'use client';

import { useState } from 'react';

// Inline button row for the decision-to-ticket bridge preview card. Both
// actions POST to /api/admin/ops/decisions/to-tickets/run with { dryRun }.
// When the DB is not yet connected (canRun=false) both buttons render visually
// disabled — the route already responds 503 in that case, but we surface the
// intent up-front to match the snapshot-import card.

export default function DecisionBridgeButtonsClient({ canRun }: { canRun: boolean }) {
  const [busy, setBusy] = useState<'dry' | 'run' | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function trigger(dryRun: boolean) {
    if (!canRun) return;
    setBusy(dryRun ? 'dry' : 'run');
    setResult(null);
    try {
      const res = await fetch('/api/admin/ops/decisions/to-tickets/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dryRun }),
      });
      const data = await res.json();
      const label = data.status ?? (res.ok ? 'unknown' : 'error');
      const detail = data.error ?? (data.created !== undefined ? `created ${data.created}, skipped ${data.skipped}` : 'ok');
      setResult(`${label} · ${detail}`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'request_failed');
    } finally {
      setBusy(null);
    }
  }

  const disabledTitle = canRun ? undefined : 'DB not connected yet';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={!canRun || busy !== null}
        title={disabledTitle}
        onClick={() => trigger(true)}
        className={`rounded-lg border px-4 py-2 text-xs font-mono uppercase tracking-[0.15em] transition-colors ${
          canRun
            ? 'border-sky-400/40 bg-sky-400/5 text-sky-200 hover:bg-sky-400/10'
            : 'border-[#27272a] bg-[#0a0a0b] text-[#52525b] cursor-not-allowed'
        }`}
      >
        {busy === 'dry' ? 'Running…' : 'Dry run'}
      </button>
      <button
        type="button"
        disabled={!canRun || busy !== null}
        title={disabledTitle}
        onClick={() => trigger(false)}
        className={`rounded-lg border px-4 py-2 text-xs font-mono uppercase tracking-[0.15em] transition-colors ${
          canRun
            ? 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200 hover:bg-emerald-400/10'
            : 'border-[#27272a] bg-[#0a0a0b] text-[#52525b] cursor-not-allowed'
        }`}
      >
        {busy === 'run' ? 'Importing…' : 'Run import'}
      </button>
      {result && (
        <span className="text-[11px] font-mono text-[#a1a1aa]">{result}</span>
      )}
    </div>
  );
}
