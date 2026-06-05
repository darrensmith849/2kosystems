'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Operator } from '@/lib/db/schema/divisions';

export default function OperatorPickerClient({
  operators,
  dbConfigured,
}: {
  operators: Operator[];
  dbConfigured: boolean;
}) {
  const router = useRouter();
  const [chosen, setChosen] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setOperator(slug: string, displayName?: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ops/operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, displayName }),
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
      setBusy(false);
    }
  }

  async function handleExisting(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen) return;
    await setOperator(chosen);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const display = newName.trim();
    if (!display) return;
    const slug = display
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    await setOperator(slug, display);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-[#71717a] mb-3">
            2KO Systems · Ops Dashboard
          </p>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-[#f5f5f5]">Who is using the dashboard?</h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-[#71717a]">Every action you take will be recorded against this operator.</p>
        </div>

        {!dbConfigured && (
          <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-xs text-amber-200">
            Database is not connected. Operator selection is still tracked in a cookie, but no operator records exist yet.
            Add at least your name below; it will become a real DB row once the database is configured.
          </div>
        )}

        {operators.length > 0 && (
          <form onSubmit={handleExisting} className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 mb-4">
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500 dark:text-[#71717a] mb-2">
              Existing operator
            </label>
            <select
              value={chosen}
              onChange={(e) => setChosen(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors mb-4"
            >
              <option value="">— pick one —</option>
              {operators.map((o) => (
                <option key={o.id} value={o.slug}>
                  {o.displayName}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy || !chosen}
              className="w-full rounded-full bg-[#0f7b3a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue as selected
            </button>
          </form>
        )}

        <form onSubmit={handleAdd} className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5">
          <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500 dark:text-[#71717a] mb-2">
            New operator
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name (e.g. Darren Smith)"
            className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors mb-4"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !newName.trim()}
            className="w-full rounded-full border border-zinc-200 dark:border-[#27272a] px-6 py-2.5 text-sm font-medium text-zinc-900 dark:text-[#f5f5f5] hover:bg-zinc-100 dark:bg-[#1c1c1e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add &amp; continue
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-rose-400 text-center">{error}</p>}
      </div>
    </div>
  );
}
