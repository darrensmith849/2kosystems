import 'server-only';
import {
  SNAPSHOT_DIVISIONS,
  SNAPSHOT_CLIENTS,
  SNAPSHOT_ASSETS,
  SNAPSHOT_REPOS,
  SNAPSHOT_VERCEL_PROJECTS,
  SNAPSHOT_HETZNER_SERVERS,
  SNAPSHOT_CLOUDFLARE_ZONES,
  SNAPSHOT_CLOUDFLARE_PAGES,
  SNAPSHOT_DOMAINS,
  SNAPSHOT_TICKETS,
  SNAPSHOT_RENEWALS,
  SNAPSHOT_INCIDENTS,
  SNAPSHOT_FINDINGS,
  SNAPSHOT_DECISIONS,
  getSnapshotImportReadiness,
} from '@/lib/ops/ops-snapshot-data';

// Snapshot export pack — JSON + Markdown. Assembled from the static
// ops-snapshot-data constants only. NO secrets, NO tokens, NO env vars.

export function buildSnapshotJson(): object {
  return {
    generatedAt: new Date().toISOString(),
    divisions: SNAPSHOT_DIVISIONS,
    clients: SNAPSHOT_CLIENTS.map(stripClientRefs),
    assets: SNAPSHOT_ASSETS.map(stripAssetRefs),
    repos: SNAPSHOT_REPOS,
    vercelProjects: SNAPSHOT_VERCEL_PROJECTS,
    hetznerServers: SNAPSHOT_HETZNER_SERVERS,
    cloudflareZones: SNAPSHOT_CLOUDFLARE_ZONES,
    cloudflarePages: SNAPSHOT_CLOUDFLARE_PAGES,
    domains: SNAPSHOT_DOMAINS,
    tickets: SNAPSHOT_TICKETS.map(stripTicketRefs),
    renewals: SNAPSHOT_RENEWALS.map(stripRenewalRefs),
    incidents: SNAPSHOT_INCIDENTS.map(stripIncidentRefs),
    findings: SNAPSHOT_FINDINGS,
    decisions: SNAPSHOT_DECISIONS,
    importReadiness: getSnapshotImportReadiness(),
  };
}

// The *WithRefs view-model joins (client/division/asset) are convenient for the
// UI but bloat exports. The JSON pack ships the flat table-shaped rows.
function stripClientRefs<T extends { division?: unknown }>(c: T): Omit<T, 'division'> {
  const { division: _division, ...rest } = c;
  void _division;
  return rest;
}
function stripAssetRefs<T extends { client?: unknown; division?: unknown }>(
  a: T,
): Omit<T, 'client' | 'division'> {
  const { client: _client, division: _division, ...rest } = a;
  void _client;
  void _division;
  return rest;
}
function stripTicketRefs<T extends { client?: unknown; asset?: unknown }>(
  t: T,
): Omit<T, 'client' | 'asset'> {
  const { client: _client, asset: _asset, ...rest } = t;
  void _client;
  void _asset;
  return rest;
}
function stripRenewalRefs<T extends { client?: unknown }>(r: T): Omit<T, 'client'> {
  const { client: _client, ...rest } = r;
  void _client;
  return rest;
}
function stripIncidentRefs<T extends { client?: unknown; asset?: unknown }>(
  i: T,
): Omit<T, 'client' | 'asset'> {
  const { client: _client, asset: _asset, ...rest } = i;
  void _client;
  void _asset;
  return rest;
}

// --------------------------------------------------------------- Markdown

function mdTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map(cell).join(' | ')} |`).join('\n');
  return [head, sep, body].join('\n');
}

function cell(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v).replace(/\|/g, '\\|').replace(/\n+/g, ' ');
}

export function buildSnapshotMarkdown(): string {
  const generatedAt = new Date().toISOString();
  const lines: string[] = [];
  lines.push('# 2KO Ops — Snapshot Pack');
  lines.push('');
  lines.push(`Generated: ${generatedAt}`);
  lines.push('');
  lines.push(
    'Read-only operational handover assembled from the discovery snapshot. This document reflects the static fixture that activates while DATABASE_URL is unset; live data takes precedence once the dashboard is connected to Hetzner Postgres.',
  );
  lines.push('');

  lines.push('## Divisions');
  lines.push('');
  lines.push(
    mdTable(
      ['Code', 'Name', 'Parent', 'Description'],
      SNAPSHOT_DIVISIONS.map((d) => [
        d.code,
        d.name,
        d.parentDivisionId ?? '',
        d.description ?? '',
      ]),
    ),
  );
  lines.push('');

  lines.push('## Clients');
  lines.push('');
  lines.push(
    mdTable(
      ['Name', 'Division', 'Status', 'Tags'],
      SNAPSHOT_CLIENTS.map((c) => [
        c.name,
        c.division?.code ?? '',
        c.status,
        (c.tags ?? []).join(', '),
      ]),
    ),
  );
  lines.push('');

  lines.push('## Assets');
  lines.push('');
  lines.push(
    mdTable(
      ['Name', 'Type', 'Client', 'Live URL', 'Status'],
      SNAPSHOT_ASSETS.map((a) => [
        a.name,
        a.type,
        a.client?.name ?? '',
        a.liveUrl ?? '',
        a.status,
      ]),
    ),
  );
  lines.push('');

  lines.push('## GitHub repos');
  lines.push('');
  lines.push(
    mdTable(
      ['Owner/Name', 'Category', 'Visibility', 'Description'],
      SNAPSHOT_REPOS.map((r) => [
        `${r.owner}/${r.name}`,
        r.category,
        r.visibility,
        r.description ?? '',
      ]),
    ),
  );
  lines.push('');

  lines.push('## Vercel projects');
  lines.push('');
  lines.push(
    mdTable(
      ['Team', 'Project', 'Production URL', 'State', 'Linked repo'],
      SNAPSHOT_VERCEL_PROJECTS.map((v) => [
        v.teamSlug,
        v.name,
        v.productionUrl ?? '',
        v.state,
        v.linkedRepo ?? '',
      ]),
    ),
  );
  lines.push('');

  lines.push('## Hetzner servers');
  lines.push('');
  lines.push(
    mdTable(
      ['Name', 'Type', 'Location', 'Public IPv4', 'Role'],
      SNAPSHOT_HETZNER_SERVERS.map((h) => [
        h.name,
        h.serverType ?? '',
        h.location ?? '',
        h.publicIpv4 ?? '',
        (h.labels as Record<string, string>)?.role ?? '',
      ]),
    ),
  );
  lines.push('');

  lines.push('## Cloudflare zones');
  lines.push('');
  lines.push(
    mdTable(
      ['Name', 'Status', 'Plan'],
      SNAPSHOT_CLOUDFLARE_ZONES.map((z) => [z.name, z.status ?? '', z.plan ?? '']),
    ),
  );
  lines.push('');

  lines.push('## Cloudflare Pages');
  lines.push('');
  lines.push(
    mdTable(
      ['Project', 'Subdomain', 'Branch', 'State'],
      SNAPSHOT_CLOUDFLARE_PAGES.map((p) => [
        p.name,
        p.subdomain ?? '',
        p.productionBranch ?? '',
        p.state,
      ]),
    ),
  );
  lines.push('');

  lines.push('## Domains');
  lines.push('');
  lines.push(
    mdTable(
      ['Name', 'Registrar', 'Notes'],
      SNAPSHOT_DOMAINS.map((d) => [d.name, d.registrar ?? '', d.notes ?? '']),
    ),
  );
  lines.push('');

  lines.push('## Tickets');
  lines.push('');
  lines.push(
    mdTable(
      ['Title', 'Kind', 'Priority', 'Status'],
      SNAPSHOT_TICKETS.map((t) => [t.title, t.kind, t.priority, t.status]),
    ),
  );
  lines.push('');

  lines.push('## Renewals');
  lines.push('');
  lines.push(
    mdTable(
      ['Name', 'Kind', 'Amount', 'Currency', 'Next due'],
      SNAPSHOT_RENEWALS.map((r) => [
        r.name,
        r.kind,
        r.amount ?? '',
        r.currency,
        r.nextDueAt.toISOString().slice(0, 10),
      ]),
    ),
  );
  lines.push('');

  lines.push('## Incidents');
  lines.push('');
  lines.push(
    mdTable(
      ['Summary', 'Severity', 'Status', 'Followup'],
      SNAPSHOT_INCIDENTS.map((i) => [
        i.summary,
        i.severity,
        i.status,
        i.followupRequired ? 'yes' : 'no',
      ]),
    ),
  );
  lines.push('');

  lines.push('## Audit findings');
  lines.push('');
  lines.push(
    mdTable(
      ['Title', 'Kind', 'Severity', 'Entity'],
      SNAPSHOT_FINDINGS.map((f) => [
        f.title,
        f.kind,
        f.severity,
        f.entityRef ?? '',
      ]),
    ),
  );
  lines.push('');

  lines.push('## Decisions pending');
  lines.push('');
  lines.push(
    mdTable(
      ['Title', 'Cluster', 'Risk', 'Recommendation'],
      SNAPSHOT_DECISIONS.map((d) => [d.title, d.cluster, d.risk, d.recommendation]),
    ),
  );
  lines.push('');

  lines.push('## Import readiness');
  lines.push('');
  lines.push(
    mdTable(
      ['Category', 'Snapshot count', 'Readiness', 'Notes'],
      getSnapshotImportReadiness().map((r) => [
        r.category,
        String(r.snapshotCount),
        r.readiness,
        r.notes,
      ]),
    ),
  );
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push(
    'Read-only snapshot. The dashboard treats this content as the source of truth only while DATABASE_URL is unset. Once the database is connected, live records take over and this file becomes a reference fixture.',
  );

  return lines.join('\n');
}
