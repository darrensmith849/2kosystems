'use client';

import { useState } from 'react';
import type { LocalAgentJob, LocalStatus } from '../utils/types';
import { LOCAL_STATUSES } from '../utils/types';
import { Badge } from './ui';
import {
  scoreColor,
  tempColor,
  statusLabel,
  statusColor,
  followUpLabel,
  fmtDateTime,
  slug,
} from '../utils/formatters';

export function LocalHistoryItem({
  item,
  onReload,
  onDelete,
  onUpdate,
}: {
  item: LocalAgentJob;
  onReload: (item: LocalAgentJob) => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    patch: Partial<Pick<LocalAgentJob, 'localStatus' | 'localFollowUpDate' | 'localAdminNote'>>,
  ) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [noteValue, setNoteValue] = useState(item.localAdminNote);
  const [noteSaving, setNoteSaving] = useState(false);

  const fuLabel = followUpLabel(item.localFollowUpDate);

  function handleNoteBlur() {
    if (noteValue !== item.localAdminNote) {
      setNoteSaving(true);
      onUpdate(item.id, { localAdminNote: noteValue });
      setTimeout(() => setNoteSaving(false), 600);
    }
  }

  return (
    <div className="border-b border-[#1c1c1e] last:border-0">
      {/* Summary row */}
      <div
        className="px-5 py-3 flex items-start gap-3 hover:bg-[#111113] transition-colors cursor-pointer"
        onClick={() => setExpanded((o) => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-sm font-semibold tabular-nums ${scoreColor(item.leadScore)}`}>
              {item.leadScore}
            </span>
            <span className="text-xs text-[#a1a1aa]">{item.senderName ?? 'Unknown sender'}</span>
            {item.result?.context?.companyName && (
              <span className="text-xs text-[#71717a]">· {item.result.context.companyName}</span>
            )}
            <Badge text={item.temperature} className={tempColor(item.temperature)} />
            <Badge
              text={statusLabel(item.localStatus)}
              className={`${statusColor(item.localStatus)} text-[10px]`}
            />
            {fuLabel && (
              <span className={`text-[10px] font-mono ${fuLabel.color}`}>{fuLabel.text}</span>
            )}
            <span className="text-[10px] font-mono text-[#3f3f46] ml-auto">
              {fmtDateTime(item.createdAt)}
            </span>
          </div>
          <p className="text-[11px] text-[#71717a] mb-0.5">
            {slug(item.enquiryType)} · {slug(item.recommendedOffer)}
          </p>
          <p className="text-[11px] text-[#3f3f46] truncate">{item.enquirySummary}</p>
        </div>
        <span className="text-[#3f3f46] text-[10px] shrink-0 pt-1">{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-5 pb-4 bg-[#0d0d0f] border-t border-[#1c1c1e]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {/* Left: read-only info */}
            <div className="space-y-3">
              {item.result?.context?.enquirySummary && (
                <div>
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Enquiry summary</p>
                  <p className="text-xs text-[#71717a]">{item.result.context.enquirySummary}</p>
                </div>
              )}
              {item.result?.context?.operationalPainPoint && (
                <div>
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Pain point</p>
                  <p className="text-xs text-[#71717a]">{item.result.context.operationalPainPoint}</p>
                </div>
              )}
              {item.result?.internalNotes?.recommendedNextAction && (
                <div>
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Next action</p>
                  <p className="text-xs text-[#a1a1aa]">
                    {item.result.internalNotes.recommendedNextAction}
                  </p>
                </div>
              )}
            </div>

            {/* Right: editable workflow state */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Status</label>
                <select
                  value={item.localStatus}
                  onChange={(e) =>
                    onUpdate(item.id, { localStatus: e.target.value as LocalStatus })
                  }
                  className="w-full rounded-lg border border-[#27272a] bg-[#111113] px-2.5 py-1.5 text-xs text-[#f5f5f5] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
                >
                  {LOCAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">
                  Follow-up date
                </label>
                <input
                  type="date"
                  value={item.localFollowUpDate ?? ''}
                  onChange={(e) =>
                    onUpdate(item.id, { localFollowUpDate: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-[#27272a] bg-[#111113] px-2.5 py-1.5 text-xs text-[#f5f5f5] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">
                  Admin notes{' '}
                  {noteSaving && (
                    <span className="text-[#4ade80] font-normal">saved</span>
                  )}
                </label>
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  onBlur={handleNoteBlur}
                  rows={3}
                  placeholder="Internal notes — not shown to the client"
                  className="w-full rounded-lg border border-[#27272a] bg-[#111113] px-2.5 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors resize-y"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 mt-1 border-t border-[#1c1c1e]">
            <button
              type="button"
              onClick={() => onReload(item)}
              className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1"
            >
              Reload into form
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
