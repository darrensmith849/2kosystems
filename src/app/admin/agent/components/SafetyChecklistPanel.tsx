'use client';

import { useState } from 'react';

const CHECKLIST_OPEN_KEY = '2ko_agent_checklist_open';

function readOpen(): boolean {
  try {
    const v = localStorage.getItem(CHECKLIST_OPEN_KEY);
    return v === null ? false : v === 'true';
  } catch {
    return false;
  }
}

export function SafetyChecklistPanel() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return readOpen();
  });

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(CHECKLIST_OPEN_KEY, String(next));
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-[#1c1c1e] bg-[#0d0d0f] overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#111113] transition-colors"
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3f3f46]">
          Safety protocol
        </p>
        <span className="text-[10px] text-[#3f3f46]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-[#1c1c1e] pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#3f3f46] mb-2">
                The agent always
              </p>
              <ul className="space-y-1.5">
                {[
                  'Marks every output as draft status',
                  'Sets humanReviewRequired: true',
                  'Sets autoSent: false',
                  'Sets productionActionTaken: false',
                  'Explains what it did and did not do',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-[#4ade80]">
                    <span className="shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#3f3f46] mb-2">
                The agent never
              </p>
              <ul className="space-y-1.5">
                {[
                  'Sends emails or WhatsApp messages',
                  'Writes to any database or CRM',
                  'Creates calendar events',
                  'Takes any action outside this console',
                  'Approves output for you — that is your job',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-[#3f3f46]">
                    <span className="shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-[10px] text-[#3f3f46] mt-4 pt-3 border-t border-[#1c1c1e]">
            If the safety panel shows a warning after analysis, do not use the output. Review the
            raw JSON and handle manually.
          </p>
        </div>
      )}
    </div>
  );
}
