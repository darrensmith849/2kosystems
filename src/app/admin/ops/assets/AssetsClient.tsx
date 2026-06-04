'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminCard, Badge, DataTable, EmptyState } from '@/components/admin-ui';
import type { AssetWithRefs } from '@/lib/ops/assets-service';
import { ASSET_TYPE_LABEL, labelFor } from '@/lib/ops/labels';

const ASSET_TYPES = [
  'website', 'saas_app', 'portal', 'api', 'landing', 'internal_tool', 'database', 'service',
];

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
      <div className="space-y-5">
        <AdminCard title="Add asset — read-only in preview mode">
          <p className="text-xs text-[#a1a1aa]">
            Adding assets turns on once the production database is connected. The rows below are the saved sample data.
          </p>
        </AdminCard>
        <DataTable
          rows={initialAssets}
          columns={[
            { key: 'name', header: 'Name', render: (a) => (
              <Link href={`/admin/ops/assets/${a.id}`} className="font-medium text-[#f5f5f5] hover:text-emerald-300 transition-colors">
                {a.name}
                <span className="ml-2 inline-block text-[9px] uppercase tracking-wider text-emerald-300/80 border border-emerald-400/30 rounded-full px-1.5 py-0.5 align-middle">snapshot</span>
              </Link>
            ) },
            { key: 'type', header: 'Type', render: (a) => <Badge text={labelFor(ASSET_TYPE_LABEL, a.type)} /> },
            { key: 'client', header: 'Client', render: (a) => a.client?.name ?? <span className="text-[#52525b]">—</span> },
            { key: 'url', header: 'Live URL', render: (a) =>
              a.liveUrl
                ? <a href={a.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">{a.liveUrl}</a>
                : <span className="text-[#52525b]">—</span>
            },
            { key: 'tech', header: 'Stack', render: (a) => a.techStack && a.techStack.length > 0 ? <span className="font-mono text-[10px] text-[#a1a1aa]">{a.techStack.join(', ')}</span> : <span className="text-[#52525b]">—</span> },
            { key: 'notes', header: 'Notes', render: (a) => a.notes ? <span className="text-[11px] text-[#a1a1aa]">{a.notes}</span> : <span className="text-[#52525b]">—</span> },
          ]}
        />
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
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none lg:col-span-1"
            disabled={busy}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
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
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none lg:col-span-2"
            disabled={busy}
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
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
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors lg:col-span-5"
          >
            {busy ? 'Saving…' : 'Add asset'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>

      {initialAssets.length === 0 ? (
        <EmptyState title="No assets yet" hint="Add assets to start linking clients to the websites, apps, and tools we manage for them." />
      ) : (
        <DataTable
          rows={initialAssets}
          columns={[
            { key: 'name', header: 'Name', render: (a) => (
              <Link href={`/admin/ops/assets/${a.id}`} className="font-medium text-[#f5f5f5] hover:text-emerald-300 transition-colors">
                {a.name}
              </Link>
            ) },
            { key: 'type', header: 'Type', render: (a) => <Badge text={labelFor(ASSET_TYPE_LABEL, a.type)} /> },
            { key: 'client', header: 'Client', render: (a) => a.client?.name ?? <span className="text-[#52525b]">—</span> },
            { key: 'url', header: 'Live URL', render: (a) =>
              a.liveUrl
                ? <a href={a.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">{a.liveUrl}</a>
                : <span className="text-[#52525b]">—</span>
            },
            { key: 'status', header: 'Status', render: (a) => <Badge text={a.status[0].toUpperCase() + a.status.slice(1)} tone={a.status === 'active' ? 'green' : 'neutral'} /> },
          ]}
        />
      )}
    </div>
  );
}
