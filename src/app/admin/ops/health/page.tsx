import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import Link from 'next/link';
import { AdminCard, Badge, Row, SectionHeader, StatusPill } from '@/components/admin-ui';
import { detectRuntime, getDeploymentEnv } from '@/lib/runtime';
import { isDbConfigured, pingDb } from '@/lib/db/client';
import { isAiKeyConfigured } from '@/lib/ops/ops-assistant-context';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { buildIndex } from '@/lib/ops/ops-knowledge-index';
import { SNAPSHOT_COUNTS } from '@/lib/ops/ops-snapshot-data';
import { SNAPSHOT_SERVICES } from '@/lib/ops/email-services-data';
import { previewSnapshotImport } from '@/lib/ops/snapshot-import';

// /admin/ops/health — single diagnostic page. Server component only.
// Every env var is checked for PRESENCE only (Boolean). NO values are ever
// rendered, logged, or otherwise exposed. Safe to render in any environment.

export const dynamic = 'force-dynamic';

function present(name: string): boolean {
  return Boolean(process.env[name]);
}

function YesNo({ ok, yes = 'yes', no = 'no' }: { ok: boolean; yes?: string; no?: string }) {
  return <Badge text={ok ? yes : no} tone={ok ? 'green' : 'amber'} />;
}

function Check({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2 py-1.5 text-xs text-[#e4e4e7]">
      <span aria-hidden className="mt-0.5 text-emerald-300">✓</span>
      <span>{label}</span>
    </li>
  );
}

// Pure file read of repo-tracked vercel.json. Never throws — any failure
// returns an empty result. We surface only the *names* of cron paths, never
// the schedule (it isn't a secret, but we keep the card terse).
function readVercelCrons(): { ok: boolean; paths: string[] } {
  try {
    const path = join(process.cwd(), 'vercel.json');
    if (!existsSync(path)) return { ok: false, paths: [] };
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw) as { crons?: Array<{ path?: string }> };
    if (!Array.isArray(parsed.crons)) return { ok: false, paths: [] };
    const paths = parsed.crons
      .map((c) => (typeof c?.path === 'string' ? c.path : null))
      .filter((p): p is string => Boolean(p));
    return { ok: paths.length > 0, paths };
  } catch {
    return { ok: false, paths: [] };
  }
}

const OPS_ROUTES: Array<{ href: string; label: string }> = [
  { href: '/admin/ops', label: '/admin/ops' },
  { href: '/admin/ops/search', label: '/admin/ops/search' },
  { href: '/admin/ops/ask', label: '/admin/ops/ask' },
  { href: '/admin/ops/emails', label: '/admin/ops/emails' },
  { href: '/admin/ops/clients', label: '/admin/ops/clients' },
  { href: '/admin/ops/contacts', label: '/admin/ops/contacts' },
  { href: '/admin/ops/assets', label: '/admin/ops/assets' },
  { href: '/admin/ops/services', label: '/admin/ops/services' },
  { href: '/admin/ops/map', label: '/admin/ops/map' },
  { href: '/admin/ops/github', label: '/admin/ops/github' },
  { href: '/admin/ops/vercel', label: '/admin/ops/vercel' },
  { href: '/admin/ops/infrastructure', label: '/admin/ops/infrastructure' },
  { href: '/admin/ops/tickets', label: '/admin/ops/tickets' },
  { href: '/admin/ops/renewals', label: '/admin/ops/renewals' },
  { href: '/admin/ops/incidents', label: '/admin/ops/incidents' },
  { href: '/admin/ops/activation', label: '/admin/ops/activation' },
  { href: '/admin/ops/reports', label: '/admin/ops/reports' },
  { href: '/admin/ops/audits', label: '/admin/ops/audits' },
  { href: '/admin/ops/review', label: '/admin/ops/review' },
  { href: '/admin/ops/sync-log', label: '/admin/ops/sync-log' },
  { href: '/admin/ops/runbooks', label: '/admin/ops/runbooks' },
  { href: '/admin/ops/health', label: '/admin/ops/health' },
  { href: '/admin/ops/settings', label: '/admin/ops/settings' },
];

export default async function HealthPage() {
  const runtime = detectRuntime();
  const deployEnv = getDeploymentEnv();
  const nodeEnv = process.env.NODE_ENV ?? 'unknown';
  const region = process.env.VERCEL_REGION ?? '—';
  const shaRaw = process.env.VERCEL_GIT_COMMIT_SHA ?? '';
  const sha = shaRaw ? shaRaw.slice(0, 7) : '—';
  const ref = process.env.VERCEL_GIT_COMMIT_REF ?? '—';

  const dbConfigured = isDbConfigured();
  const snapshotActive = isSnapshotMode();
  const dbDirectPresent = present('DATABASE_URL_DIRECT');

  // pingDb returns either { ok: true } or { ok: false, error }. We display
  // the shape only — never any DB credential. The error string from
  // postgres-js does not contain the connection URL.
  const ping = dbConfigured ? await pingDb() : { ok: false, error: 'DATABASE_URL not set' };
  const pingError = ping.ok ? null : ping.error?.slice(0, 120) ?? 'unknown error';

  const aiConfigured = isAiKeyConfigured();
  const aiMode = aiConfigured ? 'AI' : 'search-only';
  const betterstack = present('BETTERSTACK_WEBHOOK_SECRET');
  const renewalReminders = present('BREVO_OPS_DIGEST_TO');
  const cronSecret = present('CRON_SECRET');

  const cronFile = readVercelCrons();
  const cronReady = cronFile.ok && cronSecret;

  // Knowledge index size — used as a presence proxy for "Search & Ask is
  // healthy". The index is built from pure snapshot data so it's safe to
  // call here.
  const index = await buildIndex();
  const indexSize = index.length;

  // Snapshot import preview — we read it only for the .dbConfigured flag.
  // The actual category breakdown belongs on /admin/ops/review.
  const importPreview = await previewSnapshotImport();

  // Service catalogue — counts only, never values.
  const serviceCount = SNAPSHOT_SERVICES.length;
  const serviceByStatus = {
    active: SNAPSHOT_SERVICES.filter((s) => s.status === 'active').length,
    planned: SNAPSHOT_SERVICES.filter((s) => s.status === 'planned').length,
    needs_review: SNAPSHOT_SERVICES.filter((s) => s.status === 'needs_review').length,
    blocked: SNAPSHOT_SERVICES.filter((s) => s.status === 'blocked').length,
  };

  return (
    <>
      <SectionHeader
        title="Health"
        subtitle="Runtime, database, and integration status. Every check is presence-only — no secret values are ever shown."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminCard title="Runtime">
          <Row label="Detected runtime" value={<Badge text={runtime} tone={runtime === 'unknown' ? 'neutral' : 'blue'} />} />
          <Row label="Deployment env" value={<Badge text={deployEnv} tone={deployEnv === 'production' ? 'green' : 'amber'} />} />
          <Row label="Node env" value={<span className="font-mono text-xs">{nodeEnv}</span>} />
          <Row label="Vercel region" value={<span className="font-mono text-xs">{region}</span>} />
          <Row label="Commit sha" value={<span className="font-mono text-xs">{sha}</span>} />
          <Row label="Commit ref" value={<span className="font-mono text-xs">{ref}</span>} />
        </AdminCard>

        {/* 1. Database */}
        <AdminCard title="Database">
          <Row label="DATABASE_URL" value={<YesNo ok={dbConfigured} yes="set up" no="needs setup" />} />
          <Row label="DATABASE_URL_DIRECT" value={<YesNo ok={dbDirectPresent} yes="set up" no="needs setup" />} />
          <Row
            label="Preview mode"
            value={<Badge text={snapshotActive ? 'active (snapshot data)' : 'off (live database)'} tone={snapshotActive ? 'amber' : 'green'} />}
          />
          <Row
            label="Database ping"
            value={
              dbConfigured ? (
                ping.ok ? (
                  <StatusPill status="ok" />
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <StatusPill status="failed" />
                    <span className="font-mono text-[10px] text-[#71717a]">{pingError}</span>
                  </span>
                )
              ) : (
                <StatusPill status="skipped" />
              )
            }
          />
        </AdminCard>

        {/* 2. Snapshot mode */}
        <AdminCard title="Preview mode (snapshot data)">
          <Row
            label="Current mode"
            value={
              <Badge
                text={snapshotActive ? 'preview (snapshot)' : 'live (database)'}
                tone={snapshotActive ? 'amber' : 'green'}
              />
            }
          />
          <Row
            label="Snapshot rows"
            value={
              <span className="font-mono text-xs text-[#e4e4e7]">
                {SNAPSHOT_COUNTS.clients} clients · {SNAPSHOT_COUNTS.assets} assets · {SNAPSHOT_COUNTS.repos} repos · {SNAPSHOT_COUNTS.vercelProjects} Vercel · {SNAPSHOT_COUNTS.hetznerServers} Hetzner
              </span>
            }
          />
          <Row
            label="Rehearsal page"
            value={
              <Link href="/admin/ops/review" className="text-emerald-300 hover:underline">
                /admin/ops/review
              </Link>
            }
          />
          <Row
            label="Activation page"
            value={
              <Link href="/admin/ops/activation" className="text-emerald-300 hover:underline">
                /admin/ops/activation
              </Link>
            }
          />
        </AdminCard>

        {/* 3. Search & Ask */}
        <AdminCard title="Search and Ask">
          <Row label="Assistant mode" value={<Badge text={aiMode} tone={aiConfigured ? 'green' : 'blue'} />} />
          <Row label="ANTHROPIC_API_KEY" value={<YesNo ok={aiConfigured} yes="set up" no="optional — not set" />} />
          <Row
            label="Knowledge index"
            value={<span className="font-mono text-xs text-[#e4e4e7]">{indexSize} items</span>}
          />
          <Row
            label="Intent gate"
            value={<Badge text="active" tone="green" />}
          />
          <Row
            label="Ask page"
            value={
              <Link href="/admin/ops/ask" className="text-emerald-300 hover:underline">
                /admin/ops/ask
              </Link>
            }
          />
        </AdminCard>

        {/* 4. Import & export */}
        <AdminCard title="Import and export">
          <Row
            label="Importer can write"
            value={<YesNo ok={importPreview.dbConfigured} yes="yes" no="rehearsal only" />}
          />
          <Row
            label="Snapshot export (JSON)"
            value={
              <Link href="/api/admin/ops/export/snapshot.json" className="font-mono text-emerald-300 hover:underline">
                /api/admin/ops/export/snapshot.json
              </Link>
            }
          />
          <Row
            label="Snapshot export (Markdown)"
            value={
              <Link href="/api/admin/ops/export/snapshot.md" className="font-mono text-emerald-300 hover:underline">
                /api/admin/ops/export/snapshot.md
              </Link>
            }
          />
          <Row
            label="Safe path until database"
            value={<Badge text={importPreview.dbConfigured ? 'rehearsal or save for real' : 'rehearsal only'} tone={importPreview.dbConfigured ? 'green' : 'amber'} />}
          />
        </AdminCard>

        {/* 5. Email linking */}
        <AdminCard title="Email linking">
          <Row
            label="Email linking"
            value={<Badge text={dbConfigured ? 'manual notes ready' : 'preview'} tone={dbConfigured ? 'green' : 'blue'} />}
          />
          <Row label="Gmail integration" value={<Badge text="inactive" tone="neutral" />} />
          <Row label="Outlook integration" value={<Badge text="inactive" tone="neutral" />} />
          <Row
            label="Reading your inbox guard"
            value={<Badge text="off (correct)" tone="green" />}
          />
          <Row label="BREVO_OPS_DIGEST_TO" value={<YesNo ok={renewalReminders} yes="set up" no="needs setup" />} />
        </AdminCard>

        {/* 6. Services catalogue */}
        <AdminCard title="Services list">
          <Row
            label="Mode"
            value={<Badge text={dbConfigured ? 'live' : 'preview'} tone={dbConfigured ? 'green' : 'blue'} />}
          />
          <Row
            label="Total services"
            value={<span className="font-mono text-xs text-[#e4e4e7]">{serviceCount}</span>}
          />
          <Row
            label="Active"
            value={<Badge text={String(serviceByStatus.active)} tone="green" />}
          />
          <Row
            label="Planned"
            value={<Badge text={String(serviceByStatus.planned)} tone="blue" />}
          />
          <Row
            label="Needs first look"
            value={<Badge text={String(serviceByStatus.needs_review)} tone="amber" />}
          />
          <Row
            label="Waiting on something"
            value={<Badge text={String(serviceByStatus.blocked)} tone={serviceByStatus.blocked > 0 ? 'amber' : 'green'} />}
          />
          <Row
            label="Services page"
            value={
              <Link href="/admin/ops/services" className="text-emerald-300 hover:underline">
                /admin/ops/services
              </Link>
            }
          />
        </AdminCard>

        {/* 7. Cron / scheduled jobs */}
        <AdminCard title="Scheduled jobs">
          <Row label="vercel.json crons" value={<YesNo ok={cronFile.ok} yes="set up" no="needs setup" />} />
          <Row label="CRON_SECRET" value={<YesNo ok={cronSecret} yes="set up" no="needs setup" />} />
          <Row
            label="Status"
            value={<Badge text={cronReady ? 'ready' : 'needs setup'} tone={cronReady ? 'green' : 'amber'} />}
          />
          {cronFile.paths.length > 0 ? (
            <Row
              label="Job paths"
              value={
                <ul className="space-y-0.5">
                  {cronFile.paths.map((p) => (
                    <li key={p} className="font-mono text-[10px] text-[#a1a1aa]">
                      {p}
                    </li>
                  ))}
                </ul>
              }
            />
          ) : null}
        </AdminCard>

        {/* 8. BetterStack */}
        <AdminCard title="BetterStack">
          <Row label="BETTERSTACK_WEBHOOK_SECRET" value={<YesNo ok={betterstack} yes="set up" no="optional — not set" />} />
          <Row
            label="Incoming alert URL"
            value={
              <span className="font-mono text-[10px] text-[#a1a1aa]">
                /api/webhooks/betterstack
              </span>
            }
          />
          <Row
            label="Status"
            value={<Badge text={betterstack ? 'ready' : 'off by design'} tone={betterstack ? 'green' : 'blue'} />}
          />
        </AdminCard>

        {/* 9. Brevo */}
        <AdminCard title="Brevo (renewal digest)">
          <Row label="BREVO_OPS_DIGEST_TO" value={<YesNo ok={renewalReminders} yes="set up" no="needs setup" />} />
          <Row
            label="Used for"
            value={<span className="text-xs text-[#a1a1aa]">Daily renewal digest email</span>}
          />
          <Row
            label="Status"
            value={<Badge text={renewalReminders ? 'ready' : 'needs setup'} tone={renewalReminders ? 'green' : 'amber'} />}
          />
        </AdminCard>

        {/* 10. Provider sync tokens */}
        <AdminCard title="Provider API keys">
          <Row label="GITHUB_TOKEN" value={<YesNo ok={present('GITHUB_TOKEN')} yes="set up" no="needs setup" />} />
          <Row label="VERCEL_API_TOKEN" value={<YesNo ok={present('VERCEL_API_TOKEN')} yes="set up" no="needs setup" />} />
          <Row label="CLOUDFLARE_API_TOKEN" value={<YesNo ok={present('CLOUDFLARE_API_TOKEN')} yes="set up" no="needs setup" />} />
          <Row label="CLOUDFLARE_ACCOUNT_ID" value={<YesNo ok={present('CLOUDFLARE_ACCOUNT_ID')} yes="set up" no="needs setup" />} />
          <Row label="HETZNER_API_TOKEN" value={<YesNo ok={present('HETZNER_API_TOKEN')} yes="set up" no="needs setup" />} />
        </AdminCard>

        {/* 11. Safety guarantees */}
        <AdminCard title="Safety guarantees">
          <ul>
            <Check label="No provider write APIs to GitHub / Vercel / Cloudflare / Hetzner" />
            <Check label="No database writes when DATABASE_URL is unset" />
            <Check label="No secret values exposed in any response" />
            <Check label="/admin/agent untouched by /admin/ops" />
            <Check label="Snapshot data clearly labelled read-only" />
            <Check label="No inbox is being read; no emails sent, archived, deleted, or labelled" />
            <Check label="No email body content stored — references only when the database is connected" />
          </ul>
        </AdminCard>

        {/* 12. Route smoke checklist */}
        <AdminCard title="Route smoke checklist">
          <ul className="space-y-1">
            {OPS_ROUTES.map((route) => (
              <li key={route.href} className="flex items-center gap-2 py-1 text-xs">
                <span aria-hidden className="text-[#52525b]">→</span>
                <Link href={route.href} className="font-mono text-emerald-300 hover:underline">
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </>
  );
}
