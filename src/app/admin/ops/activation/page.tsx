import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AdminCard, Badge, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isDbConfigured } from '@/lib/db/client';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { validateSnapshot, VALIDATION_CATEGORY_LABEL } from '@/lib/ops/snapshot-validation';

// /admin/ops/activation — full 27-step bring-up sequence from snapshot mode
// through to a live, monitored, scheduled-job-driven ops console.
//
// Status signals are presence-only env reads. We never echo or log values.
// Steps that can only be confirmed by a human (SSH work, redeploys, snapshot
// import runs, sync runs) carry status "Manual" and the operator marks them
// done by following the matching runbook.

type Tone = 'green' | 'amber' | 'rose' | 'blue';

type StepStatus = 'Done' | 'Pending' | 'Blocked' | 'Manual' | 'Optional';

type BlockerToken =
  | 'env'
  | 'ssh'
  | 'db'
  | 'github_token'
  | 'vercel_token'
  | 'cloudflare_token'
  | 'hetzner_token'
  | 'human';

type Step = {
  n: number;
  title: string;
  description: string;
  status: StepStatus;
  blockedBy: BlockerToken[];
  where: string;
  runbook: string;
  safeNextAction: string;
};

const TOKEN_PANEL_ENVS = [
  'GITHUB_TOKEN',
  'VERCEL_API_TOKEN',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'HETZNER_API_TOKEN',
  'CRON_SECRET',
] as const;

function hasVercelCrons(): boolean {
  try {
    const path = join(process.cwd(), 'vercel.json');
    if (!existsSync(path)) return false;
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw) as { crons?: unknown };
    return Array.isArray(parsed.crons) && parsed.crons.length > 0;
  } catch {
    return false;
  }
}

function statusTone(status: StepStatus): Tone {
  switch (status) {
    case 'Done':
      return 'green';
    case 'Pending':
      return 'amber';
    case 'Blocked':
      return 'rose';
    case 'Manual':
      return 'blue';
    case 'Optional':
      return 'blue';
  }
}

const BLOCKER_LABEL: Record<BlockerToken, string> = {
  env: 'env var',
  ssh: 'SSH key',
  db: 'database',
  github_token: 'GitHub token',
  vercel_token: 'Vercel token',
  cloudflare_token: 'Cloudflare token',
  hetzner_token: 'Hetzner token',
  human: 'human review',
};

export default function ActivationPage() {
  const dbConfigured = isDbConfigured();
  const snapshot = isSnapshotMode();

  const databaseUrlPresent = Boolean(process.env.DATABASE_URL);
  const databaseUrlDirectPresent = Boolean(process.env.DATABASE_URL_DIRECT);

  const githubTokenPresent = Boolean(process.env.GITHUB_TOKEN);
  const vercelTokenPresent = Boolean(process.env.VERCEL_API_TOKEN);
  const cloudflareTokenPresent = Boolean(process.env.CLOUDFLARE_API_TOKEN);
  const cloudflareAccountPresent = Boolean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const cloudflareBothPresent = cloudflareTokenPresent && cloudflareAccountPresent;
  const hetznerTokenPresent = Boolean(process.env.HETZNER_API_TOKEN);
  const cronSecretPresent = Boolean(process.env.CRON_SECRET);
  const cronsScaffolded = hasVercelCrons();
  const anthropicKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  const betterstackSecretPresent = Boolean(process.env.BETTERSTACK_WEBHOOK_SECRET);
  const brevoDigestRecipientPresent = Boolean(process.env.BREVO_OPS_DIGEST_TO);

  const tokenPresence = TOKEN_PANEL_ENVS.map((name) => Boolean(process.env[name]));
  const tokensConfiguredCount = tokenPresence.filter(Boolean).length;
  const tokensConfiguredTone: Tone =
    tokensConfiguredCount === TOKEN_PANEL_ENVS.length
      ? 'green'
      : tokensConfiguredCount === 0
        ? 'rose'
        : 'amber';

  // Validation report — informational only, never blocks activation.
  const validation = validateSnapshot();

  const steps: Step[] = [
    {
      n: 1,
      title: 'Restore the SSH key for the ma130 servers',
      description:
        'Put ~/.ssh/ma130_migration back on the operator Mac so the ops database server is reachable.',
      status: 'Manual',
      blockedBy: ['ssh'],
      where: 'Operator laptop + Hetzner cloud console',
      runbook: 'docs/runbooks/ops-hetzner-activation.md',
      safeNextAction: 'Follow the SSH restore steps in the Hetzner activation runbook.',
    },
    {
      n: 2,
      title: 'Create the ops database on ma130-data',
      description: 'A new Postgres database for the dashboard, separate from any existing databases.',
      status: 'Manual',
      blockedBy: ['ssh', 'db'],
      where: 'SSH to ma130-data, then psql',
      runbook: 'docs/runbooks/ops-db-setup.md',
      safeNextAction: 'Run the CREATE DATABASE block from the database setup runbook.',
    },
    {
      n: 3,
      title: 'Create the ops_app role with least-privilege access',
      description: 'A dedicated app role with only the grants the dashboard needs.',
      status: 'Manual',
      blockedBy: ['ssh', 'db'],
      where: 'psql as superuser on ma130-data',
      runbook: 'docs/runbooks/ops-db-setup.md',
      safeNextAction: 'Store the role password in 1Password — never in the repo or shell history.',
    },
    {
      n: 4,
      title: 'Run database migrations 0000 to 0002',
      description: 'drizzle-kit migrate against DATABASE_URL_DIRECT — sets up the tables.',
      status: databaseUrlDirectPresent ? 'Done' : 'Pending',
      blockedBy: ['db'],
      where: 'Operator laptop running drizzle-kit',
      runbook: 'docs/runbooks/ops-db-setup.md',
      safeNextAction: databaseUrlDirectPresent
        ? 'Direct connection string is present — re-run drizzle-kit migrate if any new migrations land.'
        : 'Set DATABASE_URL_DIRECT locally and run drizzle-kit migrate.',
    },
    {
      n: 5,
      title: 'Set DATABASE_URL (pooled) in Vercel',
      description: 'Production-scope environment variable — the pooled connection string.',
      status: databaseUrlPresent ? 'Done' : 'Pending',
      blockedBy: ['env', 'db'],
      where: 'Vercel project settings → Environment Variables',
      runbook: 'docs/runbooks/ops-db-setup.md',
      safeNextAction: databaseUrlPresent
        ? 'Pooled URL is present.'
        : 'Add DATABASE_URL in Vercel and redeploy.',
    },
    {
      n: 6,
      title: 'Set DATABASE_URL_DIRECT (direct) in Vercel',
      description: 'Direct connection string used by migrations only.',
      status: databaseUrlDirectPresent ? 'Done' : 'Pending',
      blockedBy: ['env', 'db'],
      where: 'Vercel project settings → Environment Variables',
      runbook: 'docs/runbooks/ops-db-setup.md',
      safeNextAction: databaseUrlDirectPresent
        ? 'Direct URL is present.'
        : 'Add DATABASE_URL_DIRECT in Vercel — used only for migrations.',
    },
    {
      n: 7,
      title: 'Redeploy Vercel production',
      description: 'Pick up the new environment variables on the running runtime.',
      status: 'Manual',
      blockedBy: ['env'],
      where: 'Vercel → Deployments → Redeploy',
      runbook: 'docs/runbooks/ops-hetzner-activation.md',
      safeNextAction: 'Trigger a redeploy after DATABASE_URL and DATABASE_URL_DIRECT are saved.',
    },
    {
      n: 8,
      title: 'Verify the database is connected',
      description: 'The Database card on the Health page reports a healthy ping.',
      status: dbConfigured ? 'Done' : 'Pending',
      blockedBy: ['db'],
      where: '/admin/ops/health → Database card',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: dbConfigured
        ? 'Database connection confirmed — proceed to the import preview.'
        : 'Open the Health page after the redeploy completes to confirm connection.',
    },
    {
      n: 9,
      title: 'Run the snapshot import preview',
      description: 'Read-only walk of every row that would land — no writes.',
      status: 'Manual',
      blockedBy: [],
      where: '/admin/ops/review → Import preview',
      runbook: 'docs/runbooks/ops-review-session.md',
      safeNextAction: 'Open the Review page and scan the preview table for surprises.',
    },
    {
      n: 10,
      title: 'Run the snapshot import as a rehearsal',
      description: 'Same import code path with dry-run on — nothing is saved.',
      status: 'Manual',
      blockedBy: ['db'],
      where: '/admin/ops/review → Rehearsal button',
      runbook: 'docs/runbooks/ops-review-session.md',
      safeNextAction: 'Run the rehearsal once the DB is connected to surface any runtime errors.',
    },
    {
      n: 11,
      title: 'Run the snapshot import for real',
      description: 'Commit the same data inside a transaction.',
      status: 'Manual',
      blockedBy: ['db'],
      where: '/admin/ops/review → Save for real',
      runbook: 'docs/runbooks/ops-review-session.md',
      safeNextAction: 'Only after the rehearsal succeeds — then commit and verify counts.',
    },
    {
      n: 12,
      title: 'Spot-check the imported rows',
      description: 'Open clients / assets / tickets / renewals / incidents and confirm rows match.',
      status: 'Manual',
      blockedBy: ['db'],
      where: '/admin/ops/clients · /assets · /tickets · /renewals · /incidents',
      runbook: 'docs/runbooks/ops-review-session.md',
      safeNextAction: 'Walk each list view and sanity-check the first page of results.',
    },
    {
      n: 13,
      title: 'Bridge the review decisions to tickets',
      description: 'Each open snapshot decision becomes a ticket so the work is tracked.',
      status: 'Manual',
      blockedBy: ['db', 'human'],
      where: '/admin/ops/review → Decision bridge',
      runbook: 'docs/runbooks/ops-review-session.md',
      safeNextAction: 'After import, click Bridge to create tickets from each unresolved decision.',
    },
    {
      n: 14,
      title: 'Add GITHUB_TOKEN',
      description: 'Read-only token so the dashboard can sync repos and archive decisions.',
      status: githubTokenPresent ? 'Done' : 'Pending',
      blockedBy: ['env', 'github_token'],
      where: 'Vercel environment variables',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: githubTokenPresent
        ? 'GitHub token present — run the first sync next.'
        : 'Create a fine-grained PAT in GitHub with repo read; add as GITHUB_TOKEN.',
    },
    {
      n: 15,
      title: 'Run the first GitHub sync',
      description: 'Populates the repos table so the External clients page shows live data.',
      status: 'Manual',
      blockedBy: ['github_token', 'db'],
      where: '/admin/ops/github → Sync',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: 'Click Sync on the GitHub page once both the DB and token are live.',
    },
    {
      n: 16,
      title: 'Add VERCEL_API_TOKEN',
      description: 'Read-only token so the dashboard can sync Vercel projects + deployments.',
      status: vercelTokenPresent ? 'Done' : 'Pending',
      blockedBy: ['env', 'vercel_token'],
      where: 'Vercel environment variables',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: vercelTokenPresent
        ? 'Vercel token present — run the first sync next.'
        : 'Create a Vercel API token with read scope; add as VERCEL_API_TOKEN.',
    },
    {
      n: 17,
      title: 'Run the first Vercel sync',
      description: 'Refreshes both Vercel teams so the dashboard can see live projects.',
      status: 'Manual',
      blockedBy: ['vercel_token', 'db'],
      where: '/admin/ops/vercel → Sync',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: 'Sync after the token is set; confirm both teams come back.',
    },
    {
      n: 18,
      title: 'Add CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID',
      description: 'Both are needed so the dashboard can list zones, Pages projects, and DNS.',
      status: cloudflareBothPresent ? 'Done' : 'Pending',
      blockedBy: ['env', 'cloudflare_token'],
      where: 'Vercel environment variables',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: cloudflareBothPresent
        ? 'Cloudflare credentials present — run the first sync next.'
        : 'Create a read token in Cloudflare and copy the account id alongside it.',
    },
    {
      n: 19,
      title: 'Run the first Cloudflare sync',
      description: 'Lists all ~40 zones so the snapshot illustrative subset is replaced with real data.',
      status: 'Manual',
      blockedBy: ['cloudflare_token', 'db'],
      where: '/admin/ops/infrastructure → Cloudflare',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: 'Sync once both Cloudflare credentials are in place.',
    },
    {
      n: 20,
      title: 'Add HETZNER_API_TOKEN',
      description: 'Read-only token so the dashboard can list servers and load balancers.',
      status: hetznerTokenPresent ? 'Done' : 'Pending',
      blockedBy: ['env', 'hetzner_token'],
      where: 'Vercel environment variables',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: hetznerTokenPresent
        ? 'Hetzner token present — run the first sync next.'
        : 'Create a Hetzner read token; add as HETZNER_API_TOKEN.',
    },
    {
      n: 21,
      title: 'Run the first Hetzner sync',
      description: 'Refreshes the three ma130 servers and their labels.',
      status: 'Manual',
      blockedBy: ['hetzner_token', 'db'],
      where: '/admin/ops/infrastructure → Hetzner',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: 'Sync after the token lands; expect three servers to come back.',
    },
    {
      n: 22,
      title: 'Add CRON_SECRET',
      description: 'A shared secret so only Vercel Cron can hit the scheduled-job routes.',
      status: cronSecretPresent ? 'Done' : 'Pending',
      blockedBy: ['env'],
      where: 'Vercel environment variables',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: cronSecretPresent
        ? 'CRON_SECRET present.'
        : 'Generate a strong random secret and add as CRON_SECRET.',
    },
    {
      n: 23,
      title: 'Enable Vercel scheduled jobs',
      description: 'vercel.json carries the crons array; the runtime runs them on schedule.',
      status: cronsScaffolded && cronSecretPresent ? 'Done' : 'Pending',
      blockedBy: ['env'],
      where: 'vercel.json + redeploy',
      runbook: 'docs/runbooks/ops-renewal-reminders.md',
      safeNextAction:
        cronsScaffolded && cronSecretPresent
          ? 'Scheduled jobs are wired.'
          : cronsScaffolded
            ? 'vercel.json has the crons array — CRON_SECRET still missing.'
            : 'Add the crons array to vercel.json and redeploy.',
    },
    {
      n: 24,
      title: 'Add ANTHROPIC_API_KEY (optional)',
      description: 'Enables AI-mode answers on the Ask page. Search-only mode runs fine without it.',
      status: anthropicKeyPresent ? 'Done' : 'Optional',
      blockedBy: ['env'],
      where: 'Vercel environment variables',
      runbook: 'docs/runbooks/ops-assistant.md',
      safeNextAction: anthropicKeyPresent
        ? 'AI mode is available.'
        : 'Skip for now — Ask still works in search-only mode.',
    },
    {
      n: 25,
      title: 'Add BETTERSTACK_WEBHOOK_SECRET (optional)',
      description: 'Validates incoming BetterStack alerts so they create real incidents.',
      status: betterstackSecretPresent ? 'Done' : 'Optional',
      blockedBy: ['env'],
      where: 'Vercel environment variables',
      runbook: 'docs/runbooks/ops-activation-hardening.md',
      safeNextAction: betterstackSecretPresent
        ? 'BetterStack inbound webhook is verified.'
        : 'Skip until you wire BetterStack alerts to the dashboard.',
    },
    {
      n: 26,
      title: 'Add BREVO_OPS_DIGEST_TO',
      description: 'The daily renewal digest needs a recipient address.',
      status: brevoDigestRecipientPresent ? 'Done' : 'Pending',
      blockedBy: ['env'],
      where: 'Vercel environment variables',
      runbook: 'docs/runbooks/ops-renewal-reminders.md',
      safeNextAction: brevoDigestRecipientPresent
        ? 'Digest recipient is set.'
        : 'Add the operator inbox as BREVO_OPS_DIGEST_TO so the 07:00 SAST digest has somewhere to land.',
    },
    {
      n: 27,
      title: 'Verify the emails / services / contacts foundation',
      description: 'Walk these three pages to confirm the manual-reference baseline matches reality.',
      status: 'Manual',
      blockedBy: ['human'],
      where: '/admin/ops/emails · /services · /contacts',
      runbook: 'docs/runbooks/ops-email-linkage.md',
      safeNextAction: 'After import, spot-check each page and edit anything that does not match.',
    },
  ];

  const totalSteps = steps.length;
  const doneSteps = steps.filter((s) => s.status === 'Done').length;
  const pendingSteps = steps.filter((s) => s.status === 'Pending').length;
  const optionalSteps = steps.filter((s) => s.status === 'Optional').length;
  const manualSteps = steps.filter((s) => s.status === 'Manual').length;

  // Pre-flight inputs — friendly labels for credential presence checks.
  const credentialRows: Array<{ label: string; present: boolean; hint: string }> = [
    {
      label: 'GitHub access',
      present: githubTokenPresent,
      hint: 'Needed for repo sync.',
    },
    {
      label: 'Vercel access',
      present: vercelTokenPresent,
      hint: 'Needed for project + deployment sync.',
    },
    {
      label: 'Cloudflare access',
      present: cloudflareBothPresent,
      hint: 'Both the access token and account id are required.',
    },
    {
      label: 'Hetzner access',
      present: hetznerTokenPresent,
      hint: 'Needed for server sync.',
    },
    {
      label: 'Production database',
      present: databaseUrlPresent,
      hint: 'Pooled connection string for the live ops database.',
    },
  ];

  return (
    <>
      <SectionHeader
        title="Activation"
        subtitle="Step-by-step bring-up — from snapshot mode to a live, monitored dashboard."
      />
      {snapshot && <SnapshotBanner area="Activation" />}

      <div className="mb-4">
        <p className="mb-3 text-sm font-medium text-zinc-100">
          Pre-flight summary
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <PreflightCard
            title="Before you start"
            intent="blue"
            bullets={[
              'Confirm you are signed in as an operator with admin permissions.',
              'Confirm the snapshot mode banner is visible on the Health page.',
              'Read the activation hardening runbook before touching production.',
              `Total steps: ${totalSteps} — ${doneSteps} done, ${pendingSteps} still pending.`,
            ]}
          />
          <PreflightCard
            title="Do not do this yet"
            intent="amber"
            bullets={[
              'Do not change any DNS records on Cloudflare.',
              'Do not run any provider sync — no writes until tokens land.',
              'Do not connect Gmail or Outlook — email linking stays manual for now.',
              'Do not redeploy until DATABASE_URL and DATABASE_URL_DIRECT are saved.',
            ]}
          />
          <PreflightCard
            title="Safe to do now"
            intent="green"
            bullets={[
              'Walk every Operations page and review the saved sample data.',
              'Work the Review & decisions queue — captures stay in this browser.',
              'Confirm the billing owner on every row of the Services page.',
              'Validate client-to-asset mapping and walk the Emails categories.',
            ]}
          />
          <PreflightCard
            title="Needs credentials"
            intent="amber"
            credentials={credentialRows}
          />
          <PreflightCard
            title="After database connects"
            intent="green"
            bullets={[
              'Run the import preview on the Review page — read-only walkthrough.',
              'Run the import as a rehearsal — a dry run inside a transaction that is always rolled back.',
              'Run the import for real once the rehearsal is clean.',
              'Verify counts on Clients, Assets, Tickets, Renewals, and Incidents.',
            ]}
          />
          <PreflightCard
            title="Rollback plan"
            intent="blue"
            bullets={[
              'Preview mode writes nothing — closing the tab is rollback.',
              'Rehearsal runs as a dry-run inside a transaction; nothing is committed.',
              'After save, every imported row is tagged with the import run id and can be reverted.',
              'See docs/runbooks/ops-activation-hardening.md#safe-rollback for the full procedure.',
            ]}
          />
          <PreflightCard
            title="Success looks like"
            intent="green"
            checklist={[
              'Database card on Health shows a healthy ping.',
              '/admin/ops/review shows imported counts that match the snapshot preview.',
              'All four provider syncs succeeded at least once.',
              'Validation report has zero errors (warnings and info are OK).',
              'Team members can sign in and reach the operator views.',
            ]}
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatusCard
          label="Snapshot data"
          value="Ready"
          tone="green"
          hint="Discovery data is loaded and read-only."
        />
        <StatusCard
          label="Database"
          value={dbConfigured ? 'Connected' : 'Not connected'}
          tone={dbConfigured ? 'green' : 'amber'}
          hint={dbConfigured ? 'DATABASE_URL is set.' : 'Waiting for DATABASE_URL.'}
        />
        <StatusCard
          label="Tokens configured"
          value={`${tokensConfiguredCount} / ${TOKEN_PANEL_ENVS.length}`}
          tone={tokensConfiguredTone}
          hint="Presence only — values are never displayed."
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <ProgressTile label="Done" value={doneSteps} total={totalSteps} tone="green" />
        <ProgressTile label="Pending" value={pendingSteps} total={totalSteps} tone="amber" />
        <ProgressTile label="Manual" value={manualSteps} total={totalSteps} tone="blue" />
        <ProgressTile label="Optional" value={optionalSteps} total={totalSteps} tone="blue" />
      </div>

      {/* Commercial preflight — inserted between the pre-flight summary and
          the 27-step sequence. The 27-step list itself is not modified; this
          card just reminds operators of the commercial-side work that runs
          alongside activation. */}
      <div className="mb-6">
        <AdminCard title="Commercial preflight">
          <p className="mb-3 text-xs text-zinc-400 leading-relaxed">
            Five short checks for the commercial side of activation. None of
            these block the 27-step sequence — they make sure the local-only
            workspace stays useful while the database is being prepared.
          </p>
          <ul className="space-y-2 text-xs text-zinc-200">
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-emerald-400/70" />
              <span>Test local email references on <code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-200 font-mono">/admin/ops/emails</code> — capture one per category as a smoke test.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-emerald-400/70" />
              <span>Confirm service billing owners on <code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-200 font-mono">/admin/ops/services</code> — every row either has an owner or is tagged &ldquo;Needs review&rdquo;.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-emerald-400/70" />
              <span>Confirm contact role placeholders on <code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-200 font-mono">/admin/ops/contacts</code> reflect the real team that will be entered as live rows.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-emerald-400/70" />
              <span>Plan the migration of local drafts after Hetzner connects — see <code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-200 font-mono">docs/runbooks/ops-local-email-references.md</code>.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-emerald-400/70" />
              <span>Decide on Gmail / Outlook later — only as a separately approved phase. Default answer: no.</span>
            </li>
          </ul>
        </AdminCard>
      </div>

      <div className="mb-6">
        <AdminCard title="Activation sequence (27 steps)">
          <ol className="space-y-3">
            {steps.map((step) => (
              <li
                key={step.n}
                className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <span className="w-8 shrink-0 text-right font-mono text-xs text-zinc-500">
                  {String(step.n).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">{step.title}</span>
                    <Badge text={step.status} tone={statusTone(step.status)} />
                    {step.blockedBy.length > 0 && step.status !== 'Done' && (
                      <span className="flex flex-wrap gap-1">
                        {step.blockedBy.map((b) => (
                          <Badge key={b} text={`needs ${BLOCKER_LABEL[b]}`} tone="neutral" />
                        ))}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400">
                    <span className="text-xs font-medium text-zinc-500">
                      Where ·{' '}
                    </span>
                    {step.where}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    <span className="text-xs font-medium text-zinc-500">
                      Runbook ·{' '}
                    </span>
                    <code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-200 font-mono">{step.runbook}</code>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-300/80">
                    <span className="text-xs font-medium text-emerald-400/80">
                      Safe next action ·{' '}
                    </span>
                    {step.safeNextAction}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </AdminCard>
      </div>

      <div className="mb-6">
        <AdminCard title="Snapshot validation — informational">
          <p className="mb-3 text-xs text-zinc-400 leading-relaxed">
            Findings from a pure-function pass over the snapshot data. They never block activation
            — fix them before the import or accept the default behaviour.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge text={`${validation.bySeverity.error} errors`} tone="rose" />
            <Badge text={`${validation.bySeverity.warn} warnings`} tone="amber" />
            <Badge text={`${validation.bySeverity.info} info`} tone="blue" />
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-400">
            {(Object.keys(validation.byCategory) as (keyof typeof validation.byCategory)[])
              .filter((k) => validation.byCategory[k].length > 0)
              .map((k) => (
                <li key={k} className="flex justify-between gap-3">
                  <span className="text-zinc-200">{VALIDATION_CATEGORY_LABEL[k]}</span>
                  <span className="text-xs text-zinc-500">
                    {validation.byCategory[k].length} item{validation.byCategory[k].length === 1 ? '' : 's'}
                  </span>
                </li>
              ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            Full per-finding detail is on the Review page under &ldquo;Validation findings&rdquo;.
          </p>
        </AdminCard>
      </div>

      <div className="mb-6">
        <AdminCard title="Email linking — next steps">
          <p className="mb-3 text-xs text-zinc-400 leading-relaxed">
            Email linking is in preview today. The following steps make it active once the
            database is connected. No inbox is connected, and no email is sent or read by the
            dashboard automatically.
          </p>
          <ol className="space-y-2 text-xs text-zinc-200">
            <li>
              <span className="text-zinc-500">1.</span> Pick the email linking approach — manual
              references first; Gmail or Outlook integration only as a later, separately approved
              phase.
            </li>
            <li>
              <span className="text-zinc-500">2.</span> After the database is connected, open the
              manual email-reference form and start filing billing, renewal, support, and approval
              emails.
            </li>
            <li>
              <span className="text-zinc-500">3.</span> If Gmail or Outlook integration is later
              approved, add it behind explicit opt-in. Read access only — no archiving, deleting,
              or labelling.
            </li>
            <li>
              <span className="text-zinc-500">4.</span> Set{' '}
              <code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-200 font-mono">BREVO_OPS_DIGEST_TO</code> so the daily renewal
              digest has a recipient.
            </li>
            <li>
              <span className="text-zinc-500">5.</span> Confirm on the Health page that no inbox
              reads are active until explicitly approved.
            </li>
          </ol>
        </AdminCard>
      </div>

      <div className="mb-6">
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 flex items-start gap-3">
          <span aria-hidden className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-amber-200">Safety</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
              Database changes are disabled until <code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-200 font-mono">DATABASE_URL</code> is set. Provider sync actions are
              disabled until the matching token is set. Snapshot data stays read-only. No
              destructive action exists on this page.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function StatusCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: Tone;
  hint?: string;
}) {
  const ring =
    tone === 'green'
      ? 'border-emerald-400/20 bg-emerald-400/[0.04]'
      : tone === 'amber'
        ? 'border-amber-400/20 bg-amber-400/[0.04]'
        : tone === 'rose'
          ? 'border-rose-400/20 bg-rose-400/[0.04]'
          : 'border-sky-400/20 bg-sky-400/[0.04]';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="mb-2 text-[11px] font-medium text-zinc-500">
        {label}
      </p>
      <div className="mb-2 flex items-baseline gap-3">
        <p className="text-xl font-semibold text-zinc-100">{value}</p>
      </div>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function PreflightCard({
  title,
  intent,
  bullets,
  checklist,
  credentials,
}: {
  title: string;
  intent: 'green' | 'amber' | 'rose' | 'blue';
  bullets?: string[];
  checklist?: string[];
  credentials?: Array<{ label: string; present: boolean; hint: string }>;
}) {
  const ring =
    intent === 'green'
      ? 'border-emerald-400/20 bg-emerald-400/[0.04]'
      : intent === 'amber'
        ? 'border-amber-400/20 bg-amber-400/[0.04]'
        : intent === 'rose'
          ? 'border-rose-400/20 bg-rose-400/[0.04]'
          : 'border-sky-400/20 bg-sky-400/[0.04]';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="mb-3 text-[11px] font-medium text-zinc-500">{title}</p>
      {bullets && (
        <ul className="space-y-1.5 text-[12px] leading-relaxed text-zinc-200">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-zinc-500" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {checklist && (
        <ul className="space-y-1.5 text-[12px] leading-relaxed text-zinc-200">
          {checklist.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 inline-block size-3.5 shrink-0 rounded-sm border border-emerald-400/40 bg-emerald-400/[0.04]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {credentials && (
        <ul className="space-y-2 text-[12px] leading-relaxed text-zinc-200">
          {credentials.map((c) => (
            <li
              key={c.label}
              className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-zinc-100">{c.label}</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">{c.hint}</p>
              </div>
              <Badge text={c.present ? 'present' : 'missing'} tone={c.present ? 'green' : 'amber'} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProgressTile({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: Tone;
}) {
  const ring =
    tone === 'green'
      ? 'border-emerald-400/20 bg-emerald-400/[0.04] text-emerald-200'
      : tone === 'amber'
        ? 'border-amber-400/20 bg-amber-400/[0.04] text-amber-200'
        : tone === 'rose'
          ? 'border-rose-400/20 bg-rose-400/[0.04] text-rose-200'
          : 'border-sky-400/20 bg-sky-400/[0.04] text-sky-200';
  return (
    <div className={`rounded-2xl border p-3 ${ring}`}>
      <p className="mb-1 text-[11px] font-medium text-zinc-500">
        {label}
      </p>
      <p className="text-base font-semibold">
        {value}
        <span className="text-zinc-500 text-xs"> / {total}</span>
      </p>
    </div>
  );
}
