'use client';

import type { AgentOutput } from '@/lib/agent-core/types';
import { CopyBtn } from './ui';

export function RawJsonCard({
  result,
  copiedKey,
  onCopy,
  safetyOk,
  open,
  onToggle,
}: {
  result: AgentOutput;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  safetyOk: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const json = JSON.stringify(result, null, 2);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-700 dark:text-[#71717a]">
            Raw JSON output
          </p>
          <span className="text-zinc-700 dark:text-[#71717a] text-xs">{open ? '▲' : '▼'}</span>
        </button>
        <CopyBtn
          text={json}
          label="Copy JSON"
          id="json"
          copiedKey={copiedKey}
          onCopy={onCopy}
          disabled={!safetyOk}
        />
      </div>
      {open && (
        <pre className="px-5 pb-5 text-[11px] font-mono text-zinc-700 dark:text-[#71717a] overflow-x-auto whitespace-pre leading-relaxed border-t border-zinc-200 dark:border-[#1c1c1e]">
          {json}
        </pre>
      )}
    </div>
  );
}
