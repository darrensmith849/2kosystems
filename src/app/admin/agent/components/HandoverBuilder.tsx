'use client';

import { useState } from 'react';
import type { LocalAgentJob } from '../utils/types';
import { buildHandoverReport } from '../utils/handoverExport';
import { downloadFile } from '../utils/exportUtils';
import { recordBackupTimestamp } from '../utils/localBackupMetadata';
import { scoreColor, scoreLabel, fmtDateTime, statusLabel } from '../utils/formatters';
import { useCopy } from '../hooks/useCopy';

export function HandoverBuilder({ items }: { items: LocalAgentJob[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<string | null>(null);
  const { copy, copiedKey } = useCopy();

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setPreview(null);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
    setPreview(null);
  }

  function handleGenerate() {
    const toInclude = items.filter((i) => selected.has(i.id));
    if (toInclude.length === 0) return;
    setPreview(buildHandoverReport(toInclude));
  }

  function handleDownload() {
    if (!preview) return;
    downloadFile(
      preview,
      `2ko-handover-${new Date().toISOString().slice(0, 10)}.md`,
      'text/markdown',
    );
    recordBackupTimestamp();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-[#1c1c1e] bg-[#0d0d0f] px-5 py-6 text-center">
        <p className="text-xs text-[#3f3f46]">
          No items in local history. Run analyses first — they will appear here for handover selection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Item selector */}
      <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-[#1c1c1e]">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-700 dark:text-[#71717a]">
            Select leads to include
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleAll} className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors">
              {selected.size === items.length ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-[10px] text-[#3f3f46]">{selected.size} selected</span>
          </div>
        </div>
        <div className="divide-y divide-[#1c1c1e]">
          {items.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-start gap-3 px-5 py-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#0d1a11]' : 'hover:bg-[#0d0d0f]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleItem(item.id)}
                  className="mt-0.5 accent-[#0f7b3a]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold tabular-nums ${scoreColor(item.leadScore)}`}>
                      {item.leadScore}
                    </span>
                    <span className="text-xs text-zinc-700 dark:text-[#a1a1aa]">{item.senderName ?? 'Unknown'}</span>
                    <span className="text-[10px] text-[#3f3f46]">
                      {scoreLabel(item.leadScore)} · {statusLabel(item.localStatus)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3f3f46] truncate mt-0.5">{item.enquirySummary}</p>
                  <p className="text-[10px] text-[#3f3f46]">{fmtDateTime(item.createdAt)}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Generate button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={selected.size === 0}
          className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#B8C4C8] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generate handover report ({selected.size})
        </button>
        {preview && (
          <>
            <button
              type="button"
              onClick={() => copy(preview, 'handover-report')}
              className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] rounded-full px-3 py-1 transition-colors"
            >
              {copiedKey === 'handover-report' ? '✓ Copied' : 'Copy markdown'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] rounded-full px-3 py-1 transition-colors"
            >
              ↓ Download
            </button>
          </>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-[#0d0d0f] overflow-hidden">
          <p className="px-5 py-3 text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a] border-b border-zinc-200 dark:border-[#1c1c1e]">
            Handover report preview
          </p>
          <pre className="px-5 py-4 text-[11px] font-mono text-zinc-700 dark:text-[#71717a] whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
            {preview}
          </pre>
        </div>
      )}
    </div>
  );
}
