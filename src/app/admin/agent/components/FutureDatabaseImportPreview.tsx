'use client';

import { useState } from 'react';
import type { LocalAgentJob } from '../utils/types';
import { buildImportPreview } from '../utils/localToAgentJobMapper';
import { downloadFile } from '../utils/exportUtils';

export function FutureDatabaseImportPreview({
  items,
}: {
  items: LocalAgentJob[];
}) {
  const [expanded, setExpanded] = useState(false);

  const preview = buildImportPreview(items);
  const withWarnings = preview.filter((p) => p.warnings.length > 0);
  const clean = preview.filter((p) => p.warnings.length === 0);

  function handleDownload() {
    downloadFile(
      JSON.stringify({ generatedAt: new Date().toISOString(), items: preview }, null, 2),
      `future-agent-jobs-import-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json',
    );
  }

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#0d0d0f] transition-colors"
      >
        <div className="text-left">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
            Future DB Import Preview
          </p>
          <p className="text-[11px] text-[#3f3f46] mt-0.5">
            See how your local history will map to the database schema when Phase 2 launches.
          </p>
        </div>
        <span className="text-[#3f3f46] text-[10px] shrink-0 ml-4">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-[#1c1c1e] px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-xs text-[#3f3f46]">No history items to preview.</p>
          ) : (
            <>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="text-[#4ade80]">{clean.length} clean</span>
                {withWarnings.length > 0 && (
                  <span className="text-amber-400">{withWarnings.length} with warnings</span>
                )}
                <span className="text-[#3f3f46]">{items.length} total</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {preview.map((item) => (
                  <div
                    key={item.localId}
                    className={`rounded-xl border px-3 py-2.5 text-[11px] space-y-1 ${
                      item.warnings.length > 0
                        ? 'border-amber-400/20 bg-amber-400/5'
                        : 'border-[#1c1c1e] bg-[#0d0d0f]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#a1a1aa] font-medium truncate">
                        {item.senderName ?? '(no name)'} — score {item.leadScore}
                      </span>
                      <span className="text-[#3f3f46] shrink-0 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[#3f3f46]">{item.enquiryType.replace(/_/g, ' ')}</span>
                    {item.warnings.map((w, i) => (
                      <p key={i} className="text-amber-400/80">⚠ {w}</p>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1.5 transition-colors"
                >
                  ↓ Download import payload
                </button>
                <p className="text-[10px] text-[#3f3f46]">
                  This payload is for planning only — no DB connection exists yet.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
