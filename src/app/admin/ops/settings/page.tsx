import { allConnectivity } from '@/lib/integrations';
import { isDbConfigured, pingDb } from '@/lib/db/client';
import { detectRuntime, getDeploymentEnv } from '@/lib/runtime';
import { AdminCard, Row, SectionHeader, StatusPill } from '@/components/admin-ui';
import ReadinessChecklist from '@/components/admin-ui/ReadinessChecklist';
import ActivationReadiness from '@/components/admin-ui/ActivationReadiness';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import NotConnectedBanner from '../NotConnectedBanner';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const conn = allConnectivity();
  const dbConfigured = isDbConfigured();
  const dbPing = dbConfigured ? await pingDb() : { ok: false, error: 'DATABASE_URL not set' };

  return (
    <>
      <SectionHeader
        title="Settings"
        subtitle="Connection status and setup."
      />
      <NotConnectedBanner />

      <div className="mb-6">
        <ActivationReadiness />
      </div>

      <div className="mb-6">
        <ReadinessChecklist />
      </div>

      <WaitingForDb
        area="Settings"
        description="Several settings (operator picker, seed runners, manual sync triggers) activate once DATABASE_URL is set."
        whatYouWillSee={[
          'Operator picker — register and switch the active operator',
          'Day-one seeds: divisions, Vercel teams, known findings',
          'Per-provider manual sync triggers',
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard title="Runtime">
          <Row label="Detected runtime" value={<code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">{detectRuntime()}</code>} />
          <Row label="Deployment env" value={<code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">{getDeploymentEnv()}</code>} />
          <Row label="Node env" value={<code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">{process.env.NODE_ENV}</code>} />
        </AdminCard>

        <AdminCard
          title="Database"
          action={<StatusPill status={dbConfigured && dbPing.ok ? 'connected' : 'not_connected'} />}
        >
          <Row label="DATABASE_URL" value={dbConfigured ? 'set (value hidden)' : <span className="text-amber-700 dark:text-amber-200">not set</span>} />
          <Row label="Reachable" value={dbPing.ok ? <span className="text-emerald-700 dark:text-emerald-300">yes</span> : <span className="text-rose-400">{dbPing.error ?? 'no'}</span>} />
        </AdminCard>
      </div>

      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-8 mb-3">Integrations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProviderCard name="GitHub" envVar="GITHUB_TOKEN" status={conn.github} />
        <ProviderCard name="Vercel" envVar="VERCEL_API_TOKEN" status={conn.vercel} />
        <ProviderCard name="Cloudflare" envVar="CLOUDFLARE_API_TOKEN (+ CLOUDFLARE_ACCOUNT_ID)" status={conn.cloudflare} />
        <ProviderCard name="Hetzner Cloud" envVar="HETZNER_API_TOKEN" status={conn.hetzner} />
      </div>

      <div className="mt-8">
        <SettingsClient />
      </div>
    </>
  );
}

function ProviderCard({
  name,
  envVar,
  status,
}: {
  name: string;
  envVar: string;
  status: ReturnType<typeof allConnectivity>[keyof ReturnType<typeof allConnectivity>];
}) {
  return (
    <AdminCard
      title={name}
      action={<StatusPill status={status.status === 'connected' ? 'connected' : 'not_connected'} />}
    >
      <Row label="Env" value={<code className="text-xs bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">{envVar}</code>} />
      <Row label="Reason" value={status.status === 'connected' ? 'token present' : `${status.reason}${status.detail ? ` — ${status.detail}` : ''}`} />
      <Row label="Last checked" value={<span className="text-xs text-zinc-700 dark:text-zinc-500">{status.checkedAt}</span>} />
    </AdminCard>
  );
}
