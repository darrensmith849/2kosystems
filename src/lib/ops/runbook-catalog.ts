// Catalog of operational runbooks rendered by /admin/ops/runbooks.
// Each entry maps a URL-safe slug to a repo-relative path and human-readable
// metadata. Adding a runbook = add an entry here.

export type RunbookEntry = {
  slug: string;
  path: string;
  title: string;
  description: string;
  topics: string[];
};

export const RUNBOOK_CATALOG: RunbookEntry[] = [
  {
    slug: 'ops-db-setup',
    path: 'docs/runbooks/ops-db-setup.md',
    title: 'Database setup',
    description:
      'One-time reference for creating the ops Postgres on ma130-data, wiring Vercel env vars, applying migrations, and running backups.',
    topics: ['postgres', 'migrations', 'env-vars', 'backup', 'restore'],
  },
  {
    slug: 'ops-local-dev',
    path: 'docs/runbooks/ops-local-dev.md',
    title: 'Local dev workflow',
    description:
      'How to run /admin/ops end-to-end on a laptop using the disposable Postgres 16 container in docker-compose.ops.yml.',
    topics: ['docker', 'local', 'postgres', 'dev'],
  },
  {
    slug: 'ops-hetzner-activation',
    path: 'docs/runbooks/ops-hetzner-activation.md',
    title: 'Hetzner activation playbook',
    description:
      'Day-of operator playbook for flipping the dashboard from snapshot mode to live DB-backed mode the moment Hetzner Postgres comes online.',
    topics: ['hetzner', 'activation', 'cutover', 'snapshot'],
  },
  {
    slug: 'ops-renewal-reminders',
    path: 'docs/runbooks/ops-renewal-reminders.md',
    title: 'Renewal reminders',
    description:
      'How the daily 07:00 SAST renewal digest cron buckets renewals, sends the Brevo HTML digest, and advances per-renewal reminder state.',
    topics: ['cron', 'renewals', 'brevo', 'digest'],
  },
  {
    slug: 'ops-assistant',
    path: 'docs/runbooks/ops-assistant.md',
    title: 'Ops Assistant',
    description:
      'Grounded internal analyst for /admin/ops — what it can answer, how citations work, and the boundaries it never crosses.',
    topics: ['assistant', 'ai', 'grounding', 'citations'],
  },
  {
    slug: 'ops-search',
    path: 'docs/runbooks/ops-search.md',
    title: 'Knowledge index and search',
    description:
      'The single source of truth behind the search box and the assistant — what is indexed, how snapshot and live rows are deduped, and how to query it.',
    topics: ['search', 'index', 'knowledge', 'snapshot'],
  },
  {
    slug: 'vercel-to-hetzner',
    path: 'docs/migration/vercel-to-hetzner.md',
    title: 'Migrate Vercel to Hetzner',
    description:
      'Forward-looking checklist for migrating /admin/ops off Vercel onto Hetzner — runtime seams, cron parity, and the boundaries to preserve.',
    topics: ['migration', 'hetzner', 'vercel', 'portability'],
  },
  {
    slug: 'ops-email-linkage',
    path: 'docs/runbooks/ops-email-linkage.md',
    title: 'Email linkage',
    description:
      'Plan for linking billing, supplier, support, approval, and incident emails into the dashboard — manual references first, optional Gmail/Outlook integration only as a later, separately approved phase.',
    topics: ['emails', 'commercial', 'manual-refs', 'privacy', 'planned'],
  },
];

export function findRunbook(slug: string): RunbookEntry | undefined {
  return RUNBOOK_CATALOG.find((r) => r.slug === slug);
}
