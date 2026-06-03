import Link from 'next/link';
import { listClients } from '@/lib/ops/clients-service';
import { listAssets } from '@/lib/ops/assets-service';
import { listStoredGithubRepos } from '@/lib/ops/github-service';
import { listStoredVercelProjects } from '@/lib/ops/vercel-service';
import { listFindings } from '@/lib/ops/findings-service';
import { listRecentSyncRuns } from '@/lib/ops/sync-service';
import { listRenewals, computeRenewalWindow, type RenewalWithRefs } from '@/lib/ops/renewals-service';
import { listTickets, type TicketWithRefs } from '@/lib/ops/tickets-service';
import { listIncidents, type IncidentWithRefs } from '@/lib/ops/incidents-service';
import { allConnectivity } from '@/lib/integrations';
import { isDbConfigured } from '@/lib/db/client';
import { AdminCard, SectionHeader, Badge } from '@/components/admin-ui';
import ReadinessChecklist from '@/components/admin-ui/ReadinessChecklist';
import ActivationReadiness from '@/components/admin-ui/ActivationReadiness';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from './NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import {
  SNAPSHOT_CLIENTS,
  SNAPSHOT_ASSETS,
  SNAPSHOT_REPOS,
  SNAPSHOT_VERCEL_PROJECTS,
  SNAPSHOT_FINDINGS,
  SNAPSHOT_RENEWALS,
  SNAPSHOT_TICKETS,
  SNAPSHOT_INCIDENTS,
} from '@/lib/ops/ops-snapshot-data';

// Lightweight defensive wrapper — even though every service is already graceful
// when DB is null, the Overview page is the dashboard's front door so we wrap
// each fetch in try/catch to guarantee it never throws.
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

type TicketPriority = 'urgent' | 'high' | 'med' | 'low';

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 1,
  med: 2,
  low: 3,
};

const URGENT_WINDOWS = new Set(['overdue', 'due', 'within_7', 'within_14']);

const OPEN_INCIDENT_STATUSES = new Set(['open', 'investigating', 'identified', 'monitoring']);

export default async function OpsOverviewPage() {
  const snapshot = isSnapshotMode();
  const [clients, assets, repos, vercel, findings, recentSyncs, renewals, tickets, incidents] = snapshot
    ? [
        SNAPSHOT_CLIENTS,
        SNAPSHOT_ASSETS,
        SNAPSHOT_REPOS,
        SNAPSHOT_VERCEL_PROJECTS,
        SNAPSHOT_FINDINGS,
        [] as Awaited<ReturnType<typeof listRecentSyncRuns>>,
        SNAPSHOT_RENEWALS,
        SNAPSHOT_TICKETS,
        SNAPSHOT_INCIDENTS,
      ]
    : await Promise.all([
        safe(listClients(), []),
        safe(listAssets(), []),
        safe(listStoredGithubRepos(), []),
        safe(listStoredVercelProjects(), []),
        safe(listFindings({ status: 'open' }), []),
        safe(listRecentSyncRuns(5), []),
        safe(listRenewals(), [] as RenewalWithRefs[]),
        safe(listTickets(), [] as TicketWithRefs[]),
        safe(listIncidents(), [] as IncidentWithRefs[]),
      ]);
  const conn = allConnectivity();
  const dbConfigured = isDbConfigured();
  const reposActive = repos.filter((r) => r.category !== 'personal_excluded' && r.category !== 'legacy_stale').length;
  const vercelLive = vercel.filter((p) => p.state === 'live').length;
  const vercelDormant = vercel.filter((p) => p.state === 'dormant').length;

  // "Due soon" surfaces — derived view, safe on empty arrays.
  const renewalsDueSoon = renewals
    .filter((r) => URGENT_WINDOWS.has(computeRenewalWindow(r.nextDueAt)))
    .slice(0, 3);

  const openHighPriorityTickets = tickets
    .filter((t) => t.status !== 'closed' && t.status !== 'resolved' && t.status !== 'cancelled')
    .sort((a, b) => {
      const ra = PRIORITY_RANK[a.priority] ?? 99;
      const rb = PRIORITY_RANK[b.priority] ?? 99;
      if (ra !== rb) return ra - rb;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 3);

  const openIncidents = incidents
    .filter((i) => OPEN_INCIDENT_STATUSES.has(i.status))
    .slice(0, 3);

  return (
    <>
      <SectionHeader title="Overview" subtitle="High-level snapshot of clients, infrastructure, and open findings." />
      {snapshot ? (
        <SnapshotBanner area="The Overview" />
      ) : (
        <>
          {!dbConfigured && (
            <p className="mb-4 text-xs text-amber-200">
              Production DB is intentionally not connected yet — Hetzner ops DB lands next week. See Settings -&gt; Phase 2A — Migration readiness for the checklist.
            </p>
          )}
          <NotConnectedBanner />
          <WaitingForDb
            area="Overview"
            whatYouWillSee={[
              'Live counts of clients, assets, open tickets, and renewals',
              'Top urgent renewals, high-priority tickets, and open incidents',
              'Recent sync run history across every provider',
            ]}
          />
        </>
      )}

      <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717a] mb-3">
        What needs your attention this week
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DueSoonCard
          title="Renewals due soon"
          count={renewalsDueSoon.length}
          totalLabel={dbConfigured ? `${renewalsDueSoon.length} due within 14 days` : null}
          dbConfigured={dbConfigured || snapshot}
          sampleRows={[
            { label: 'Domain: example.co.za', meta: 'due in 3d' },
            { label: 'SSL: api.client.com', meta: 'due in 9d' },
            { label: 'Retainer: ACME monthly', meta: 'due in 12d' },
          ]}
        >
          {renewalsDueSoon.length === 0 ? (
            <p className="text-xs text-[#71717a]">Nothing within the next 14 days.</p>
          ) : (
            <ul className="space-y-2">
              {renewalsDueSoon.map((r) => {
                const win = computeRenewalWindow(r.nextDueAt);
                return (
                  <li key={r.id} className="flex items-start justify-between gap-3 border-b border-[#1c1c1e] pb-2 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#e4e4e7] truncate">{r.name}</p>
                      <p className="text-[10px] font-mono text-[#71717a] mt-0.5">
                        {r.client?.name ?? 'no client'}
                      </p>
                    </div>
                    <Badge text={win.replace('_', ' ')} tone={renewalTone(win)} />
                  </li>
                );
              })}
            </ul>
          )}
        </DueSoonCard>

        <DueSoonCard
          title="Open high-priority tickets"
          count={openHighPriorityTickets.length}
          totalLabel={dbConfigured ? `${openHighPriorityTickets.length} surfaced` : null}
          dbConfigured={dbConfigured || snapshot}
          sampleRows={[
            { label: 'Login intermittently failing', meta: 'urgent · ACME' },
            { label: 'Newsletter signup 500s', meta: 'high · Sigmafy' },
            { label: 'Add booking field to form', meta: 'high · Impart' },
          ]}
        >
          {openHighPriorityTickets.length === 0 ? (
            <p className="text-xs text-[#71717a]">No open tickets above triage.</p>
          ) : (
            <ul className="space-y-2">
              {openHighPriorityTickets.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-3 border-b border-[#1c1c1e] pb-2 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#e4e4e7] truncate">{t.title}</p>
                    <p className="text-[10px] font-mono text-[#71717a] mt-0.5">
                      {t.client?.name ?? 'no client'}
                    </p>
                  </div>
                  <Badge text={t.priority} tone={priorityTone(t.priority as TicketPriority)} />
                </li>
              ))}
            </ul>
          )}
        </DueSoonCard>

        <DueSoonCard
          title="Open incidents"
          count={openIncidents.length}
          totalLabel={dbConfigured ? `${openIncidents.length} open` : null}
          dbConfigured={dbConfigured || snapshot}
          sampleRows={[
            { label: 'CF zone DNS lookup failing', meta: 'major · investigating' },
            { label: 'Vercel build timeout', meta: 'minor · monitoring' },
            { label: 'Hetzner server unreachable', meta: 'critical · open' },
          ]}
        >
          {openIncidents.length === 0 ? (
            <p className="text-xs text-[#71717a]">No open incidents.</p>
          ) : (
            <ul className="space-y-2">
              {openIncidents.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3 border-b border-[#1c1c1e] pb-2 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#e4e4e7] truncate">{i.summary}</p>
                    <p className="text-[10px] font-mono text-[#71717a] mt-0.5">
                      {i.asset?.name ?? i.client?.name ?? 'unscoped'}
                    </p>
                  </div>
                  <Badge text={i.severity} tone={incidentTone(i.severity)} />
                </li>
              ))}
            </ul>
          )}
        </DueSoonCard>
      </div>

      <div className="mb-6">
        <ActivationReadiness />
      </div>

      <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717a] mb-3">
        Quick actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <AdminCard title="Ask the dashboard">
          <p className="text-xs text-[#a1a1aa] mb-4">
            Ground-truthed assistant. Ask in plain English; answers come only from your dashboard data.
          </p>
          <Link
            href="/admin/ops/ask"
            className="text-xs font-mono uppercase tracking-[0.18em] text-emerald-300 hover:text-emerald-200"
          >
            Go to Ask →
          </Link>
        </AdminCard>
        <AdminCard title="Search">
          <p className="text-xs text-[#a1a1aa] mb-4">
            Lexical search across every snapshot record + (later) live DB rows.
          </p>
          <Link
            href="/admin/ops/search"
            className="text-xs font-mono uppercase tracking-[0.18em] text-emerald-300 hover:text-emerald-200"
          >
            Open search →
          </Link>
        </AdminCard>
      </div>

      {!dbConfigured && (
        <div className="mb-6">
          <ReadinessChecklist />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Tile label="Active clients" value={clients.length} />
        <Tile label="Tracked assets" value={assets.length} />
        <Tile label="GitHub repos (active)" value={`${reposActive} / ${repos.length}`} />
        <Tile label="Vercel projects" value={`${vercelLive} live · ${vercelDormant} dormant`} />
        <Tile label="Open findings" value={findings.length} tone={findings.length > 0 ? 'amber' : 'neutral'} />
        <Tile
          label="Cloudflare"
          value={conn.cloudflare.status === 'connected' ? 'connected' : 'not connected'}
          tone={conn.cloudflare.status === 'connected' ? 'green' : 'rose'}
        />
        <Tile
          label="Hetzner"
          value={conn.hetzner.status === 'connected' ? 'connected' : 'not connected'}
          tone={conn.hetzner.status === 'connected' ? 'green' : 'rose'}
        />
        <Tile
          label="Vercel API"
          value={conn.vercel.status === 'connected' ? 'connected' : 'not connected'}
          tone={conn.vercel.status === 'connected' ? 'green' : 'rose'}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard title="Open findings (latest)">
          {findings.length === 0 ? (
            <p className="text-xs text-[#71717a]">No open findings — run the audit seeder from Audits to populate known issues.</p>
          ) : (
            <ul className="space-y-3">
              {findings.slice(0, 6).map((f) => (
                <li key={f.id} className="border-b border-[#1c1c1e] pb-2 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-[#e4e4e7] flex-1">{f.title}</p>
                    <Badge text={f.severity} tone={severityTone(f.severity)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
        <AdminCard title="Recent sync runs">
          {recentSyncs.length === 0 ? (
            <p className="text-xs text-[#71717a]">No sync runs recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentSyncs.map((s) => (
                <li key={s.id} className="border-b border-[#1c1c1e] pb-2 last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-[#e4e4e7]">
                      <span className="font-mono">{s.provider}</span>
                      <span className="text-[#71717a]"> · {fmtAgo(s.startedAt)}</span>
                    </p>
                    <Badge text={s.status} tone={syncTone(s.status)} />
                  </div>
                  <p className="text-[10px] text-[#52525b] mt-1 font-mono">
                    seen {s.itemsSeen} · new {s.itemsCreated} · upd {s.itemsUpdated}
                    {s.errorMessage ? ` · ${s.errorMessage.slice(0, 60)}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </>
  );
}

function Tile({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'green' | 'amber' | 'rose' | 'neutral' }) {
  const ring =
    tone === 'green' ? 'border-emerald-400/30 bg-emerald-400/5'
    : tone === 'amber' ? 'border-amber-400/30 bg-amber-400/5'
    : tone === 'rose' ? 'border-rose-400/30 bg-rose-400/5'
    : 'border-[#27272a] bg-[#111113]';
  return (
    <div className={`rounded-2xl border p-5 ${ring}`}>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">{label}</p>
      <p className="text-2xl font-semibold text-[#f5f5f5]">{value}</p>
    </div>
  );
}

function DueSoonCard({
  title,
  count,
  totalLabel,
  dbConfigured,
  sampleRows,
  children,
}: {
  title: string;
  count: number;
  totalLabel: string | null;
  dbConfigured: boolean;
  sampleRows: Array<{ label: string; meta: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">{title}</p>
        {dbConfigured && (
          <span className="text-xs font-semibold text-[#f5f5f5]">{count}</span>
        )}
      </div>
      {dbConfigured ? (
        <>
          {children}
          {totalLabel && (
            <p className="mt-3 text-[10px] font-mono text-[#52525b] uppercase tracking-wider">
              {totalLabel}
            </p>
          )}
        </>
      ) : (
        <div>
          <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300/70">
            Sample view — activates with DATABASE_URL
          </p>
          <ul className="space-y-2 opacity-50">
            {sampleRows.map((r) => (
              <li key={r.label} className="flex items-start justify-between gap-3 border-b border-dashed border-[#27272a] pb-2 last:border-0">
                <p className="text-xs text-[#a1a1aa] truncate flex-1">{r.label}</p>
                <span className="text-[10px] font-mono text-[#71717a]">{r.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function severityTone(s: string): 'neutral' | 'green' | 'amber' | 'rose' | 'blue' {
  if (s === 'critical' || s === 'high') return 'rose';
  if (s === 'med') return 'amber';
  if (s === 'low') return 'blue';
  return 'neutral';
}
function syncTone(s: string): 'neutral' | 'green' | 'amber' | 'rose' | 'blue' {
  if (s === 'ok') return 'green';
  if (s === 'running' || s === 'partial') return 'amber';
  if (s === 'failed') return 'rose';
  if (s === 'skipped') return 'blue';
  return 'neutral';
}
function priorityTone(p: TicketPriority): 'neutral' | 'green' | 'amber' | 'rose' | 'blue' {
  if (p === 'urgent') return 'rose';
  if (p === 'high') return 'amber';
  if (p === 'med') return 'blue';
  return 'neutral';
}
function incidentTone(sev: string): 'neutral' | 'green' | 'amber' | 'rose' | 'blue' {
  if (sev === 'critical') return 'rose';
  if (sev === 'major') return 'rose';
  if (sev === 'minor') return 'amber';
  if (sev === 'info') return 'blue';
  return 'neutral';
}
function renewalTone(w: string): 'neutral' | 'green' | 'amber' | 'rose' | 'blue' {
  if (w === 'overdue' || w === 'due') return 'rose';
  if (w === 'within_7') return 'amber';
  if (w === 'within_14') return 'blue';
  return 'neutral';
}
function fmtAgo(d: Date | null): string {
  if (!d) return '—';
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
