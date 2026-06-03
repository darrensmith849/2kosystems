import 'server-only';

import {
  SNAPSHOT_DIVISIONS,
  SNAPSHOT_CLIENTS,
  SNAPSHOT_ASSETS,
  SNAPSHOT_REPOS,
  SNAPSHOT_VERCEL_PROJECTS,
  SNAPSHOT_HETZNER_SERVERS,
  SNAPSHOT_CLOUDFLARE_ZONES,
  SNAPSHOT_DOMAINS,
  SNAPSHOT_TICKETS,
  SNAPSHOT_RENEWALS,
  SNAPSHOT_INCIDENTS,
  SNAPSHOT_FINDINGS,
  SNAPSHOT_DECISIONS,
  getSnapshotImportReadiness,
  getClientConfidence,
  getAssetConfidence,
} from './ops-snapshot-data';
import { getDb, isDbConfigured } from '@/lib/db/client';
import {
  clients as clientsTbl,
  assets as assetsTbl,
  tickets as ticketsTbl,
  renewals as renewalsTbl,
  incidents as incidentsTbl,
  githubRepos as githubReposTbl,
  vercelProjects as vercelProjectsTbl,
  hetznerServers as hetznerServersTbl,
  cloudflareZones as cloudflareZonesTbl,
  domains as domainsTbl,
  auditFindings as auditFindingsTbl,
} from '@/lib/db/schema';

// --------------------------------------------------------------- Public types

export type IndexItemType =
  | 'division'
  | 'client'
  | 'asset'
  | 'github_repo'
  | 'vercel_project'
  | 'hetzner_server'
  | 'cloudflare_zone'
  | 'domain'
  | 'ticket'
  | 'renewal'
  | 'incident'
  | 'audit_finding'
  | 'review_decision'
  | 'import_readiness'
  | 'activation_step'
  | 'runbook';

export type IndexItemSource = 'snapshot' | 'db' | 'docs' | 'readiness';

export type IndexConfidence = 'confirmed' | 'likely' | 'needs_review' | 'unknown';

export type IndexItem = {
  id: string;
  type: IndexItemType;
  title: string;
  subtitle?: string;
  body: string;
  tags: string[];
  source: IndexItemSource;
  url?: string;
  status?: string;
  confidence?: IndexConfidence;
  blockedBy?: string[];
  relations?: {
    clientId?: string;
    divisionCode?: string;
    assetId?: string;
  };
};

export type SearchFilters = {
  q?: string;
  types?: IndexItem['type'][];
  sources?: IndexItem['source'][];
  blockedBy?: string[];
  status?: string[];
  divisionCode?: string;
  clientId?: string;
};

// --------------------------------------------------------------- Activation steps
// Mirrors the five groups in src/components/admin-ui/ActivationReadiness.tsx
// so the assistant can answer questions like "what's left to activate the DB?"
// without dynamically reading React. blockedBy uses the same vocabulary as
// SnapshotDecision.blockedBy: 'env' for credentials, 'ssh' for ma130 work,
// 'human' for decisions, 'none' for already-done items.

type ActivationStep = {
  id: string;
  group: 'Ready' | 'Needs credential' | 'Needs human decision' | 'Waiting for Hetzner' | 'Optional later';
  label: string;
  done: boolean;
  blockedBy: string[];
  note?: string;
};

export const ACTIVATION_STEPS: ActivationStep[] = [
  // Ready
  { id: 'activation-snapshot-data', group: 'Ready', label: 'Snapshot data', done: true, blockedBy: [], note: '27 assets, 15 clients, 38 repos, 23 Vercel projects, etc.' },
  { id: 'activation-snapshot-export', group: 'Ready', label: 'Snapshot export (JSON + Markdown)', done: true, blockedBy: [] },
  { id: 'activation-snapshot-import', group: 'Ready', label: 'Snapshot import engine', done: true, blockedBy: [], note: '/api/admin/ops/import/snapshot/{preview,run}' },
  { id: 'activation-review-decisions', group: 'Ready', label: 'Review & decisions surface', done: true, blockedBy: [], note: '15 decisions in /admin/ops/review' },
  { id: 'activation-browser-review', group: 'Ready', label: 'Browser-local review workflow', done: true, blockedBy: [], note: 'localStorage-backed status + notes' },
  { id: 'activation-cron-scaffolds', group: 'Ready', label: 'Cron route scaffolds', done: true, blockedBy: [] },
  { id: 'activation-betterstack-webhook', group: 'Ready', label: 'BetterStack webhook', done: true, blockedBy: [], note: 'route reachable; verifies signature when BETTERSTACK_WEBHOOK_SECRET set' },
  { id: 'activation-renewal-reminders', group: 'Ready', label: 'Renewal reminders', done: true, blockedBy: [], note: '07:00 SAST digest scaffold' },

  // Needs credential
  { id: 'activation-database-url', group: 'Needs credential', label: 'DATABASE_URL', done: false, blockedBy: ['env', 'db'] },
  { id: 'activation-database-url-direct', group: 'Needs credential', label: 'DATABASE_URL_DIRECT', done: false, blockedBy: ['env', 'db'] },
  { id: 'activation-github-token', group: 'Needs credential', label: 'GITHUB_TOKEN', done: false, blockedBy: ['env', 'github_token'] },
  { id: 'activation-vercel-token', group: 'Needs credential', label: 'VERCEL_API_TOKEN', done: false, blockedBy: ['env', 'vercel_token'] },
  { id: 'activation-cloudflare-token', group: 'Needs credential', label: 'CLOUDFLARE_API_TOKEN', done: false, blockedBy: ['env', 'cloudflare_token'] },
  { id: 'activation-cloudflare-account', group: 'Needs credential', label: 'CLOUDFLARE_ACCOUNT_ID', done: false, blockedBy: ['env', 'cloudflare_token'] },
  { id: 'activation-hetzner-token', group: 'Needs credential', label: 'HETZNER_API_TOKEN', done: false, blockedBy: ['env', 'hetzner_token'] },
  { id: 'activation-cron-secret', group: 'Needs credential', label: 'CRON_SECRET', done: false, blockedBy: ['env'] },
  { id: 'activation-betterstack-secret', group: 'Needs credential', label: 'BETTERSTACK_WEBHOOK_SECRET', done: false, blockedBy: ['env'] },
  { id: 'activation-brevo-digest', group: 'Needs credential', label: 'BREVO_OPS_DIGEST_TO', done: false, blockedBy: ['env'] },

  // Needs human decision
  { id: 'activation-repo-canonical', group: 'Needs human decision', label: '5 repo canonical picks', done: false, blockedBy: ['human', 'github_token'] },
  { id: 'activation-unmapped-owners', group: 'Needs human decision', label: '4 unmapped Vercel / domain owners', done: false, blockedBy: ['human'] },
  { id: 'activation-systemd-rename', group: 'Needs human decision', label: '1 systemd rename (taxo -> autotax)', done: false, blockedBy: ['human', 'ssh'] },
  { id: 'activation-dormant-vercel', group: 'Needs human decision', label: 'Dormant Vercel cleanup confirmation', done: false, blockedBy: ['human', 'vercel_token'] },
  { id: 'activation-xneelo-zones', group: 'Needs human decision', label: 'xneelo stranded zones retire/revive', done: false, blockedBy: ['human'] },

  // Waiting for Hetzner
  { id: 'activation-ssh-key', group: 'Waiting for Hetzner', label: 'SSH key restored on operator Mac', done: false, blockedBy: ['ssh'] },
  { id: 'activation-ops-db', group: 'Waiting for Hetzner', label: 'ops Postgres database created on ma130-data', done: false, blockedBy: ['ssh', 'db'] },
  { id: 'activation-ops-app-role', group: 'Waiting for Hetzner', label: 'ops_app role with scoped grants', done: false, blockedBy: ['ssh', 'db'] },
  { id: 'activation-db-exposure', group: 'Waiting for Hetzner', label: 'DB exposure path chosen (PgBouncer / Cloudflare Tunnel / public + firewall)', done: false, blockedBy: ['ssh', 'db'] },
  { id: 'activation-drizzle-migrate', group: 'Waiting for Hetzner', label: 'drizzle-kit migrate applied 0000 + 0001 + 0002', done: false, blockedBy: ['db'] },
  { id: 'activation-import-dry-run', group: 'Waiting for Hetzner', label: 'Snapshot import dry-run executed', done: false, blockedBy: ['db'] },
  { id: 'activation-import-commit', group: 'Waiting for Hetzner', label: 'Snapshot import committed', done: false, blockedBy: ['db'] },
  { id: 'activation-real-sync', group: 'Waiting for Hetzner', label: 'Real sync runs executed for all 4 providers', done: false, blockedBy: ['github_token', 'vercel_token', 'cloudflare_token', 'hetzner_token'] },

  // Optional later
  { id: 'activation-auth-js', group: 'Optional later', label: 'Per-user auth (Auth.js)', done: false, blockedBy: ['human'] },
  { id: 'activation-client-portal', group: 'Optional later', label: 'Client portal', done: false, blockedBy: ['human'] },
  { id: 'activation-ai-summaries', group: 'Optional later', label: 'AI summaries', done: false, blockedBy: ['env'] },
  { id: 'activation-cost-reporting', group: 'Optional later', label: 'Cost reporting', done: false, blockedBy: ['human'] },
];

// --------------------------------------------------------------- Runbooks
// Hardcoded SAFE list — never reads disk, never enumerates docs/. New runbook
// files should be appended here explicitly.

type RunbookEntry = {
  id: string;
  title: string;
  path: string;
  blurb: string;
};

const RUNBOOKS: RunbookEntry[] = [
  {
    id: 'runbook-ops-db-setup',
    title: 'Ops DB setup',
    path: 'docs/runbooks/ops-db-setup.md',
    blurb: 'Create the ops Postgres database + ops_app role on ma130-data; apply the 0000/0001/0002 migrations; wire DATABASE_URL.',
  },
  {
    id: 'runbook-ops-local-dev',
    title: 'Ops local dev',
    path: 'docs/runbooks/ops-local-dev.md',
    blurb: 'Run the dashboard against a local Postgres-in-Docker — mirrors production, no Hetzner needed.',
  },
  {
    id: 'runbook-ops-hetzner-activation',
    title: 'Ops Hetzner activation',
    path: 'docs/runbooks/ops-hetzner-activation.md',
    blurb: 'End-to-end checklist for moving the dashboard from snapshot mode to live DB on ma130-data.',
  },
  {
    id: 'runbook-ops-renewal-reminders',
    title: 'Ops renewal reminders',
    path: 'docs/runbooks/ops-renewal-reminders.md',
    blurb: '07:00 SAST renewal digest cron, BetterStack webhook handler, BREVO_OPS_DIGEST_TO configuration.',
  },
  {
    id: 'runbook-vercel-to-hetzner',
    title: 'Vercel to Hetzner migration',
    path: 'docs/runbooks/vercel-to-hetzner.md',
    blurb: 'Per-asset playbook for moving a Vercel project to a Hetzner ma130-apps systemd unit + Cloudflare DNS cutover.',
  },
];

// --------------------------------------------------------------- Builders

function divisionItems(): IndexItem[] {
  return SNAPSHOT_DIVISIONS.map((d) => ({
    id: d.id,
    type: 'division',
    title: d.name,
    subtitle: d.code,
    body: `${d.name} (${d.code}) — ${d.description ?? ''}`.trim(),
    tags: ['division', d.code],
    source: 'snapshot',
    url: '/admin/ops',
    relations: { divisionCode: d.code },
  }));
}

function clientItems(): IndexItem[] {
  return SNAPSHOT_CLIENTS.map((c) => {
    const divisionCode = c.division?.code;
    const tags = ['client', ...(c.tags ?? [])];
    if (divisionCode) tags.push(divisionCode);
    return {
      id: c.id,
      type: 'client',
      title: c.name,
      subtitle: c.division?.name ?? undefined,
      body: [c.name, c.legalName ?? '', c.notes ?? '', (c.tags ?? []).join(' ')]
        .filter(Boolean)
        .join(' — '),
      tags,
      source: 'snapshot',
      url: `/admin/ops/clients/${c.id}`,
      status: c.status,
      confidence: getClientConfidence(c.id),
      relations: { clientId: c.id, divisionCode },
    };
  });
}

function assetItems(): IndexItem[] {
  return SNAPSHOT_ASSETS.map((a) => {
    const divisionCode = a.division?.code;
    const tags = ['asset', a.type, ...(a.techStack ?? [])];
    if (divisionCode) tags.push(divisionCode);
    return {
      id: a.id,
      type: 'asset',
      title: a.name,
      subtitle: a.client?.name ?? a.division?.name ?? undefined,
      body: [a.name, a.liveUrl ?? '', a.notes ?? '', (a.techStack ?? []).join(' ')]
        .filter(Boolean)
        .join(' — '),
      tags,
      source: 'snapshot',
      url: `/admin/ops/assets/${a.id}`,
      status: a.status,
      confidence: getAssetConfidence(a.id),
      relations: {
        assetId: a.id,
        clientId: a.clientId ?? undefined,
        divisionCode,
      },
    };
  });
}

function repoItems(): IndexItem[] {
  return SNAPSHOT_REPOS.map((r) => ({
    id: r.id,
    type: 'github_repo',
    title: r.name,
    subtitle: r.category,
    body: [r.owner + '/' + r.name, r.description ?? '', r.language ?? '', r.category]
      .filter(Boolean)
      .join(' — '),
    tags: ['github_repo', r.category, r.visibility, ...(r.isArchived ? ['archived'] : []), ...(r.language ? [r.language] : [])],
    source: 'snapshot',
    url: `/admin/ops/github#${r.id}`,
    status: r.isArchived ? 'archived' : 'active',
  }));
}

function vercelItems(): IndexItem[] {
  return SNAPSHOT_VERCEL_PROJECTS.map((v) => ({
    id: v.id,
    type: 'vercel_project',
    title: v.name,
    subtitle: v.teamSlug ?? undefined,
    body: [v.name, v.teamSlug ?? '', v.productionUrl ?? '', v.linkedRepo ?? '', v.notes ?? '', v.state]
      .filter(Boolean)
      .join(' — '),
    tags: ['vercel_project', v.state, ...(v.teamSlug ? [v.teamSlug] : [])],
    source: 'snapshot',
    url: `/admin/ops/vercel#${v.id}`,
    status: v.state,
  }));
}

function hetznerItems(): IndexItem[] {
  return SNAPSHOT_HETZNER_SERVERS.map((h) => {
    const serverType = h.serverType ?? 'unknown';
    const location = h.location ?? 'unknown';
    const tags: string[] = ['hetzner_server', location, serverType, ...Object.values(h.labels ?? {})];
    return {
      id: h.id,
      type: 'hetzner_server',
      title: h.name,
      subtitle: `${serverType} · ${location}`,
      body: [h.name, serverType, location, h.publicIpv4 ?? '', JSON.stringify(h.labels ?? {})]
        .filter(Boolean)
        .join(' — '),
      tags,
      source: 'snapshot',
      url: `/admin/ops/hetzner#${h.id}`,
      status: h.status ?? undefined,
    };
  });
}

function cloudflareZoneItems(): IndexItem[] {
  return SNAPSHOT_CLOUDFLARE_ZONES.map((z) => {
    const status = z.status ?? 'unknown';
    return {
      id: z.id,
      type: 'cloudflare_zone',
      title: z.name,
      subtitle: z.plan ?? undefined,
      body: [z.name, z.plan ?? '', status, z.state].filter(Boolean).join(' — '),
      tags: ['cloudflare_zone', status, z.state],
      source: 'snapshot',
      url: `/admin/ops/cloudflare#${z.id}`,
      status,
    };
  });
}

function domainItems(): IndexItem[] {
  return SNAPSHOT_DOMAINS.map((d) => ({
    id: d.id,
    type: 'domain',
    title: d.name,
    subtitle: d.registrar ?? undefined,
    body: [d.name, d.registrar ?? '', d.notes ?? ''].filter(Boolean).join(' — '),
    tags: ['domain', ...(d.registrar ? [d.registrar] : [])],
    source: 'snapshot',
    url: `/admin/ops/domains#${d.id}`,
  }));
}

function ticketItems(): IndexItem[] {
  return SNAPSHOT_TICKETS.map((t) => ({
    id: t.id,
    type: 'ticket',
    title: t.title,
    subtitle: t.client?.name ?? undefined,
    body: [t.title, t.description ?? '', t.kind, t.priority, t.status, (t.tags ?? []).join(' ')]
      .filter(Boolean)
      .join(' — '),
    tags: ['ticket', t.kind, t.priority, t.status, ...(t.tags ?? [])],
    source: 'snapshot',
    url: `/admin/ops/tickets/${t.id}`,
    status: t.status,
    relations: {
      clientId: t.clientId ?? undefined,
      assetId: t.assetId ?? undefined,
    },
  }));
}

function renewalItems(): IndexItem[] {
  return SNAPSHOT_RENEWALS.map((r) => ({
    id: r.id,
    type: 'renewal',
    title: r.name,
    subtitle: r.client?.name ?? r.kind,
    body: [
      r.name,
      r.kind,
      r.amount ? `${r.amount} ${r.currency ?? ''}`.trim() : '',
      r.notes ?? '',
      r.nextDueAt ? `due ${r.nextDueAt.toISOString().slice(0, 10)}` : '',
    ]
      .filter(Boolean)
      .join(' — '),
    tags: ['renewal', r.kind, r.period ?? 'annual'],
    source: 'snapshot',
    url: `/admin/ops/renewals/${r.id}`,
    status: r.reminderState ?? undefined,
    relations: { clientId: r.clientId ?? undefined },
  }));
}

function incidentItems(): IndexItem[] {
  return SNAPSHOT_INCIDENTS.map((i) => ({
    id: i.id,
    type: 'incident',
    title: i.summary,
    subtitle: i.client?.name ?? i.asset?.name ?? undefined,
    body: [i.summary, i.rootCause ?? '', i.severity, i.status, (i.tags ?? []).join(' ')]
      .filter(Boolean)
      .join(' — '),
    tags: ['incident', i.severity, i.status, ...(i.tags ?? [])],
    source: 'snapshot',
    url: `/admin/ops/incidents/${i.id}`,
    status: i.status,
    relations: {
      clientId: i.clientId ?? undefined,
      assetId: i.assetId ?? undefined,
    },
  }));
}

function findingItems(): IndexItem[] {
  return SNAPSHOT_FINDINGS.map((f) => ({
    id: f.id,
    type: 'audit_finding',
    title: f.title,
    subtitle: f.entityRef ?? f.kind,
    body: [f.title, f.detail, f.kind, f.severity, f.entityType ?? '', f.entityRef ?? '']
      .filter(Boolean)
      .join(' — '),
    tags: ['audit_finding', f.kind, f.severity, f.status],
    source: 'snapshot',
    url: '/admin/ops/audits',
    status: f.status,
  }));
}

function decisionItems(): IndexItem[] {
  return SNAPSHOT_DECISIONS.map((d) => {
    const options = d.options.map((o) => `${o.recommended ? '* ' : '- '}${o.label}`).join('\n');
    return {
      id: d.id,
      type: 'review_decision',
      title: d.title,
      subtitle: d.cluster,
      body: [d.title, d.context, 'Recommendation: ' + d.recommendation, 'Options:\n' + options, 'Action: ' + d.action, 'Risk: ' + d.risk]
        .filter(Boolean)
        .join('\n'),
      tags: ['review_decision', d.cluster, d.risk, ...d.blockedBy],
      source: 'snapshot',
      url: `/admin/ops/review#${d.id}`,
      blockedBy: d.blockedBy.filter((b) => b !== 'none'),
      confidence: 'needs_review',
    };
  });
}

function importReadinessItems(): IndexItem[] {
  return getSnapshotImportReadiness().map((g) => ({
    id: `readiness-${g.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    type: 'import_readiness',
    title: `Import readiness: ${g.category}`,
    subtitle: `${g.snapshotCount} rows · ${g.readiness}`,
    body: `${g.category}: ${g.snapshotCount} rows in snapshot — ${g.notes}`,
    tags: ['import_readiness', g.readiness, g.category.toLowerCase()],
    source: 'readiness',
    url: '/admin/ops',
    status: g.readiness,
  }));
}

function activationItems(): IndexItem[] {
  return ACTIVATION_STEPS.map((s) => ({
    id: s.id,
    type: 'activation_step',
    title: s.label,
    subtitle: s.group,
    body: [s.label, s.group, s.note ?? '', s.done ? 'done' : 'pending', `blockedBy: ${s.blockedBy.join(', ') || 'none'}`]
      .filter(Boolean)
      .join(' — '),
    tags: ['activation_step', s.group.toLowerCase().replace(/\s+/g, '_'), s.done ? 'done' : 'pending', ...s.blockedBy],
    source: 'readiness',
    url: '/admin/ops',
    status: s.done ? 'ready' : 'pending',
    blockedBy: s.blockedBy,
  }));
}

function runbookItems(): IndexItem[] {
  return RUNBOOKS.map((r) => ({
    id: r.id,
    type: 'runbook',
    title: r.title,
    subtitle: r.path,
    body: `${r.title} — ${r.blurb} (${r.path})`,
    tags: ['runbook', r.path],
    source: 'docs',
    url: undefined,
  }));
}

// --------------------------------------------------------------- DB pulls

async function dbItems(): Promise<IndexItem[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  if (!db) return [];
  const out: IndexItem[] = [];

  // Each table is wrapped individually — if one fails the others still run.
  try {
    const rows = await db.select().from(clientsTbl);
    for (const c of rows) {
      out.push({
        id: c.id,
        type: 'client',
        title: c.name,
        subtitle: c.legalName ?? undefined,
        body: [c.name, c.legalName ?? '', c.notes ?? '', (c.tags ?? []).join(' ')].filter(Boolean).join(' — '),
        tags: ['client', ...(c.tags ?? [])],
        source: 'db',
        url: `/admin/ops/clients/${c.id}`,
        status: c.status,
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(assetsTbl);
    for (const a of rows) {
      out.push({
        id: a.id,
        type: 'asset',
        title: a.name,
        subtitle: a.type,
        body: [a.name, a.liveUrl ?? '', a.notes ?? '', (a.techStack ?? []).join(' ')].filter(Boolean).join(' — '),
        tags: ['asset', a.type, ...(a.techStack ?? [])],
        source: 'db',
        url: `/admin/ops/assets/${a.id}`,
        status: a.status,
        relations: { clientId: a.clientId ?? undefined, assetId: a.id },
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(ticketsTbl);
    for (const t of rows) {
      out.push({
        id: t.id,
        type: 'ticket',
        title: t.title,
        subtitle: t.kind,
        body: [t.title, t.description ?? '', t.kind, t.priority, t.status].filter(Boolean).join(' — '),
        tags: ['ticket', t.kind, t.priority, t.status, ...(t.tags ?? [])],
        source: 'db',
        url: `/admin/ops/tickets/${t.id}`,
        status: t.status,
        relations: { clientId: t.clientId ?? undefined, assetId: t.assetId ?? undefined },
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(renewalsTbl);
    for (const r of rows) {
      out.push({
        id: r.id,
        type: 'renewal',
        title: r.name,
        subtitle: r.kind,
        body: [r.name, r.kind, r.amount ?? '', r.notes ?? ''].filter(Boolean).join(' — '),
        tags: ['renewal', r.kind, r.period ?? 'annual'],
        source: 'db',
        url: `/admin/ops/renewals/${r.id}`,
        status: r.reminderState ?? undefined,
        relations: { clientId: r.clientId ?? undefined },
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(incidentsTbl);
    for (const i of rows) {
      out.push({
        id: i.id,
        type: 'incident',
        title: i.summary,
        subtitle: i.severity,
        body: [i.summary, i.rootCause ?? '', i.severity, i.status].filter(Boolean).join(' — '),
        tags: ['incident', i.severity, i.status, ...(i.tags ?? [])],
        source: 'db',
        url: `/admin/ops/incidents/${i.id}`,
        status: i.status,
        relations: { clientId: i.clientId ?? undefined, assetId: i.assetId ?? undefined },
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(githubReposTbl);
    for (const r of rows) {
      out.push({
        id: r.id,
        type: 'github_repo',
        title: r.name,
        subtitle: r.category,
        body: [r.owner + '/' + r.name, r.description ?? '', r.language ?? '', r.category].filter(Boolean).join(' — '),
        tags: ['github_repo', r.category, r.visibility, ...(r.isArchived ? ['archived'] : [])],
        source: 'db',
        url: `/admin/ops/github#${r.id}`,
        status: r.isArchived ? 'archived' : 'active',
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(vercelProjectsTbl);
    for (const v of rows) {
      out.push({
        id: v.id,
        type: 'vercel_project',
        title: v.name,
        subtitle: v.teamSlug ?? undefined,
        body: [v.name, v.teamSlug ?? '', v.productionUrl ?? '', v.notes ?? '', v.state].filter(Boolean).join(' — '),
        tags: ['vercel_project', v.state, ...(v.teamSlug ? [v.teamSlug] : [])],
        source: 'db',
        url: `/admin/ops/vercel#${v.id}`,
        status: v.state,
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(hetznerServersTbl);
    for (const h of rows) {
      const serverType = h.serverType ?? 'unknown';
      const location = h.location ?? 'unknown';
      out.push({
        id: h.id,
        type: 'hetzner_server',
        title: h.name,
        subtitle: `${serverType} · ${location}`,
        body: [h.name, serverType, location, h.publicIpv4 ?? ''].filter(Boolean).join(' — '),
        tags: ['hetzner_server', location, serverType],
        source: 'db',
        url: `/admin/ops/hetzner#${h.id}`,
        status: h.status ?? undefined,
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(cloudflareZonesTbl);
    for (const z of rows) {
      const status = z.status ?? 'unknown';
      out.push({
        id: z.id,
        type: 'cloudflare_zone',
        title: z.name,
        subtitle: z.plan ?? undefined,
        body: [z.name, z.plan ?? '', status, z.state].filter(Boolean).join(' — '),
        tags: ['cloudflare_zone', status, z.state],
        source: 'db',
        url: `/admin/ops/cloudflare#${z.id}`,
        status,
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(domainsTbl);
    for (const d of rows) {
      out.push({
        id: d.id,
        type: 'domain',
        title: d.name,
        subtitle: d.registrar ?? undefined,
        body: [d.name, d.registrar ?? '', d.notes ?? ''].filter(Boolean).join(' — '),
        tags: ['domain', ...(d.registrar ? [d.registrar] : [])],
        source: 'db',
        url: `/admin/ops/domains#${d.id}`,
      });
    }
  } catch {
    /* skip */
  }

  try {
    const rows = await db.select().from(auditFindingsTbl);
    for (const f of rows) {
      out.push({
        id: f.id,
        type: 'audit_finding',
        title: f.title,
        subtitle: f.entityRef ?? f.kind,
        body: [f.title, f.detail, f.kind, f.severity].filter(Boolean).join(' — '),
        tags: ['audit_finding', f.kind, f.severity, f.status],
        source: 'db',
        url: '/admin/ops/audits',
        status: f.status,
      });
    }
  } catch {
    /* skip */
  }

  return out;
}

// --------------------------------------------------------------- buildIndex

export async function buildIndex(): Promise<IndexItem[]> {
  const snapshot: IndexItem[] = [
    ...divisionItems(),
    ...clientItems(),
    ...assetItems(),
    ...repoItems(),
    ...vercelItems(),
    ...hetznerItems(),
    ...cloudflareZoneItems(),
    ...domainItems(),
    ...ticketItems(),
    ...renewalItems(),
    ...incidentItems(),
    ...findingItems(),
    ...decisionItems(),
    ...importReadinessItems(),
    ...activationItems(),
    ...runbookItems(),
  ];

  let live: IndexItem[] = [];
  try {
    live = await dbItems();
  } catch {
    live = [];
  }

  if (live.length === 0) return snapshot;

  // Dedupe: if a DB row matches a snapshot row by (type + lowercase title),
  // the DB row wins. Snapshot rows for types not represented in DB pass
  // through.
  const liveKeys = new Set(live.map((it) => `${it.type}::${it.title.toLowerCase()}`));
  const filteredSnapshot = snapshot.filter((s) => !liveKeys.has(`${s.type}::${s.title.toLowerCase()}`));

  return [...live, ...filteredSnapshot];
}
