'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  { href: '/admin/ops', label: 'Overview', exact: true },
  { href: '/admin/ops/clients', label: 'Clients' },
  { href: '/admin/ops/assets', label: 'Assets' },
  { href: '/admin/ops/github', label: 'GitHub' },
  { href: '/admin/ops/vercel', label: 'Vercel' },
  { href: '/admin/ops/infrastructure', label: 'Infrastructure' },
  { href: '/admin/ops/audits', label: 'Audits' },
  { href: '/admin/ops/sync-log', label: 'Sync Log' },
  { href: '/admin/ops/settings', label: 'Settings' },
];

export default function OpsTopNav({ operatorSlug }: { operatorSlug: string }) {
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
    <div className="border-b border-[#1c1c1e] bg-[#0a0a0b]/95 backdrop-blur-sm">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.15em] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#1c1c1e] text-[#f5f5f5] border border-[#27272a]'
                    : 'text-[#71717a] hover:text-[#f5f5f5]'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-mono text-[#71717a]">acting as</span>
          <button
            type="button"
            onClick={handleSwitchOperator}
            className="text-[11px] font-mono text-emerald-300 hover:text-emerald-200 border border-emerald-400/30 rounded-full px-3 py-1"
            title="Switch operator"
          >
            {operatorSlug}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[11px] font-mono text-[#71717a] hover:text-[#f5f5f5] border border-[#27272a] rounded-full px-3 py-1"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
