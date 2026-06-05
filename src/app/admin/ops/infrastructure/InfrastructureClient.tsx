'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, DataTable, EmptyState, StatusPill } from '@/components/admin-ui';
import type { CloudflareZone, CloudflarePagesProject, HetznerServer } from '@/lib/db/schema/infra';
import type { IntegrationConnectivity } from '@/lib/integrations/types';
import { SYNC_STATE_LABEL, labelFor } from '@/lib/ops/labels';

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
          title="Cloudflare"
          action={
            <div className="flex items-center gap-3">
              <StatusPill status={cloudflareStatus.status === 'connected' ? 'connected' : 'not_connected'} />
              <button
                type="button"
                onClick={() => runSync('cloudflare')}
                disabled={busy !== null || cloudflareStatus.status !== 'connected'}
                className="rounded-md border border-white/[0.08] hover:bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy === 'cloudflare' ? 'Syncing…' : 'Run sync now'}
              </button>
            </div>
          }
        >
          {cloudflareStatus.status === 'connected' ? (
            <p className="text-xs text-zinc-400">
              Sync reads DNS zones, DNS records, and Pages projects. Read-only — nothing is deleted. Rows that disappear upstream are marked Missing.
            </p>
          ) : (
            <p className="text-xs text-amber-200">{cloudflareStatus.detail}</p>
          )}
        </AdminCard>

        <AdminCard
          title="Hetzner Cloud"
          action={
            <div className="flex items-center gap-3">
              <StatusPill status={hetznerStatus.status === 'connected' ? 'connected' : 'not_connected'} />
              <button
                type="button"
                onClick={() => runSync('hetzner')}
                disabled={busy !== null || hetznerStatus.status !== 'connected'}
                className="rounded-md border border-white/[0.08] hover:bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy === 'hetzner' ? 'Syncing…' : 'Run sync now'}
              </button>
            </div>
          }
        >
          {hetznerStatus.status === 'connected' ? (
            <p className="text-xs text-zinc-400">
              Sync reads servers, labels, and IP addresses. Read-only. Metrics and backup status come in a later step.
            </p>
          ) : (
            <p className="text-xs text-amber-200">{hetznerStatus.detail}</p>
          )}
        </AdminCard>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div>
        <h3 className="text-sm font-medium text-zinc-100 mb-3">Hetzner servers</h3>
        {hetznerServers.length === 0 ? (
          <EmptyState title="No Hetzner servers yet" hint="Connect Hetzner in Settings and click Run sync." />
        ) : (
          <DataTable
            rows={hetznerServers}
            columns={[
              { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-zinc-100">{s.name}</span> },
              { key: 'type', header: 'Type', render: (s) => s.serverType ?? <span className="text-zinc-500">—</span> },
              { key: 'location', header: 'Location', render: (s) => s.location ?? <span className="text-zinc-500">—</span> },
              { key: 'status', header: 'Status', render: (s) => <Badge text={s.status ?? 'unknown'} tone={s.status === 'running' ? 'green' : 'neutral'} /> },
              { key: 'ipv4', header: 'IPv4', render: (s) => <span className="font-mono text-[10px]">{s.publicIpv4 ?? '—'}</span> },
              { key: 'state', header: 'Sync state', render: (s) => <Badge text={labelFor(SYNC_STATE_LABEL, s.state)} tone={STATE_TONES[s.state] ?? 'neutral'} /> },
            ]}
          />
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-100 mb-3">Cloudflare zones</h3>
        {zones.length === 0 ? (
          <EmptyState title="No Cloudflare zones yet" hint="Connect Cloudflare in Settings and click Run sync." />
        ) : (
          <DataTable
            rows={zones}
            columns={[
              { key: 'name', header: 'Name', render: (z) => <span className="font-medium text-zinc-100">{z.name}</span> },
              { key: 'status', header: 'Status', render: (z) => <Badge text={z.status ?? 'unknown'} tone={z.status === 'active' ? 'green' : 'neutral'} /> },
              { key: 'plan', header: 'Plan', render: (z) => z.plan ?? <span className="text-zinc-500">—</span> },
              { key: 'state', header: 'Sync state', render: (z) => <Badge text={labelFor(SYNC_STATE_LABEL, z.state)} tone={STATE_TONES[z.state] ?? 'neutral'} /> },
            ]}
          />
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-100 mb-3">Cloudflare Pages projects</h3>
        {pagesProjects.length === 0 ? (
          <EmptyState title="No Cloudflare Pages projects yet" hint="Sync runs surface CF Pages projects here." />
        ) : (
          <DataTable
            rows={pagesProjects}
            columns={[
              { key: 'name', header: 'Name', render: (p) => <span className="font-medium text-zinc-100">{p.name}</span> },
              { key: 'branch', header: 'Branch', render: (p) => p.productionBranch ?? <span className="text-zinc-500">—</span> },
              { key: 'status', header: 'Latest deploy', render: (p) => p.latestDeploymentStatus ?? <span className="text-zinc-500">—</span> },
              { key: 'domains', header: 'Custom domains', render: (p) => p.customDomains.length > 0 ? <span className="font-mono text-[10px]">{p.customDomains.join(', ')}</span> : <span className="text-zinc-500">—</span> },
              { key: 'state', header: 'Sync state', render: (p) => <Badge text={labelFor(SYNC_STATE_LABEL, p.state)} tone={STATE_TONES[p.state] ?? 'neutral'} /> },
            ]}
          />
        )}
      </div>
    </div>
  );
}
