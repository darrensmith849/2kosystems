import Link from 'next/link';
import { AdminCard, Badge, DataTable, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { buildReportsSummary, type ReportsSummary } from '@/lib/ops/ops-reports';
import { buildIndex, type IndexItem } from '@/lib/ops/ops-knowledge-index';
import {
  SNAPSHOT_SERVICES,
  SERVICE_STATUS_LABEL,
  SERVICE_STATUS_TONE,
  EMAIL_CATEGORY_ORDER,
  EMAIL_CATEGORY_LABEL,
} from '@/lib/ops/email-services-data';

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
  const [summary, items] = await Promise.all([buildReportsSummary(), buildIndex()]);
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
      <ClientPortfolio items={items} />
      <InfrastructureFootprint summary={summary} items={items} />
      <RiskRegister items={items} />
      <RenewalsByWindow summary={summary} />
      <RenewalPressure items={items} />
      <IncidentsSection summary={summary} />
      <DecisionsSection summary={summary} />
      <DecisionBacklog summary={summary} />
      <BlockedBySection summary={summary} />
      <ActivationSummary summary={summary} />
      <ImportSummary summary={summary} />
      <CommercialReadiness />
      <SuggestedNextActions summary={summary} />
    </>
  );
}

function CommercialReadiness() {
  const totalServices = SNAPSHOT_SERVICES.length;
  const needsReview = SNAPSHOT_SERVICES.filter(
    (s) => s.status === 'needs_review' || s.status === 'blocked',
  );
  const missingOwner = SNAPSHOT_SERVICES.filter((s) =>
    /needs review|unknown/i.test(s.billingOwner),
  );
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium text-[#f5f5f5]">Commercial readiness</h2>
      <p className="mb-4 text-xs text-[#a1a1aa]">
        Email linkage and services catalogue — both in preview mode while the database connection
        is being prepared. Manual email references and live editing activate after the database
        is connected.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminCard title="Email linkage readiness">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge text="Email linking — not active yet" tone="amber" />
              <Badge text="No inbox is being read" tone="green" />
              <Badge text="No emails being sent" tone="green" />
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Manual references will activate once the database is connected. Gmail and Outlook
              integration are kept out of scope until separately approved.
            </p>
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#71717a]">
                Planned categories ({EMAIL_CATEGORY_ORDER.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EMAIL_CATEGORY_ORDER.map((c) => (
                  <Badge key={c} text={EMAIL_CATEGORY_LABEL[c]} tone="neutral" />
                ))}
              </div>
            </div>
            <p className="text-xs">
              <Link
                href="/admin/ops/emails"
                className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
              >
                Open Emails →
              </Link>
            </p>
          </div>
        </AdminCard>

        <AdminCard title="Services catalogue">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge text={`${totalServices} total`} tone="neutral" />
              <Badge text={`${needsReview.length} need review`} tone="amber" />
              <Badge text={`${missingOwner.length} missing billing owner`} tone="amber" />
            </div>
            {needsReview.length > 0 && (
              <ul className="space-y-1.5 text-xs text-[#e4e4e7]">
                {needsReview.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-1.5">
                    <span aria-hidden className="text-[#52525b]">·</span>
                    <span>{s.name}</span>
                    <Badge text={SERVICE_STATUS_LABEL[s.status]} tone={SERVICE_STATUS_TONE[s.status]} />
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs">
              <Link
                href="/admin/ops/services"
                className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
              >
                Open Services →
              </Link>
            </p>
          </div>
        </AdminCard>
      </div>
    </section>
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

// ---------------------------------------------------------------- New sections

function ClientPortfolio({ items }: { items: IndexItem[] }) {
  const clients = items.filter((it) => it.type === 'client');
  const assets = items.filter((it) => it.type === 'asset');

  const internal = clients.filter((c) => c.tags.includes('internal'));
  const external = clients.filter(
    (c) => !c.tags.includes('internal') && (c.tags.includes('client') || c.tags.includes('external')),
  );
  const unmapped = clients.filter(
    (c) => c.status === 'lead' || c.tags.includes('unmapped'),
  );

  // assets-per-client tally
  const assetsByClient = new Map<string, number>();
  for (const a of assets) {
    const cid = a.relations?.clientId;
    if (!cid) continue;
    assetsByClient.set(cid, (assetsByClient.get(cid) ?? 0) + 1);
  }
  const topClients = clients
    .map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      url: c.url,
      assetCount: assetsByClient.get(c.id) ?? 0,
    }))
    .filter((r) => r.assetCount > 0)
    .sort((a, b) => b.assetCount - a.assetCount)
    .slice(0, 10);

  return (
    <div className="mb-6">
      <AdminCard title="Client / entity portfolio">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <PortfolioTile label="Internal products" value={internal.length} tone="green" />
          <PortfolioTile label="External clients" value={external.length} tone="blue" />
          <PortfolioTile label="Unmapped" value={unmapped.length} tone={unmapped.length > 0 ? 'amber' : 'neutral'} />
        </div>
        <DataTable
          rows={topClients}
          columns={[
            {
              key: 'client',
              header: 'Client',
              render: (r) =>
                r.url ? (
                  <Link href={r.url} className="text-xs text-emerald-300 hover:underline">
                    {r.title}
                  </Link>
                ) : (
                  <span className="text-xs text-[#e4e4e7]">{r.title}</span>
                ),
            },
            {
              key: 'division',
              header: 'Division',
              render: (r) => <span className="text-xs text-[#a1a1aa]">{r.subtitle ?? '—'}</span>,
            },
            {
              key: 'assets',
              header: 'Assets',
              render: (r) => <span className="font-mono">{r.assetCount}</span>,
              className: 'text-right',
            },
          ]}
          empty={<p className="text-xs text-[#71717a]">No assets linked to clients.</p>}
        />
      </AdminCard>
    </div>
  );
}

function InfrastructureFootprint({ summary, items }: { summary: ReportsSummary; items: IndexItem[] }) {
  const v = summary.totals.vercelProjects;

  const vercelByTeam = Object.entries(v.byTeam)
    .map(([team, count]) => ({ id: team, label: team, count }))
    .sort((a, b) => b.count - a.count);

  const vercelStateOrder = ['live', 'migrated_to_hetzner', 'dormant', 'unknown'];
  const vercelByState = vercelStateOrder.map((state) => ({
    id: state,
    label: state,
    count: v.byState[state] ?? 0,
  }));

  // Hetzner: derive role from labels — we stored role tag during indexing
  const hetznerItems = items.filter((it) => it.type === 'hetzner_server');
  const hetznerByRole: Record<string, number> = {};
  for (const h of hetznerItems) {
    // labels were spread into tags after the location + serverType tags
    const role =
      h.tags.find((t) => t === 'web' || t === 'data' || t === 'trading-bot') ?? 'other';
    hetznerByRole[role] = (hetznerByRole[role] ?? 0) + 1;
  }
  const hetznerRoleRows = Object.entries(hetznerByRole)
    .map(([role, count]) => ({ id: role, label: role, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mb-6">
      <AdminCard title="Infrastructure footprint">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">Vercel by team</p>
            <DataTable
              rows={vercelByTeam}
              columns={[
                { key: 'team', header: 'Team', render: (r) => <span className="text-xs text-[#e4e4e7]">{r.label}</span> },
                { key: 'count', header: 'Projects', render: (r) => <span className="font-mono">{r.count}</span>, className: 'text-right' },
              ]}
              empty={<p className="text-xs text-[#71717a]">No Vercel teams indexed.</p>}
            />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">Vercel by state</p>
            <DataTable
              rows={vercelByState.filter((r) => r.count > 0)}
              columns={[
                { key: 'state', header: 'State', render: (r) => <Badge text={r.label.replace(/_/g, ' ')} tone={vercelStateTone(r.label)} /> },
                { key: 'count', header: 'Count', render: (r) => <span className="font-mono">{r.count}</span>, className: 'text-right' },
              ]}
              empty={<p className="text-xs text-[#71717a]">No Vercel state data.</p>}
            />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">Hetzner by role</p>
            <DataTable
              rows={hetznerRoleRows}
              columns={[
                { key: 'role', header: 'Role', render: (r) => <span className="text-xs text-[#e4e4e7]">{r.label}</span> },
                { key: 'count', header: 'Servers', render: (r) => <span className="font-mono">{r.count}</span>, className: 'text-right' },
              ]}
              empty={<p className="text-xs text-[#71717a]">No Hetzner servers indexed.</p>}
            />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">Cloudflare</p>
            <div className="rounded-2xl border border-[#27272a] bg-[#0e0e10] p-4">
              <p className="mb-1 text-2xl font-semibold text-[#f5f5f5]">{summary.totals.cloudflareZones}</p>
              <p className="text-[11px] text-[#71717a]">
                zones indexed (illustrative subset — full list activates with CLOUDFLARE_API_TOKEN)
              </p>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

type RiskRow = {
  id: string;
  title: string;
  source: string;
  severity: string;
  status: string;
  blockedBy: string;
  url?: string;
};

function RiskRegister({ items }: { items: IndexItem[] }) {
  // audit findings: severity is tags[2] (kind, severity, status)
  const findings: RiskRow[] = items
    .filter((it) => it.type === 'audit_finding')
    .map((f) => ({
      id: f.id,
      title: f.title,
      source: 'audit',
      severity: f.tags[2] ?? 'unknown',
      status: f.status ?? 'open',
      blockedBy: (f.blockedBy ?? []).join(', ') || '—',
      url: f.url,
    }));

  // decisions: tags = ['review_decision', cluster, risk, ...blockedBy]
  const decisionRisks: RiskRow[] = items
    .filter((it) => it.type === 'review_decision')
    .map((d) => ({
      id: d.id,
      title: d.title,
      source: 'decision',
      severity: d.tags[2] ?? 'unknown',
      status: d.status ?? 'open',
      blockedBy: (d.blockedBy ?? []).filter((b) => b !== 'none').join(', ') || 'human_decision',
      url: d.url,
    }));

  const sevRank = (s: string) => (s === 'high' || s === 'critical' ? 3 : s === 'med' || s === 'major' ? 2 : s === 'low' || s === 'minor' ? 1 : 0);

  const rows = [...findings, ...decisionRisks]
    .sort((a, b) => sevRank(b.severity) - sevRank(a.severity))
    .slice(0, 10);

  return (
    <div className="mb-6">
      <AdminCard title="Risk register (top 10)">
        <DataTable
          rows={rows}
          columns={[
            {
              key: 'title',
              header: 'Title',
              render: (r) =>
                r.url ? (
                  <Link href={r.url} className="text-xs text-emerald-300 hover:underline">
                    {r.title}
                  </Link>
                ) : (
                  <span className="text-xs text-[#e4e4e7]">{r.title}</span>
                ),
            },
            {
              key: 'source',
              header: 'Source',
              render: (r) => <Badge text={r.source} tone={r.source === 'audit' ? 'amber' : 'blue'} />,
            },
            {
              key: 'severity',
              header: 'Severity / risk',
              render: (r) => <Badge text={r.severity} tone={riskTone(r.severity === 'critical' || r.severity === 'major' ? 'high' : r.severity === 'minor' ? 'low' : r.severity)} />,
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <span className="text-xs text-[#a1a1aa]">{r.status}</span>,
            },
            {
              key: 'blockedBy',
              header: 'Blocked by',
              render: (r) => <span className="font-mono text-[10px] text-[#a1a1aa]">{r.blockedBy}</span>,
            },
          ]}
          empty={<p className="text-xs text-[#71717a]">No risks indexed.</p>}
        />
      </AdminCard>
    </div>
  );
}

function RenewalPressure({ items }: { items: IndexItem[] }) {
  const renewals = items.filter((it) => it.type === 'renewal');

  const withDate = renewals
    .map((r) => {
      const m = r.body.match(/due (\d{4}-\d{2}-\d{2})/);
      return { item: r, dueIso: m?.[1] ?? null };
    })
    .filter((r) => r.dueIso !== null) as { item: IndexItem; dueIso: string }[];

  const today = new Date().toISOString().slice(0, 10);
  const dueOrOverdue = withDate.filter((r) => r.dueIso <= today).length;
  const topUrgent = [...withDate].sort((a, b) => a.dueIso.localeCompare(b.dueIso)).slice(0, 5);
  const needsConfirm = renewals.filter((r) => /confirm/i.test(r.body)).length;

  return (
    <div className="mb-6">
      <AdminCard title="Renewal pressure">
        <div className="mb-4 flex flex-wrap items-baseline gap-4">
          <Stat label="Due / overdue" value={dueOrOverdue} tone={dueOrOverdue > 0 ? 'rose' : 'neutral'} />
          <Stat label="Needs date confirm" value={needsConfirm} tone={needsConfirm > 0 ? 'amber' : 'neutral'} />
          <p className="font-mono text-xs text-[#71717a]">{renewals.length} tracked</p>
        </div>
        <DataTable
          rows={topUrgent.map((r) => ({
            id: r.item.id,
            title: r.item.title,
            subtitle: r.item.subtitle ?? '—',
            due: r.dueIso,
            url: r.item.url,
          }))}
          columns={[
            {
              key: 'title',
              header: 'Renewal',
              render: (r) =>
                r.url ? (
                  <Link href={r.url} className="text-xs text-emerald-300 hover:underline">
                    {r.title}
                  </Link>
                ) : (
                  <span className="text-xs text-[#e4e4e7]">{r.title}</span>
                ),
            },
            { key: 'subtitle', header: 'Subject', render: (r) => <span className="text-xs text-[#a1a1aa]">{r.subtitle}</span> },
            {
              key: 'due',
              header: 'Next due',
              render: (r) => <span className="font-mono text-[11px]">{r.due}</span>,
              className: 'text-right',
            },
          ]}
          empty={<p className="text-xs text-[#71717a]">No renewals with dates.</p>}
        />
      </AdminCard>
    </div>
  );
}

function DecisionBacklog({ summary }: { summary: ReportsSummary }) {
  const risks = summary.decisionsByRisk;
  const total = Object.values(risks).reduce((a, b) => a + b, 0);
  const high = risks.high ?? 0;
  const med = risks.med ?? 0;
  const low = risks.low ?? 0;

  const clusters = Object.entries(summary.decisionsByCluster)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ id: k, label: k.replace(/_/g, ' '), count: v }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mb-6">
      <AdminCard
        title="Decision backlog"
        action={<span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#71717a]">{total} pending</span>}
      >
        <div className="mb-4 grid grid-cols-3 gap-3">
          <PortfolioTile label="High" value={high} tone={high > 0 ? 'rose' : 'neutral'} />
          <PortfolioTile label="Med" value={med} tone={med > 0 ? 'amber' : 'neutral'} />
          <PortfolioTile label="Low" value={low} tone={low > 0 ? 'blue' : 'neutral'} />
        </div>
        <div className="mb-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">By cluster</p>
          <DataTable
            rows={clusters}
            columns={[
              { key: 'cluster', header: 'Cluster', render: (r) => <span className="text-xs text-[#e4e4e7]">{r.label}</span> },
              { key: 'count', header: 'Count', render: (r) => <span className="font-mono">{r.count}</span>, className: 'text-right' },
            ]}
            empty={<p className="text-xs text-[#71717a]">No decisions indexed.</p>}
          />
        </div>
        <p className="mt-3 rounded-lg border border-dashed border-[#27272a] bg-[#0a0a0b] px-3 py-2 text-[11px] text-[#71717a]">
          Local review state not visible to server — see{' '}
          <Link href="/admin/ops/review" className="text-emerald-300 hover:underline">
            /admin/ops/review
          </Link>{' '}
          for browser-local accept / reject / notes.
        </p>
      </AdminCard>
    </div>
  );
}

function SuggestedNextActions({ summary }: { summary: ReportsSummary }) {
  const decisionsHigh = summary.decisionsByRisk.high ?? 0;
  const decisionsTotal =
    (summary.decisionsByRisk.high ?? 0) +
    (summary.decisionsByRisk.med ?? 0) +
    (summary.decisionsByRisk.low ?? 0);
  const importBlocked = summary.importReadiness.blocked;
  const importNeedsReview = summary.importReadiness.needs_review;
  const openIncidents = summary.totals.openIncidents;
  const openTickets = summary.totals.openTickets;

  const beforeDb = [
    `Walk the ${decisionsTotal} pending decisions in /admin/ops/review (${decisionsHigh} high-risk first).`,
    `Triage the ${importNeedsReview} import groups marked needs_review so the first import is clean.`,
    `Confirm renewal dates with xneelo / Hetzner / Vercel before reminders go live.`,
    `Resolve ${openIncidents} open incident${openIncidents === 1 ? '' : 's'} or downgrade to monitoring.`,
    `Close out quick-win operator tickets (${openTickets} open) so the post-DB backlog is shorter.`,
  ];

  const afterDb = [
    'Run the snapshot import dry-run (/api/admin/ops/import/snapshot/preview) and review the diff.',
    'Commit the snapshot import so /admin/ops surfaces switch from snapshot to DB rows.',
    `Resolve the ${importBlocked} blocked import group${importBlocked === 1 ? '' : 's'} once provider tokens unlock the source data.`,
    'Wire BREVO_OPS_DIGEST_TO and BETTERSTACK_WEBHOOK_SECRET so renewal / incident notifications fire.',
    'Schedule the 07:00 SAST renewal digest cron in Vercel + verify the first run.',
  ];

  const afterProviderTokens = [
    'GITHUB_TOKEN: archive the canonical-pick losers across the 5 repo clusters.',
    'VERCEL_API_TOKEN: walk the ~25 dormant pumpbots-projects projects and delete confirmed unused ones.',
    'CLOUDFLARE_API_TOKEN: re-import full zone list and clean stale records (dev.saprivateschools dead A record).',
    'HETZNER_API_TOKEN: add a daily disk-usage check on ma130-apps; enable off-site Postgres backups for ma130-data.',
    'Schedule the first real sync runs for all four providers to baseline drift detection.',
  ];

  return (
    <div className="mb-6">
      <AdminCard title="Suggested next actions">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SuggestionColumn title="Before DB" items={beforeDb} tone="amber" />
          <SuggestionColumn title="After DB" items={afterDb} tone="blue" />
          <SuggestionColumn title="After provider tokens" items={afterProviderTokens} tone="green" />
        </div>
      </AdminCard>
    </div>
  );
}

function SuggestionColumn({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#0e0e10] p-4">
      <div className="mb-3">
        <Badge text={title} tone={tone} />
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-[#e4e4e7]">
            <span className="text-[#52525b]">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PortfolioTile({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  const ring =
    tone === 'green' ? 'border-emerald-400/30 bg-emerald-400/5'
    : tone === 'amber' ? 'border-amber-400/30 bg-amber-400/5'
    : tone === 'rose' ? 'border-rose-400/30 bg-rose-400/5'
    : tone === 'blue' ? 'border-sky-400/30 bg-sky-400/5'
    : 'border-[#27272a] bg-[#0e0e10]';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">{label}</p>
      <p className="text-2xl font-semibold text-[#f5f5f5]">{value}</p>
    </div>
  );
}

function vercelStateTone(state: string): Tone {
  if (state === 'live') return 'green';
  if (state === 'migrated_to_hetzner') return 'blue';
  if (state === 'dormant') return 'amber';
  return 'neutral';
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
