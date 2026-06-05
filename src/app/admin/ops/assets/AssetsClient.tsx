'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminCard, Badge, EmptyState } from '@/components/admin-ui';
import type { AssetWithRefs } from '@/lib/ops/assets-service';
import { ASSET_TYPE_LABEL, labelFor } from '@/lib/ops/labels';

const ASSET_TYPES = [
  'website', 'saas_app', 'portal', 'api', 'landing', 'internal_tool', 'database', 'service',
];

// Compact card-grid renderer modeled on the Cloudflare "Domains" / "Workers"
// tiles in the account home: one tile per asset, name bold, small subtitle,
// status dot on the right. No multi-column wide table. Long info (stack,
// notes, live URL) lives on the per-asset detail page reachable by clicking
// the tile.

function statusDot(status: string | null | undefined): { color: string; label: string } {
  switch (status) {
    case 'active':
      return { color: 'bg-emerald-400', label: 'Active' };
    case 'archived':
      return { color: 'bg-zinc-500', label: 'Archived' };
    case 'paused':
      return { color: 'bg-amber-400', label: 'Paused' };
    case 'planned':
      return { color: 'bg-sky-400', label: 'Planned' };
    default:
      return { color: 'bg-zinc-500', label: status ?? '—' };
  }
}

function AssetGrid({ assets }: { assets: AssetWithRefs[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {assets.map((a) => {
        const dot = statusDot(a.status);
        const subtitle = [
          labelFor(ASSET_TYPE_LABEL, a.type),
          a.client?.name,
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <Link
            key={a.id}
            href={`/admin/ops/assets/${a.id}`}
            className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.10] transition-colors px-4 py-3.5 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-white">
                {a.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 truncate">
                {subtitle || '—'}
              </p>
            </div>
            <span className="flex items-center gap-1.5 shrink-0">
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot.color}`} />
              <span className="text-xs text-zinc-400">{dot.label}</span>
            </span>
          </Link>
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
          <p className="text-xs text-zinc-500">
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
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none lg:col-span-1"
            disabled={busy}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100"
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
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none lg:col-span-2"
            disabled={busy}
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100"
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
            className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-5 py-2.5 text-sm font-medium text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors lg:col-span-5"
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
          <p className="text-xs text-zinc-500">
            {initialAssets.length} {initialAssets.length === 1 ? 'asset' : 'assets'}
          </p>
          <AssetGrid assets={initialAssets} />
        </div>
      )}
    </div>
  );
}
