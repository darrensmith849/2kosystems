import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDbConfigured } from '@/lib/db/client';
import { allConnectivity } from '@/lib/integrations';
import { getCronSecret, getDeploymentEnv } from '@/lib/runtime';
import { AdminCard } from './index';

// Server component. Pure presence-read of env + repo files. Never logs secret
// values — only Boolean(process.env.X). Complements ReadinessChecklist with a
// broader sprint-aware view of the dashboard's own activation state.

type Item = {
  label: string;
  done: boolean;
  note?: string;
};

type Section = {
  heading: string;
  items: Item[];
};

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

export default function ActivationReadiness() {
  // Touching these so the component reacts to runtime config without ever
  // exposing values — presence-only.
  const dbConfigured = isDbConfigured();
  const conn = allConnectivity();
  const cronSecretPresent = Boolean(getCronSecret());
  const deploymentEnv = getDeploymentEnv();
  const cronsScaffolded = hasVercelCrons();

  // Suppress unused warnings — these are read for future expansion and to keep
  // the component reactive to runtime config.
  void conn;
  void deploymentEnv;

  const ready: Section = {
    heading: 'Ready',
    items: [
      { label: 'Snapshot data', done: true, note: '27 assets, 15 clients, 38 repos, 23 Vercel projects, etc.' },
      { label: 'Snapshot export (JSON + Markdown)', done: true },
      { label: 'Snapshot import engine', done: true, note: '/api/admin/ops/import/snapshot/{preview,run}' },
      { label: 'Review & decisions surface', done: true, note: '15 decisions in /admin/ops/review' },
      { label: 'Browser-local review workflow', done: true, note: 'localStorage-backed status + notes' },
      {
        label: 'Cron route scaffolds',
        done: cronsScaffolded,
        note: cronsScaffolded ? 'vercel.json crons array present' : 'vercel.json has no crons array',
      },
      { label: 'BetterStack webhook', done: true, note: 'route reachable; verifies signature when BETTERSTACK_WEBHOOK_SECRET set' },
      { label: 'Renewal reminders', done: true, note: '07:00 SAST digest scaffold' },
    ],
  };

  const credentialEnvVars: Array<{ label: string; envName: string }> = [
    { label: 'DATABASE_URL', envName: 'DATABASE_URL' },
    { label: 'DATABASE_URL_DIRECT', envName: 'DATABASE_URL_DIRECT' },
    { label: 'GITHUB_TOKEN', envName: 'GITHUB_TOKEN' },
    { label: 'VERCEL_API_TOKEN', envName: 'VERCEL_API_TOKEN' },
    { label: 'CLOUDFLARE_API_TOKEN', envName: 'CLOUDFLARE_API_TOKEN' },
    { label: 'CLOUDFLARE_ACCOUNT_ID', envName: 'CLOUDFLARE_ACCOUNT_ID' },
    { label: 'HETZNER_API_TOKEN', envName: 'HETZNER_API_TOKEN' },
    { label: 'CRON_SECRET', envName: 'CRON_SECRET' },
    { label: 'BETTERSTACK_WEBHOOK_SECRET', envName: 'BETTERSTACK_WEBHOOK_SECRET' },
    { label: 'BREVO_OPS_DIGEST_TO', envName: 'BREVO_OPS_DIGEST_TO' },
  ];

  const credentials: Section = {
    heading: 'Needs credential',
    items: credentialEnvVars.map(({ label, envName }) => ({
      label,
      done: Boolean(process.env[envName]),
    })),
  };

  // Keep cron-secret presence reactive even though it lives inside the env list
  // above — referencing it here ensures eslint sees it consumed and lets future
  // additions tie behaviour to the helper.
  void cronSecretPresent;

  const decisions: Section = {
    heading: 'Needs human decision',
    items: [
      { label: '5 repo canonical picks', done: false },
      { label: '4 unmapped Vercel / domain owners', done: false },
      { label: '1 systemd rename (taxo -> autotax)', done: false },
      { label: 'Dormant Vercel cleanup confirmation', done: false },
      { label: 'xneelo stranded zones retire/revive', done: false },
    ],
  };

  const hetzner: Section = {
    heading: 'Waiting for Hetzner',
    items: [
      { label: 'SSH key restored on operator Mac', done: false },
      { label: 'ops Postgres database created on ma130-data', done: false },
      { label: 'ops_app role with scoped grants', done: false },
      { label: 'DB exposure path chosen (PgBouncer / Cloudflare Tunnel / public + firewall)', done: false },
      { label: 'drizzle-kit migrate applied 0000 + 0001 + 0002', done: false },
      { label: 'Snapshot import dry-run executed', done: false },
      { label: 'Snapshot import committed', done: false },
      { label: 'Real sync runs executed for all 4 providers', done: false },
    ],
  };

  const optional: Section = {
    heading: 'Optional later',
    items: [
      { label: 'Per-user auth (Auth.js)', done: false },
      { label: 'Client portal', done: false },
      { label: 'AI summaries', done: false },
      { label: 'Cost reporting', done: false },
    ],
  };

  const sections: Section[] = [ready, credentials, decisions, hetzner, optional];

  const allItems = sections.flatMap((s) => s.items);
  const readyCount = allItems.filter((i) => i.done).length;
  const pendingCount = allItems.length - readyCount;

  return (
    <AdminCard title="Activation readiness">
      <p className="text-xs text-zinc-700 dark:text-[#a1a1aa] mb-4 font-mono">
        {readyCount} ready · {pendingCount} pending
        {dbConfigured ? ' · DB connected' : ' · DB pending'}
      </p>
      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.heading}>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-700 dark:text-[#71717a] mb-2">
              {section.heading}
            </p>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-2 font-mono text-[11px] leading-relaxed"
                >
                  <span
                    aria-hidden="true"
                    className={item.done ? 'text-emerald-400' : 'text-zinc-500 dark:text-[#52525b]'}
                  >
                    {item.done ? '✓' : '○'}
                  </span>
                  <span className="flex-1">
                    <span className={item.done ? 'text-zinc-900 dark:text-[#e4e4e7]' : 'text-zinc-700 dark:text-[#a1a1aa]'}>
                      {item.label}
                    </span>
                    {item.note ? (
                      <em className="not-italic ml-2 text-[10px] italic text-zinc-700 dark:text-[#71717a]">
                        — {item.note}
                      </em>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
