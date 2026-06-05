'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search as SearchIcon } from '@/components/admin-ui/icons';
import { ThemeToggle } from '@/components/admin-ui/theme';

// Tiny route → sentence-case label map for the page-context hint shown
// between the wordmark and the search input. Order doesn't matter; the
// resolver picks the longest matching prefix so deeper routes win.
const PAGE_LABELS: Record<string, string> = {
  '/admin/ops': 'Command Centre',
  '/admin/ops/search': 'Search',
  '/admin/ops/ask': 'Ask 2KO',
  '/admin/ops/clients': 'Clients',
  '/admin/ops/contacts': 'Contacts',
  '/admin/ops/assets': 'Assets',
  '/admin/ops/emails': 'Emails',
  '/admin/ops/services': 'Services',
  '/admin/ops/map': 'Map',
  '/admin/ops/github': 'GitHub',
  '/admin/ops/vercel': 'Vercel',
  '/admin/ops/infrastructure': 'Infrastructure',
  '/admin/ops/tickets': 'Tickets',
  '/admin/ops/renewals': 'Renewals',
  '/admin/ops/incidents': 'Incidents',
  '/admin/ops/reports': 'Reports',
  '/admin/ops/audits': 'Audits',
  '/admin/ops/review': 'Review',
  '/admin/ops/activation': 'Activation',
  '/admin/ops/health': 'Health',
  '/admin/ops/runbooks': 'Runbooks',
  '/admin/ops/sync-log': 'Sync log',
  '/admin/ops/settings': 'Settings',
};

function resolvePageLabel(pathname: string | null): string | null {
  if (!pathname) return null;
  // Longest-prefix match so /admin/ops/clients/123 still resolves to "Clients".
  let bestKey: string | null = null;
  for (const key of Object.keys(PAGE_LABELS)) {
    if (pathname === key || pathname.startsWith(key + '/')) {
      if (!bestKey || key.length > bestKey.length) bestKey = key;
    }
  }
  return bestKey ? PAGE_LABELS[bestKey] : null;
}

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
  const pathname = usePathname();
  const pageLabel = resolvePageLabel(pathname);
  return (
    <header className="hidden lg:flex sticky top-0 z-40 h-14 items-center gap-4 border-b border-zinc-200 bg-white/85 dark:border-white/[0.06] dark:bg-[#0a0a0b]/85 backdrop-blur-md px-6 transition-colors">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-black dark:text-zinc-100 dark:hover:text-white transition-colors"
      >
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
        />
        2KO Systems
      </Link>

      {pageLabel && (
        <span className="hidden md:inline text-xs text-zinc-500 dark:text-zinc-500" aria-label="Current page">
          {pageLabel}
        </span>
      )}

      <div className="flex-1 flex justify-center">
        <Link
          href="/admin/ops/search"
          className="flex items-center gap-2 w-72 rounded-lg border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:border-white/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.06] px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 transition-colors"
          aria-label="Open search"
        >
          <SearchIcon className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-500" />
          <span className="flex-1 truncate">Quick search</span>
          <kbd className="text-[11px] text-zinc-700 dark:text-zinc-500 border border-zinc-300 dark:border-white/[0.06] rounded px-1.5 py-0.5 leading-none">
            ⌘K
          </kbd>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/admin/ops/ask"
          className="inline-flex items-center gap-2 text-xs text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.04] rounded-md px-2.5 py-1.5 transition-colors"
        >
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
          />
          Ask 2KO
        </Link>
        <ThemeToggle />
        <span
          className="grid place-items-center size-7 rounded-full bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 dark:bg-white/[0.06] dark:border-white/[0.06] dark:text-zinc-300"
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
