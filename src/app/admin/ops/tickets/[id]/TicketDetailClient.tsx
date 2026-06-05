'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminCard, Badge, EmptyState, Row, SectionHeader } from '@/components/admin-ui';
import type { TicketWithRefs } from '@/lib/ops/tickets-service';
import type { TicketComment } from '@/lib/db/schema/tickets';

const STATUSES = [
  'new', 'triage', 'waiting_client', 'in_progress', 'blocked', 'review', 'completed', 'archived',
] as const;
const PRIORITIES = ['low', 'med', 'high', 'urgent'] as const;
const BILLING_STATUSES = ['included', 'billable', 'quoted', 'approved', 'invoiced'] as const;

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

function relativeTime(date: Date | null | undefined): string {
  if (!date) return '—';
  const ms = Date.now() - date.getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return date.toISOString().slice(0, 10);
}

export default function TicketDetailClient({
  ticket,
  comments,
  operators,
}: {
  ticket: TicketWithRefs;
  comments: TicketComment[];
  operators: { id: string; slug: string; displayName: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [commentInternal, setCommentInternal] = useState(true);
  const [timeLogged, setTimeLogged] = useState<string>(String(ticket.timeLoggedMinutes ?? 0));

  async function patch(field: string, payload: Record<string, unknown>) {
    setBusy(field);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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

  async function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    await patch('status', { status: e.target.value });
  }

  async function handlePriority(e: React.ChangeEvent<HTMLSelectElement>) {
    await patch('priority', { priority: e.target.value });
  }

  async function handleBilling(e: React.ChangeEvent<HTMLSelectElement>) {
    await patch('billingStatus', { billingStatus: e.target.value });
  }

  async function handleAssignee(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    await patch('assigneeOperatorId', { assigneeOperatorId: v === '' ? null : v });
  }

  async function handleTimeSave(e: React.FormEvent) {
    e.preventDefault();
    const n = Number.parseInt(timeLogged, 10);
    if (Number.isNaN(n) || n < 0) {
      setError('Time must be a non-negative integer');
      return;
    }
    await patch('timeLoggedMinutes', { timeLoggedMinutes: n });
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setBusy('comment');
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentBody.trim(), internal: commentInternal }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setCommentBody('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <SectionHeader
        title={ticket.title}
        subtitle={
          <span>
            <Link href="/admin/ops/tickets" className="text-emerald-700 dark:text-emerald-300 hover:underline">← Tickets</Link>
            <span className="ml-2 text-zinc-500 dark:text-[#52525b]">·</span>
            <span className="ml-2 text-zinc-500 dark:text-[#71717a]">{ticket.kind}</span>
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Badge text={ticket.status.replace(/_/g, ' ')} tone={STATUS_TONES[ticket.status] ?? 'amber'} />
            <Badge text={ticket.priority} tone={PRIORITY_TONES[ticket.priority] ?? 'neutral'} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <AdminCard title="Ticket detail">
            <Row label="Title" value={ticket.title} />
            <Row label="Kind" value={ticket.kind} />
            <Row label="Status" value={ticket.status} />
            <Row label="Priority" value={ticket.priority} />
            <Row label="Client" value={ticket.client?.name ?? null} />
            <Row label="Asset" value={ticket.asset?.name ?? null} />
            <Row label="Billing" value={ticket.billingStatus} />
            <Row label="Time logged (min)" value={String(ticket.timeLoggedMinutes ?? 0)} />
            <Row label="Description" value={ticket.description ?? null} />
            <Row
              label="Due"
              value={
                ticket.dueAt ? <span className="font-mono text-[10px]">{ticket.dueAt.toISOString().slice(0, 16)}</span> : null
              }
            />
            <Row
              label="Created"
              value={<span className="font-mono text-[10px]">{ticket.createdAt?.toISOString().slice(0, 16) ?? '—'}</span>}
            />
            <Row
              label="Updated"
              value={<span className="font-mono text-[10px]">{ticket.updatedAt?.toISOString().slice(0, 16) ?? '—'}</span>}
            />
          </AdminCard>
        </div>

        <AdminCard title="Manage">
          <div className="space-y-3">
            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a] mb-1">Status</span>
              <select
                value={ticket.status}
                onChange={handleStatus}
                disabled={busy !== null}
                className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a] mb-1">Priority</span>
              <select
                value={ticket.priority}
                onChange={handlePriority}
                disabled={busy !== null}
                className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5]"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a] mb-1">Assignee</span>
              <select
                value={ticket.assigneeOperatorId ?? ''}
                onChange={handleAssignee}
                disabled={busy !== null}
                className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5]"
              >
                <option value="">unassigned</option>
                {operators.map((o) => (
                  <option key={o.id} value={o.id}>{o.displayName}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a] mb-1">Billing</span>
              <select
                value={ticket.billingStatus}
                onChange={handleBilling}
                disabled={busy !== null}
                className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5]"
              >
                {BILLING_STATUSES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
            <form onSubmit={handleTimeSave} className="space-y-1">
              <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a]">Time logged (min)</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={timeLogged}
                  onChange={(e) => setTimeLogged(e.target.value)}
                  disabled={busy !== null}
                  className="flex-1 rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5]"
                />
                <button
                  type="submit"
                  disabled={busy !== null}
                  className="rounded-full border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-zinc-900 dark:text-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {busy === 'timeLoggedMinutes' ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
          {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
        </AdminCard>
      </div>

      {(ticket.client || ticket.asset) && (
        <div className="mb-5">
          <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a] mb-2">Related</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ticket.client && (
              <Link
                href={`/admin/ops/clients/${ticket.client.id}`}
                className="block rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-4 hover:border-[#3f3f46] transition-colors"
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a] mb-1">Client</p>
                <p className="text-sm text-zinc-900 dark:text-[#f5f5f5]">{ticket.client.name}</p>
              </Link>
            )}
            {ticket.asset && (
              <Link
                href={`/admin/ops/assets/${ticket.asset.id}`}
                className="block rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-4 hover:border-[#3f3f46] transition-colors"
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a] mb-1">Asset</p>
                <p className="text-sm text-zinc-900 dark:text-[#f5f5f5]">{ticket.asset.name}</p>
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 mb-5">
        <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a]">
          Comments · {comments.length}
        </h3>
        {comments.length === 0 ? (
          <EmptyState title="No comments yet" hint="Add the first comment below — internal by default." />
        ) : (
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      text={c.internal ? 'internal' : 'external'}
                      tone={c.internal ? 'amber' : 'blue'}
                    />
                    <span className="text-[11px] font-mono text-zinc-600 dark:text-[#a1a1aa]">
                      {c.authorOperatorSlug ?? 'unknown'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-[#52525b]">{relativeTime(c.createdAt)}</span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-[#e4e4e7] whitespace-pre-wrap leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminCard title="Add comment">
        <form onSubmit={handleComment} className="space-y-3">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Comment body"
            rows={3}
            disabled={busy !== null}
            className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-[#a1a1aa] cursor-pointer">
              <input
                type="checkbox"
                checked={commentInternal}
                onChange={(e) => setCommentInternal(e.target.checked)}
                disabled={busy !== null}
                className="rounded border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b]"
              />
              Internal (not visible to client)
            </label>
            <button
              type="submit"
              disabled={busy !== null || !commentBody.trim()}
              className="rounded-full bg-[#0f7b3a] px-5 py-2 text-sm font-semibold text-zinc-900 dark:text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {busy === 'comment' ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      </AdminCard>
    </>
  );
}
