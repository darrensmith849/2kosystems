'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Slim section switcher between the two admin consoles. Shown only on
// /admin/agent — the /admin/ops sidebar now owns its own section switcher,
// so this component returns null there to avoid a duplicate top bar.
// Login screens (no /admin/* prefix match) also render nothing.

export default function AdminSectionNav() {
  const pathname = usePathname() ?? '';
  const onAgent = pathname.startsWith('/admin/agent');
  const onOps = pathname.startsWith('/admin/ops');
  if (!onAgent && !onOps) return null;
  if (onOps) return null;

  return (
    <div className="border-b border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b]/95 backdrop-blur-sm">
      <div className="px-6 py-2 flex items-center gap-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-700 dark:text-[#71717a]">
          Admin consoles
        </span>
        <span className="text-[#27272a]">|</span>
        <nav className="flex items-center gap-1">
          <SectionLink href="/admin/ops" active={onOps} label="Ops Dashboard" />
          <SectionLink href="/admin/agent" active={onAgent} label="Agent Ops" />
        </nav>
      </div>
    </div>
  );
}

function SectionLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-[0.15em] transition-colors ${
        active
          ? 'bg-[#0f7b3a]/20 text-emerald-300 border border-emerald-400/30'
          : 'text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-transparent'
      }`}
    >
      {label}
    </Link>
  );
}
