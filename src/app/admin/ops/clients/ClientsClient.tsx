'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, EmptyState, Tile, type TileStatus, type SparklineTone } from '@/components/admin-ui';
import type { ClientWithDivision } from '@/lib/ops/clients-service';

function statusFor(status: string): TileStatus {
  switch (status) {
    case 'active':
      return 'ok';
    case 'lead':
    case 'paused':
      return 'warn';
    case 'former':
    case 'archived':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function toneFor(status: string): SparklineTone {
  switch (status) {
    case 'active':
      return 'good';
    case 'lead':
    case 'paused':
      return 'warn';
    case 'former':
    case 'archived':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export default function ClientsClient({
  initialClients,
  isSnapshot = false,
}: {
  initialClients: ClientWithDivision[];
  isSnapshot?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ops/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setName('');
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
        <ClientsGrid rows={initialClients} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminCard title="Add client">
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client name"
            className="flex-1 min-w-[200px] rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none transition-colors"
            disabled={busy}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 focus:border-white/[0.12] focus:outline-none"
            disabled={busy}
          >
            <option value="active">Active</option>
            <option value="lead">Lead</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
            <option value="former">Former</option>
          </select>
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? 'Saving…' : 'Add'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>

      {initialClients.length === 0 ? (
        <EmptyState title="No clients yet" hint="Add your first client above. Importing from the inventory and CRM is planned for a later step." />
      ) : (
        <ClientsGrid rows={initialClients} />
      )}
    </div>
  );
}

function ClientsGrid({ rows }: { rows: ClientWithDivision[] }) {
  if (rows.length === 0) {
    return <EmptyState title="Sample data is empty" hint="Edit src/lib/ops/ops-snapshot-data.ts to seed more sample entries." />;
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">{rows.length} clients</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((c) => (
          <Tile
            key={c.id}
            href={`/admin/ops/clients/${c.id}`}
            name={c.name}
            subtitle={c.division?.name ?? '—'}
            sparklineSeed={c.id}
            sparklineTone={toneFor(c.status)}
            status={statusFor(c.status)}
          />
        ))}
      </div>
    </div>
  );
}
