import Link from 'next/link';
import { AdminCard, Badge, DataTable, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { buildReportsSummary, type ReportsSummary } from '@/lib/ops/ops-reports';

// /admin/ops/reports — read-only summary view. Every counter is derived from
// buildIndex() via ops-reports so the same surface auto-upgrades to live DB
// rows once DATABASE_URL is set. NO new DB queries here.

type Tone = 'neutral' | 'green' | 'amber' | 'rose' | 'blue';

const RENEWAL_WINDOW_ORDER = [
  'overdue',
  'due',
  'within_7',
  'within_14',
  'within_30',
  'within_60',
  'future',
] as const;

const BLOCKED_BY_LABELS: Record<string, string> = {
  db: 'Database (DATABASE_URL)',
  ssh: 'SSH access to ma130',
  github_token: 'GITHUB_TOKEN',
  vercel_token: 'VERCEL_API_TOKEN',
  cloudflare_token: 'CLOUDFLARE_API_TOKEN',
  hetzner_token: 'HETZNER_API_TOKEN',
  human_decision: 'Operator decision',
};

const BLOCKED_BY_ORDER = [
  'db',
  'ssh',
  'github_token',
  'vercel_token',
  'cloudflare_token',
  'hetzner_token',
  'human_decision',
] as const;

export default async function ReportsPage() {
  const summary = await buildReportsSummary();
  const snapshot = isSnapshotMode();

  return (
    <>
      <SectionHeader
        title="Reports"
        subtitle="Snapshot of the current operational picture. Counts come from snapshot data while DATABASE_URL is unset; once Hetzner connects, the same view switches to live DB data."
      />
      {snapshot && <SnapshotBanner area="Reports" />}

      <p className="mb-5 font-mono text-[11px] text-[#71717a]">
        Generated <time dateTime={summary.generatedAt}>{formatTimestamp(summary.generatedAt)}</time>
        {' · '}source: <span className="text-[#a1a1aa]">{summary.dataSource}</span>
      </p>

      <AtAGlance summary={summary} />
      <RenewalsByWindow summary={summary} />
      <IncidentsSection summary={summary} />
      <DecisionsSection summary={summary} />
      <BlockedBySection summary={summary} />
      <ActivationSummary summary={summary} />
      <ImportSummary summary={summary} />
    </>
  );
}

// ---------------------------------------------------------------- Sections

function AtAGlance({ summary }: { summary: ReportsSummary }) {
  const t = summary.totals;
  const tiles: Array<{ label: string; value: number | string; tone?: Tone }> = [
    { label: 'Clients', value: t.clients },
    { label: 'Assets', value: t.assets },
    { label: 'GitHub repos', value: t.repos },
    { label: 'Vercel projects', value: t.vercelProjects.total },
    { label: 'Hetzner servers', value: t.hetznerServers },
    { label: 'Cloudflare zones', value: t.cloudflareZones },
    { label: 'Open tickets', value: t.openTickets, tone: t.openTickets > 0 ? 'amber' : 'neutral' },
    { label: 'Open incidents', value: t.openIncidents, tone: t.openIncidents > 0 ? 'rose' : 'neutral' },
  ];
  return (
    <div className="mb-6">
      <AdminCard title="At a glance">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((tile) => (
            <Tile key={tile.label} label={tile.label} value={tile.value} tone={tile.tone} />
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

function RenewalsByWindow({ summary }: { summary: ReportsSummary }) {
  const rows = RENEWAL_WINDOW_ORDER.map((win) => ({
    id: win,
    window: win,
    count: summary.renewalsByWindow[win] ?? 0,
    tone: renewalTone(win),
  }));
  const total = rows.reduce((acc, r) => acc + r.count, 0);
  return (
    <div className="mb-6">
      <AdminCard
        title="Renewals by window"
        action={<span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#71717a]">{total} tracked</span>}
      >
        {total === 0 ? (
          <p className="text-xs text-[#71717a]">No renewals indexed.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {rows.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-[#27272a] bg-[#0e0e10] p-4 text-center"
              >
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">
                  {row.window.replace('_', ' ')}
                </p>
                <p className="mb-2 text-xl font-semibold text-[#f5f5f5]">{row.count}</p>
                <Badge text={row.window.replace('_', ' ')} tone={row.tone} />
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function IncidentsSection({ summary }: { summary: ReportsSummary }) {
  const sevRows = sortedRows(summary.incidentsBySeverity);
  const statusRows = sortedRows(summary.incidentsByStatus);
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AdminCard title="Incidents by severity">
        <DataTable
          rows={sevRows}
          columns={[
            { key: 'label', header: 'Severity', render: (r) => <Badge text={r.label} tone={incidentSeverityTone(r.label)} /> },
            { key: 'count', header: 'Count', render: (r) => <span className="font-mono">{r.count}</span>, className: 'text-right' },
          ]}
          empty={<p className="text-xs text-[#71717a]">No incidents indexed.</p>}
        />
      </AdminCard>
      <AdminCard title="Incidents by status">
        <DataTable
          rows={statusRows}
          columns={[
            { key: 'label', header: 'Status', render: (r) => <Badge text={r.label} tone={incidentStatusTone(r.label)} /> },
            { key: 'count', header: 'Count', render: (r) => <span className="font-mono">{r.count}</span>, className: 'text-right' },
          ]}
          empty={<p className="text-xs text-[#71717a]">No incidents indexed.</p>}
        />
      </AdminCard>
    </div>
  );
}

function DecisionsSection({ summary }: { summary: ReportsSummary }) {
  const riskRows = sortedRows(summary.decisionsByRisk);
  const clusterRows = sortedRows(summary.decisionsByCluster);
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AdminCard title="Decisions by risk">
        <DataTable
          rows={riskRows}
          columns={[
            { key: 'label', header: 'Risk', render: (r) => <Badge text={r.label} tone={riskTone(r.label)} /> },
            { key: 'count', header: 'Count', render: (r) => <span className="font-mono">{r.count}</span>, className: 'text-right' },
          ]}
          empty={<p className="text-xs text-[#71717a]">No decisions indexed.</p>}
        />
      </AdminCard>
      <AdminCard title="Decisions by cluster">
        <DataTable
          rows={clusterRows}
          columns={[
            { key: 'label', header: 'Cluster', render: (r) => <span className="text-xs text-[#e4e4e7]">{r.label.replace(/_/g, ' ')}</span> },
            { key: 'count', header: 'Count', render: (r) => <span className="font-mono">{r.count}</span>, className: 'text-right' },
          ]}
          empty={<p className="text-xs text-[#71717a]">No decisions indexed.</p>}
        />
      </AdminCard>
    </div>
  );
}

function BlockedBySection({ summary }: { summary: ReportsSummary }) {
  const rows = BLOCKED_BY_ORDER.map((key) => ({
    id: key,
    key,
    count: summary.blockedByBreakdown[key] ?? 0,
  })).filter((r) => r.count > 0);

  return (
    <div className="mb-6">
      <AdminCard title="Blocked-by breakdown">
        <DataTable
          rows={rows}
          columns={[
            {
              key: 'blocker',
              header: 'Blocker',
              render: (r) => (
                <Link
                  href={`/admin/ops/search?blockedBy=${encodeURIComponent(r.key)}`}
                  className="text-xs text-emerald-300 hover:underline"
                >
                  {BLOCKED_BY_LABELS[r.key] ?? r.key}
                </Link>
              ),
            },
            {
              key: 'count',
              header: 'Count',
              render: (r) => <span className="font-mono">{r.count}</span>,
              className: 'text-right',
            },
          ]}
          empty={<p className="text-xs text-[#71717a]">Nothing blocked right now.</p>}
        />
      </AdminCard>
    </div>
  );
}

function ActivationSummary({ summary }: { summary: ReportsSummary }) {
  const a = summary.activationReadiness;
  const pct = a.total > 0 ? Math.round((a.ready / a.total) * 100) : 0;
  return (
    <div className="mb-6">
      <AdminCard
        title="Activation readiness"
        action={
          <Link
            href="/admin/ops/settings"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-300 hover:underline"
          >
            Full checklist
          </Link>
        }
      >
        <div className="flex flex-wrap items-baseline gap-4">
          <p className="text-2xl font-semibold text-[#f5f5f5]">
            {a.ready}
            <span className="ml-1 text-sm font-normal text-[#71717a]">/ {a.total} ready</span>
          </p>
          <p className="font-mono text-xs text-[#a1a1aa]">{a.pending} pending</p>
          <Badge text={`${pct}%`} tone={pct >= 50 ? 'green' : pct >= 25 ? 'amber' : 'rose'} />
        </div>
      </AdminCard>
    </div>
  );
}

function ImportSummary({ summary }: { summary: ReportsSummary }) {
  const i = summary.importReadiness;
  return (
    <div className="mb-6">
      <AdminCard
        title="Import readiness"
        action={
          <Link
            href="/admin/ops/review"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-300 hover:underline"
          >
            Full breakdown
          </Link>
        }
      >
        <div className="flex flex-wrap items-baseline gap-4">
          <Stat label="Ready" value={i.ready} tone="green" />
          <Stat label="Needs review" value={i.needs_review} tone="amber" />
          <Stat label="Blocked" value={i.blocked} tone="rose" />
          <p className="font-mono text-xs text-[#71717a]">{i.total} import groups</p>
        </div>
      </AdminCard>
    </div>
  );
}

// ---------------------------------------------------------------- Helpers

function Tile({ label, value, tone }: { label: string; value: React.ReactNode; tone?: Tone }) {
  const ring =
    tone === 'green' ? 'border-emerald-400/30 bg-emerald-400/5'
    : tone === 'amber' ? 'border-amber-400/30 bg-amber-400/5'
    : tone === 'rose' ? 'border-rose-400/30 bg-rose-400/5'
    : 'border-[#27272a] bg-[#0e0e10]';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">{label}</p>
      <p className="text-2xl font-semibold text-[#f5f5f5]">{value}</p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-semibold text-[#f5f5f5]">{value}</span>
      <Badge text={label} tone={tone} />
    </div>
  );
}

function sortedRows(buckets: Record<string, number>): Array<{ id: string; label: string; count: number }> {
  return Object.entries(buckets)
    .filter(([, v]) => v > 0)
    .map(([label, count]) => ({ id: label, label, count }))
    .sort((a, b) => b.count - a.count);
}

function renewalTone(w: string): Tone {
  if (w === 'overdue' || w === 'due') return 'rose';
  if (w === 'within_7') return 'amber';
  if (w === 'within_14' || w === 'within_30') return 'blue';
  return 'neutral';
}

function incidentSeverityTone(s: string): Tone {
  if (s === 'critical' || s === 'major') return 'rose';
  if (s === 'minor') return 'amber';
  if (s === 'info') return 'blue';
  return 'neutral';
}

function incidentStatusTone(s: string): Tone {
  if (s === 'open' || s === 'investigating') return 'rose';
  if (s === 'identified' || s === 'monitoring') return 'amber';
  if (s === 'resolved' || s === 'closed') return 'green';
  return 'neutral';
}

function riskTone(r: string): Tone {
  if (r === 'high') return 'rose';
  if (r === 'med') return 'amber';
  if (r === 'low') return 'blue';
  return 'neutral';
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
}
