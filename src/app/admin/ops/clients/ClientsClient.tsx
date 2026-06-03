'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, DataTable, EmptyState } from '@/components/admin-ui';
import type { ClientWithDivision } from '@/lib/ops/clients-service';

const STATUS_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  active: 'green', lead: 'blue', paused: 'amber', archived: 'neutral', former: 'rose',
};

export default function ClientsClient({ initialClients }: { initialClients: ClientWithDivision[] }) {
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

  return (
    <div className="space-y-5">
      <AdminCard title="Add client">
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client name"
            className="flex-1 min-w-[200px] rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
            disabled={busy}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] focus:border-[#0f7b3a]/50 focus:outline-none"
            disabled={busy}
          >
            <option value="active">active</option>
            <option value="lead">lead</option>
            <option value="paused">paused</option>
            <option value="archived">archived</option>
            <option value="former">former</option>
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
        <EmptyState title="No clients yet" hint="Add your first client above. Imports from the inventory and CRM are Phase 2." />
      ) : (
        <DataTable
          rows={initialClients}
          columns={[
            { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-[#f5f5f5]">{c.name}</span> },
            { key: 'division', header: 'Division', render: (c) => c.division?.name ?? <span className="text-[#52525b]">—</span> },
            { key: 'status', header: 'Status', render: (c) => <Badge text={c.status} tone={STATUS_TONES[c.status] ?? 'neutral'} /> },
            { key: 'updated', header: 'Updated', render: (c) => fmtDate(c.updatedAt) },
          ]}
        />
      )}
    </div>
  );
}

function fmtDate(d: Date | null): string {
  if (!d) return '—';
  return new Date(d).toISOString().slice(0, 10);
}
