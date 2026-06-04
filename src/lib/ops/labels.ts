// Friendly, business-readable labels for the raw enum values used across the
// Ops dashboard. The DB stores snake_case enums; user-facing surfaces should
// always render the humanised label here.
//
// Owned by Track A (sidebar + wording sweep). Tracks C and D consume these
// maps read-only via import to keep credential and status vocabulary
// consistent across Activation, Health, and the data tables.
//
// To add a new label: extend the map; if an unknown value is passed, the
// `labelFor` helper falls back to a title-case version of the raw value so
// the UI never shows an empty cell.

export const CLIENT_STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  lead: 'Lead',
  paused: 'Paused',
  archived: 'Archived',
  former: 'Former',
};

export const ASSET_TYPE_LABEL: Record<string, string> = {
  website: 'Website',
  saas_app: 'SaaS app',
  portal: 'Portal',
  api: 'API',
  landing: 'Landing page',
  internal_tool: 'Internal tool',
  database: 'Database',
  service: 'Service',
};

export const REPO_CATEGORY_LABEL: Record<string, string> = {
  '2ko_africa': '2KO Africa',
  '2ko_systems': '2KO Systems',
  'six_sigma': 'Six Sigma',
  'sigmaphi_portal': 'SigmaPhi portal',
  'sigmaphi_stats': 'SigmaPhi stats',
  'shared_internal': 'Shared internal',
  'external_client': 'External client',
  'personal_excluded': 'Personal (excluded)',
  'legacy_stale': 'Legacy (stale)',
  'unknown_unmapped': 'Unsorted',
};

export const TICKET_KIND_LABEL: Record<string, string> = {
  support: 'Support',
  bug: 'Bug',
  change_request: 'Change request',
  content_update: 'Content update',
  emergency: 'Emergency',
  billing: 'Billing',
};

export const TICKET_STATUS_LABEL: Record<string, string> = {
  new: 'New',
  triage: 'Triage',
  in_progress: 'In progress',
  waiting_client: 'Waiting on client',
  blocked: 'Blocked',
  review: 'Review',
  completed: 'Completed',
  archived: 'Archived',
};

export const TICKET_PRIORITY_LABEL: Record<string, string> = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const VERCEL_STATE_LABEL: Record<string, string> = {
  live: 'Live',
  migrated_to_hetzner: 'Moved off Vercel',
  dormant: 'Dormant',
  deleted: 'Deleted',
  unknown: 'Unknown',
};

export const SYNC_STATE_LABEL: Record<string, string> = {
  seen: 'In sync',
  vanished: 'Missing upstream',
};

// Friendly labels for the "blocked by" / credential vocabulary. Used by Map's
// filter, by Activation's preflight credential card, and by Health's
// Provider syncs card.
export const BLOCKED_BY_LABEL: Record<string, string> = {
  db: 'Database',
  ssh: 'Server access',
  github_token: 'GitHub access',
  vercel_token: 'Vercel access',
  cloudflare_token: 'Cloudflare access',
  hetzner_token: 'Hetzner access',
  human: 'A human decision',
};

// Friendly labels for the credential vocabulary used on Activation and Health
// — these are about *which* access we need, not which environment variable.
export const CREDENTIAL_LABEL: Record<string, string> = {
  github: 'GitHub access',
  vercel: 'Vercel access',
  cloudflare: 'Cloudflare access',
  hetzner: 'Hetzner access',
  database: 'Production database',
};

function titleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((p) => (p.length === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join(' ');
}

export function labelFor(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '—';
  return map[value] ?? titleCase(value);
}
