import Link from 'next/link';
import { isDbConfigured } from '@/lib/db/client';
import { AdminCard, SectionHeader, Badge, DataTable } from '@/components/admin-ui';
import ActivationReadiness from '@/components/admin-ui/ActivationReadiness';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import QuickActionTile from '@/components/admin-ui/QuickActionTile';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { buildReportsSummary, type ReportsSummary } from '@/lib/ops/ops-reports';
import { buildIndex, ACTIVATION_STEPS, type IndexItem } from '@/lib/ops/ops-knowledge-index';
import { SNAPSHOT_DECISIONS, SNAPSHOT_CLIENTS } from '@/lib/ops/ops-snapshot-data';
import { computeRenewalWindow } from '@/lib/ops/renewals-window';

// Ops Command Centre — single front-door page. All counters route through
// buildReportsSummary() so snapshot mode and live DB share one code path. The
// page is purely server-rendered; every fetch is wrapped in try/catch so a
// downstream failure never blanks the dashboard.

type Tone = 'neutral' | 'green' | 'amber' | 'rose' | 'blue';

const URGENT_RENEWAL_WINDOWS = new Set(['overdue', 'due', 'within_7']);
const URGENT_INCIDENT_SEVERITIES = new Set(['critical', 'major']);

const EMPTY_SUMMARY: ReportsSummary = {
  generatedAt: new Date(0).toISOString(),
  dataSource: 'snapshot',
  totals: {
    divisions: 0,
    clients: 0,
    assets: 0,
    repos: 0,
    vercelProjects: { total: 0, byTeam: {}, byState: {} },
    hetznerServers: 0,
    cloudflareZones: 0,
    domains: 0,
    openTickets: 0,
    openIncidents: 0,
  },
  reposByCategory: {},
  renewalsByWindow: {},
  incidentsBySeverity: {},
  incidentsByStatus: {},
  decisionsByRisk: {},
  decisionsByCluster: {},
  activationReadiness: { ready: 0, pending: 0, total: 0 },
  importReadiness: { ready: 0, needs_review: 0, blocked: 0, total: 0 },
  blockedByBreakdown: {},
};

async function safeSummary(): Promise<ReportsSummary> {
  try {
    return await buildReportsSummary();
  } catch {
    return EMPTY_SUMMARY;
  }
}

async function safeIndex(): Promise<IndexItem[]> {
  try {
    return await buildIndex();
  } catch {
    return [];
  }
}

export default async function OpsOverviewPage() {
  const snapshot = isSnapshotMode();
  const dbConfigured = isDbConfigured();
  const [summary, index] = await Promise.all([safeSummary(), safeIndex()]);

  return (
    <>
      <SectionHeader
        title="Ops Command Centre"
        subtitle="Today's picture, what needs attention, what's ready, what's blocked — one front door."
      />
      {snapshot && <SnapshotBanner area="The Overview" />}

      <TodaysPicture summary={summary} index={index} />

      <NeedsAttention summary={summary} index={index} />

      <WhatIsReady summary={summary} />

      <WhatIsBlocked />

      <QuickActions />

      {!dbConfigured && (
        <div className="mb-6">
          <ActivationReadiness />
        </div>
      )}
    </>
  );
}

// --------------------------------------------------------------- Today's picture

function TodaysPicture({ summary, index }: { summary: ReportsSummary; index: IndexItem[] }) {
  const t = summary.totals;

  // Client internal/external/unmapped breakdown — derived from snapshot tags.
  let internal = 0;
  let external = 0;
  let unmapped = 0;
  try {
    for (const c of SNAPSHOT_CLIENTS) {
      const tags = c.tags ?? [];
      if (tags.includes('unmapped')) unmapped++;
      else if (tags.includes('internal')) internal++;
      else external++;
    }
  } catch {
    /* leave zeros */
  }

  // Top-3 asset types from the index. assetItems indexer stores tags as
  // ['asset', a.type, ...techStack] so tags[1] holds the type.
  let assetTypeTopline = '';
  try {
    const tally: Record<string, number> = {};
    for (const it of index) {
      if (it.type !== 'asset') continue;
      const k = it.tags[1] ?? 'unknown';
      tally[k] = (tally[k] ?? 0) + 1;
    }
    assetTypeTopline = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, n]) => `${n} ${k}`)
      .join(' · ');
  } catch {
    assetTypeTopline = '';
  }

  // Repo split: 2KO vs external — by category buckets.
  const reposByCat = summary.reposByCategory;
  const twoKo = (reposByCat['2ko_internal'] ?? 0) + (reposByCat['shared_internal'] ?? 0);
  const externalRepos = (reposByCat['external_client'] ?? 0);

  // Vercel state breakdown.
  const v = t.vercelProjects;
  const vLive = v.byState['live'] ?? 0;
  const vDormant = v.byState['dormant'] ?? 0;
  const vMigrated = v.byState['migrated_to_hetzner'] ?? 0;

  // Hetzner role names (top 3 from snapshot — ma130-apps/data/tori).
  const hetznerSubline = 'ma130-apps · data · tori';

  // Open incidents by severity.
  const sev = summary.incidentsBySeverity;
  const incidentSubline = ['critical', 'major', 'minor', 'info']
    .map((k) => (sev[k] ? `${sev[k]} ${k}` : null))
    .filter(Boolean)
    .join(' · ');

  // Open review decisions by risk.
  const decTotal = Object.values(summary.decisionsByRisk).reduce((a, b) => a + b, 0);
  const risk = summary.decisionsByRisk;
  const decisionSubline = ['high', 'med', 'low']
    .map((k) => (risk[k] ? `${risk[k]} ${k}` : null))
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mb-6">
      <AdminCard title="Today's operational picture">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="Divisions" value={t.divisions} />
          <Tile
            label="Clients"
            value={t.clients}
            subline={`${internal} internal · ${external} external · ${unmapped} unmapped`}
          />
          <Tile label="Assets" value={t.assets} subline={assetTypeTopline || undefined} />
          <Tile
            label="Repos"
            value={t.repos}
            subline={`${twoKo} 2KO · ${externalRepos} external`}
          />
          <Tile
            label="Vercel projects"
            value={v.total}
            subline={`${vLive} live · ${vDormant} dormant · ${vMigrated} migrated`}
          />
          <Tile label="Hetzner servers" value={t.hetznerServers} subline={hetznerSubline} />
          <Tile
            label="Open incidents"
            value={t.openIncidents}
            subline={incidentSubline || 'none open'}
            tone={t.openIncidents > 0 ? 'amber' : 'neutral'}
          />
          <Tile
            label="Open review decisions"
            value={decTotal}
            subline={decisionSubline || 'none'}
            tone={(risk['high'] ?? 0) > 0 ? 'amber' : 'neutral'}
          />
        </div>
      </AdminCard>
    </div>
  );
}

// --------------------------------------------------------------- Needs attention

type AttentionRow = {
  id: string;
  icon: string;
  title: string;
  context: string;
  href: string;
  badge: { text: string; tone: Tone };
};

function NeedsAttention({ summary, index }: { summary: ReportsSummary; index: IndexItem[] }) {
  const rows: AttentionRow[] = [];

  // 1. Urgent incidents (critical/major).
  try {
    const incidents = index.filter(
      (i) => i.type === 'incident' && URGENT_INCIDENT_SEVERITIES.has(i.tags[1] ?? '') && i.status !== 'resolved',
    );
    for (const i of incidents.slice(0, 3)) {
      rows.push({
        id: `att-${i.id}`,
        icon: '!',
        title: i.title,
        context: `${i.tags[1] ?? 'incident'} · ${i.subtitle ?? 'unscoped'}\n${(i.body ?? '').slice(0, 90)}`,
        href: i.url ?? '/admin/ops/incidents',
        badge: { text: i.tags[1] ?? 'incident', tone: 'rose' },
      });
    }
  } catch {
    /* skip */
  }

  // 2. Blocked activation steps (have blockedBy other than 'none').
  try {
    const blocked = ACTIVATION_STEPS.filter(
      (s) => !s.done && s.blockedBy.length > 0 && !s.blockedBy.every((b) => b === 'none') && s.group !== 'Optional later',
    );
    for (const s of blocked.slice(0, 2)) {
      rows.push({
        id: `att-${s.id}`,
        icon: '*',
        title: s.label,
        context: `${s.group} · blocked by ${s.blockedBy.join(', ')}\n${s.note ?? ''}`,
        href: '/admin/ops/settings',
        badge: { text: s.group, tone: 'amber' },
      });
    }
  } catch {
    /* skip */
  }

  // 3. Renewals overdue / due / within 7 days.
  try {
    const renewals = index.filter((i) => i.type === 'renewal');
    const urgent: { id: string; title: string; window: string; subtitle?: string; url?: string }[] = [];
    for (const r of renewals) {
      const m = r.body.match(/due (\d{4}-\d{2}-\d{2})/);
      if (!m) continue;
      const win = computeRenewalWindow(m[1]);
      if (URGENT_RENEWAL_WINDOWS.has(win)) {
        urgent.push({ id: r.id, title: r.title, window: win, subtitle: r.subtitle, url: r.url });
      }
    }
    for (const r of urgent.slice(0, 2)) {
      rows.push({
        id: `att-${r.id}`,
        icon: '$',
        title: r.title,
        context: `${r.subtitle ?? 'no client'} · ${r.window.replace('_', ' ')}`,
        href: r.url ?? '/admin/ops/renewals',
        badge: { text: r.window.replace('_', ' '), tone: r.window === 'overdue' || r.window === 'due' ? 'rose' : 'amber' },
      });
    }
  } catch {
    /* skip */
  }

  // 4. Unresolved review decisions — top by risk.
  try {
    const decisions = [...SNAPSHOT_DECISIONS].sort((a, b) => riskRank(b.risk) - riskRank(a.risk));
    for (const d of decisions.slice(0, 2)) {
      rows.push({
        id: `att-${d.id}`,
        icon: '?',
        title: d.title,
        context: `${d.cluster.replace('_', ' ')} · risk ${d.risk}\n${d.context.slice(0, 90)}`,
        href: `/admin/ops/review#${d.id}`,
        badge: { text: `risk ${d.risk}`, tone: d.risk === 'high' ? 'rose' : d.risk === 'med' ? 'amber' : 'blue' },
      });
    }
  } catch {
    /* skip */
  }

  // 5. Unmapped Vercel properties — derived from blockedByBreakdown.
  try {
    const unmappedDecisions = SNAPSHOT_DECISIONS.filter((d) => d.cluster === 'unmapped_vercel');
    if (unmappedDecisions.length > 0) {
      rows.push({
        id: 'att-unmapped-vercel',
        icon: '@',
        title: `${unmappedDecisions.length} unmapped Vercel properties`,
        context: 'impart-global team holds live properties without an owning client.',
        href: '/admin/ops/vercel',
        badge: { text: 'unmapped', tone: 'amber' },
      });
    }
  } catch {
    /* skip */
  }

  // 6. Duplicate repo clusters.
  try {
    const repoClusters = SNAPSHOT_DECISIONS.filter((d) => d.cluster === 'repo_cluster').length;
    if (repoClusters > 0) {
      rows.push({
        id: 'att-repo-clusters',
        icon: '#',
        title: `${repoClusters} duplicate repo clusters need canonical picks`,
        context: 'SAPS, Impart, All-The-Glory, SmartHome, AutoTax/Taxo.',
        href: '/admin/ops/review',
        badge: { text: 'review', tone: 'amber' },
      });
    }
  } catch {
    /* skip */
  }

  // 7. Infrastructure risks — high/critical audit findings.
  try {
    const findings = index.filter(
      (i) => i.type === 'audit_finding' && (i.tags.includes('high') || i.tags.includes('critical')) && i.status !== 'resolved',
    );
    for (const f of findings.slice(0, 2)) {
      rows.push({
        id: `att-${f.id}`,
        icon: '%',
        title: f.title,
        context: `${f.subtitle ?? 'audit'} · severity ${f.tags.includes('critical') ? 'critical' : 'high'}`,
        href: f.url ?? '/admin/ops/audits',
        badge: { text: f.tags.includes('critical') ? 'critical' : 'high', tone: 'rose' },
      });
    }
  } catch {
    /* skip */
  }

  const top = rows.slice(0, 8);

  void summary;

  return (
    <div className="mb-6">
      <AdminCard title="What needs attention">
        <DataTable
          rows={top}
          columns={[
            {
              key: 'icon',
              header: '',
              className: 'w-10 font-mono text-emerald-300/70',
              render: (r) => <span className="font-mono text-[11px]">{r.icon}</span>,
            },
            {
              key: 'title',
              header: 'Item',
              render: (r) => (
                <div>
                  <Link
                    href={r.href}
                    className="text-xs text-[#f5f5f5] hover:text-emerald-300 font-medium"
                  >
                    {r.title}
                  </Link>
                  <p className="mt-1 text-[10px] font-mono text-[#71717a] whitespace-pre-line leading-snug">
                    {r.context}
                  </p>
                </div>
              ),
            },
            {
              key: 'badge',
              header: 'Status',
              className: 'w-32',
              render: (r) => <Badge text={r.badge.text} tone={r.badge.tone} />,
            },
          ]}
          empty={
            <p className="text-xs text-[#71717a]">
              Nothing flagged. Snapshot data may not be loaded — connect DATABASE_URL or check the
              snapshot fixtures.
            </p>
          }
        />
      </AdminCard>
    </div>
  );
}

function riskRank(r: 'low' | 'med' | 'high'): number {
  if (r === 'high') return 3;
  if (r === 'med') return 2;
  return 1;
}

// --------------------------------------------------------------- What is ready

function WhatIsReady({ summary }: { summary: ReportsSummary }) {
  const items: Array<{ label: string; ready: boolean; subline?: string }> = [
    { label: 'Snapshot data', ready: summary.totals.assets > 0, subline: `${summary.totals.assets} assets · ${summary.totals.clients} clients` },
    { label: 'Export pack', ready: true, subline: 'JSON + Markdown' },
    { label: 'Import preview', ready: true, subline: '/api/admin/ops/import' },
    { label: 'Assistant / Search', ready: true, subline: 'index + grounded fallback' },
    { label: 'Review workflow', ready: true, subline: `${SNAPSHOT_DECISIONS.length} decisions` },
    { label: 'Cron scaffolds', ready: true, subline: 'vercel.json crons' },
    { label: 'BetterStack scaffold', ready: true, subline: 'webhook route reachable' },
    {
      label: 'Reports',
      ready: true,
      subline: `${summary.activationReadiness.ready}/${summary.activationReadiness.total} activation`,
    },
  ];

  return (
    <div className="mb-6">
      <AdminCard title="What is ready">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((it) => (
            <div
              key={it.label}
              className={`rounded-xl border px-3 py-3 ${
                it.ready
                  ? 'border-emerald-400/30 bg-emerald-400/[0.04]'
                  : 'border-[#27272a] bg-[#0a0a0b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`text-[11px] font-mono ${it.ready ? 'text-emerald-300' : 'text-[#52525b]'}`}
                >
                  {it.ready ? 'ready' : 'pending'}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#e4e4e7] font-medium">{it.label}</p>
              {it.subline && (
                <p className="mt-0.5 text-[10px] font-mono text-[#71717a]">{it.subline}</p>
              )}
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

// --------------------------------------------------------------- What is blocked

function WhatIsBlocked() {
  // Presence-only env reads — never echo values.
  const env = (k: string) => Boolean(process.env[k]);

  // Human-decision count: decisions whose blockedBy list includes nothing but
  // 'none' or includes 'ssh' tagged at human level. We approximate by counting
  // unmapped_vercel + cleanup with no provider token blocker.
  let humanCount = 0;
  try {
    humanCount = SNAPSHOT_DECISIONS.filter(
      (d) => d.blockedBy.every((b) => b === 'none' || b === 'ssh'),
    ).length;
  } catch {
    humanCount = 0;
  }

  type Blocker = { label: string; status: 'blocked' | 'resolved' | 'optional' };
  const blockers: Blocker[] = [
    { label: 'Hetzner SSH key', status: 'blocked' },
    { label: 'DATABASE_URL', status: env('DATABASE_URL') ? 'resolved' : 'blocked' },
    { label: 'DATABASE_URL_DIRECT', status: env('DATABASE_URL_DIRECT') ? 'resolved' : 'blocked' },
    { label: 'GITHUB_TOKEN', status: env('GITHUB_TOKEN') ? 'resolved' : 'blocked' },
    { label: 'VERCEL_API_TOKEN', status: env('VERCEL_API_TOKEN') ? 'resolved' : 'blocked' },
    { label: 'CLOUDFLARE_API_TOKEN', status: env('CLOUDFLARE_API_TOKEN') ? 'resolved' : 'blocked' },
    { label: 'HETZNER_API_TOKEN', status: env('HETZNER_API_TOKEN') ? 'resolved' : 'blocked' },
    { label: 'CRON_SECRET', status: env('CRON_SECRET') ? 'resolved' : 'blocked' },
    { label: 'ANTHROPIC_API_KEY', status: env('ANTHROPIC_API_KEY') ? 'resolved' : 'optional' },
    {
      label: 'BETTERSTACK_WEBHOOK_SECRET',
      status: env('BETTERSTACK_WEBHOOK_SECRET') ? 'resolved' : 'optional',
    },
    { label: `${humanCount} canonical decisions (human)`, status: humanCount > 0 ? 'blocked' : 'resolved' },
  ];

  return (
    <div className="mb-6">
      <AdminCard title="What is blocked">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {blockers.map((b) => (
            <div
              key={b.label}
              className="rounded-xl border border-[#27272a] bg-[#0a0a0b] px-3 py-3 flex flex-col gap-2"
            >
              <p className="text-xs text-[#e4e4e7] font-medium leading-tight">{b.label}</p>
              <Badge
                text={b.status}
                tone={b.status === 'blocked' ? 'rose' : b.status === 'optional' ? 'amber' : 'green'}
              />
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

// --------------------------------------------------------------- Quick actions

function QuickActions() {
  return (
    <div className="mb-6">
      <AdminCard title="Quick actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickActionTile
            href="/admin/ops/ask"
            title="Ask a question"
            description="Plain-English assistant, grounded in the dashboard index."
            accent="emerald"
          />
          <QuickActionTile
            href="/admin/ops/search"
            title="Search dashboard"
            description="Lexical search across every snapshot and DB record."
            accent="emerald"
          />
          <QuickActionTile
            href="/admin/ops/review"
            title="Review decisions"
            description="Canonical picks, owner mappings, cleanup actions."
            accent="sky"
          />
          <QuickActionTile
            href="/api/admin/ops/export/snapshot.json"
            title="Export snapshot JSON"
            description="Full discovery snapshot as machine-readable JSON."
            accent="neutral"
          />
          <QuickActionTile
            href="/api/admin/ops/export/snapshot.md"
            title="Export snapshot Markdown"
            description="Same snapshot rendered as a Markdown reference doc."
            accent="neutral"
          />
          <QuickActionTile
            href="/admin/ops/settings"
            title="Activation checklist"
            description="Per-credential readiness + Hetzner migration steps."
            accent="amber"
          />
          <QuickActionTile
            href="/admin/ops/reports"
            title="Reports"
            description="Operational rollups: totals, breakdowns, readiness."
            accent="sky"
          />
          <QuickActionTile
            href="/admin/ops/health"
            title="Health"
            description="Connectivity, sync runs, BetterStack signals."
            accent="neutral"
          />
        </div>
      </AdminCard>
    </div>
  );
}

// --------------------------------------------------------------- Tile

function Tile({
  label,
  value,
  subline,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  subline?: string;
  tone?: Tone;
}) {
  const ring =
    tone === 'green'
      ? 'border-emerald-400/30 bg-emerald-400/5'
      : tone === 'amber'
        ? 'border-amber-400/30 bg-amber-400/5'
        : tone === 'rose'
          ? 'border-rose-400/30 bg-rose-400/5'
          : tone === 'blue'
            ? 'border-sky-400/30 bg-sky-400/5'
            : 'border-[#27272a] bg-[#0a0a0b]';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">
        {label}
      </p>
      <p className="text-xl font-semibold text-[#f5f5f5]">{value}</p>
      {subline && (
        <p className="mt-1 text-[10px] font-mono text-[#71717a] leading-snug">{subline}</p>
      )}
    </div>
  );
}
