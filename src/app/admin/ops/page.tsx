import { listClients } from '@/lib/ops/clients-service';
import { listAssets } from '@/lib/ops/assets-service';
import { listStoredGithubRepos } from '@/lib/ops/github-service';
import { listStoredVercelProjects } from '@/lib/ops/vercel-service';
import { listFindings } from '@/lib/ops/findings-service';
import { listRecentSyncRuns } from '@/lib/ops/sync-service';
import { allConnectivity } from '@/lib/integrations';
import { isDbConfigured } from '@/lib/db/client';
import { AdminCard, SectionHeader, Badge } from '@/components/admin-ui';
import NotConnectedBanner from './NotConnectedBanner';

export default async function OpsOverviewPage() {
  const [clients, assets, repos, vercel, findings, recentSyncs] = await Promise.all([
    listClients(),
    listAssets(),
    listStoredGithubRepos(),
    listStoredVercelProjects(),
    listFindings({ status: 'open' }),
    listRecentSyncRuns(5),
  ]);
  const conn = allConnectivity();
  const dbConfigured = isDbConfigured();
  const reposActive = repos.filter((r) => r.category !== 'personal_excluded' && r.category !== 'legacy_stale').length;
  const vercelLive = vercel.filter((p) => p.state === 'live').length;
  const vercelDormant = vercel.filter((p) => p.state === 'dormant').length;

  return (
    <>
      <SectionHeader title="Overview" subtitle="High-level snapshot of clients, infrastructure, and open findings." />
      {!dbConfigured && (
        <p className="mb-4 text-xs text-amber-200">
          Production DB is intentionally not connected yet — Hetzner ops DB lands next week. See Settings -&gt; Phase 2A — Migration readiness for the checklist.
        </p>
      )}
      <NotConnectedBanner />
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
