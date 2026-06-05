'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  OPS_NAV_GROUPS,
  getMobilePinnedItems,
  isItemActive,
  type OpsNavItem,
} from './opsNavData';
import { OPS_NAV_ICONS } from '@/components/admin-ui/icons';

// Compact top bar shown below the lg breakpoint. The full grouped nav lives
// inside an expand/collapse panel beneath the bar — no off-canvas drawer,
// just a slide-down list. Layout:
//   1. Pinned section — high-frequency destinations in a 2-column grid so
//      the most common team-member jumps are one tap away. The pinned set
//      is owned by opsNavData via the mobilePinned flag (single source of
//      truth shared with the desktop sidebar).
//   2. "All sections" disclosure — the remaining grouped items behind a
//      single reveal, with items that already appear in the pinned grid
//      hidden so users don't see them twice.
//   3. Sticky footer inside the scroll region — Switch user + Sign out
//      stay reachable without scrolling the whole nav.
// The panel closes when any link is tapped, when the route changes (back /
// forward), and when the user presses Escape.

export default function OpsMobileBar({ operatorSlug }: { operatorSlug: string }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the panel on route change so going back/forward doesn't strand
  // the user in an obscuring overlay.
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Escape-to-close for the open panel.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function handleSwitchOperator() {
    await fetch('/api/admin/ops/operator', { method: 'DELETE' });
    router.refresh();
  }

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.refresh();
  }

  const pinned = useMemo<OpsNavItem[]>(() => getMobilePinnedItems(), []);
  const pinnedHrefs = useMemo<Set<string>>(
    () => new Set(pinned.map((i) => i.href)),
    [pinned],
  );

  // Show an "active" dot on the hamburger when the user is deeper than the
  // Overview route — a quick visual cue that they're inside the tree.
  const isOnSubpage = pathname !== '/admin/ops';

  return (
    <div className="lg:hidden sticky top-0 z-30 border-b border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0b]/95 backdrop-blur-sm transition-colors">
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.08] rounded px-2 py-1 text-xs"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? '×' : '☰'}
            {!open && isOnSubpage && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
              />
            )}
          </button>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
            <span className="hidden sm:inline">2KO Systems · </span>
            Ops Dashboard
          </span>
        </div>
        <button
          type="button"
          onClick={handleSwitchOperator}
          className="text-xs text-zinc-900 dark:text-zinc-100 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-white/[0.08] hover:border-zinc-400 dark:hover:border-white/[0.12] bg-zinc-50 dark:bg-white/[0.02] rounded-md px-2.5 py-1 shrink-0"
          title="Switch user"
          aria-label="Switch user"
        >
          {operatorSlug}
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-200 dark:border-white/[0.06] max-h-[78vh] flex flex-col bg-white dark:bg-[#0a0a0b]/95 transition-colors">
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4">
            {/* Admin consoles — always visible at top so cross-console jump is one tap. */}
            <div className="pb-3 border-b border-zinc-200 dark:border-white/[0.06]">
              <p className="px-1 mb-1 text-[11px] font-medium text-zinc-500">
                {OPS_NAV_GROUPS[0].title}
              </p>
              <ul className="space-y-0.5">
                {OPS_NAV_GROUPS[0].items.map((item) => {
                  const active = isItemActive(pathname, item);
                  const isExternalConsole = !item.href.startsWith('/admin/ops');
                  const IconCmp = item.icon ? OPS_NAV_ICONS[item.icon] : undefined;
                  return (
                    <li key={`console:${item.href}`}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                          active
                            ? 'bg-zinc-200/60 dark:bg-white/[0.06] text-zinc-900 dark:text-white font-medium'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {IconCmp && (
                            <IconCmp
                              className={`h-4 w-4 shrink-0 ${
                                active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
                              }`}
                            />
                          )}
                          <span className="truncate">{item.label}</span>
                        </span>
                        {isExternalConsole && (
                          <span
                            aria-hidden="true"
                            className="text-[10px] text-zinc-500"
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

            {/* Pinned grid — top destinations as a 2-column tap grid. */}
            <div>
              <p className="px-1 mb-1.5 text-[11px] font-medium text-zinc-500">
                Pinned
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {pinned.map((item) => {
                  const active = isItemActive(pathname, item);
                  const IconCmp = item.icon ? OPS_NAV_ICONS[item.icon] : undefined;
                  return (
                    <Link
                      key={`pin:${item.href}`}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`px-2 py-2 text-sm rounded-md border transition-colors flex items-center justify-center gap-2 ${
                        active
                          ? 'bg-zinc-200/60 dark:bg-white/[0.06] text-zinc-900 dark:text-white border-zinc-300 dark:border-white/[0.08] font-medium'
                          : 'text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {IconCmp && (
                        <IconCmp
                          className={`h-4 w-4 shrink-0 ${
                            active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* "All sections" disclosure — full grouped list, with items that
                already appear in the pinned grid filtered out so the user
                doesn't see them twice. */}
            <div>
              <button
                type="button"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
                className="w-full flex items-center justify-between px-1 mb-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <span>All sections</span>
                <span
                  aria-hidden="true"
                  className={`text-[10px] leading-none transition-transform ${
                    moreOpen ? 'rotate-90' : 'rotate-0'
                  }`}
                >
                  ›
                </span>
              </button>
              {moreOpen && (
                <div className="space-y-3">
                  {OPS_NAV_GROUPS.slice(1).map((group) => {
                    const itemsToShow = group.items.filter(
                      (i) => !pinnedHrefs.has(i.href),
                    );
                    if (itemsToShow.length === 0) return null;
                    return (
                      <div key={group.title}>
                        <p className="px-1 mb-1 text-[11px] font-medium text-zinc-500">
                          {group.title}
                        </p>
                        <ul className="space-y-0.5">
                          {itemsToShow.map((item) => {
                            const active = isItemActive(pathname, item);
                            const IconCmp = item.icon ? OPS_NAV_ICONS[item.icon] : undefined;
                            return (
                              <li key={`${group.title}:${item.href}`}>
                                <Link
                                  href={item.href}
                                  onClick={() => setOpen(false)}
                                  aria-current={active ? 'page' : undefined}
                                  className={`flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                                    active
                                      ? 'bg-zinc-200/60 dark:bg-white/[0.06] text-zinc-900 dark:text-white font-medium'
                                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                                  }`}
                                >
                                  <span className="flex items-center gap-2 min-w-0">
                                    {IconCmp && (
                                      <IconCmp
                                        className={`h-4 w-4 shrink-0 ${
                                          active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
                                        }`}
                                      />
                                    )}
                                    <span className="truncate">{item.label}</span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sticky footer inside the scroll region — sign-out + switch-user
              stay reachable without scrolling 17 nav rows. */}
          <div className="shrink-0 border-t border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0b]/95 px-3 py-3 space-y-2 transition-colors">
            <button
              type="button"
              onClick={handleSwitchOperator}
              className="w-full text-xs text-zinc-900 dark:text-zinc-100 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-white/[0.08] hover:border-zinc-400 dark:hover:border-white/[0.12] bg-zinc-50 dark:bg-white/[0.02] rounded-md px-2.5 py-1.5 text-left"
              aria-label="Switch user"
            >
              <span className="block text-[11px] text-zinc-600 dark:text-zinc-400">
                Switch user
              </span>
              <span className="block truncate text-[11px] text-zinc-600 dark:text-zinc-400">
                {operatorSlug}
              </span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.08] rounded-md px-2.5 py-1.5"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
