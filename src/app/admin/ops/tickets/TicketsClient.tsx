'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, EmptyState, Tile } from '@/components/admin-ui';
import type { TicketWithRefs } from '@/lib/ops/tickets-service';
import {
  TICKET_KIND_LABEL,
  TICKET_STATUS_LABEL,
  TICKET_PRIORITY_LABEL,
  labelFor,
} from '@/lib/ops/labels';

const TICKET_KINDS = ['support', 'bug', 'change_request', 'content_update', 'emergency', 'billing'] as const;
const PRIORITIES = ['low', 'med', 'high', 'urgent'] as const;
const STATUS_OPTIONS = [
  'new', 'triage', 'in_progress', 'waiting_client', 'blocked', 'review', 'completed', 'archived',
] as const;
const PRIORITY_FILTERS = ['urgent', 'high', 'med', 'low'] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-xs font-medium text-emerald-300 transition-colors'
          : 'rounded-full border border-white/[0.08] bg-transparent px-3 py-1 text-xs font-medium text-zinc-400 hover:bg-white/[0.04] hover:border-white/[0.12] hover:text-zinc-100 transition-colors'
      }
    >
      {children}
    </button>
  );
}

export default function TicketsClient({
  initialTickets,
  clients,
  assets,
  operators,
  isSnapshot = false,
}: {
  initialTickets: TicketWithRefs[];
  clients: { id: string; name: string }[];
  assets: { id: string; name: string }[];
  operators: { id: string; slug: string; displayName: string }[];
  isSnapshot?: boolean;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof TICKET_KINDS)[number]>('support');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('med');
  const [clientId, setClientId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [assigneeOperatorId, setAssigneeOperatorId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | (typeof STATUS_OPTIONS)[number]>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | (typeof PRIORITY_FILTERS)[number]>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  const filteredTickets = useMemo(() => {
    return initialTickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (clientFilter !== 'all' && (t.client?.id ?? '') !== clientFilter) return false;
      return true;
    });
  }, [initialTickets, statusFilter, priorityFilter, clientFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        kind,
        title: title.trim(),
        priority,
        clientId: clientId || undefined,
        assetId: assetId || undefined,
        description: description.trim() || undefined,
        assigneeOperatorId: assigneeOperatorId || undefined,
      };
      if (dueAt) {
        // Date inputs return YYYY-MM-DD; expand to a full ISO timestamp at the
        // present moment of the day so the API zod datetime() check passes.
        const localMidnight = new Date(`${dueAt}T00:00:00`);
        payload.dueAt = localMidnight.toISOString();
      }
      const res = await fetch('/api/admin/ops/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setTitle('');
      setDescription('');
      setDueAt('');
      setAssigneeOperatorId('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {isSnapshot ? null : (
      <AdminCard title="Add ticket">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as (typeof TICKET_KINDS)[number])}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100"
            disabled={busy}
          >
            {TICKET_KINDS.map((k) => (
              <option key={k} value={k}>{labelFor(TICKET_KIND_LABEL, k)}</option>
            ))}
          </select>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ticket title"
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none lg:col-span-3"
            disabled={busy}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100"
            disabled={busy}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{labelFor(TICKET_PRIORITY_LABEL, p)}</option>
            ))}
          </select>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            disabled={busy}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100"
            aria-label="Due date"
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 lg:col-span-2"
            disabled={busy}
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 lg:col-span-2"
            disabled={busy}
          >
            <option value="">No asset</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={assigneeOperatorId}
            onChange={(e) => setAssigneeOperatorId(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 lg:col-span-2"
            disabled={busy}
          >
            <option value="">Unassigned</option>
            {operators.map((o) => (
              <option key={o.id} value={o.id}>{o.displayName}</option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none lg:col-span-4"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors lg:col-span-6"
          >
            {busy ? 'Saving…' : 'Add ticket'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>
      )}

      <AdminCard title="Filters">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">Client</span>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-100"
            >
              <option value="all">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">Status</span>
            <Chip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</Chip>
            {STATUS_OPTIONS.map((s) => (
              <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                {labelFor(TICKET_STATUS_LABEL, s)}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">Priority</span>
            <Chip active={priorityFilter === 'all'} onClick={() => setPriorityFilter('all')}>All</Chip>
            {PRIORITY_FILTERS.map((p) => (
              <Chip key={p} active={priorityFilter === p} onClick={() => setPriorityFilter(p)}>
                {labelFor(TICKET_PRIORITY_LABEL, p)}
              </Chip>
            ))}
          </div>
        </div>
      </AdminCard>

      {filteredTickets.length === 0 ? (
        <EmptyState
          title={initialTickets.length === 0 ? 'No tickets yet' : 'No tickets match these filters'}
          hint={
            initialTickets.length === 0
              ? 'Capture the next support request, bug, change request, or content update here.'
              : 'Try clearing a chip or switching client.'
          }
        />
      ) : (
        <>
          <p className="text-xs text-zinc-500">{filteredTickets.length} tickets</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTickets.map((t) => {
              const status = t.status;
              const priority = t.priority;
              const closed = status === 'resolved' || status === 'closed';
              const hot = priority === 'high' || priority === 'critical';
              const tone = closed ? 'good' : hot ? 'warn' : 'neutral';
              const dotStatus = closed ? 'ok' : hot ? 'warn' : 'neutral';
              return (
                <Tile
                  key={t.id}
                  href={`/admin/ops/tickets/${t.id}`}
                  name={t.title}
                  subtitle={`${t.kind} · ${t.priority} · ${t.client?.name ?? '—'}`}
                  sparklineSeed={t.id}
                  sparklineTone={tone}
                  status={dotStatus}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
