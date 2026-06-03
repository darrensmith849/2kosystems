import 'server-only';

import { buildIndex, type IndexItem } from './ops-knowledge-index';
import { computeRenewalWindow, type RenewalWindow } from './renewals-window';
import { isDbConfigured } from '@/lib/db/client';

// Server-only summary builder for /admin/ops/reports. Every counter is
// derived from buildIndex() so the same code path serves snapshot data now
// and live DB rows once DATABASE_URL is wired. NO direct DB queries here.

export type ReportsSummary = {
  generatedAt: string;
  dataSource: 'snapshot' | 'db_partial' | 'db_live';
  totals: {
    divisions: number;
    clients: number;
    assets: number;
    repos: number;
    vercelProjects: { total: number; byTeam: Record<string, number>; byState: Record<string, number> };
    hetznerServers: number;
    cloudflareZones: number;
    domains: number;
    openTickets: number;
    openIncidents: number;
  };
  reposByCategory: Record<string, number>;
  renewalsByWindow: Record<string, number>;
  incidentsBySeverity: Record<string, number>;
  incidentsByStatus: Record<string, number>;
  decisionsByRisk: Record<string, number>;
  decisionsByCluster: Record<string, number>;
  activationReadiness: { ready: number; pending: number; total: number };
  importReadiness: { ready: number; needs_review: number; blocked: number; total: number };
  blockedByBreakdown: Record<string, number>;
};

// Status sets duplicated from page conventions — kept tight to avoid pulling
// in service modules. Adjust here if vocabularies expand.
const OPEN_TICKET_STATUSES = new Set(['triage', 'open', 'in_progress', 'blocked', 'waiting']);
const OPEN_INCIDENT_STATUSES = new Set(['open', 'investigating', 'identified', 'monitoring']);

const RENEWAL_WINDOWS: RenewalWindow[] = [
  'overdue',
  'due',
  'within_7',
  'within_14',
  'within_30',
  'within_60',
  'future',
];

const BLOCKED_BY_KEYS = [
  'db',
  'ssh',
  'github_token',
  'vercel_token',
  'cloudflare_token',
  'hetzner_token',
  'human_decision',
] as const;

const PROVIDER_DB_BLOCKERS = new Set<string>([
  'db',
  'ssh',
  'github_token',
  'vercel_token',
  'cloudflare_token',
  'hetzner_token',
]);

function emptyBucket<K extends string>(keys: readonly K[]): Record<K, number> {
  return keys.reduce<Record<string, number>>((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {}) as Record<K, number>;
}

function pickRelated(items: IndexItem[], type: IndexItem['type']): IndexItem[] {
  return items.filter((it) => it.type === type);
}

function tally<T extends string>(items: IndexItem[], getKey: (it: IndexItem) => T | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) {
    const key = getKey(it);
    if (!key) continue;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

export async function buildReportsSummary(): Promise<ReportsSummary> {
  const items = await buildIndex();

  const dbConfigured = isDbConfigured();
  const dbItems = items.filter((i) => i.source === 'db');
  // dataSource hierarchy: live DB if any DB rows surfaced, partial if
  // configured but empty, snapshot otherwise. buildIndex already prefers DB.
  const dataSource: ReportsSummary['dataSource'] = dbItems.length > 0
    ? 'db_live'
    : dbConfigured
      ? 'db_partial'
      : 'snapshot';

  // ----- Totals -------------------------------------------------------------

  const divisions = pickRelated(items, 'division');
  const clients = pickRelated(items, 'client');
  const assets = pickRelated(items, 'asset');
  const repos = pickRelated(items, 'github_repo');
  const vercel = pickRelated(items, 'vercel_project');
  const hetzner = pickRelated(items, 'hetzner_server');
  const cloudflareZones = pickRelated(items, 'cloudflare_zone');
  const domains = pickRelated(items, 'domain');
  const tickets = pickRelated(items, 'ticket');
  const incidents = pickRelated(items, 'incident');
  const renewals = pickRelated(items, 'renewal');
  const decisions = pickRelated(items, 'review_decision');
  const activation = pickRelated(items, 'activation_step');
  const importReadinessItems = pickRelated(items, 'import_readiness');

  const vercelByTeam: Record<string, number> = {};
  const vercelByState: Record<string, number> = {};
  for (const v of vercel) {
    // subtitle is the team slug per the indexer.
    const team = v.subtitle ?? 'unknown_team';
    vercelByTeam[team] = (vercelByTeam[team] ?? 0) + 1;
    const state = v.status ?? 'unknown';
    vercelByState[state] = (vercelByState[state] ?? 0) + 1;
  }

  const openTickets = tickets.filter((t) => t.status && OPEN_TICKET_STATUSES.has(t.status)).length;
  const openIncidents = incidents.filter((i) => i.status && OPEN_INCIDENT_STATUSES.has(i.status)).length;

  // ----- Repos by category --------------------------------------------------

  // Category is held as subtitle in the indexer.
  const reposByCategory = tally(repos, (it) => it.subtitle);

  // ----- Renewals by window -------------------------------------------------

  const renewalsByWindow: Record<string, number> = emptyBucket(RENEWAL_WINDOWS);
  for (const r of renewals) {
    // body line "due YYYY-MM-DD" is parseable but brittle — instead read
    // the original snapshot date by looking at the body for the iso slice.
    const isoMatch = r.body.match(/due (\d{4}-\d{2}-\d{2})/);
    if (!isoMatch) continue;
    const win = computeRenewalWindow(isoMatch[1]);
    renewalsByWindow[win] = (renewalsByWindow[win] ?? 0) + 1;
  }

  // ----- Incidents ----------------------------------------------------------

  const incidentsBySeverity = tally(incidents, (it) => {
    // severity is a tag; tags = ['incident', severity, status, ...]
    return it.tags[1];
  });
  const incidentsByStatus = tally(incidents, (it) => it.status);

  // ----- Decisions ----------------------------------------------------------

  const decisionsByRisk = tally(decisions, (it) => {
    // tags = ['review_decision', cluster, risk, ...blockedBy]
    return it.tags[2];
  });
  const decisionsByCluster = tally(decisions, (it) => it.subtitle);

  // ----- Activation readiness ----------------------------------------------

  const activationReady = activation.filter((a) => a.status === 'ready').length;
  const activationPending = activation.filter((a) => a.status === 'pending').length;

  // ----- Import readiness ---------------------------------------------------

  const importReady = importReadinessItems.filter((r) => r.status === 'ready').length;
  const importNeedsReview = importReadinessItems.filter((r) => r.status === 'needs_review').length;
  const importBlocked = importReadinessItems.filter((r) => r.status === 'blocked').length;

  // ----- Blocked-by breakdown ----------------------------------------------

  const blockedByBreakdown: Record<string, number> = emptyBucket(BLOCKED_BY_KEYS);
  for (const it of items) {
    if (!it.blockedBy || it.blockedBy.length === 0) continue;
    const blockers = it.blockedBy.filter((b) => b && b !== 'none');
    if (blockers.length === 0) continue;
    let creditedProviderOrDb = false;
    for (const b of blockers) {
      if (PROVIDER_DB_BLOCKERS.has(b)) {
        blockedByBreakdown[b] = (blockedByBreakdown[b] ?? 0) + 1;
        creditedProviderOrDb = true;
      }
    }
    // human_decision: only review_decision items whose blockers do not name a
    // provider/db slot (operator-only).
    if (it.type === 'review_decision' && !creditedProviderOrDb) {
      blockedByBreakdown.human_decision = (blockedByBreakdown.human_decision ?? 0) + 1;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    dataSource,
    totals: {
      divisions: divisions.length,
      clients: clients.length,
      assets: assets.length,
      repos: repos.length,
      vercelProjects: {
        total: vercel.length,
        byTeam: vercelByTeam,
        byState: vercelByState,
      },
      hetznerServers: hetzner.length,
      cloudflareZones: cloudflareZones.length,
      domains: domains.length,
      openTickets,
      openIncidents,
    },
    reposByCategory,
    renewalsByWindow,
    incidentsBySeverity,
    incidentsByStatus,
    decisionsByRisk,
    decisionsByCluster,
    activationReadiness: {
      ready: activationReady,
      pending: activationPending,
      total: activation.length,
    },
    importReadiness: {
      ready: importReady,
      needs_review: importNeedsReview,
      blocked: importBlocked,
      total: importReadinessItems.length,
    },
    blockedByBreakdown,
  };
}
