'use client';

import { useState } from 'react';

const CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP', 'BWP', 'NAD'];

export default function LinkGeneratorClient() {
  const [clientName, setClientName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('ZAR');
  const [expiresInDays, setExpiresInDays] = useState('60');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || !price.trim()) return;
    setBusy(true);
    setError(null);
    setLink(null);
    try {
      const res = await fetch('/api/admin/questionnaire-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          priceAmount: price,
          currency,
          expiresInDays: Number(expiresInDays) || 60,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { link?: string; error?: string };
      if (!res.ok || !data.link) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setLink(data.link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — link is selectable below */
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/[0.08] bg-[#0e0e10] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#0f7b3a]/60 focus:outline-none transition-colors';
  const labelClass = 'mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Create a client questionnaire link</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Set the client&apos;s name and price, generate the private link, and send it to them along with the
        password <span className="font-mono text-zinc-200">systems123!</span>. Payment terms are fixed at 50% upfront,
        50% on completion; the client chooses cash or bank transfer on the form. The price is sealed inside the link —
        the client can&apos;t change it.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
      >
        <div>
          <label className={labelClass}>Client / company name</label>
          <input
            className={inputClass}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Virgin Estate Agents and Property Consultants (PVT) LTD"
            disabled={busy}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={busy}
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={busy}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Link expires (days)</label>
            <input
              type="number"
              min="1"
              max="365"
              className={inputClass}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy || !clientName.trim() || !price.trim()}
          className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? 'Generating…' : 'Generate link'}
        </button>
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </form>

      {link && (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-300">Link ready — send this to the client</p>
          <p className="mt-2 break-all font-mono text-xs text-zinc-100">{link}</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={copy}
              className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/15 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <span className="text-xs text-zinc-400">
              Password to share: <span className="font-mono text-zinc-200">systems123!</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
