import 'server-only';

// Pure, synchronous validation of the static snapshot fixture.
//
// This module has zero side effects: no DB calls, no network calls, no
// provider mutations, no file IO. Every check reads from the in-memory
// SNAPSHOT_* arrays exported by ops-snapshot-data + email-services-data and
// returns a structured ValidationReport that any server component can render.
//
// The intent is to catch obvious data-shape problems BEFORE the live import
// runs (orphan FKs, missing billing owners, placeholder rows, duplicate
// names) and give the operator a clear surface for "what would block import
// today and what is only informational".

import {
  SNAPSHOT_CLIENTS,
  SNAPSHOT_ASSETS,
  SNAPSHOT_REPOS,
  SNAPSHOT_VERCEL_PROJECTS,
  SNAPSHOT_DOMAINS,
  SNAPSHOT_TICKETS,
  SNAPSHOT_RENEWALS,
  SNAPSHOT_INCIDENTS,
  SNAPSHOT_DECISIONS,
} from './ops-snapshot-data';
import {
  SNAPSHOT_EMAIL_REFS,
  SNAPSHOT_SERVICES,
} from './email-services-data';

// ----------------------------------------------------------- Types

export type Severity = 'info' | 'warn' | 'error';

export type ValidationCategory =
  | 'duplicate_client_names'
  | 'assets_without_client'
  | 'clients_without_assets'
  | 'repos_without_owner'
  | 'vercel_projects_without_team'
  | 'domains_without_linked_asset'
  | 'services_without_billing_owner'
  | 'renewals_without_confirmed_date'
  | 'email_refs_placeholders'
  | 'incidents_without_asset'
  | 'tickets_missing_fields'
  | 'unresolved_decisions';

export type Finding = {
  id: string;
  category: ValidationCategory;
  severity: Severity;
  title: string;
  detail?: string;
  entityRef?: string;
};

export type ValidationReport = {
  generatedAt: string;
  total: number;
  bySeverity: Record<Severity, number>;
  byCategory: Record<ValidationCategory, Finding[]>;
};

// ----------------------------------------------------------- Category labels

export const VALIDATION_CATEGORY_LABEL: Record<ValidationCategory, string> = {
  duplicate_client_names: 'Duplicate client names',
  assets_without_client: 'Assets without a client',
  clients_without_assets: 'Clients with no assets',
  repos_without_owner: 'Repos without an owner',
  vercel_projects_without_team: 'Vercel projects without a team',
  domains_without_linked_asset: 'Domains without a linked asset',
  services_without_billing_owner: 'Services without a billing owner',
  renewals_without_confirmed_date: 'Renewals without a confirmed date',
  email_refs_placeholders: 'Email references that are placeholders',
  incidents_without_asset: 'Incidents without an affected asset',
  tickets_missing_fields: 'Tickets missing owner / priority / status',
  unresolved_decisions: 'Review decisions not yet resolved',
};

// ----------------------------------------------------------- Helpers

function emptyByCategory(): Record<ValidationCategory, Finding[]> {
  return {
    duplicate_client_names: [],
    assets_without_client: [],
    clients_without_assets: [],
    repos_without_owner: [],
    vercel_projects_without_team: [],
    domains_without_linked_asset: [],
    services_without_billing_owner: [],
    renewals_without_confirmed_date: [],
    email_refs_placeholders: [],
    incidents_without_asset: [],
    tickets_missing_fields: [],
    unresolved_decisions: [],
  };
}

function isNeedsReviewText(value: string | null | undefined): boolean {
  if (!value) return true;
  return /needs review|unknown|tbd|placeholder/i.test(value);
}

// Normalises a hostname for domain ↔ asset cross-checks. Strips scheme,
// leading "www.", trailing slash, and lowercases.
function hostnameOf(value: string | null | undefined): string {
  if (!value) return '';
  let v = value.trim().toLowerCase();
  v = v.replace(/^https?:\/\//, '');
  v = v.replace(/^www\./, '');
  v = v.replace(/\/.*$/, '');
  return v;
}

// ----------------------------------------------------------- Individual checks

function checkDuplicateClientNames(): Finding[] {
  const findings: Finding[] = [];
  const byLower = new Map<string, string[]>();
  for (const c of SNAPSHOT_CLIENTS) {
    const key = c.name.toLowerCase().trim();
    const list = byLower.get(key) ?? [];
    list.push(c.id);
    byLower.set(key, list);
  }
  for (const [key, ids] of byLower) {
    if (ids.length > 1) {
      findings.push({
        id: `dup-client-${key}`,
        category: 'duplicate_client_names',
        severity: 'error',
        title: `Client name "${key}" appears ${ids.length} times`,
        detail: `Duplicate client ids: ${ids.join(', ')}. Pick one canonical row before import.`,
        entityRef: ids[0],
      });
    }
  }
  return findings;
}

function checkAssetsWithoutClient(): Finding[] {
  return SNAPSHOT_ASSETS.filter((a) => !a.clientId).map((a) => ({
    id: `asset-no-client-${a.id}`,
    category: 'assets_without_client' as const,
    severity: 'warn' as const,
    title: `Asset "${a.name}" has no client`,
    detail: 'Assign a client before import so the live row links to the right organisation.',
    entityRef: a.id,
  }));
}

function checkClientsWithoutAssets(): Finding[] {
  const assetClientIds = new Set(
    SNAPSHOT_ASSETS.map((a) => a.clientId).filter((id): id is string => Boolean(id))
  );
  return SNAPSHOT_CLIENTS.filter((c) => !assetClientIds.has(c.id)).map((c) => ({
    id: `client-no-assets-${c.id}`,
    category: 'clients_without_assets' as const,
    severity: 'info' as const,
    title: `Client "${c.name}" has no linked assets`,
    detail: 'May be intentional (umbrella / lead). Confirm before import.',
    entityRef: c.id,
  }));
}

function checkReposWithoutOwner(): Finding[] {
  // Snapshot GithubRepo rows carry an `owner` field. Flag any row missing
  // it, or anything that looks like a placeholder ("unknown").
  return SNAPSHOT_REPOS.filter((r) => !r.owner || /unknown/i.test(r.owner)).map((r) => ({
    id: `repo-no-owner-${r.id}`,
    category: 'repos_without_owner' as const,
    severity: 'warn' as const,
    title: `Repo "${r.name}" has no owner`,
    detail: 'Snapshot repos should carry the GitHub owner login before import.',
    entityRef: r.id,
  }));
}

function checkVercelWithoutTeam(): Finding[] {
  return SNAPSHOT_VERCEL_PROJECTS.filter(
    (v) => !v.teamSlug || /unknown/i.test(v.teamSlug)
  ).map((v) => ({
    id: `vercel-no-team-${v.id}`,
    category: 'vercel_projects_without_team' as const,
    severity: 'warn' as const,
    title: `Vercel project "${v.name}" has no team`,
    detail: 'Team slug should be one of pumpbots-projects or impart-global.',
    entityRef: v.id,
  }));
}

function checkDomainsWithoutLinkedAsset(): Finding[] {
  const assetHosts = new Set<string>();
  for (const a of SNAPSHOT_ASSETS) {
    const h = hostnameOf(a.liveUrl);
    if (h) assetHosts.add(h);
  }
  return SNAPSHOT_DOMAINS.filter((d) => {
    const h = hostnameOf(d.name);
    if (!h) return false;
    // Match either the domain itself or a parent of any asset host.
    for (const ah of assetHosts) {
      if (ah === h || ah.endsWith(`.${h}`)) return false;
    }
    return true;
  }).map((d) => ({
    id: `domain-orphan-${d.id}`,
    category: 'domains_without_linked_asset' as const,
    severity: 'info' as const,
    title: `Domain "${d.name}" is not linked to any asset`,
    detail: 'No snapshot asset has a liveUrl matching this domain. May be a parking / personal domain.',
    entityRef: d.id,
  }));
}

function checkServicesWithoutBillingOwner(): Finding[] {
  return SNAPSHOT_SERVICES.filter((s) => isNeedsReviewText(s.billingOwner)).map((s) => ({
    id: `service-no-owner-${s.id}`,
    category: 'services_without_billing_owner' as const,
    severity: 'warn' as const,
    title: `Service "${s.name}" has no billing owner`,
    detail: `Billing owner is "${s.billingOwner}". Assign a real owner before import.`,
    entityRef: s.id,
  }));
}

function checkRenewalsWithoutConfirmedDate(): Finding[] {
  // Snapshot renewals all carry a nextDueAt today, but the discovery work
  // marked several as "confirm at registrar" — flag anything where the
  // notes contain "confirm" since that maps to needs_review confidence.
  return SNAPSHOT_RENEWALS.filter((r) => {
    if (!r.nextDueAt) return true;
    if (r.notes && /confirm/i.test(r.notes)) return true;
    return false;
  }).map((r) => ({
    id: `renewal-unconfirmed-${r.id}`,
    category: 'renewals_without_confirmed_date' as const,
    severity: 'warn' as const,
    title: `Renewal "${r.name}" — date not confirmed`,
    detail: r.notes ?? 'No nextDueAt on this renewal.',
    entityRef: r.id,
  }));
}

function checkEmailRefsPlaceholders(): Finding[] {
  // Every snapshot email_ref today is a placeholder. Surface them as info
  // rather than warn — they are intentionally placeholders until the real
  // inbox-linkage phase lands.
  return SNAPSHOT_EMAIL_REFS.map((e) => ({
    id: `email-placeholder-${e.id}`,
    category: 'email_refs_placeholders' as const,
    severity: 'info' as const,
    title: `Email reference "${e.subject}" is a placeholder`,
    detail: 'Will be skipped on import — the linkage phase replaces these with real Gmail/Outlook URLs.',
    entityRef: e.id,
  }));
}

function checkIncidentsWithoutAsset(): Finding[] {
  return SNAPSHOT_INCIDENTS.filter((i) => !i.assetId).map((i) => ({
    id: `incident-no-asset-${i.id}`,
    category: 'incidents_without_asset' as const,
    severity: 'warn' as const,
    title: `Incident "${i.summary}" has no affected asset`,
    detail: 'Incidents without an asset id are harder to triage and to surface on the asset page.',
    entityRef: i.id,
  }));
}

function checkTicketsMissingFields(): Finding[] {
  const findings: Finding[] = [];
  for (const t of SNAPSHOT_TICKETS) {
    const missing: string[] = [];
    if (!t.assigneeOperatorId) missing.push('owner');
    if (!t.priority || /unknown/i.test(t.priority)) missing.push('priority');
    if (!t.status || /unknown/i.test(t.status)) missing.push('status');
    if (missing.length > 0) {
      findings.push({
        id: `ticket-missing-${t.id}`,
        category: 'tickets_missing_fields',
        severity: missing.includes('priority') || missing.includes('status') ? 'warn' : 'info',
        title: `Ticket "${t.title}" missing: ${missing.join(', ')}`,
        detail: 'Fill before import or accept the default mapping.',
        entityRef: t.id,
      });
    }
  }
  return findings;
}

function checkUnresolvedDecisions(): Finding[] {
  // A decision is "unresolved" while it remains in the snapshot fixture
  // — every snapshot decision currently surfaces as needs_review until an
  // operator records a choice in the live DB. Surface as info-level so it
  // does not drown the report.
  return SNAPSHOT_DECISIONS.map((d) => ({
    id: `decision-open-${d.id}`,
    category: 'unresolved_decisions' as const,
    severity: 'info' as const,
    title: d.title,
    detail: `Cluster: ${d.cluster} · risk: ${d.risk}. ${d.recommendation}`,
    entityRef: d.id,
  }));
}

// ----------------------------------------------------------- Public entry

export function validateSnapshot(): ValidationReport {
  const byCategory = emptyByCategory();

  byCategory.duplicate_client_names = checkDuplicateClientNames();
  byCategory.assets_without_client = checkAssetsWithoutClient();
  byCategory.clients_without_assets = checkClientsWithoutAssets();
  byCategory.repos_without_owner = checkReposWithoutOwner();
  byCategory.vercel_projects_without_team = checkVercelWithoutTeam();
  byCategory.domains_without_linked_asset = checkDomainsWithoutLinkedAsset();
  byCategory.services_without_billing_owner = checkServicesWithoutBillingOwner();
  byCategory.renewals_without_confirmed_date = checkRenewalsWithoutConfirmedDate();
  byCategory.email_refs_placeholders = checkEmailRefsPlaceholders();
  byCategory.incidents_without_asset = checkIncidentsWithoutAsset();
  byCategory.tickets_missing_fields = checkTicketsMissingFields();
  byCategory.unresolved_decisions = checkUnresolvedDecisions();

  const all: Finding[] = (Object.values(byCategory) as Finding[][]).flat();
  const bySeverity: Record<Severity, number> = { info: 0, warn: 0, error: 0 };
  for (const f of all) {
    bySeverity[f.severity]++;
  }

  return {
    generatedAt: new Date().toISOString(),
    total: all.length,
    bySeverity,
    byCategory,
  };
}

// ----------------------------------------------------------- Convenience selectors

export function listFindingsBySeverity(
  report: ValidationReport,
  severity: Severity
): Finding[] {
  return (Object.values(report.byCategory) as Finding[][])
    .flat()
    .filter((f) => f.severity === severity);
}

export function countFindingsBySeverity(report: ValidationReport): Record<Severity, number> {
  return report.bySeverity;
}
