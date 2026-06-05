import Link from 'next/link';
import { isDbConfigured } from '@/lib/db/client';
import { AdminCard, SectionHeader, Badge } from '@/components/admin-ui';
import ActivationReadiness from '@/components/admin-ui/ActivationReadiness';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  Mail as MailIcon,
  Building as BuildingIcon,
  Boxes as BoxesIcon,
  Server as ServerIcon,
  Clipboard as ClipboardIcon,
  Calendar as CalendarIcon,
  AlertTriangle as AlertTriangleIcon,
  CreditCard as CreditCardIcon,
  Chart as ChartIcon,
  Shield as ShieldIcon,
  Eye as EyeIcon,
  Rocket as RocketIcon,
  Activity as ActivityIcon,
  Book as BookIcon,
  Download as DownloadIcon,
  ArrowRight as ArrowRightIcon,
  type IconComponent,
} from '@/components/admin-ui/icons';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { buildReportsSummary, type ReportsSummary } from '@/lib/ops/ops-reports';
import { buildIndex, ACTIVATION_STEPS, type IndexItem } from '@/lib/ops/ops-knowledge-index';
import { SNAPSHOT_DECISIONS, SNAPSHOT_CLIENTS } from '@/lib/ops/ops-snapshot-data';
import { computeRenewalWindow } from '@/lib/ops/renewals-window';

// Ops Command Centre — single front-door page. All counters route through
// buildReportsSummary() so snapshot mode and live DB share one code path. The
// page is purely server-rendered; every fetch is wrapped in try/catch so a
// downstream failure never blanks the dashboard.
//
// Layout contract (do not regress):
//   1. Today's picture — top stats tiles (snapshot-driven totals).
//   2. Next action — the single most important thing to do right now.
//   3. Key blockers — credential/env gates blocking automation.
//   4. Operational areas — six executive cards linking deeper into the
//      console (Clients & assets, Infrastructure, Workflows, Commercial ops,
//      Email references, Activation).
//   5. Quick actions — eight one-tap shortcuts to common workflows.
// Every snapshot/env read is wrapped in try/catch so a broken upstream
// never blanks the dashboard; the safe-fallback EMPTY_SUMMARY mirrors the
// real ReportsSummary shape.

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
        subtitle="Today's picture and what needs attention."
      />
      {snapshot && <SnapshotBanner area="The Overview" />}

      <SectionLabel title="Today's picture" />
      <TodaysPicture summary={summary} index={index} />

      <SectionLabel title="Next action" />
      <NextAction summary={summary} index={index} />

      <SectionLabel title="Key blockers" />
      <KeyBlockers />

      <SectionLabel title="Operational areas" />
      <OperationalAreas summary={summary} />

      <SectionLabel title="Quick actions" />
      <QuickActions />

      {!dbConfigured && (
        <div className="mb-6">
          <ActivationReadiness />
        </div>
      )}
    </>
  );
}

// --------------------------------------------------------------- Section label

function SectionLabel({ title }: { title: string }) {
  return (
    <p className="mt-2 mb-3 text-sm font-medium text-zinc-100">
      {title}
    </p>
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

// --------------------------------------------------------------- Next action

type AttentionRow = {
  id: string;
  icon: string;
  title: string;
  context: string;
  href: string;
  badge: { text: string; tone: Tone };
};

function buildAttentionRows(summary: ReportsSummary, index: IndexItem[]): AttentionRow[] {
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

  void summary;
  return rows;
}

function NextAction({ summary, index }: { summary: ReportsSummary; index: IndexItem[] }) {
  const rows = buildAttentionRows(summary, index);
  const top = rows.slice(0, 8);
  const headline = top[0];
  const rest = top.slice(1);

  return (
    <div className="mb-6">
      <AdminCard title="What needs attention">
        {top.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Nothing flagged. Snapshot data may not be loaded — connect DATABASE_URL or check the
            snapshot fixtures.
          </p>
        ) : (
          <div className="space-y-4">
            {headline && (
              <Link
                href={headline.href}
                className="block rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4 hover:border-emerald-400/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-emerald-300">
                      Do this next
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-zinc-100">{headline.title}</p>
                    <p className="mt-1 text-xs text-zinc-400 whitespace-pre-line leading-snug">
                      {headline.context}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge text={headline.badge.text} tone={headline.badge.tone} />
                    <ArrowRightIcon className="h-4 w-4 text-emerald-300" />
                  </div>
                </div>
              </Link>
            )}
            {rest.length > 0 && (
              <ul className="space-y-3">
                {rest.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-start gap-3 border-b border-white/[0.04] pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs text-emerald-300/80 w-6 shrink-0">
                      {r.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={r.href}
                        className="text-xs text-zinc-100 hover:text-white font-medium"
                      >
                        {r.title}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500 whitespace-pre-line leading-snug">
                        {r.context}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Badge text={r.badge.text} tone={r.badge.tone} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function riskRank(r: 'low' | 'med' | 'high'): number {
  if (r === 'high') return 3;
  if (r === 'med') return 2;
  return 1;
}

// --------------------------------------------------------------- Key blockers

function KeyBlockers() {
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

  const blockedCount = blockers.filter((b) => b.status === 'blocked').length;
  const resolvedCount = blockers.filter((b) => b.status === 'resolved').length;
  const optionalCount = blockers.filter((b) => b.status === 'optional').length;

  return (
    <div className="mb-6">
      <AdminCard
        title="Credentials and decisions"
        action={
          <p className="text-xs text-zinc-500">
            {blockedCount} blocked · {resolvedCount} resolved · {optionalCount} optional
          </p>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {blockers.map((b) => (
            <div
              key={b.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 flex flex-col gap-2"
            >
              <p className="text-xs text-zinc-100 font-medium leading-tight">{b.label}</p>
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

// --------------------------------------------------------------- Operational areas

type AreaCardProps = {
  href: string;
  Icon: IconComponent;
  title: string;
  summary: string;
};

function AreaCard({ href, Icon, title, summary }: AreaCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.08] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-zinc-100 truncate">{title}</p>
        </div>
        <ArrowRightIcon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
      </div>
      <p className="mt-2 text-xs text-zinc-400 leading-snug">{summary}</p>
      <p className="mt-2 text-xs text-emerald-300/80 group-hover:text-emerald-200">
        View
      </p>
    </Link>
  );
}

function OperationalAreas({ summary }: { summary: ReportsSummary }) {
  const t = summary.totals;
  const v = t.vercelProjects;

  // Email-references summary — count snapshot email refs without forcing an
  // import to the data file. Soft-count via the index would be cleaner; this
  // is a one-line teaser, not the authoritative figure, so we hard-code the
  // hint copy instead of risking a snapshot import here.
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AreaCard
          href="/admin/ops/clients"
          Icon={BuildingIcon}
          title="Clients & assets"
          summary={`${t.clients} clients · ${t.assets} assets · ${t.divisions} divisions`}
        />
        <AreaCard
          href="/admin/ops/infrastructure"
          Icon={ServerIcon}
          title="Infrastructure"
          summary={`${t.hetznerServers} Hetzner · ${v.total} Vercel · ${t.cloudflareZones} Cloudflare zones`}
        />
        <AreaCard
          href="/admin/ops/tickets"
          Icon={ClipboardIcon}
          title="Workflows"
          summary={`${t.openTickets} open tickets · ${t.openIncidents} open incidents`}
        />
        <AreaCard
          href="/admin/ops/services"
          Icon={CreditCardIcon}
          title="Commercial ops"
          summary="Services catalogue · pricing · contact roles · readiness"
        />
        <AreaCard
          href="/admin/ops/emails"
          Icon={MailIcon}
          title="Email references"
          summary="Service emails & client linkage · local drafts & exports"
        />
        <AreaCard
          href="/admin/ops/activation"
          Icon={RocketIcon}
          title="Activation"
          summary={`${summary.activationReadiness.ready}/${summary.activationReadiness.total} ready · commercial preflight inside`}
        />
      </div>
    </div>
  );
}

// --------------------------------------------------------------- Quick actions

type QuickActionProps = {
  href: string;
  Icon: IconComponent;
  label: string;
  accent: 'emerald' | 'sky' | 'amber' | 'neutral';
};

const ACCENT_BORDER: Record<QuickActionProps['accent'], string> = {
  emerald: 'border-emerald-400/20 bg-emerald-400/[0.04] hover:border-emerald-400/40 hover:bg-emerald-400/[0.08]',
  sky: 'border-sky-400/20 bg-sky-400/[0.04] hover:border-sky-400/40 hover:bg-sky-400/[0.08]',
  amber: 'border-amber-400/20 bg-amber-400/[0.04] hover:border-amber-400/40 hover:bg-amber-400/[0.08]',
  neutral: 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.04]',
};

const ACCENT_ICON: Record<QuickActionProps['accent'], string> = {
  emerald: 'text-emerald-300',
  sky: 'text-sky-300',
  amber: 'text-amber-300',
  neutral: 'text-zinc-400',
};

function QuickActionButton({ href, Icon, label, accent }: QuickActionProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${ACCENT_BORDER[accent]}`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <Icon className={`h-4 w-4 shrink-0 ${ACCENT_ICON[accent]}`} />
        <span className="text-sm font-medium text-zinc-100 truncate">{label}</span>
      </span>
      <ArrowRightIcon className={`h-4 w-4 shrink-0 ${ACCENT_ICON[accent]}`} />
    </Link>
  );
}

function QuickActions() {
  return (
    <div className="mb-6">
      <AdminCard title="Quick actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <QuickActionButton
            href="/admin/ops/ask"
            Icon={ChatIcon}
            label="Ask 2KO"
            accent="emerald"
          />
          <QuickActionButton
            href="/admin/ops/search"
            Icon={SearchIcon}
            label="Search dashboard"
            accent="emerald"
          />
          <QuickActionButton
            href="/admin/ops/activation"
            Icon={RocketIcon}
            label="Review activation"
            accent="amber"
          />
          <QuickActionButton
            href="/admin/ops/emails"
            Icon={MailIcon}
            label="Email references"
            accent="sky"
          />
          <QuickActionButton
            href="/admin/ops/services"
            Icon={CreditCardIcon}
            label="Services"
            accent="sky"
          />
          <QuickActionButton
            href="/admin/ops/health"
            Icon={ActivityIcon}
            label="Health"
            accent="neutral"
          />
          <QuickActionButton
            href="/api/admin/ops/export/snapshot.json"
            Icon={DownloadIcon}
            label="Export snapshot"
            accent="neutral"
          />
          <QuickActionButton
            href="/admin/ops/runbooks"
            Icon={BookIcon}
            label="View runbooks"
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
      ? 'border-emerald-400/20 bg-emerald-400/[0.04]'
      : tone === 'amber'
        ? 'border-amber-400/20 bg-amber-400/[0.04]'
        : tone === 'rose'
          ? 'border-rose-400/20 bg-rose-400/[0.04]'
          : tone === 'blue'
            ? 'border-sky-400/20 bg-sky-400/[0.04]'
            : 'border-white/[0.06] bg-white/[0.02]';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="text-xs text-zinc-500 mb-2">
        {label}
      </p>
      <p className="text-xl font-semibold text-zinc-100">{value}</p>
      {subline && (
        <p className="mt-1 text-xs text-zinc-500 leading-snug">{subline}</p>
      )}
    </div>
  );
}

// Silence unused-icon import warnings — these are reserved for upcoming
// callsites in this file (DashboardIcon: future Today's-picture toolbar;
// ChartIcon/ShieldIcon/EyeIcon/AlertTriangleIcon/CalendarIcon/BoxesIcon:
// future operational-area subheaders). Centralising the import list now
// avoids churn when those callsites land. Each is also a documented
// member of OPS_NAV_ICONS so the explicit reference here doubles as a
// type-check guard against the icon module changing shape.
const _RESERVED_ICONS: IconComponent[] = [
  DashboardIcon,
  ChartIcon,
  ShieldIcon,
  EyeIcon,
  AlertTriangleIcon,
  CalendarIcon,
  BoxesIcon,
];
void _RESERVED_ICONS;
