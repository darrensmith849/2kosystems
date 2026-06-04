'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { OPS_NAV_GROUPS, isItemActive } from './opsNavData';

// Compact top bar shown below the lg breakpoint. The full grouped nav
// lives inside an expand/collapse panel beneath the bar — no off-canvas
// drawer, just a slide-down list that closes when any link is tapped.

export default function OpsMobileBar({ operatorSlug }: { operatorSlug: string }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSwitchOperator() {
    await fetch('/api/admin/ops/operator', { method: 'DELETE' });
    router.refresh();
  }

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <div className="lg:hidden sticky top-0 z-30 border-b border-[#1c1c1e] bg-[#0a0a0b]/95 backdrop-blur-sm">
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-[#a1a1aa] hover:text-[#f5f5f5] border border-[#27272a] rounded px-2 py-1 text-xs"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? '×' : '☰'}
          </button>
          <span className="text-xs text-[#a1a1aa] truncate">
            2KO Systems · Ops Dashboard
          </span>
        </div>
        <button
          type="button"
          onClick={handleSwitchOperator}
          className="text-xs text-emerald-300 hover:text-emerald-200 border border-emerald-400/30 rounded-md px-2.5 py-1 shrink-0"
          title="Switch operator"
        >
          {operatorSlug}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#1c1c1e] max-h-[70vh] overflow-y-auto px-3 py-3 space-y-4">
          {OPS_NAV_GROUPS.map((group, idx) => {
            const isConsoleSwitcher = idx === 0;
            return (
              <div
                key={group.title}
                className={
                  isConsoleSwitcher
                    ? 'pb-3 border-b border-[#1c1c1e]'
                    : undefined
                }
              >
                <p className="px-1 mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isItemActive(pathname, item);
                    const isExternalConsole =
                      isConsoleSwitcher && !item.href.startsWith('/admin/ops');
                    return (
                      <li key={`${group.title}:${item.href}`}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded border-l-2 transition-colors ${
                            active
                              ? 'bg-neutral-800 text-emerald-300 border-emerald-400 font-medium'
                              : 'text-[#a1a1aa] hover:text-[#f5f5f5] hover:bg-neutral-800 border-transparent'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isExternalConsole && (
                            <span
                              aria-hidden="true"
                              className="text-[10px] text-[#52525b]"
                            >
                              →
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div className="pt-3 border-t border-[#1c1c1e]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-xs text-[#a1a1aa] hover:text-[#f5f5f5] border border-[#27272a] rounded-md px-2.5 py-1"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
