'use client';

// Bottom-right floating launcher + slide-in drawer. Mounted once at the ops
// layout level. Hidden on /admin/ops/ask (the full-page Ask client owns that
// surface).

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatPanel } from './ChatPanel';
import type { PageContext } from './chatTypes';

const STORAGE_KEY = '2ko_ops_floating_chat_v1';
const ASK_ROUTE = '/admin/ops/ask';

// Lightweight route-to-section mapping. Kept local to avoid coupling the
// widget to the sidebar nav data module (different owner).
const SECTION_TITLES: Array<{ match: RegExp; title: string }> = [
  { match: /^\/admin\/ops\/ask(\b|$)/, title: 'Ask' },
  { match: /^\/admin\/ops\/search(\b|$)/, title: 'Search' },
  { match: /^\/admin\/ops\/clients(\b|$)/, title: 'Clients' },
  { match: /^\/admin\/ops\/assets(\b|$)/, title: 'Assets' },
  { match: /^\/admin\/ops\/map(\b|$)/, title: 'Map' },
  { match: /^\/admin\/ops\/github(\b|$)/, title: 'GitHub' },
  { match: /^\/admin\/ops\/vercel(\b|$)/, title: 'Vercel' },
  { match: /^\/admin\/ops\/infrastructure(\b|$)/, title: 'Infrastructure' },
  { match: /^\/admin\/ops\/tickets(\b|$)/, title: 'Tickets' },
  { match: /^\/admin\/ops\/renewals(\b|$)/, title: 'Renewals' },
  { match: /^\/admin\/ops\/incidents(\b|$)/, title: 'Incidents' },
  { match: /^\/admin\/ops\/reports(\b|$)/, title: 'Reports' },
  { match: /^\/admin\/ops\/audits(\b|$)/, title: 'Audits' },
  { match: /^\/admin\/ops\/review(\b|$)/, title: 'Review' },
  { match: /^\/admin\/ops\/activation(\b|$)/, title: 'Activation' },
  { match: /^\/admin\/ops\/health(\b|$)/, title: 'Health' },
  { match: /^\/admin\/ops\/runbooks(\b|$)/, title: 'Runbooks' },
  { match: /^\/admin\/ops\/sync-log(\b|$)/, title: 'Sync Log' },
  { match: /^\/admin\/ops\/settings(\b|$)/, title: 'Settings' },
  { match: /^\/admin\/ops(\b|$)/, title: 'Overview' },
];

function resolveSectionTitle(pathname: string): string {
  for (const entry of SECTION_TITLES) {
    if (entry.match.test(pathname)) return entry.title;
  }
  return 'Ops Dashboard';
}

export function FloatingChat() {
  const pathname = usePathname() ?? '/admin/ops';
  const [open, setOpen] = useState<boolean>(false);

  // The page-level Ask client owns that surface — do not double-mount the
  // floating widget there.
  const hideOnRoute = pathname === ASK_ROUTE || pathname.startsWith(`${ASK_ROUTE}/`);

  const pageContext = useMemo<PageContext>(() => {
    return { route: pathname, sectionTitle: resolveSectionTitle(pathname) };
  }, [pathname]);

  // Lock body scroll while the drawer is open (mobile-friendly).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close drawer on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (hideOnRoute) return null;

  return (
    <>
      {/* Launcher button — bottom-right, always visible */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open 2KO Ops Assistant"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.14] px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 shadow-lg shadow-black/30 transition-colors"
          style={{
            fontFamily:
              'var(--font-roboto), Roboto, system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
          <span>Ask 2KO</span>
        </button>
      )}

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-2 top-2 bottom-2 z-50 w-[420px] max-w-[92vw] transform transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-[110%] pointer-events-none'
        }`}
        role="dialog"
        aria-label="2KO Ops Assistant"
        aria-modal={open}
        style={{
          fontFamily:
            'var(--font-roboto), Roboto, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div className="h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0b]/95 backdrop-blur-xl shadow-2xl shadow-black/60">
          <ChatPanel
            storageKey={STORAGE_KEY}
            pageContext={pageContext}
            onClose={() => setOpen(false)}
          />
        </div>
      </div>
    </>
  );
}
