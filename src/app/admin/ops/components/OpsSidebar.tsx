'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { OPS_NAV_GROUPS, isItemActive } from './opsNavData';

// Desktop left rail for the Ops dashboard. Hidden under lg — OpsMobileBar
// takes over below that breakpoint. Sticky to the viewport so the page
// scrolls underneath while the nav stays parked. Owns the cross-console
// switcher (Ops Dashboard <-> Agent Ops) on /admin/ops via the leading
// "Admin consoles" group in OPS_NAV_GROUPS, so AdminSectionNav returns
// null on this route.

export default function OpsSidebar({ operatorSlug }: { operatorSlug: string }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.refresh();
  }

  async function handleSwitchOperator() {
    await fetch('/api/admin/ops/operator', { method: 'DELETE' });
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex lg:flex-col w-56 shrink-0 border-r border-[#1c1c1e] bg-[#0a0a0b]/95 backdrop-blur-sm sticky top-0 h-screen overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="px-4 pt-5 pb-4 border-b border-[#1c1c1e]">
          <p className="text-[10px] uppercase tracking-wider text-[#52525b]">
            2KO Systems
          </p>
          <p className="mt-1 text-base font-medium text-[#f5f5f5]">Ops Dashboard</p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
          {OPS_NAV_GROUPS.map((group, idx) => {
            const isConsoleSwitcher = idx === 0;
            return (
              <div
                key={group.title}
                className={
                  isConsoleSwitcher
                    ? 'pb-4 border-b border-[#1c1c1e]'
                    : undefined
                }
              >
                <p className="px-3 mb-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isItemActive(pathname, item);
                    // The Admin consoles group sends users out of this
                    // console; mark the external destination with a small
                    // glyph so it reads as a switcher, not a page link.
                    const isExternalConsole =
                      isConsoleSwitcher && !item.href.startsWith('/admin/ops');
                    return (
                      <li key={`${group.title}:${item.href}`}>
                        <Link
                          href={item.href}
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
        </nav>

        <div className="px-4 py-4 border-t border-[#1c1c1e] space-y-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-[#52525b]">
              acting as
            </span>
            <button
              type="button"
              onClick={handleSwitchOperator}
              className="text-xs text-emerald-300 hover:text-emerald-200 border border-emerald-400/30 rounded-md px-2.5 py-1 text-left truncate"
              title="Switch operator"
            >
              {operatorSlug}
            </button>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-xs text-[#a1a1aa] hover:text-[#f5f5f5] border border-[#27272a] rounded-md px-2.5 py-1"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

