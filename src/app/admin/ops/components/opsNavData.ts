// Single source of truth for the Ops dashboard sidebar/mobile-panel structure.
// Pure data — no React imports — so both OpsSidebar (desktop) and
// OpsMobileBar (compact) render exactly the same groups + items.

export type OpsNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  // Optional key into the OPS_NAV_ICONS map exported by
  // src/components/admin-ui/icons.tsx. Made optional rather than required
  // so adding a new nav row never forces a corresponding icon choice up
  // front and so the type contract stays loose for any other consumer.
  // Sidebar/mobile renderers fall back gracefully when icon is undefined.
  icon?: string;
  // When true, this nav item is shown muted (no emerald border / text) on
  // subroutes that live in another group. Used by the cross-console
  // "Ops Dashboard" entry so we don't double-paint the active rail.
  dimWhenSubrouteActive?: boolean;
  // When true, this item is pinned to the mobile top-of-panel grid. Owning
  // the pinned set here keeps OpsMobileBar's pinned list and the data file
  // in sync.
  mobilePinned?: boolean;
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
      // the Operations group is what indicates the actual current page. The
      // dimWhenSubrouteActive flag tells the sidebar to render this row
      // muted on any /admin/ops/* subroute so we don't paint two emerald
      // rails (the console-level one + the actual leaf).
      { href: '/admin/ops', label: 'Ops Dashboard', icon: 'Dashboard', dimWhenSubrouteActive: true },
      // Agent Ops navigates out of the ops console. While inside /admin/ops
      // this item is never active (pathname does not start with /admin/agent),
      // and OpsSidebar is unmounted on /admin/agent, so the active state for
      // this link is handled correctly by isItemActive without special-casing.
      { href: '/admin/agent', label: 'Agent Ops', icon: 'Chat' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/ops', label: 'Overview', icon: 'Dashboard', exact: true, mobilePinned: true },
      { href: '/admin/ops/search', label: 'Search', icon: 'Search', mobilePinned: true },
      { href: '/admin/ops/ask', label: 'Ask', icon: 'Chat', mobilePinned: true },
      { href: '/admin/ops/emails', label: 'Emails', icon: 'Mail' },
      { href: '/admin/ops/clients', label: 'Clients', icon: 'Building' },
      { href: '/admin/ops/contacts', label: 'Contacts', icon: 'User' },
      { href: '/admin/ops/assets', label: 'Assets', icon: 'Boxes' },
      { href: '/admin/ops/map', label: 'Map', icon: 'NetworkMap' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { href: '/admin/ops/github', label: 'GitHub', icon: 'Code' },
      { href: '/admin/ops/vercel', label: 'Vercel', icon: 'Triangle' },
      { href: '/admin/ops/infrastructure', label: 'Infrastructure', icon: 'Server' },
    ],
  },
  {
    title: 'Workflows',
    items: [
      { href: '/admin/ops/tickets', label: 'Tickets', icon: 'Clipboard', mobilePinned: true },
      { href: '/admin/ops/renewals', label: 'Renewals', icon: 'Calendar' },
      { href: '/admin/ops/incidents', label: 'Incidents', icon: 'AlertTriangle' },
    ],
  },
  {
    title: 'Control',
    items: [
      // Bring-up items first so the most-clicked items stay above the fold
      // on short laptops.
      { href: '/admin/ops/activation', label: 'Activation', icon: 'Rocket', mobilePinned: true },
      { href: '/admin/ops/health', label: 'Health', icon: 'Activity', mobilePinned: true },
      { href: '/admin/ops/settings', label: 'Settings', icon: 'Cog' },
      { href: '/admin/ops/reports', label: 'Reports', icon: 'Chart' },
      { href: '/admin/ops/services', label: 'Services', icon: 'CreditCard' },
      { href: '/admin/ops/audits', label: 'Audits', icon: 'Shield' },
      { href: '/admin/ops/review', label: 'Review', icon: 'Eye' },
      { href: '/admin/ops/runbooks', label: 'Runbooks', icon: 'Book' },
      { href: '/admin/ops/sync-log', label: 'Sync Log', icon: 'Refresh' },
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

// Flat list of items pinned to the mobile bar's top grid. Centralised here
// so OpsMobileBar reads the data file instead of duplicating the list.
export function getMobilePinnedItems(): OpsNavItem[] {
  return OPS_NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.mobilePinned);
}
