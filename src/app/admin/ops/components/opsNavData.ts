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
    title: 'Operations',
    items: [
      { href: '/admin/ops', label: 'Overview', exact: true },
      { href: '/admin/ops/clients', label: 'Clients' },
      { href: '/admin/ops/assets', label: 'Assets' },
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
      { href: '/admin/ops/audits', label: 'Audits' },
      { href: '/admin/ops/review', label: 'Review' },
      { href: '/admin/ops/sync-log', label: 'Sync Log' },
      { href: '/admin/ops/settings', label: 'Settings' },
    ],
  },
];

export function isItemActive(pathname: string, item: OpsNavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
