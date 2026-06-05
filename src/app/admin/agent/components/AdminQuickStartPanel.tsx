'use client';

import { useState } from 'react';

const QUICK_START_KEY = '2ko_agent_quickstart_open';

function readOpen(): boolean {
  try {
    const v = localStorage.getItem(QUICK_START_KEY);
    return v === null ? true : v === 'true'; // default open
  } catch {
    return true;
  }
}

const STEPS = [
  {
    n: 1,
    title: 'Set required env vars in Vercel',
    body: 'Add AGENT_ADMIN_UI_PASSWORD, AGENT_ADMIN_API_KEY, and AGENT_MOCK_MODE to your Vercel project environment variables. These are required before logging in.',
  },
  {
    n: 2,
    title: 'Log in at /admin/agent',
    body: 'Navigate to /admin/agent and enter your AGENT_ADMIN_UI_PASSWORD. Your session lasts 8 hours.',
  },
  {
    n: 3,
    title: 'Use mock mode first',
    body: 'Set AGENT_MOCK_MODE=true in Vercel and redeploy. Go to the Diagnostics tab and click "Load diagnostics" to confirm mock mode is active. This lets you test the full UI without any LLM costs.',
  },
  {
    n: 4,
    title: 'Run Quality Lab tests',
    body: 'Use the Quality Lab tab to run built-in test cases through the agent and check that output matches expected values. All runs are localStorage only.',
  },
  {
    n: 5,
    title: 'For live LLM: add your Anthropic API key',
    body: 'Add ANTHROPIC_API_KEY to Vercel, set AGENT_MOCK_MODE=false, and redeploy. Then use the Diagnostics tab to run the live readiness test to confirm everything is working before using in production.',
  },
  {
    n: 6,
    title: 'Use Batch Inbox for pasted enquiries',
    body: 'The Batch Inbox tab lets you queue multiple enquiries and run them through the agent one at a time. Useful for processing a backlog of contact form submissions.',
  },
  {
    n: 7,
    title: 'Use the local workflow board for temporary tracking',
    body: 'The Workflow tab shows your analysis history. You can update statuses, add follow-up dates, and add internal notes. This data is stored in browser localStorage only.',
  },
  {
    n: 8,
    title: 'Export JSON backups regularly',
    body: 'Go to the Export tab and download a JSON backup of your history. Local data is browser-only — it will be lost if you clear browser storage or switch devices.',
  },
  {
    n: 9,
    title: 'Railway/database required for permanent storage',
    body: 'The current console uses browser localStorage only. For multi-user support, persistent history, and server-side storage, a Railway PostgreSQL database must be provisioned. See docs/agent-ops-phase-2-database-plan.md.',
  },
];

export function AdminQuickStartPanel() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return readOpen();
  });

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(QUICK_START_KEY, String(next));
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
          Quick start guide
        </p>
        <span className="text-[10px] text-[#3f3f46]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-zinc-200 dark:border-[#1c1c1e] pt-4 space-y-4">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-3">
              <span className="text-[10px] font-mono text-[#3f3f46] border border-zinc-200 dark:border-[#27272a] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                {step.n}
              </span>
              <div>
                <p className="text-xs font-medium text-zinc-700 dark:text-[#a1a1aa] mb-0.5">{step.title}</p>
                <p className="text-xs text-zinc-700 dark:text-[#71717a]">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
