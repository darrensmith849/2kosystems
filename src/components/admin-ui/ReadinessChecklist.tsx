import { isDbConfigured } from '@/lib/db/client';
import { AdminCard } from './index';

// Server component. Reads env presence + isDbConfigured directly.
// Renders the Phase 2A migration readiness checklist so the dashboard
// communicates progress while DB is disconnected.

type Item = {
  label: string;
  done: boolean;
  note?: string;
};

type Category = {
  heading: string;
  items: Item[];
};

const HETZNER_ITEMS: Item[] = [
  { label: 'SSH access to ma130-data restored on operator Mac', done: false, note: 'blocked on Hetzner access' },
  { label: 'ops Postgres database created on ma130-data', done: false, note: 'blocked on Hetzner access' },
  { label: 'ops_app role created', done: false, note: 'blocked on Hetzner access' },
  { label: 'Drizzle migrations applied (0000, 0001, 0002)', done: false, note: 'blocked on Hetzner access' },
];

const VERCEL_ENV_VARS: Array<{ label: string; envName: string }> = [
  { label: 'DATABASE_URL set', envName: 'DATABASE_URL' },
  { label: 'DATABASE_URL_DIRECT set', envName: 'DATABASE_URL_DIRECT' },
  { label: 'GITHUB_TOKEN set', envName: 'GITHUB_TOKEN' },
  { label: 'VERCEL_API_TOKEN set', envName: 'VERCEL_API_TOKEN' },
  { label: 'CLOUDFLARE_API_TOKEN set', envName: 'CLOUDFLARE_API_TOKEN' },
  { label: 'CLOUDFLARE_ACCOUNT_ID set', envName: 'CLOUDFLARE_ACCOUNT_ID' },
  { label: 'HETZNER_API_TOKEN set', envName: 'HETZNER_API_TOKEN' },
  { label: 'CRON_SECRET set', envName: 'CRON_SECRET' },
];

const SEED_ITEMS: Item[] = [
  { label: 'Foundational seed (divisions + Vercel teams)', done: false, note: 'pending DB' },
  { label: 'Known operational findings seed', done: false, note: 'pending DB' },
  { label: 'GitHub sync first run', done: false, note: 'pending DB' },
  { label: 'Vercel sync first run', done: false, note: 'pending DB' },
  { label: 'Cloudflare sync first run', done: false, note: 'pending DB' },
  { label: 'Hetzner sync first run', done: false, note: 'pending DB' },
];

export default function ReadinessChecklist() {
  // DB-configured flag is purely informational here — categories A and C remain
  // pending until the migration completes, regardless of the env var.
  const dbConfigured = isDbConfigured();

  const vercelEnvItems: Item[] = VERCEL_ENV_VARS.map(({ label, envName }) => ({
    label,
    done: Boolean(process.env[envName]),
  }));

  const categories: Category[] = [
    { heading: 'A. Hetzner infrastructure', items: HETZNER_ITEMS },
    { heading: 'B. Vercel runtime env vars', items: vercelEnvItems },
    { heading: 'C. Day-one seeds', items: SEED_ITEMS },
  ];

  const allItems = categories.flatMap((c) => c.items);
  const doneCount = allItems.filter((i) => i.done).length;
  const totalCount = allItems.length;

  return (
    <AdminCard title="Phase 2A — Migration readiness">
      <p className="text-xs text-zinc-700 dark:text-[#a1a1aa] mb-4 font-mono">
        {doneCount} of {totalCount} ready
        {dbConfigured ? ' · DB connected' : ' · DB pending'}
      </p>
      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.heading}>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-700 dark:text-[#71717a] mb-2">
              {cat.heading}
            </p>
            <ul className="space-y-1.5">
              {cat.items.map((item) => (
                <li key={item.label} className="flex items-start gap-2 font-mono text-[11px] leading-relaxed">
                  <span
                    aria-hidden="true"
                    className={item.done ? 'text-emerald-400' : 'text-zinc-500 dark:text-[#52525b]'}
                  >
                    {item.done ? '✓' : '○'}
                  </span>
                  <span className="flex-1">
                    <span className={item.done ? 'text-zinc-900 dark:text-[#e4e4e7]' : 'text-zinc-700 dark:text-[#a1a1aa]'}>{item.label}</span>
                    {item.note ? (
                      <em className="not-italic ml-2 text-[10px] italic text-zinc-700 dark:text-[#71717a]">— {item.note}</em>
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
