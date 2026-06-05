'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, EmptyState, StatusPill, Tile, type TileStatus } from '@/components/admin-ui';
import type { SparklineTone } from '@/components/admin-ui';
import type { CloudflareZone, CloudflarePagesProject, HetznerServer } from '@/lib/db/schema/infra';
import type { IntegrationConnectivity } from '@/lib/integrations/types';

function infraTone(active: boolean): SparklineTone {
  return active ? 'good' : 'neutral';
}

function infraStatus(active: boolean): TileStatus {
  return active ? 'ok' : 'neutral';
}

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
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-100">Hetzner servers</h3>
          {hetznerServers.length > 0 && (
            <span className="text-[11px] font-medium text-zinc-500">
              {hetznerServers.length} server{hetznerServers.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        {hetznerServers.length === 0 ? (
          <EmptyState title="No Hetzner servers yet" hint="Connect Hetzner in Settings and click Run sync." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {hetznerServers.map((s) => {
              const active = s.status === 'running';
              const parts = [s.serverType, s.location].filter(Boolean) as string[];
              const subtitle = parts.length > 0 ? parts.join(' · ') : (s.status ?? '—');
              return (
                <Tile
                  key={s.id}
                  href="/admin/ops/infrastructure"
                  name={s.name}
                  subtitle={subtitle}
                  sparklineSeed={s.id}
                  sparklineTone={infraTone(active)}
                  status={infraStatus(active)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-100">Cloudflare zones</h3>
          {zones.length > 0 && (
            <span className="text-[11px] font-medium text-zinc-500">
              {zones.length} zone{zones.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        {zones.length === 0 ? (
          <EmptyState title="No Cloudflare zones yet" hint="Connect Cloudflare in Settings and click Run sync." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {zones.map((z) => {
              const active = z.status === 'active';
              const parts = [z.status ?? 'unknown', z.plan].filter(Boolean) as string[];
              const subtitle = `zone · ${parts.join(' · ')}`;
              return (
                <Tile
                  key={z.id}
                  href="/admin/ops/infrastructure"
                  name={z.name}
                  subtitle={subtitle}
                  sparklineSeed={z.id}
                  sparklineTone={infraTone(active)}
                  status={infraStatus(active)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-100">Cloudflare Pages projects</h3>
          {pagesProjects.length > 0 && (
            <span className="text-[11px] font-medium text-zinc-500">
              {pagesProjects.length} project{pagesProjects.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        {pagesProjects.length === 0 ? (
          <EmptyState title="No Cloudflare Pages projects yet" hint="Sync runs surface CF Pages projects here." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pagesProjects.map((p) => {
              const active = p.latestDeploymentStatus === 'success';
              const branch = p.productionBranch ?? '—';
              const subtitle = `pages · ${branch}${p.latestDeploymentStatus ? ` · ${p.latestDeploymentStatus}` : ''}`;
              return (
                <Tile
                  key={p.id}
                  href="/admin/ops/infrastructure"
                  name={p.name}
                  subtitle={subtitle}
                  sparklineSeed={p.id}
                  sparklineTone={infraTone(active)}
                  status={infraStatus(active)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
