'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminCard, EmptyState, Badge } from '@/components/admin-ui';
import type { Questionnaire } from '@/lib/db/schema/questionnaires';

const CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP', 'BWP', 'NAD'];

type Tone = 'neutral' | 'green' | 'amber' | 'rose' | 'blue';
function toneForStatus(status: string): Tone {
  switch (status) {
    case 'submitted':
      return 'green';
    case 'opened':
      return 'amber';
    case 'sent':
      return 'blue';
    case 'revoked':
      return 'rose';
    default:
      return 'neutral';
  }
}

function formatMoney(amount: string, currency: string): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function QuestionnairesClient({ initial }: { initial: Questionnaire[] }) {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [clientName, setClientName] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [currency, setCurrency] = useState('ZAR');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || !priceAmount.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ops/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: clientName.trim(), priceAmount, currency }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setClientName('');
      setPriceAmount('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(q: Questionnaire) {
    const url = `${origin}/q/${q.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(q.id);
      setTimeout(() => setCopiedId((c) => (c === q.id ? null : c)), 1500);
    } catch {
      /* clipboard blocked — link is still visible/selectable below */
    }
  }

  const inputClass =
    'rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none transition-colors';

  return (
    <div className="space-y-5">
      <AdminCard title="New questionnaire link">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-1 min-w-[220px] flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Client / company name</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Virgin Estate Agents and Property Consultants (PVT) LTD"
              className={inputClass}
              disabled={busy}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              placeholder="0.00"
              className={`${inputClass} w-32`}
              disabled={busy}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={inputClass}
              disabled={busy}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={busy || !clientName.trim() || !priceAmount.trim()}
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? 'Creating…' : 'Create link'}
          </button>
        </form>
        <p className="mt-3 text-xs text-zinc-500">
          Payment terms are fixed at <strong>50% upfront, 50% on completion</strong>. The client chooses how they&apos;ll
          pay (cash or bank transfer) on the form. The price stays server-side — it is never shown in the URL.
        </p>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>

      {initial.length === 0 ? (
        <EmptyState
          title="No questionnaires yet"
          hint="Create your first onboarding link above, then send it to the client. They unlock it with the shared password."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-zinc-700 dark:text-zinc-500">{initial.length} link{initial.length === 1 ? '' : 's'}</p>
          <div className="space-y-2">
            {initial.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02] p-4 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{q.clientName}</p>
                      <Badge text={q.status} tone={toneForStatus(q.status)} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {formatMoney(q.priceAmount, q.currency)} · 50% upfront / 50% on completion
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-zinc-500">
                      {origin ? `${origin}/q/${q.token}` : `/q/${q.token}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyLink(q)}
                      className="rounded-full border border-zinc-200 dark:border-white/[0.08] px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:border-emerald-400/40 transition-colors"
                    >
                      {copiedId === q.id ? 'Copied!' : 'Copy link'}
                    </button>
                    <Link
                      href={`/admin/ops/questionnaires/${q.id}`}
                      className="rounded-full border border-zinc-200 dark:border-white/[0.08] px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:border-emerald-400/40 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
