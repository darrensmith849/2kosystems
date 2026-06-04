import Link from 'next/link';
import { AdminCard, Badge, Row, SectionHeader, StatusPill } from '@/components/admin-ui';
import { detectRuntime, getDeploymentEnv } from '@/lib/runtime';
import { isDbConfigured, pingDb } from '@/lib/db/client';
import { isAiKeyConfigured } from '@/lib/ops/ops-assistant-context';

// /admin/ops/health — single diagnostic page. Server component only. Every
// env var is checked for PRESENCE only (Boolean). NO values are ever rendered,
// logged, or otherwise exposed. Safe to render in any environment.

export const dynamic = 'force-dynamic';

function present(name: string): boolean {
  return Boolean(process.env[name]);
}

function YesNo({ ok, yes = 'yes', no = 'no' }: { ok: boolean; yes?: string; no?: string }) {
  return <Badge text={ok ? yes : no} tone={ok ? 'green' : 'neutral'} />;
}

function Check({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2 py-1.5 text-xs text-[#e4e4e7]">
      <span aria-hidden className="mt-0.5 text-emerald-300">✓</span>
      <span>{label}</span>
    </li>
  );
}

const OPS_ROUTES: Array<{ href: string; label: string }> = [
  { href: '/admin/ops', label: '/admin/ops' },
  { href: '/admin/ops/search', label: '/admin/ops/search' },
  { href: '/admin/ops/ask', label: '/admin/ops/ask' },
  { href: '/admin/ops/clients', label: '/admin/ops/clients' },
  { href: '/admin/ops/assets', label: '/admin/ops/assets' },
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
  const snapshotActive = !dbConfigured;
  const dbDirectPresent = present('DATABASE_URL_DIRECT');

  const ping = dbConfigured ? await pingDb() : { ok: false, error: 'DATABASE_URL not set' };
  // pingDb returns either { ok: true } or { ok: false, error }. We display the
  // shape only — never any DB credential. The error string from postgres-js
  // does not contain the connection URL.
  const pingError = ping.ok ? null : ping.error?.slice(0, 120) ?? 'unknown error';

  const aiMode = isAiKeyConfigured() ? 'AI' : 'search-only';
  const betterstack = present('BETTERSTACK_WEBHOOK_SECRET');
  const renewalReminders = present('BREVO_OPS_DIGEST_TO');
  const cronSecret = present('CRON_SECRET');

  return (
    <>
      <SectionHeader
        title="Health"
        subtitle="Runtime, database, and integration status."
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

        <AdminCard title="Database">
          <Row label="DATABASE_URL" value={<YesNo ok={dbConfigured} yes="present" no="absent" />} />
          <Row label="DATABASE_URL_DIRECT" value={<YesNo ok={dbDirectPresent} yes="present" no="absent" />} />
          <Row
            label="Snapshot mode"
            value={<Badge text={snapshotActive ? 'active' : 'inactive'} tone={snapshotActive ? 'amber' : 'green'} />}
          />
          <Row
            label="DB ping"
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

        <AdminCard title="Integrations">
          <Row label="GITHUB_TOKEN" value={<YesNo ok={present('GITHUB_TOKEN')} yes="present" no="absent" />} />
          <Row label="VERCEL_API_TOKEN" value={<YesNo ok={present('VERCEL_API_TOKEN')} yes="present" no="absent" />} />
          <Row label="CLOUDFLARE_API_TOKEN" value={<YesNo ok={present('CLOUDFLARE_API_TOKEN')} yes="present" no="absent" />} />
          <Row label="CLOUDFLARE_ACCOUNT_ID" value={<YesNo ok={present('CLOUDFLARE_ACCOUNT_ID')} yes="present" no="absent" />} />
          <Row label="HETZNER_API_TOKEN" value={<YesNo ok={present('HETZNER_API_TOKEN')} yes="present" no="absent" />} />
          <Row label="CRON_SECRET" value={<YesNo ok={cronSecret} yes="present" no="absent" />} />
          <Row label="BETTERSTACK_WEBHOOK_SECRET" value={<YesNo ok={betterstack} yes="present" no="absent" />} />
          <Row label="BREVO_OPS_DIGEST_TO" value={<YesNo ok={renewalReminders} yes="present" no="absent" />} />
          <Row label="ANTHROPIC_API_KEY" value={<YesNo ok={isAiKeyConfigured()} yes="present" no="absent" />} />
        </AdminCard>

        <AdminCard title="Feature flags / surfaces">
          <Row
            label="Snapshot mode"
            value={<Badge text={snapshotActive ? 'active' : 'inactive'} tone={snapshotActive ? 'amber' : 'green'} />}
          />
          <Row
            label="AI assistant mode"
            value={<Badge text={aiMode} tone={aiMode === 'AI' ? 'green' : 'blue'} />}
          />
          <Row label="Export routes" value={<Badge text="available" tone="green" />} />
          <Row label="Cron routes" value={<Badge text="available" tone="green" />} />
          <Row
            label="BetterStack webhook"
            value={<YesNo ok={betterstack} yes="enabled" no="disabled" />}
          />
          <Row
            label="Renewal reminders"
            value={<YesNo ok={renewalReminders} yes="enabled" no="disabled" />}
          />
          <Row
            label="Decision → ticket bridge"
            value={<Badge text={dbConfigured ? 'live' : 'preview-only'} tone={dbConfigured ? 'green' : 'amber'} />}
          />
        </AdminCard>

        <AdminCard title="Safety guarantees">
          <ul>
            <Check label="No provider write APIs to GitHub / Vercel / Cloudflare / Hetzner" />
            <Check label="No DB writes when DATABASE_URL is unset" />
            <Check label="No secret values exposed in any response" />
            <Check label="/admin/agent untouched by /admin/ops" />
            <Check label="Snapshot data clearly labelled read-only" />
          </ul>
        </AdminCard>

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
