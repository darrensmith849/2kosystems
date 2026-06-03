'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, DataTable, EmptyState, StatusPill } from '@/components/admin-ui';
import type { CloudflareZone, CloudflarePagesProject, HetznerServer } from '@/lib/db/schema/infra';
import type { IntegrationConnectivity } from '@/lib/integrations/types';

const STATE_TONES: Record<string, 'green' | 'amber' | 'rose' | 'neutral'> = {
  seen: 'green', vanished: 'rose',
};

export default function InfrastructureClient({
  cloudflareStatus,
  hetznerStatus,
  zones,
  pagesProjects,
  hetznerServers,
}: {
  cloudflareStatus: IntegrationConnectivity;
  hetznerStatus: IntegrationConnectivity;
  zones: CloudflareZone[];
  pagesProjects: CloudflarePagesProject[];
  hetznerServers: HetznerServer[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSync(provider: 'cloudflare' | 'hetzner') {
    setBusy(provider);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/sync/${provider}`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard
          title="Integration: Cloudflare"
          action={
            <div className="flex items-center gap-3">
              <StatusPill status={cloudflareStatus.status === 'connected' ? 'connected' : 'not_connected'} />
              <button
                type="button"
                onClick={() => runSync('cloudflare')}
                disabled={busy !== null || cloudflareStatus.status !== 'connected'}
                className="rounded-full border border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy === 'cloudflare' ? 'Syncing…' : 'Run sync now'}
              </button>
            </div>
          }
        >
          {cloudflareStatus.status === 'connected' ? (
            <p className="text-xs text-[#71717a]">
              Sync reads zones + DNS records + Pages projects. Read-only; never deletes; missing rows tagged <code>vanished</code>.
            </p>
          ) : (
            <p className="text-xs text-amber-200">{cloudflareStatus.detail}</p>
          )}
        </AdminCard>

        <AdminCard
          title="Integration: Hetzner Cloud"
          action={
            <div className="flex items-center gap-3">
              <StatusPill status={hetznerStatus.status === 'connected' ? 'connected' : 'not_connected'} />
              <button
                type="button"
                onClick={() => runSync('hetzner')}
                disabled={busy !== null || hetznerStatus.status !== 'connected'}
                className="rounded-full border border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy === 'hetzner' ? 'Syncing…' : 'Run sync now'}
              </button>
            </div>
          }
        >
          {hetznerStatus.status === 'connected' ? (
            <p className="text-xs text-[#71717a]">
              Sync reads servers + labels + IPs. Metrics + backups in Phase 2. Read-only.
            </p>
          ) : (
            <p className="text-xs text-amber-200">{hetznerStatus.detail}</p>
          )}
        </AdminCard>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div>
        <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717a] mb-3">Hetzner servers</h3>
        {hetznerServers.length === 0 ? (
          <EmptyState title="No Hetzner servers yet" hint="Set HETZNER_API_TOKEN and click Run sync." />
        ) : (
          <DataTable
            rows={hetznerServers}
            columns={[
              { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-[#f5f5f5]">{s.name}</span> },
              { key: 'type', header: 'Type', render: (s) => s.serverType ?? <span className="text-[#52525b]">—</span> },
              { key: 'location', header: 'Location', render: (s) => s.location ?? <span className="text-[#52525b]">—</span> },
              { key: 'status', header: 'Status', render: (s) => <Badge text={s.status ?? 'unknown'} tone={s.status === 'running' ? 'green' : 'neutral'} /> },
              { key: 'ipv4', header: 'IPv4', render: (s) => <span className="font-mono text-[10px]">{s.publicIpv4 ?? '—'}</span> },
              { key: 'state', header: 'Sync', render: (s) => <Badge text={s.state} tone={STATE_TONES[s.state] ?? 'neutral'} /> },
            ]}
          />
        )}
      </div>

      <div>
        <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717a] mb-3">Cloudflare zones</h3>
        {zones.length === 0 ? (
          <EmptyState title="No Cloudflare zones yet" hint="Set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID and click Run sync." />
        ) : (
          <DataTable
            rows={zones}
            columns={[
              { key: 'name', header: 'Name', render: (z) => <span className="font-medium text-[#f5f5f5]">{z.name}</span> },
              { key: 'status', header: 'Status', render: (z) => <Badge text={z.status ?? 'unknown'} tone={z.status === 'active' ? 'green' : 'neutral'} /> },
              { key: 'plan', header: 'Plan', render: (z) => z.plan ?? <span className="text-[#52525b]">—</span> },
              { key: 'state', header: 'Sync', render: (z) => <Badge text={z.state} tone={STATE_TONES[z.state] ?? 'neutral'} /> },
            ]}
          />
        )}
      </div>

      <div>
        <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717a] mb-3">Cloudflare Pages projects</h3>
        {pagesProjects.length === 0 ? (
          <EmptyState title="No Cloudflare Pages projects yet" hint="Sync runs surface CF Pages projects here." />
        ) : (
          <DataTable
            rows={pagesProjects}
            columns={[
              { key: 'name', header: 'Name', render: (p) => <span className="font-medium text-[#f5f5f5]">{p.name}</span> },
              { key: 'branch', header: 'Branch', render: (p) => p.productionBranch ?? <span className="text-[#52525b]">—</span> },
              { key: 'status', header: 'Latest deploy', render: (p) => p.latestDeploymentStatus ?? <span className="text-[#52525b]">—</span> },
              { key: 'domains', header: 'Custom domains', render: (p) => p.customDomains.length > 0 ? <span className="font-mono text-[10px]">{p.customDomains.join(', ')}</span> : <span className="text-[#52525b]">—</span> },
              { key: 'state', header: 'Sync', render: (p) => <Badge text={p.state} tone={STATE_TONES[p.state] ?? 'neutral'} /> },
            ]}
          />
        )}
      </div>
    </div>
  );
}
