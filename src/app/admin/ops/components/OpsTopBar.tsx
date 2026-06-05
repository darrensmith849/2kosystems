'use client';

import Link from 'next/link';
import { Search as SearchIcon } from '@/components/admin-ui/icons';

// Slim 56px top bar mounted by /admin/ops/layout.tsx inside the authenticated
// branch. Visual-only: no real search input (the ⌘K pill is a Link to the
// existing /admin/ops/search page), no operator switching (sidebar footer
// already owns that). Hidden under lg — the OpsMobileBar provides the top
// affordance below that breakpoint.
//
// Z-index sits at z-40: above page content but BELOW the floating chat
// drawer (z-50) so opening Ask 2KO drapes over the top bar cleanly.

export default function OpsTopBar({ operatorSlug }: { operatorSlug: string }) {
  const initials = computeInitials(operatorSlug);
  return (
    <header className="hidden lg:flex sticky top-0 z-40 h-14 items-center gap-4 border-b border-white/[0.06] bg-[#0a0a0b]/85 backdrop-blur-md px-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-semibold text-zinc-100 hover:text-white"
      >
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
        />
        2KO Systems
      </Link>

      <div className="flex-1 flex justify-center">
        <Link
          href="/admin/ops/search"
          className="flex items-center gap-2 w-72 rounded-lg border border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.06] px-3 py-1.5 text-xs text-zinc-400 transition-colors"
          aria-label="Open search"
        >
          <SearchIcon className="h-3.5 w-3.5 text-zinc-500" />
          <span className="flex-1 truncate">Quick search</span>
          <kbd className="text-[11px] text-zinc-500 border border-white/[0.06] rounded px-1.5 py-0.5 leading-none">
            ⌘K
          </kbd>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/ops/ask"
          className="inline-flex items-center gap-2 text-xs text-zinc-300 hover:text-white rounded-md px-2.5 py-1.5 hover:bg-white/[0.04] transition-colors"
        >
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
          Ask 2KO
        </Link>
        <span
          className="grid place-items-center size-7 rounded-full bg-white/[0.06] border border-white/[0.06] text-xs text-zinc-300"
          title={operatorSlug}
          aria-label={`Operator ${operatorSlug}`}
        >
          {initials}
        </span>
      </div>
    </header>
  );
}

function computeInitials(slug: string): string {
  if (!slug) return '·';
  // Slug formats observed: "first-last", "first.last", "first_last", or a
  // bare handle. Split on common separators and take the first letter of
  // up to two segments. Fall back to the first two letters of the slug.
  const parts = slug
    .split(/[.\-_@\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return slug.slice(0, 2).toUpperCase();
}
