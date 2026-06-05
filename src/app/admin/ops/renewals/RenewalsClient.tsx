'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, DataTable, EmptyState } from '@/components/admin-ui';
import type { RenewalWithRefs } from '@/lib/ops/renewals-service';
import {
  computeRenewalWindow,
  type RenewalWindow,
  type ReminderState,
} from '@/lib/ops/renewals-window';

const KINDS = [
  'domain',
  'hosting',
  'ssl',
  'saas',
  'client_retainer',
  'supplier_subscription',
] as const;

const PERIODS = ['monthly', 'annual', 'one_off'] as const;

const REMINDER_CYCLE: ReminderState[] = [
  'none',
  'notified_60',
  'notified_30',
  'notified_14',
  'notified_7',
  'due',
  'overdue',
];

const WINDOW_TONE: Record<RenewalWindow, 'rose' | 'amber' | 'blue' | 'neutral'> = {
  overdue: 'rose',
  due: 'rose',
  within_7: 'amber',
  within_14: 'amber',
  within_30: 'blue',
  within_60: 'neutral',
  future: 'neutral',
};

type KindFilter = 'all' | (typeof KINDS)[number];
type WindowFilter = 'all' | 'attention' | 'next_7' | 'next_30';
type SubjectKind = 'none' | 'asset' | 'domain' | 'service';

function formatDate(d: Date | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatAmount(amount: string | null, currency: string): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency || 'ZAR',
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function nextReminderState(current: string): ReminderState {
  const idx = REMINDER_CYCLE.indexOf(current as ReminderState);
  if (idx === -1) return REMINDER_CYCLE[1]; // 'notified_60'
  return REMINDER_CYCLE[(idx + 1) % REMINDER_CYCLE.length];
}

type PickerOption = { id: string; name: string };

export default function RenewalsClient({
  initialRenewals,
  clients,
  assets = [],
  domains = [],
  isSnapshot = false,
}: {
  initialRenewals: RenewalWithRefs[];
  clients: PickerOption[];
  assets?: PickerOption[];
  domains?: PickerOption[];
  isSnapshot?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number]>('domain');
  const [nextDueAt, setNextDueAt] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ZAR');
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('annual');
  const [clientId, setClientId] = useState<string>('');
  const [subjectKind, setSubjectKind] = useState<SubjectKind>('none');
  const [subjectId, setSubjectId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);

  // Filter state
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('all');

  const subjectOptions: PickerOption[] = useMemo(() => {
    if (subjectKind === 'asset') return assets;
    if (subjectKind === 'domain') return domains;
    return [];
  }, [subjectKind, assets, domains]);

  // Annotate every renewal with its computed window once
  const annotated = useMemo(
    () => initialRenewals.map((r) => ({ row: r, window: computeRenewalWindow(r.nextDueAt) })),
    [initialRenewals],
  );

  const dueSoonCount = useMemo(
    () =>
      annotated.filter((a) => a.window === 'overdue' || a.window === 'due' || a.window === 'within_7')
        .length,
    [annotated],
  );

  const filtered = useMemo(() => {
    return annotated.filter(({ row, window }) => {
      if (kindFilter !== 'all' && row.kind !== kindFilter) return false;
      if (clientFilter !== 'all') {
        if (clientFilter === '__none__') {
          if (row.clientId) return false;
        } else if (row.clientId !== clientFilter) {
          return false;
        }
      }
      if (windowFilter === 'attention') {
        if (window !== 'overdue' && window !== 'due' && window !== 'within_7') return false;
      } else if (windowFilter === 'next_7') {
        if (window !== 'due' && window !== 'within_7' && window !== 'overdue') return false;
      } else if (windowFilter === 'next_30') {
        if (
          window !== 'overdue' &&
          window !== 'due' &&
          window !== 'within_7' &&
          window !== 'within_14' &&
          window !== 'within_30'
        ) {
          return false;
        }
      }
      return true;
    }).map((a) => a.row);
  }, [annotated, kindFilter, clientFilter, windowFilter]);

  function handleSubjectKindChange(next: SubjectKind) {
    setSubjectKind(next);
    setSubjectId('');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !nextDueAt) return;
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        kind,
        nextDueAt: new Date(nextDueAt).toISOString(),
        currency: currency.trim() || 'ZAR',
        period,
      };
      if (amount.trim()) {
        const n = Number(amount);
        if (!Number.isNaN(n)) payload.amount = n;
      }
      if (clientId) payload.clientId = clientId;
      if (subjectKind !== 'none' && subjectId) {
        payload.subjectType = subjectKind;
        payload.subjectId = subjectId;
      }
      const res = await fetch('/api/admin/ops/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setName('');
      setNextDueAt('');
      setAmount('');
      setSubjectKind('none');
      setSubjectId('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  async function patchRenewal(id: string, body: Record<string, unknown>) {
    setRowBusyId(id);
    try {
      const res = await fetch(`/api/admin/ops/renewals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      setRowBusyId(null);
    }
  }

  const subjectPickerDisabled = subjectKind === 'none' || subjectKind === 'service';
  const subjectPickerHint =
    subjectKind === 'service'
      ? 'Services aren’t tracked as a separate entity yet — leave subject as none or pick an asset/domain.'
      : null;

  return (
    <div className="space-y-5">
      {isSnapshot ? null : (
      <AdminCard title="Add renewal">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Renewal name"
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none lg:col-span-2"
            disabled={busy}
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100"
            disabled={busy}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input
            type="date"
            value={nextDueAt}
            onChange={(e) => setNextDueAt(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none"
            disabled={busy}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none"
            disabled={busy}
          />
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="ZAR"
            maxLength={8}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none"
            disabled={busy}
          />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as (typeof PERIODS)[number])}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100"
            disabled={busy}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100 lg:col-span-2"
            disabled={busy}
          >
            <option value="">no client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Subject picker */}
          <div className="lg:col-span-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[11px] font-medium text-zinc-500">Subject</p>
              {(['none', 'asset', 'domain', 'service'] as SubjectKind[]).map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <input
                    type="radio"
                    name="subjectKind"
                    value={opt}
                    checked={subjectKind === opt}
                    onChange={() => handleSubjectKindChange(opt)}
                    disabled={busy}
                    className="accent-[#0f7b3a]"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {!subjectPickerDisabled && (
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-100"
                disabled={busy}
              >
                <option value="">— pick {subjectKind} —</option>
                {subjectOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            )}
            {subjectPickerHint && (
              <p className="text-xs text-zinc-500">{subjectPickerHint}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy || !name.trim() || !nextDueAt}
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors lg:col-span-6"
          >
            {busy ? 'Saving…' : 'Add renewal'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>
      )}

      {/* Filter bar */}
      <AdminCard title="Filters">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">
              Kind
            </span>
            {(['all', ...KINDS] as KindFilter[]).map((k) => {
              const active = kindFilter === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKindFilter(k)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? 'border-emerald-400/20 text-emerald-300 bg-emerald-400/[0.08]'
                      : 'border-white/[0.08] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                  }`}
                >
                  {k.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">
              Window
            </span>
            {(
              [
                ['all', 'All'],
                ['attention', 'Overdue + due'],
                ['next_7', 'Next 7 days'],
                ['next_30', 'Next 30 days'],
              ] as Array<[WindowFilter, string]>
            ).map(([key, label]) => {
              const active = windowFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setWindowFilter(key)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? 'border-amber-400/20 text-amber-300 bg-amber-400/[0.08]'
                      : 'border-white/[0.08] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">
              Client
            </span>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-100"
            >
              <option value="all">All clients</option>
              <option value="__none__">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </AdminCard>

      {dueSoonCount > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-300 flex items-center gap-2">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          {dueSoonCount} renewal{dueSoonCount === 1 ? '' : 's'} need attention this week
        </div>
      )}

      {initialRenewals.length === 0 ? (
        <EmptyState
          title="No renewals yet"
          hint="Add a renewal to start tracking domain, hosting, SSL, SaaS, retainer and subscription deadlines."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No renewals match the current filters"
          hint="Try resetting filters or widening the window."
        />
      ) : (
        <DataTable
          rows={filtered}
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (r) => (
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-100">{r.name}</span>
                  <span className="text-xs text-zinc-500">{r.kind.replace('_', ' ')}</span>
                </div>
              ),
            },
            {
              key: 'window',
              header: 'Window',
              render: (r) => {
                const w = computeRenewalWindow(r.nextDueAt);
                return <Badge text={w.replace('_', ' ')} tone={WINDOW_TONE[w]} />;
              },
            },
            {
              key: 'nextDueAt',
              header: 'Next due',
              render: (r) => <span className="font-mono text-[11px]">{formatDate(r.nextDueAt)}</span>,
            },
            {
              key: 'amount',
              header: 'Amount',
              render: (r) => <span className="font-mono text-[11px]">{formatAmount(r.amount, r.currency)}</span>,
            },
            {
              key: 'client',
              header: 'Client',
              render: (r) => r.client?.name ?? <span className="text-zinc-500">—</span>,
            },
            {
              key: 'autoRenew',
              header: 'Auto-renew',
              render: (r) =>
                r.autoRenew === null || r.autoRenew === undefined
                  ? <span className="text-zinc-500">—</span>
                  : <Badge text={r.autoRenew ? 'Y' : 'N'} tone={r.autoRenew ? 'green' : 'neutral'} />,
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (r) => {
                const disabled = rowBusyId === r.id;
                return (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => patchRenewal(r.id, { reminderState: nextReminderState(r.reminderState) })}
                      disabled={disabled}
                      className="text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/[0.08] disabled:opacity-40"
                      title={`Current: ${r.reminderState}`}
                    >
                      Mark reminded
                    </button>
                    <button
                      type="button"
                      onClick={() => patchRenewal(r.id, { reminderState: 'none' })}
                      disabled={disabled}
                      className="text-xs font-medium px-2.5 py-1 rounded-full border border-white/[0.08] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100 disabled:opacity-40"
                    >
                      Snooze
                    </button>
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
}
