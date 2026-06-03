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
        subtitle="Connectivity status for every integration. Manual sync runs land here in Phase 2 — use the per-section ‘Run sync now’ buttons for now."
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
          <Row label="Detected runtime" value={<span className="font-mono">{detectRuntime()}</span>} />
          <Row label="Deployment env" value={<span className="font-mono">{getDeploymentEnv()}</span>} />
          <Row label="Node env" value={<span className="font-mono">{process.env.NODE_ENV}</span>} />
        </AdminCard>

        <AdminCard
          title="Database"
          action={<StatusPill status={dbConfigured && dbPing.ok ? 'connected' : 'not_connected'} />}
        >
          <Row label="DATABASE_URL" value={dbConfigured ? 'set (value hidden)' : <span className="text-amber-200">not set</span>} />
          <Row label="Reachable" value={dbPing.ok ? <span className="text-emerald-300">yes</span> : <span className="text-rose-400">{dbPing.error ?? 'no'}</span>} />
        </AdminCard>
      </div>

      <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717a] mt-8 mb-3">Integrations</h3>
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
      <Row label="Env" value={<code className="text-[#a1a1aa] text-[11px]">{envVar}</code>} />
      <Row label="Reason" value={status.status === 'connected' ? 'token present' : `${status.reason}${status.detail ? ` — ${status.detail}` : ''}`} />
      <Row label="Last checked" value={<span className="font-mono text-[10px]">{status.checkedAt}</span>} />
    </AdminCard>
  );
}
