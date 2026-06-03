'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminCard, Badge, DataTable, EmptyState } from '@/components/admin-ui';
import type { TicketWithRefs } from '@/lib/ops/tickets-service';

const TICKET_KINDS = ['support', 'bug', 'change_request', 'content_update', 'emergency', 'billing'] as const;
const PRIORITIES = ['low', 'med', 'high', 'urgent'] as const;

const STATUS_TONES: Record<string, 'green' | 'amber' | 'rose' | 'blue' | 'neutral'> = {
  completed: 'green',
  archived: 'neutral',
  blocked: 'rose',
  waiting_client: 'blue',
  new: 'amber',
  triage: 'amber',
  in_progress: 'amber',
  review: 'amber',
};

const PRIORITY_TONES: Record<string, 'green' | 'amber' | 'rose' | 'blue' | 'neutral'> = {
  urgent: 'rose',
  high: 'amber',
  med: 'neutral',
  low: 'blue',
};

export default function TicketsClient({
  initialTickets,
  clients,
  assets,
}: {
  initialTickets: TicketWithRefs[];
  clients: { id: string; name: string }[];
  assets: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof TICKET_KINDS)[number]>('support');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('med');
  const [clientId, setClientId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ops/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          title: title.trim(),
          priority,
          clientId: clientId || undefined,
          assetId: assetId || undefined,
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setTitle('');
      setDescription('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminCard title="Add ticket">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as (typeof TICKET_KINDS)[number])}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
            disabled={busy}
          >
            {TICKET_KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ticket title"
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none lg:col-span-2"
            disabled={busy}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
            disabled={busy}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
            disabled={busy}
          >
            <option value="">no client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] lg:col-span-2"
            disabled={busy}
          >
            <option value="">no asset</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none lg:col-span-3"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors lg:col-span-5"
          >
            {busy ? 'Saving…' : 'Add ticket'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>

      {initialTickets.length === 0 ? (
        <EmptyState title="No tickets yet" hint="Capture the next support request, bug, change, or content update here." />
      ) : (
        <DataTable
          rows={initialTickets}
          columns={[
            {
              key: 'title',
              header: 'Title',
              render: (t) => (
                <Link href={`/admin/ops/tickets/${t.id}`} className="font-medium text-[#f5f5f5] hover:text-emerald-300 transition-colors">
                  {t.title}
                </Link>
              ),
            },
            { key: 'kind', header: 'Kind', render: (t) => <Badge text={t.kind} /> },
            {
              key: 'status',
              header: 'Status',
              render: (t) => <Badge text={t.status.replace(/_/g, ' ')} tone={STATUS_TONES[t.status] ?? 'amber'} />,
            },
            {
              key: 'priority',
              header: 'Priority',
              render: (t) => <Badge text={t.priority} tone={PRIORITY_TONES[t.priority] ?? 'neutral'} />,
            },
            {
              key: 'client',
              header: 'Client',
              render: (t) => t.client?.name ?? <span className="text-[#52525b]">—</span>,
            },
            {
              key: 'updated',
              header: 'Updated',
              render: (t) => (
                <span className="font-mono text-[10px] text-[#71717a]">
                  {t.updatedAt?.toISOString().slice(0, 16) ?? '—'}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
