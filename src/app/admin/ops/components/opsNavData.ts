// Single source of truth for the Ops dashboard sidebar/mobile-panel structure.
// Pure data — no React imports — so both OpsSidebar (desktop) and
// OpsMobileBar (compact) render exactly the same groups + items.

export type OpsNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export type OpsNavGroup = {
  title: string;
  items: OpsNavItem[];
};

export const OPS_NAV_GROUPS: OpsNavGroup[] = [
  {
    title: 'Admin consoles',
    items: [
      // Ops Dashboard is active across all /admin/ops* routes (console-level
      // indicator). It intentionally uses prefix matching — not exact — so
      // it stays highlighted on every sub-route. The Overview item below in
      // the Operations group is what indicates the actual current page.
      { href: '/admin/ops', label: 'Ops Dashboard' },
      // Agent Ops navigates out of the ops console. While inside /admin/ops
      // this item is never active (pathname does not start with /admin/agent),
      // and OpsSidebar is unmounted on /admin/agent, so the active state for
      // this link is handled correctly by isItemActive without special-casing.
      { href: '/admin/agent', label: 'Agent Ops' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/ops', label: 'Overview', exact: true },
      { href: '/admin/ops/search', label: 'Search' },
      { href: '/admin/ops/ask', label: 'Ask' },
      { href: '/admin/ops/emails', label: 'Emails' },
      { href: '/admin/ops/clients', label: 'Clients' },
      { href: '/admin/ops/contacts', label: 'Contacts' },
      { href: '/admin/ops/assets', label: 'Assets' },
      { href: '/admin/ops/map', label: 'Map' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { href: '/admin/ops/github', label: 'GitHub' },
      { href: '/admin/ops/vercel', label: 'Vercel' },
      { href: '/admin/ops/infrastructure', label: 'Infrastructure' },
    ],
  },
  {
    title: 'Workflows',
    items: [
      { href: '/admin/ops/tickets', label: 'Tickets' },
      { href: '/admin/ops/renewals', label: 'Renewals' },
      { href: '/admin/ops/incidents', label: 'Incidents' },
    ],
  },
  {
    title: 'Control',
    items: [
      { href: '/admin/ops/reports', label: 'Reports' },
      { href: '/admin/ops/services', label: 'Services' },
      { href: '/admin/ops/audits', label: 'Audits' },
      { href: '/admin/ops/review', label: 'Review' },
      { href: '/admin/ops/activation', label: 'Activation' },
      { href: '/admin/ops/health', label: 'Health' },
      { href: '/admin/ops/runbooks', label: 'Runbooks' },
      { href: '/admin/ops/sync-log', label: 'Sync Log' },
      { href: '/admin/ops/settings', label: 'Settings' },
    ],
  },
];

export function isItemActive(pathname: string, item: OpsNavItem): boolean {
  if (item.exact) return pathname === item.href;
  // Match either the route itself or any deeper sub-route, but require a
  // trailing slash for the deeper case so /admin/ops doesn't claim to be
  // active for /admin/ops/clients (it would, with a bare startsWith).
  // Without this guard, the Admin consoles "Ops Dashboard" item would
  // correctly stay active on every /admin/ops sub-route (intended), but
  // the rule below also keeps the deeper items themselves correctly
  // scoped (e.g. /admin/ops/clients vs /admin/ops/clients/123).
  return pathname === item.href || pathname.startsWith(item.href + '/');
}
