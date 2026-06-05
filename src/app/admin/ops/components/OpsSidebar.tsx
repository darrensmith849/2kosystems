'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { OPS_NAV_GROUPS, isItemActive } from './opsNavData';
import { OPS_NAV_ICONS } from '@/components/admin-ui/icons';

// Desktop left rail for the Ops dashboard. Hidden under lg — OpsMobileBar
// takes over below that breakpoint. Sticky to the viewport so the page
// scrolls underneath while the nav stays parked. Owns the cross-console
// switcher (Ops Dashboard <-> Agent Ops) on /admin/ops via the leading
// "Admin consoles" group in OPS_NAV_GROUPS, so AdminSectionNav returns
// null on this route.
//
// Layout rules (do not regress):
//   1. The outer <aside> uses h-screen + sticky top-0 and is a flex column.
//      NO overflow on the aside — only the inner <nav> scrolls so the
//      footer (Signed in as / Sign out) stays visible at the bottom.
//   2. In-console groups (Operations / Infrastructure / Workflows / Control)
//      are collapsible. Default-open. Collapsed state persists to
//      localStorage under 'ops.sidebar.groups.collapsed'. The group
//      containing the active route is force-opened regardless of saved
//      state so a user is never looking at a closed group that hides
//      "where am I" in the tree.
//   3. SSR renders with all groups open (no localStorage on the server).
//      We hydrate the persisted collapsed set in useEffect to avoid
//      hydration mismatch.

const COLLAPSED_STORAGE_KEY = 'ops.sidebar.groups.collapsed';

function readCollapsedFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((v): v is string => typeof v === 'string'));
    }
    return new Set();
  } catch {
    return new Set();
  }
}

export default function OpsSidebar({ operatorSlug }: { operatorSlug: string }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  // Hydrate collapsed state from localStorage on mount only — SSR renders
  // everything open so the markup is stable.
  useEffect(() => {
    setCollapsed(readCollapsedFromStorage());
  }, []);

  function toggleGroup(title: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      try {
        window.localStorage.setItem(
          COLLAPSED_STORAGE_KEY,
          JSON.stringify([...next]),
        );
      } catch {
        // localStorage may throw (private mode, quota); persistence is best-effort.
      }
      return next;
    });
  }

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.refresh();
  }

  async function handleSwitchOperator() {
    await fetch('/api/admin/ops/operator', { method: 'DELETE' });
    router.refresh();
  }

  // True when the user has navigated past the console-level Overview into a
  // specific leaf. Used to dim the cross-console "Ops Dashboard" row so we
  // only paint one emerald rail at a time.
  const isOnOpsSubroute = pathname !== '/admin/ops' && pathname.startsWith('/admin/ops');

  return (
    <aside className="hidden lg:flex lg:flex-col w-56 shrink-0 border-r border-white/[0.06] bg-[#0a0a0b]/95 backdrop-blur-sm sticky top-0 h-screen">
      <div className="flex flex-col h-full min-h-0">
        <div className="px-4 pt-5 pb-4 border-b border-white/[0.06]">
          <p className="text-[11px] font-medium text-zinc-500">
            2KO Systems
          </p>
          <p className="mt-1 text-base font-medium text-zinc-100">Ops Dashboard</p>
        </div>

        <nav className="flex-1 min-h-0 px-2 py-4 pb-3 space-y-5 overflow-y-auto">
          {OPS_NAV_GROUPS.map((group, idx) => {
            const isConsoleSwitcher = idx === 0;
            const groupHasActive = group.items.some((item) =>
              isItemActive(pathname, item),
            );
            // Console switcher is never collapsible — it is the cross-console
            // gateway and must stay visible. In-console groups (idx > 0) are
            // collapsible. If the group contains the active route, force open
            // regardless of saved collapsed state.
            const isCollapsible = !isConsoleSwitcher;
            const userCollapsed = collapsed.has(group.title);
            const isOpen = !isCollapsible ? true : groupHasActive ? true : !userCollapsed;
            const headerId = `ops-sidebar-group-${idx}`;
            const panelId = `ops-sidebar-group-panel-${idx}`;
            return (
              <div
                key={group.title}
                className={
                  isConsoleSwitcher
                    ? 'pb-4 border-b border-white/[0.06]'
                    : undefined
                }
              >
                {isCollapsible ? (
                  <button
                    type="button"
                    id={headerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 mb-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <span>{group.title}</span>
                    <span
                      aria-hidden="true"
                      className={`text-[10px] leading-none transition-transform ${
                        isOpen ? 'rotate-90' : 'rotate-0'
                      }`}
                    >
                      ›
                    </span>
                  </button>
                ) : (
                  <p
                    id={headerId}
                    className="px-3 mb-1.5 text-[11px] font-medium text-zinc-500"
                  >
                    {group.title}
                  </p>
                )}
                {isOpen && (
                  <ul
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    className="space-y-0.5"
                  >
                    {group.items.map((item) => {
                      const rawActive = isItemActive(pathname, item);
                      // Dim the cross-console "Ops Dashboard" row when the
                      // user is on any /admin/ops/* subroute — that prevents
                      // the double-emerald-rail glitch where both the
                      // console-switcher row and the actual leaf light up.
                      const suppressActive = Boolean(
                        item.dimWhenSubrouteActive && isOnOpsSubroute,
                      );
                      const active = rawActive && !suppressActive;
                      // The Admin consoles group sends users out of this
                      // console; mark the external destination with a small
                      // glyph so it reads as a switcher, not a page link.
                      const isExternalConsole =
                        isConsoleSwitcher && !item.href.startsWith('/admin/ops');
                      const IconCmp = item.icon ? OPS_NAV_ICONS[item.icon] : undefined;
                      return (
                        <li key={`${group.title}:${item.href}`}>
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex items-center justify-between gap-2 px-2 py-1.5 text-[13px] rounded-md transition-colors ${
                              active
                                ? 'bg-white/[0.06] text-white font-medium'
                                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              {IconCmp && (
                                <IconCmp
                                  className={`h-4 w-4 shrink-0 ${
                                    active ? 'text-emerald-400' : 'text-zinc-500'
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
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 px-4 py-4 border-t border-white/[0.06] space-y-2 bg-[#0a0a0b]/95">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-zinc-500">
              Signed in as
            </span>
            <button
              type="button"
              onClick={handleSwitchOperator}
              className="text-xs text-zinc-100 hover:text-white border border-white/[0.08] hover:border-white/[0.12] rounded-md px-2.5 py-1 text-left bg-white/[0.02]"
              title={operatorSlug}
              aria-label="Switch user"
            >
              <span className="block text-[11px] text-zinc-400">Switch user</span>
              <span className="block truncate text-[11px] text-zinc-400">
                {operatorSlug}
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-xs text-zinc-400 hover:text-zinc-100 border border-white/[0.06] hover:border-white/[0.08] rounded-md px-2.5 py-1"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
