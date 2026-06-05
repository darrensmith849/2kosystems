'use client';

import type { BatchItem, BatchItemStatus } from '../utils/batchInboxStorage';
import { scoreColor, scoreLabel } from '../utils/formatters';

function StatusBadge({ status }: { status: BatchItemStatus }) {
  const map: Record<BatchItemStatus, string> = {
    queued: 'text-zinc-700 dark:text-[#71717a] border-zinc-200 dark:border-[#27272a]',
    analysed: 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/5',
    skipped: 'text-[#3f3f46] border-zinc-200 dark:border-[#1c1c1e]',
    error: 'text-rose-400 border-rose-400/30 bg-rose-400/5',
  };
  return (
    <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${map[status]}`}>
      {status}
    </span>
  );
}

export function BatchQueueItem({
  item,
  analysing,
  onAnalyse,
  onLoadToForm,
  onSkip,
  onDelete,
}: {
  item: BatchItem;
  analysing: boolean;
  onAnalyse: (item: BatchItem) => void;
  onLoadToForm: (item: BatchItem) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const result = item.result;
  const score = result?.classification?.leadScore;

  return (
    <div className="px-5 py-3 border-b border-zinc-200 dark:border-[#1c1c1e] last:border-0 hover:bg-white dark:bg-[#111113] transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusBadge status={item.status} />
            {item.senderName && <span className="text-xs text-zinc-700 dark:text-[#a1a1aa]">{item.senderName}</span>}
            {item.senderEmail && <span className="text-[10px] text-[#3f3f46]">{item.senderEmail}</span>}
            {score !== undefined && (
              <span className={`text-xs font-semibold tabular-nums ${scoreColor(score)}`}>
                {score} — {scoreLabel(score)}
              </span>
            )}
          </div>
          {item.subject && <p className="text-[11px] text-zinc-700 dark:text-[#71717a] mb-0.5">{item.subject}</p>}
          <p className="text-[11px] text-[#3f3f46] line-clamp-2">{item.message}</p>
          {item.errorMessage && <p className="text-[11px] text-rose-400 mt-0.5">{item.errorMessage}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
          {item.status === 'queued' && (
            <button
              type="button"
              onClick={() => onAnalyse(item)}
              disabled={analysing}
              className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {analysing ? (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-[#0f7b3a] border-t-transparent animate-spin" />
                  Analysing
                </span>
              ) : 'Analyse'}
            </button>
          )}
          <button type="button" onClick={() => onLoadToForm(item)} className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 transition-colors">
            Load to form
          </button>
          {item.status === 'queued' && (
            <button type="button" onClick={() => onSkip(item.id)} className="text-[11px] text-[#3f3f46] hover:text-zinc-700 dark:text-[#71717a] transition-colors">
              Skip
            </button>
          )}
          <button type="button" onClick={() => onDelete(item.id)} className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
