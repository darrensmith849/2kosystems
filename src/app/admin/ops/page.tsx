import Link from 'next/link';
import { isDbConfigured } from '@/lib/db/client';
import { AdminCard, SectionHeader, Badge } from '@/components/admin-ui';
import ActivationReadiness from '@/components/admin-ui/ActivationReadiness';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import {
  Search as SearchIcon,
  Chat as ChatIcon,
  Mail as MailIcon,
  Building as BuildingIcon,
  Boxes as BoxesIcon,
  Server as ServerIcon,
  Clipboard as ClipboardIcon,
  AlertTriangle as AlertTriangleIcon,
  CreditCard as CreditCardIcon,
  Shield as ShieldIcon,
  Eye as EyeIcon,
  Rocket as RocketIcon,
  Activity as ActivityIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  ArrowRight as ArrowRightIcon,
  type IconComponent,
} from '@/components/admin-ui/icons';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { buildReportsSummary, type ReportsSummary } from '@/lib/ops/ops-reports';
import { buildIndex, ACTIVATION_STEPS, type IndexItem } from '@/lib/ops/ops-knowledge-index';
import {
  SNAPSHOT_CLIENTS,
  SNAPSHOT_COUNTS,
  SNAPSHOT_DECISIONS,
} from '@/lib/ops/ops-snapshot-data';
import { SNAPSHOT_SERVICES } from '@/lib/ops/email-services-data';

// Ops Command Centre — Cloudflare-style hero + analytics + dashboard grid.
// All counters route through buildReportsSummary() and SNAPSHOT_* fixtures so
// snapshot mode and live DB share one code path. The page is purely
// server-rendered; every derived stat is wrapped in try/catch so a downstream
// failure never blanks the dashboard.
//
// Layout contract (do not regress):
//   1. Page hero — H1, subtitle, slim preview-mode pill (right action slot).
//   2. Top action row — Ask 2KO (primary) · Search · Export snapshot.
//   3. Analytics grid — 6 MetricCard tiles (Clients/Assets/Repos/Services/
//      Incidents/Review decisions).
//   4. Main dashboard cards — 2-column GlassCard grid (Clients & assets /
//      Infrastructure / Email references / Services / Tickets & renewals /
//      Activation).
//   5. Bottom row — 3-column GlassCard grid (Audit summary / Next steps /
//      Health readiness).
//   6. Activation footer — ActivationReadiness when !isDbConfigured().
// The floating Ask 2KO widget mount lives in /admin/ops/layout.tsx — do NOT
// add it here. SnapshotBanner is rendered ONCE at the page hero — no per-row
// "PREVIEW" repetition downstream.

type Tone = 'neutral' | 'good' | 'warn' | 'risk';

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

  // Derived stats — every block in its own try/catch so a downstream throw
  // never blanks the dashboard.

  // Client internal/external/unmapped breakdown from snapshot tags.
  let clientInternal = 0;
  let clientExternal = 0;
  let clientUnmapped = 0;
  try {
    for (const c of SNAPSHOT_CLIENTS) {
      const tags = c.tags ?? [];
      if (tags.includes('unmapped')) clientUnmapped++;
      else if (tags.includes('internal')) clientInternal++;
      else clientExternal++;
    }
  } catch {
    /* leave zeros */
  }

  // Top-3 asset types from index where type === 'asset'; tags[1] holds type.
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

  // Repo split 2KO vs external.
  let repoTwoKo = 0;
  let repoExternal = 0;
  try {
    const cat = summary.reposByCategory;
    repoTwoKo = (cat['2ko_internal'] ?? 0) + (cat['shared_internal'] ?? 0);
    repoExternal = cat['external_client'] ?? 0;
  } catch {
    /* leave zeros */
  }

  // Services count + active/needs-review split.
  let servicesTotal = SNAPSHOT_COUNTS.clients ? SNAPSHOT_SERVICES.length : 0;
  let servicesActive = 0;
  let servicesNeedsReview = 0;
  try {
    servicesTotal = SNAPSHOT_SERVICES.length;
    for (const s of SNAPSHOT_SERVICES) {
      if (s.status === 'active') servicesActive++;
      if (s.status === 'needs_review') servicesNeedsReview++;
    }
  } catch {
    /* leave defaults */
  }

  // Incidents by severity.
  let incidentCritical = 0;
  let incidentMajor = 0;
  let incidentMinor = 0;
  try {
    const sev = summary.incidentsBySeverity;
    incidentCritical = sev['critical'] ?? 0;
    incidentMajor = sev['major'] ?? 0;
    incidentMinor = sev['minor'] ?? 0;
  } catch {
    /* leave zeros */
  }

  // Review decisions by risk.
  let decisionsTotal = 0;
  let decisionsHigh = 0;
  let decisionsMed = 0;
  let decisionsLow = 0;
  try {
    const r = summary.decisionsByRisk;
    decisionsHigh = r['high'] ?? 0;
    decisionsMed = r['med'] ?? 0;
    decisionsLow = r['low'] ?? 0;
    decisionsTotal = decisionsHigh + decisionsMed + decisionsLow;
    if (decisionsTotal === 0) {
      // Fall back to SNAPSHOT_DECISIONS length so the tile is never blank in
      // snapshot mode if reports summary couldn't compute risk buckets.
      decisionsTotal = SNAPSHOT_DECISIONS.length;
    }
  } catch {
    decisionsTotal = SNAPSHOT_DECISIONS.length;
  }

  // Top 3 client names (sentence-case, no enum echo).
  let topClients: { id: string; name: string }[] = [];
  try {
    topClients = SNAPSHOT_CLIENTS.slice(0, 3).map((c) => ({ id: c.id, name: c.name }));
  } catch {
    topClients = [];
  }

  // Vercel state breakdown for Infrastructure card.
  const v = summary.totals.vercelProjects;
  const vLive = v.byState['live'] ?? 0;
  const vDormant = v.byState['dormant'] ?? 0;
  const vMigrated = v.byState['migrated_to_hetzner'] ?? 0;

  // Renewals — urgent window count.
  let urgentRenewals = 0;
  try {
    const w = summary.renewalsByWindow;
    urgentRenewals = (w['overdue'] ?? 0) + (w['due'] ?? 0) + (w['within_7'] ?? 0);
  } catch {
    urgentRenewals = 0;
  }

  // Top pending activation steps (next steps card).
  let pendingSteps: { id: string; label: string }[] = [];
  try {
    pendingSteps = ACTIVATION_STEPS.filter(
      (s) => !s.done && s.group !== 'Optional later',
    )
      .slice(0, 3)
      .map((s) => ({ id: s.id, label: s.label }));
  } catch {
    pendingSteps = [];
  }

  // Audit findings — high/critical count + first 3.
  let auditUrgentCount = 0;
  let auditUrgentTop: { id: string; title: string }[] = [];
  try {
    const findings = index.filter(
      (i) =>
        i.type === 'audit_finding' &&
        (i.tags.includes('high') || i.tags.includes('critical')) &&
        i.status !== 'resolved',
    );
    auditUrgentCount = findings.length;
    auditUrgentTop = findings.slice(0, 3).map((f) => ({ id: f.id, title: f.title }));
  } catch {
    /* leave defaults */
  }

  // Health readiness — env presence-only (never echo values).
  const envPresent = (k: string) => Boolean(process.env[k]);
  const healthRows: { label: string; tone: StatusTone }[] = [
    { label: 'Database', tone: dbConfigured ? 'ok' : 'risk' },
    { label: 'Search and assistant', tone: envPresent('ANTHROPIC_API_KEY') ? 'ok' : 'warn' },
    { label: 'Scheduled jobs', tone: envPresent('CRON_SECRET') ? 'ok' : 'warn' },
    { label: 'Email digests (Brevo)', tone: envPresent('BREVO_OPS_DIGEST_TO') ? 'ok' : 'warn' },
  ];

  return (
    <>
      <SectionHeader
        title="Ops Command Centre"
        subtitle="A single view of 2KO clients, assets, infrastructure, support, renewals, and activation."
        action={snapshot ? <PreviewPill /> : null}
      />

      {/* Top action row — Cloudflare-style + Add buttons. */}
      <div className="mt-2 mb-6 flex flex-wrap gap-2">
        <ActionButton
          href="/admin/ops/ask"
          Icon={ChatIcon}
          label="Ask 2KO"
          variant="primary"
        />
        <ActionButton
          href="/admin/ops/search"
          Icon={SearchIcon}
          label="Search"
          variant="secondary"
        />
        <ActionButton
          href="/api/admin/ops/export/snapshot.json"
          Icon={DownloadIcon}
          label="Export snapshot"
          variant="secondary"
        />
      </div>

      {/* Analytics grid — 6 MetricCard tiles. */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Clients"
          value={summary.totals.clients || SNAPSHOT_COUNTS.clients}
          Icon={BuildingIcon}
          hint={`${clientInternal} internal · ${clientExternal} external · ${clientUnmapped} unmapped`}
        />
        <MetricCard
          title="Assets"
          value={summary.totals.assets || SNAPSHOT_COUNTS.assets}
          Icon={BoxesIcon}
          hint={assetTypeTopline || undefined}
        />
        <MetricCard
          title="Repos"
          value={summary.totals.repos || SNAPSHOT_COUNTS.repos}
          Icon={CodeIcon}
          hint={`${repoTwoKo} 2KO · ${repoExternal} external`}
        />
        <MetricCard
          title="Services"
          value={servicesTotal}
          Icon={CreditCardIcon}
          hint="Catalogue · pricing · contacts"
        />
        <MetricCard
          title="Incidents"
          value={summary.totals.openIncidents}
          Icon={AlertTriangleIcon}
          hint={`${incidentCritical} critical · ${incidentMajor} major · ${incidentMinor} minor`}
          tone={summary.totals.openIncidents > 0 ? 'warn' : 'neutral'}
        />
        <MetricCard
          title="Review decisions"
          value={decisionsTotal}
          Icon={EyeIcon}
          hint={`${decisionsHigh} high · ${decisionsMed} med · ${decisionsLow} low`}
          tone={decisionsHigh > 0 ? 'warn' : 'neutral'}
        />
      </div>

      {/* Main dashboard cards — 2-column grid. */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <GlassCard
          Icon={BuildingIcon}
          title="Clients and assets"
          action={<CardLink href="/admin/ops/clients" label="View all" />}
          footerSlot={
            <p className="text-xs text-zinc-500">
              {(summary.totals.clients || SNAPSHOT_COUNTS.clients)} clients ·{' '}
              {(summary.totals.assets || SNAPSHOT_COUNTS.assets)} assets ·{' '}
              {(summary.totals.divisions || SNAPSHOT_COUNTS.divisions)} divisions
            </p>
          }
        >
          {topClients.length === 0 ? (
            <p className="text-xs text-zinc-500">No client data available.</p>
          ) : (
            <ul className="space-y-2">
              {topClients.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <StatusDot tone="neutral" size="sm" />
                  <span className="text-sm text-zinc-100">{c.name}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard
          Icon={ServerIcon}
          title="Infrastructure"
          action={<CardLink href="/admin/ops/infrastructure" label="View" />}
          footerSlot={
            <p className="text-xs text-zinc-500">
              {summary.totals.cloudflareZones} Cloudflare zones managed
            </p>
          }
        >
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-zinc-100">
              <StatusDot tone="ok" size="sm" />
              <span>Hetzner ({summary.totals.hetznerServers || SNAPSHOT_COUNTS.hetznerServers})</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-100">
              <StatusDot tone="ok" size="sm" />
              <span>
                Vercel ({vLive} live · {vDormant} dormant · {vMigrated} migrated)
              </span>
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-100">
              <StatusDot tone="ok" size="sm" />
              <span>Cloudflare zones ({summary.totals.cloudflareZones || SNAPSHOT_COUNTS.cloudflareZones})</span>
            </li>
          </ul>
        </GlassCard>

        <GlassCard
          Icon={MailIcon}
          title="Email references"
          action={<CardLink href="/admin/ops/emails" label="Open" />}
        >
          <p className="text-sm text-zinc-200">
            Service emails and client linkage planned.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Local drafts and exports enabled in browser.
          </p>
        </GlassCard>

        <GlassCard
          Icon={CreditCardIcon}
          title="Services"
          action={<CardLink href="/admin/ops/services" label="Open" />}
          footerSlot={
            <p className="text-xs text-zinc-500">
              Catalogue · pricing · contact roles · readiness
            </p>
          }
        >
          <p className="text-sm text-zinc-200">
            {servicesActive} active · {servicesNeedsReview} needs review
          </p>
        </GlassCard>

        <GlassCard
          Icon={ClipboardIcon}
          title="Tickets and renewals"
          action={<CardLink href="/admin/ops/tickets" label="Open" />}
        >
          <p className="text-sm text-zinc-200">
            {summary.totals.openTickets} open tickets
          </p>
          <p className="mt-1 text-sm text-zinc-200">
            {urgentRenewals} urgent renewals
          </p>
        </GlassCard>

        <GlassCard
          Icon={RocketIcon}
          title="Activation"
          action={<CardLink href="/admin/ops/activation" label="Open" />}
          footerSlot={<p className="text-xs text-zinc-500">Commercial preflight inside.</p>}
        >
          <div className="flex items-center gap-2">
            <Badge
              text={`${summary.activationReadiness.ready}/${summary.activationReadiness.total} ready`}
              tone="amber"
            />
            <span className="text-xs text-zinc-500">
              {summary.activationReadiness.pending} pending
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Bottom row — 3-column compact summary cards. */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <GlassCard
          Icon={ShieldIcon}
          title="Audit summary"
          action={<CardLink href="/admin/ops/audits" label="Open" />}
        >
          <p className="text-sm text-zinc-200">
            {auditUrgentCount} high or critical findings
          </p>
          {auditUrgentTop.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {auditUrgentTop.map((f) => (
                <li key={f.id} className="flex items-start gap-2">
                  <StatusDot tone="risk" size="sm" />
                  <span className="text-xs text-zinc-300 leading-snug">{f.title}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard
          Icon={ArrowRightIcon}
          title="Next steps"
          action={<CardLink href="/admin/ops/activation" label="Open" />}
        >
          {pendingSteps.length === 0 ? (
            <p className="text-xs text-zinc-500">
              Nothing flagged. Snapshot data may not be loaded — connect DATABASE_URL or
              check the snapshot fixtures.
            </p>
          ) : (
            <ul className="space-y-2">
              {pendingSteps.map((s) => (
                <li key={s.id} className="flex items-start gap-2">
                  <StatusDot tone="warn" size="sm" />
                  <span className="text-sm text-zinc-200 leading-snug">{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard
          Icon={ActivityIcon}
          title="Health readiness"
          action={<CardLink href="/admin/ops/health" label="Open" />}
        >
          <ul className="space-y-2">
            {healthRows.map((r) => (
              <li key={r.label} className="flex items-center gap-2">
                <StatusDot tone={r.tone} size="sm" />
                <span className="text-sm text-zinc-200">{r.label}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {snapshot && (
        <div className="mb-6">
          <SnapshotBanner area="The Overview" />
        </div>
      )}

      {!dbConfigured && (
        <div className="mb-6">
          <AdminCard title="Activation readiness">
            <ActivationReadiness />
          </AdminCard>
        </div>
      )}
    </>
  );
}

// --------------------------------------------------------------- Preview pill

function PreviewPill() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1 text-xs font-medium text-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
      Preview mode
    </span>
  );
}

// --------------------------------------------------------------- Action button

function ActionButton({
  href,
  Icon,
  label,
  variant,
}: {
  href: string;
  Icon: IconComponent;
  label: string;
  variant: 'primary' | 'secondary';
}) {
  const styles =
    variant === 'primary'
      ? 'border-white/[0.08] bg-white/[0.06] text-zinc-100 hover:bg-white/[0.10]'
      : 'border-white/[0.08] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.05]';
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${styles}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

// --------------------------------------------------------------- MetricCard

function MetricCard({
  title,
  value,
  hint,
  Icon,
  tone = 'neutral',
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
  Icon?: IconComponent;
  tone?: Tone;
}) {
  const valueColor =
    tone === 'good'
      ? 'text-emerald-200'
      : tone === 'warn'
        ? 'text-amber-200'
        : tone === 'risk'
          ? 'text-rose-200'
          : 'text-white';
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-zinc-400 shrink-0" />}
        <p className="text-[11px] font-medium text-zinc-500">{title}</p>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${valueColor}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500 leading-snug">{hint}</p>}
    </div>
  );
}

// --------------------------------------------------------------- StatusDot

type StatusTone = 'ok' | 'warn' | 'risk' | 'neutral';

function StatusDot({ tone, size = 'sm' }: { tone: StatusTone; size?: 'sm' | 'md' }) {
  const color =
    tone === 'ok'
      ? 'bg-emerald-400'
      : tone === 'warn'
        ? 'bg-amber-400'
        : tone === 'risk'
          ? 'bg-rose-400'
          : 'bg-zinc-500';
  const sizing = size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5';
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${color} ${sizing}`}
      aria-hidden="true"
    />
  );
}

// --------------------------------------------------------------- GlassCard

function GlassCard({
  Icon,
  title,
  children,
  action,
  footerSlot,
}: {
  Icon?: IconComponent;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  footerSlot?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="h-4 w-4 text-zinc-400 shrink-0" />}
          <p className="text-sm font-medium text-zinc-100 truncate">{title}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-5 pb-5">{children}</div>
      {footerSlot && (
        <div className="border-t border-white/[0.04] px-5 py-3">{footerSlot}</div>
      )}
    </div>
  );
}

// --------------------------------------------------------------- CardLink

function CardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
    >
      <span>{label}</span>
      <ArrowRightIcon className="h-3 w-3" />
    </Link>
  );
}
