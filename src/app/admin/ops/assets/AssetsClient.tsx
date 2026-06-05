'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, EmptyState, Tile, type TileStatus } from '@/components/admin-ui';
import type { SparklineTone } from '@/components/admin-ui';
import type { AssetWithRefs } from '@/lib/ops/assets-service';
import { ASSET_TYPE_LABEL, labelFor } from '@/lib/ops/labels';

const ASSET_TYPES = [
  'website', 'saas_app', 'portal', 'api', 'landing', 'internal_tool', 'database', 'service',
];

// Cloudflare-style tile grid: one tile per asset, name + subtitle + sparkline
// + status dot. Long info (stack, notes, live URL) lives on the per-asset
// detail page reachable by clicking the tile.

function statusFor(status: string | null | undefined): { status: TileStatus; tone: SparklineTone } {
  switch (status) {
    case 'active':
      return { status: 'ok', tone: 'good' };
    case 'paused':
      return { status: 'warn', tone: 'warn' };
    case 'archived':
      return { status: 'neutral', tone: 'neutral' };
    case 'planned':
      return { status: 'neutral', tone: 'neutral' };
    default:
      return { status: 'neutral', tone: 'neutral' };
  }
}

function AssetGrid({ assets }: { assets: AssetWithRefs[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {assets.map((a) => {
        const { status, tone } = statusFor(a.status);
        const subtitle = [
          labelFor(ASSET_TYPE_LABEL, a.type),
          a.client?.name,
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <Tile
            key={a.id}
            href={`/admin/ops/assets/${a.id}`}
            name={a.name}
            subtitle={subtitle || '—'}
            sparklineSeed={a.id}
            sparklineTone={tone}
            status={status}
          />
        );
      })}
    </div>
  );
}

export default function AssetsClient({
  initialAssets,
  clients,
  isSnapshot = false,
}: {
  initialAssets: AssetWithRefs[];
  clients: { id: string; name: string }[];
  isSnapshot?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('website');
  const [liveUrl, setLiveUrl] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ops/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          liveUrl: liveUrl.trim() || null,
          clientId: clientId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setName('');
      setLiveUrl('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  if (isSnapshot) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-700 dark:text-zinc-500">
            {initialAssets.length} {initialAssets.length === 1 ? 'asset' : 'assets'}
          </p>
        </div>
        <AssetGrid assets={initialAssets} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminCard title="Add asset">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Asset name"
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none lg:col-span-1"
            disabled={busy}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
            disabled={busy}
          >
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>{labelFor(ASSET_TYPE_LABEL, t)}</option>
            ))}
          </select>
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://example.com"
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none lg:col-span-2"
            disabled={busy}
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
            disabled={busy}
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-5 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors lg:col-span-5"
          >
            {busy ? 'Saving…' : 'Add asset'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>

      {initialAssets.length === 0 ? (
        <EmptyState title="No assets yet" hint="Add assets to start linking clients to the websites, apps, and tools we manage for them." />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-zinc-700 dark:text-zinc-500">
            {initialAssets.length} {initialAssets.length === 1 ? 'asset' : 'assets'}
          </p>
          <AssetGrid assets={initialAssets} />
        </div>
      )}
    </div>
  );
}
