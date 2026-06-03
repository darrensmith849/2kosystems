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
          <div className="flex items-center gap-1.5">
            <SectionPill href="/admin/agent" label="Agent Ops" active={false} onNavigate={() => setOpen(false)} />
            <SectionPill href="/admin/ops" label="Ops" active={true} onNavigate={() => setOpen(false)} />
          </div>

          {OPS_NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-1 mb-1 text-[10px] uppercase tracking-wider text-[#52525b]">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center px-3 py-1.5 text-sm border-l-2 transition-colors ${
                          active
                            ? 'text-emerald-300 bg-emerald-400/5 border-emerald-400 font-medium'
                            : 'text-[#a1a1aa] hover:text-[#f5f5f5] border-transparent'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

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

function SectionPill({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
        active
          ? 'bg-[#0f7b3a]/20 text-emerald-300 border border-emerald-400/30 font-medium'
          : 'text-[#a1a1aa] hover:text-[#f5f5f5] border border-transparent'
      }`}
    >
      {label}
    </Link>
  );
}
