'use client';

import { useState } from 'react';
import type { TestRun, AssertionResult } from '../utils/qualityLabStorage';
import { fmtDateTime } from '../utils/formatters';

function resultColor(r: 'pass' | 'warn' | 'fail') {
  if (r === 'pass') return 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/5';
  if (r === 'warn') return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
  return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
}
function resultIcon(r: 'pass' | 'warn' | 'fail') {
  return r === 'pass' ? '✓' : r === 'warn' ? '⚠' : '✗';
}

function AssertionRow({ a }: { a: AssertionResult }) {
  return (
    <div
      className={`flex items-start gap-2 px-3 py-1.5 rounded-lg text-[11px] ${
        a.result === 'pass'
          ? 'bg-[#0a1410] border border-[#1c4a2e]'
          : a.result === 'warn'
            ? 'bg-amber-400/5 border border-amber-400/20'
            : 'bg-rose-400/5 border border-rose-400/25'
      }`}
    >
      <span className={`shrink-0 font-mono ${a.result === 'pass' ? 'text-[#4ade80]' : a.result === 'warn' ? 'text-amber-400' : 'text-rose-400'}`}>
        {resultIcon(a.result)}
      </span>
      <div>
        <span className="text-zinc-700 dark:text-[#a1a1aa]">{a.label}</span>
        <span className="text-[#3f3f46] ml-2">({a.expected} → {a.actual})</span>
      </div>
    </div>
  );
}

export function TestRunResult({
  run,
  onDelete,
  onUpdateNote,
}: {
  run: TestRun;
  onDelete: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(run.manualNote);

  const passCount = run.assertions.filter((a) => a.result === 'pass').length;
  const warnCount = run.assertions.filter((a) => a.result === 'warn').length;
  const failCount = run.assertions.filter((a) => a.result === 'fail').length;

  return (
    <div className="border-b border-zinc-200 dark:border-[#1c1c1e] last:border-0">
      <div className="flex items-center gap-3 px-5 py-3 hover:bg-[#0d0d0f] transition-colors">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex-1 flex items-center gap-3 text-left min-w-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${resultColor(run.overallResult)}`}>
            {resultIcon(run.overallResult)} {run.overallResult.toUpperCase()}
          </span>
          <span className="text-xs text-zinc-700 dark:text-[#a1a1aa] truncate">{run.caseTitle}</span>
          <span className="text-[10px] text-[#3f3f46] shrink-0">{fmtDateTime(run.createdAt)}</span>
          <span className="text-[10px] text-[#3f3f46] shrink-0">
            {passCount}✓ {warnCount > 0 && <span className="text-amber-400">{warnCount}⚠</span>} {failCount > 0 && <span className="text-rose-400">{failCount}✗</span>}
          </span>
          <span className="text-[#3f3f46] text-[10px] shrink-0">{open ? '▲' : '▼'}</span>
        </button>
        <button type="button" onClick={() => onDelete(run.id)} className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors shrink-0">
          Delete
        </button>
      </div>

      {open && (
        <div className="px-5 pb-4 space-y-3">
          {/* Score + summary */}
          <div className="flex items-center gap-4 text-xs text-zinc-700 dark:text-[#71717a]">
            <span>Score: <strong className="text-zinc-900 dark:text-[#f5f5f5]">{run.output?.classification?.leadScore}/100</strong></span>
            <span>Route: <strong className="text-zinc-900 dark:text-[#f5f5f5]">{run.output?.route?.business?.replace(/_/g, ' ')}</strong></span>
            <span>Type: <strong className="text-zinc-900 dark:text-[#f5f5f5]">{run.output?.route?.enquiryType?.replace(/_/g, ' ')}</strong></span>
          </div>

          {/* Assertions */}
          <div className="space-y-1">
            {run.assertions.map((a) => <AssertionRow key={a.id} a={a} />)}
          </div>

          {/* Reply preview */}
          {run.output?.suggestedReply?.body && (
            <div className="rounded-xl border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] p-3">
              <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Reply preview</p>
              <p className="text-[11px] text-zinc-700 dark:text-[#71717a] line-clamp-3 whitespace-pre-wrap">{run.output.suggestedReply.body}</p>
            </div>
          )}

          {/* Manual note */}
          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Reviewer note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => onUpdateNote(run.id, note)}
              rows={2}
              className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors resize-none"
              placeholder="Add a note about this test run…"
            />
          </div>
        </div>
      )}
    </div>
  );
}
