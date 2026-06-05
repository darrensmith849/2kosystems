'use client';

import { useState } from 'react';

const CONFIRM_PHRASE = 'RESET LOCAL AGENT DATA';

export function ResetLocalDataPanel({
  onReset,
}: {
  onReset: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);

  const confirmed = input.trim() === CONFIRM_PHRASE;

  function handleReset() {
    if (!confirmed) return;
    onReset();
    setDone(true);
    setExpanded(false);
    setInput('');
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] px-5 py-4">
        <p className="text-xs text-[#4ade80]">✓ Local agent data cleared.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#0d0d0f] transition-colors"
      >
        <div className="text-left">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-700 dark:text-[#71717a]">Reset Local Data</p>
          <p className="text-[11px] text-[#3f3f46] mt-0.5">Clear all workflow history, quality lab runs, and batch inbox items.</p>
        </div>
        <span className="text-[#3f3f46] text-[10px] shrink-0 ml-4">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-zinc-200 dark:border-[#1c1c1e] px-5 py-4 space-y-3">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 space-y-1">
            <p className="text-[11px] font-semibold text-amber-400">Before you reset</p>
            <ul className="text-[11px] text-amber-400/80 space-y-0.5 list-disc list-inside">
              <li>This clears data in this browser only — it does not affect other admins or the backend.</li>
              <li>Cleared data cannot be recovered. Export a backup first.</li>
              <li>This does not affect your login session, tab preferences, or quick-start state.</li>
            </ul>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1.5">
              Type <span className="text-zinc-700 dark:text-[#a1a1aa]">{CONFIRM_PHRASE}</span> to confirm
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5] placeholder-[#3f3f46] focus:border-rose-500/40 focus:outline-none transition-colors font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={!confirmed}
              className="rounded-full bg-rose-500 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear all local data
            </button>
            <button
              type="button"
              onClick={() => { setExpanded(false); setInput(''); }}
              className="text-xs text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
