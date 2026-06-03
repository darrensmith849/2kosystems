'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { OPS_NAV_GROUPS, isItemActive } from './opsNavData';

// Desktop left rail for the Ops dashboard. Hidden under lg — OpsMobileBar
// takes over below that breakpoint. Sticky to the viewport so the page
// scrolls underneath while the nav stays parked. Owns the cross-console
// switcher (Agent Ops <-> Ops Dashboard) on /admin/ops, so AdminSectionNav
// returns null on this route.

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

        <div className="px-4 py-3 border-b border-[#1c1c1e] flex items-center gap-1.5">
          <SectionPill href="/admin/agent" label="Agent Ops" active={false} />
          <SectionPill href="/admin/ops" label="Ops" active={true} />
        </div>

        <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
          {OPS_NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-1.5 text-[10px] uppercase tracking-wider text-[#52525b]">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-1.5 text-sm border-l-2 transition-colors ${
                          active
                            ? 'text-emerald-300 bg-emerald-400/5 border-emerald-400 font-medium'
                            : 'text-[#a1a1aa] hover:text-[#f5f5f5] border-transparent hover:border-[#27272a]'
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

function SectionPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
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
