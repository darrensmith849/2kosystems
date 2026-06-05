'use client';

import { useState } from 'react';

const ABOUT_OPEN_KEY = '2ko_agent_about_open';

function readOpen(): boolean {
  try {
    const v = localStorage.getItem(ABOUT_OPEN_KEY);
    return v === null ? false : v === 'true';
  } catch {
    return false;
  }
}

export function AboutPanel() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return readOpen();
  });

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(ABOUT_OPEN_KEY, String(next));
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#1c1c1e] bg-[#0d0d0f] overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white dark:bg-[#111113] transition-colors"
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3f3f46]">
          About this console
        </p>
        <span className="text-[10px] text-[#3f3f46]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-zinc-200 dark:border-[#1c1c1e] space-y-3 pt-4">
          <p className="text-xs text-zinc-700 dark:text-[#71717a]">
            This is a private admin tool for 2KO Systems staff. It runs an AI analysis on incoming
            enquiries and produces a suggested reply, lead classification, and internal notes.
          </p>
          <p className="text-xs text-zinc-700 dark:text-[#71717a]">
            <strong className="text-zinc-700 dark:text-[#a1a1aa]">What it does:</strong> Routes the enquiry, scores
            the lead, extracts context, drafts a reply, and flags follow-up actions. All output is
            for internal review only.
          </p>
          <p className="text-xs text-zinc-700 dark:text-[#71717a]">
            <strong className="text-zinc-700 dark:text-[#a1a1aa]">What it does not do:</strong> Send emails, send
            WhatsApps, write to a database, create calendar events, or take any production action.
            Every run is a draft for human review.
          </p>
          <p className="text-xs text-zinc-700 dark:text-[#71717a]">
            <strong className="text-zinc-700 dark:text-[#a1a1aa]">Local history:</strong> Analyses are stored in
            browser localStorage only — they are not sent to any backend and are cleared when
            browser storage is cleared. Maximum 10 items are kept.
          </p>
          <p className="text-xs text-[#3f3f46]">
            Access to this console is restricted. Do not share the URL or your session with anyone
            outside the team.
          </p>
        </div>
      )}
    </div>
  );
}
