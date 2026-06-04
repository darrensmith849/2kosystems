import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AdminCard, Badge, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isDbConfigured } from '@/lib/db/client';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';

// /admin/ops/activation — day-of Hetzner activation playbook.
//
// Server component, presence-only env reads (never echo or log values), and
// no destructive UI. The page is a high-altitude operator checklist that
// mirrors docs/runbooks/ops-hetzner-activation.md and reacts to the same
// signals as the ActivationReadiness panel: isDbConfigured() and Boolean
// presence of the eight + two env vars listed in the runbook.

type Tone = 'green' | 'amber' | 'rose' | 'blue';

type StepStatus = 'Done' | 'Pending' | 'Blocked' | 'Manual';

type Step = {
  n: number;
  title: string;
  description: string;
  status: StepStatus;
  runbookSection?: string;
};

const PROVIDER_TOKEN_ENVS = [
  'GITHUB_TOKEN',
  'VERCEL_API_TOKEN',
  'CLOUDFLARE_API_TOKEN',
  'HETZNER_API_TOKEN',
] as const;

const TOKEN_PANEL_ENVS = [
  'GITHUB_TOKEN',
  'VERCEL_API_TOKEN',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'HETZNER_API_TOKEN',
  'CRON_SECRET',
] as const;

function hasVercelCrons(): boolean {
  // Pure file-presence read of repo-tracked vercel.json. Never throws — any
  // failure (missing file, malformed JSON, missing array) returns false.
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
  }
}

export default function ActivationPage() {
  const dbConfigured = isDbConfigured();
  const snapshot = isSnapshotMode();

  const databaseUrlPresent = Boolean(process.env.DATABASE_URL);
  const databaseUrlDirectPresent = Boolean(process.env.DATABASE_URL_DIRECT);

  const tokenPresence = TOKEN_PANEL_ENVS.map((name) => Boolean(process.env[name]));
  const tokensConfiguredCount = tokenPresence.filter(Boolean).length;
  const tokensConfiguredTone: Tone =
    tokensConfiguredCount === TOKEN_PANEL_ENVS.length
      ? 'green'
      : tokensConfiguredCount === 0
        ? 'rose'
        : 'amber';

  const providerTokensPresent = PROVIDER_TOKEN_ENVS.filter((n) => Boolean(process.env[n])).length;
  const providerTokensAllSet = providerTokensPresent === PROVIDER_TOKEN_ENVS.length;

  const cronSecretPresent = Boolean(process.env.CRON_SECRET);
  const cronsScaffolded = hasVercelCrons();
  const cronStepDone = cronsScaffolded && cronSecretPresent;

  const steps: Step[] = [
    {
      n: 1,
      title: 'Restore SSH key',
      description: '~/.ssh/ma130_migration on the operator Mac. No env signal — operator confirms.',
      status: 'Manual',
      runbookSection: 'Prerequisites',
    },
    {
      n: 2,
      title: 'Create ops database on ma130-data',
      description: 'psql block over SSH — creates the ops Postgres database.',
      status: 'Manual',
      runbookSection: 'Step 1 — create the ops database',
    },
    {
      n: 3,
      title: 'Create ops_app role',
      description: 'Strong password stored in 1Password; never in repo or shell history.',
      status: 'Manual',
      runbookSection: 'Step 1 — create the ops database',
    },
    {
      n: 4,
      title: 'Run migrations 0000-0002',
      description: 'drizzle-kit migrate against DATABASE_URL_DIRECT.',
      status: databaseUrlDirectPresent ? 'Done' : 'Pending',
      runbookSection: 'Step 3 — apply migrations',
    },
    {
      n: 5,
      title: 'Set DATABASE_URL in Vercel',
      description: 'Pooled URL on the 2kosystems.com project, Production scope.',
      status: databaseUrlPresent ? 'Done' : 'Pending',
      runbookSection: 'Step 2 — set Vercel env vars',
    },
    {
      n: 6,
      title: 'Set DATABASE_URL_DIRECT in Vercel',
      description: 'Direct URL used by migrations only.',
      status: databaseUrlDirectPresent ? 'Done' : 'Pending',
      runbookSection: 'Step 2 — set Vercel env vars',
    },
    {
      n: 7,
      title: 'Redeploy Vercel',
      description: 'Trigger a redeploy after env vars land so the running runtime picks them up.',
      status: 'Manual',
      runbookSection: 'Step 2 — set Vercel env vars',
    },
    {
      n: 8,
      title: 'Verify DB connected',
      description: 'isDbConfigured() flips to true and pingDb() responds OK.',
      status: dbConfigured ? 'Done' : 'Pending',
      runbookSection: 'Step 3 — apply migrations',
    },
    {
      n: 9,
      title: 'Run snapshot import preview',
      description: 'GET /api/admin/ops/import/snapshot/preview — describes every row, no writes.',
      status: 'Manual',
      runbookSection: 'Step 4 — run snapshot import preview',
    },
    {
      n: 10,
      title: 'Run snapshot import dry-run',
      description: 'POST /api/admin/ops/import/snapshot/run with dryRun:true.',
      status: 'Manual',
      runbookSection: 'Step 5 — run snapshot import dry-run',
    },
    {
      n: 11,
      title: 'Run snapshot import committed',
      description: 'Same route with dryRun:false — commits inside a transaction.',
      status: 'Manual',
      runbookSection: 'Step 7 — run snapshot import for real',
    },
    {
      n: 12,
      title: 'Run foundational seeds',
      description: 'Divisions, operators, baseline integration_status rows.',
      status: 'Manual',
      runbookSection: 'Step 7 — run snapshot import for real',
    },
    {
      n: 13,
      title: 'Add provider tokens',
      description: providerTokensAllSet
        ? 'GITHUB_TOKEN, VERCEL_API_TOKEN, CLOUDFLARE_API_TOKEN, HETZNER_API_TOKEN present.'
        : `${providerTokensPresent}/4 provider tokens present (GitHub, Vercel, Cloudflare, Hetzner).`,
      status: providerTokensAllSet ? 'Done' : 'Pending',
      runbookSection: 'Step 2 — set Vercel env vars',
    },
    {
      n: 14,
      title: 'Run first syncs',
      description: 'GitHub → Vercel → Cloudflare → Hetzner, in order, from the provider pages.',
      status: 'Manual',
      runbookSection: 'Step 8 — first sync runs',
    },
    {
      n: 15,
      title: 'Enable Vercel Cron',
      description: cronStepDone
        ? 'vercel.json has crons array and CRON_SECRET is set.'
        : cronsScaffolded
          ? 'vercel.json has crons array — CRON_SECRET still pending.'
          : 'vercel.json crons array missing.',
      status: cronStepDone ? 'Done' : 'Pending',
      runbookSection: 'Step 9 — turn on cron triggers',
    },
    {
      n: 16,
      title: 'Enable BetterStack + renewal reminders',
      description: 'Optional. Verifies BETTERSTACK_WEBHOOK_SECRET and wires the 07:00 SAST digest.',
      status: 'Pending',
      runbookSection: 'Step 2 — set Vercel env vars',
    },
  ];

  return (
    <>
      <SectionHeader
        title="Activation"
        subtitle="Steps to bring the live database online."
      />
      {snapshot && <SnapshotBanner area="Activation" />}

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatusCard
          label="Snapshot data"
          value="Ready"
          tone="green"
          hint="27 assets · 15 clients · 38 repos"
        />
        <StatusCard
          label="Database"
          value={dbConfigured ? 'Ready' : 'Pending'}
          tone={dbConfigured ? 'green' : 'amber'}
          hint={dbConfigured ? 'DATABASE_URL set' : 'Waiting for DATABASE_URL'}
        />
        <StatusCard
          label="Tokens configured"
          value={`${tokensConfiguredCount} / ${TOKEN_PANEL_ENVS.length}`}
          tone={tokensConfiguredTone}
          hint="Presence-only — values are never displayed."
        />
      </div>

      <div className="mb-6">
        <AdminCard title="Activation sequence">
          <ol className="space-y-3">
            {steps.map((step) => (
              <li
                key={step.n}
                className="flex gap-4 rounded-xl border border-[#1c1c1e] bg-[#0e0e10] p-4"
              >
                <span className="w-8 shrink-0 text-right font-mono text-xs text-[#71717a]">
                  {String(step.n).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#f5f5f5]">{step.title}</span>
                    <Badge text={step.status} tone={statusTone(step.status)} />
                  </div>
                  <p className="mt-1 text-xs text-[#a1a1aa]">{step.description}</p>
                  {step.runbookSection && (
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#52525b]">
                      Runbook · {step.runbookSection}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </AdminCard>
      </div>

      <div className="mb-6">
        <AdminCard title="Runbook links">
          <ul className="space-y-1.5 text-xs text-[#a1a1aa]">
            <li>
              <code className="text-[#e4e4e7]">docs/runbooks/ops-hetzner-activation.md</code>
            </li>
            <li>
              <code className="text-[#e4e4e7]">docs/runbooks/ops-db-setup.md</code>
            </li>
            <li>
              <code className="text-[#e4e4e7]">docs/runbooks/ops-renewal-reminders.md</code>
            </li>
            <li>
              <code className="text-[#e4e4e7]">docs/runbooks/ops-assistant.md</code>
            </li>
            <li>
              <code className="text-[#e4e4e7]">docs/runbooks/ops-search.md</code>
            </li>
          </ul>
        </AdminCard>
      </div>

      <div className="mb-6">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.04] p-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300/80">
            Safety
          </p>
          <p className="text-xs leading-relaxed text-amber-100/80">
            DB-changing actions are disabled until DATABASE_URL is set. Provider sync actions are
            disabled until the corresponding token is set. Snapshot data remains read-only. No
            destructive UI exists on this page.
          </p>
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
      ? 'border-emerald-400/30 bg-emerald-400/5'
      : tone === 'amber'
        ? 'border-amber-400/30 bg-amber-400/5'
        : tone === 'rose'
          ? 'border-rose-400/30 bg-rose-400/5'
          : 'border-sky-400/30 bg-sky-400/5';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">
        {label}
      </p>
      <div className="mb-2 flex items-baseline gap-3">
        <p className="text-xl font-semibold text-[#f5f5f5]">{value}</p>
        <Badge text={tone === 'green' ? 'ready' : tone === 'amber' ? 'pending' : tone === 'rose' ? 'blocked' : 'info'} tone={tone} />
      </div>
      {hint && <p className="text-[11px] text-[#71717a]">{hint}</p>}
    </div>
  );
}
