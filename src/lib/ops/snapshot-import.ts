import 'server-only';
import { getDb } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
import { writeAudit } from '@/lib/ops/audit';
import {
  SNAPSHOT_DIVISIONS,
  SNAPSHOT_CLIENTS,
  SNAPSHOT_ASSETS,
  SNAPSHOT_TICKETS,
  SNAPSHOT_RENEWALS,
  SNAPSHOT_INCIDENTS,
  SNAPSHOT_FINDINGS,
  getSnapshotImportReadiness,
} from '@/lib/ops/ops-snapshot-data';
import { divisions, clients, assets } from '@/lib/db/schema';
import { tickets } from '@/lib/db/schema/tickets';
import { renewals } from '@/lib/db/schema/renewals';
import { incidents } from '@/lib/db/schema/incidents';
import { auditFindings } from '@/lib/db/schema/audits';

// Snapshot → DB import engine. Activates only when DATABASE_URL is set;
// otherwise every entry point gracefully returns a "skipped" report so the
// /admin/ops UI can render the import panel without throwing.
//
// Schema-shape decisions:
// - Snapshot row IDs (e.g. `snap-client-foo`) are NOT UUIDs and cannot be
//   preserved verbatim — every target table uses `uuid PRIMARY KEY DEFAULT
//   gen_random_uuid()`. We let the DB assign IDs and tag each inserted row
//   with a `source: snapshot_import` marker, either in `tags` (where the
//   table has a jsonb tags column) or in `metadata` (audit_findings).
// - Stable business keys are honoured where they exist:
//     divisions.code (unique), domains.name, vercel_projects (teamSlug+name),
//     github_repos (owner+name), hetzner_servers.hzServerId,
//     cloudflare_zones.cfZoneId. For tables without a natural key (clients,
//     assets, tickets, renewals, incidents, audit_findings) we de-dupe by
//     checking for a prior snapshot-tagged row with the same name/title.

export type ImportCategoryKey =
  | 'divisions'
  | 'clients'
  | 'assets'
  | 'tickets'
  | 'renewals'
  | 'incidents'
  | 'findings';

export type ImportPreviewGroup = {
  category: string;
  snapshotCount: number;
  readiness: 'ready' | 'needs_review' | 'blocked';
  notes: string;
  willInsert: number;
  willSkip: number;
};

export type ImportTotalsEntry = { inserted: number; skipped: number };

export type ImportTotals = {
  divisions: ImportTotalsEntry;
  clients: ImportTotalsEntry;
  assets: ImportTotalsEntry;
  tickets: ImportTotalsEntry;
  renewals: ImportTotalsEntry;
  incidents: ImportTotalsEntry;
  findings: ImportTotalsEntry;
};

export type ImportRunReport = {
  status: 'ok' | 'dry_run' | 'skipped' | 'failed';
  totals: ImportTotals;
  error?: string;
  durationMs: number;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
};

const SNAPSHOT_MARKER = 'source:snapshot_import';

function zeroTotals(): ImportTotals {
  return {
    divisions: { inserted: 0, skipped: 0 },
    clients: { inserted: 0, skipped: 0 },
    assets: { inserted: 0, skipped: 0 },
    tickets: { inserted: 0, skipped: 0 },
    renewals: { inserted: 0, skipped: 0 },
    incidents: { inserted: 0, skipped: 0 },
    findings: { inserted: 0, skipped: 0 },
  };
}

// Map snapshot readiness category labels → import category keys used in totals.
const CATEGORY_KEY: Record<string, ImportCategoryKey | null> = {
  Divisions: 'divisions',
  Clients: 'clients',
  Assets: 'assets',
  Tickets: 'tickets',
  Renewals: 'renewals',
  Incidents: 'incidents',
  'Audit findings': 'findings',
  // The following readiness groups have no automated importer in this phase:
  'GitHub repos': null,
  'Vercel projects': null,
  'Hetzner servers': null,
  'Cloudflare zones': null,
  Domains: null,
};

async function existingCountFor(key: ImportCategoryKey): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  try {
    switch (key) {
      case 'divisions': {
        const rows = await db.select({ c: sql<number>`count(*)::int` }).from(divisions);
        return Number(rows[0]?.c ?? 0);
      }
      case 'clients': {
        const rows = await db.select({ c: sql<number>`count(*)::int` }).from(clients);
        return Number(rows[0]?.c ?? 0);
      }
      case 'assets': {
        const rows = await db.select({ c: sql<number>`count(*)::int` }).from(assets);
        return Number(rows[0]?.c ?? 0);
      }
      case 'tickets': {
        const rows = await db.select({ c: sql<number>`count(*)::int` }).from(tickets);
        return Number(rows[0]?.c ?? 0);
      }
      case 'renewals': {
        const rows = await db.select({ c: sql<number>`count(*)::int` }).from(renewals);
        return Number(rows[0]?.c ?? 0);
      }
      case 'incidents': {
        const rows = await db.select({ c: sql<number>`count(*)::int` }).from(incidents);
        return Number(rows[0]?.c ?? 0);
      }
      case 'findings': {
        const rows = await db.select({ c: sql<number>`count(*)::int` }).from(auditFindings);
        return Number(rows[0]?.c ?? 0);
      }
    }
  } catch {
    // Table missing or query failed — behave as if there are no existing rows.
    return 0;
  }
}

export async function previewSnapshotImport(): Promise<{
  groups: ImportPreviewGroup[];
  dbConfigured: boolean;
}> {
  const db = getDb();
  const readiness = getSnapshotImportReadiness();

  if (!db) {
    return {
      dbConfigured: false,
      groups: readiness.map((r) => ({
        category: r.category,
        snapshotCount: r.snapshotCount,
        readiness: r.readiness,
        notes: r.notes,
        willInsert: r.snapshotCount,
        willSkip: 0,
      })),
    };
  }

  const groups: ImportPreviewGroup[] = [];
  for (const r of readiness) {
    const key = CATEGORY_KEY[r.category];
    let willInsert = r.snapshotCount;
    let willSkip = 0;
    if (key) {
      const existing = await existingCountFor(key);
      willSkip = Math.min(existing, r.snapshotCount);
      willInsert = Math.max(0, r.snapshotCount - willSkip);
    }
    groups.push({
      category: r.category,
      snapshotCount: r.snapshotCount,
      readiness: r.readiness,
      notes: r.notes,
      willInsert,
      willSkip,
    });
  }
  return { dbConfigured: true, groups };
}

// Internal: each per-category importer returns the {inserted, skipped} pair.
// Uses onConflictDoNothing on the natural unique key (divisions.code) where
// available; for tables without a natural unique key we check first for an
// existing snapshot-tagged row of the same name/title.

async function importDivisions(dryRun: boolean): Promise<ImportTotalsEntry> {
  const db = getDb();
  if (!db) return { inserted: 0, skipped: SNAPSHOT_DIVISIONS.length };
  let inserted = 0;
  let skipped = 0;
  for (const d of SNAPSHOT_DIVISIONS) {
    if (dryRun) {
      inserted++;
      continue;
    }
    const result = await db
      .insert(divisions)
      .values({
        code: d.code,
        name: d.name,
        description: d.description,
      })
      .onConflictDoNothing({ target: divisions.code })
      .returning({ id: divisions.id });
    if (result.length > 0) inserted++;
    else skipped++;
  }
  return { inserted, skipped };
}

async function importClients(dryRun: boolean): Promise<ImportTotalsEntry> {
  const db = getDb();
  if (!db) return { inserted: 0, skipped: SNAPSHOT_CLIENTS.length };
  let inserted = 0;
  let skipped = 0;
  for (const c of SNAPSHOT_CLIENTS) {
    if (dryRun) {
      inserted++;
      continue;
    }
    // Dedupe: skip if a previously-snapshot-tagged client with this name exists.
    const exists = await db
      .select({ id: clients.id })
      .from(clients)
      .where(sql`${clients.name} = ${c.name} and ${clients.tags} ? ${SNAPSHOT_MARKER}`)
      .limit(1);
    if (exists.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(clients).values({
      name: c.name,
      legalName: c.legalName,
      status: c.status,
      notes: c.notes,
      tags: [...(c.tags ?? []), SNAPSHOT_MARKER],
    });
    inserted++;
  }
  return { inserted, skipped };
}

async function importAssets(dryRun: boolean): Promise<ImportTotalsEntry> {
  const db = getDb();
  if (!db) return { inserted: 0, skipped: SNAPSHOT_ASSETS.length };
  let inserted = 0;
  let skipped = 0;
  for (const a of SNAPSHOT_ASSETS) {
    if (dryRun) {
      inserted++;
      continue;
    }
    // assets has no tags column — dedupe by name only.
    const exists = await db
      .select({ id: assets.id })
      .from(assets)
      .where(sql`${assets.name} = ${a.name}`)
      .limit(1);
    if (exists.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(assets).values({
      name: a.name,
      type: a.type,
      liveUrl: a.liveUrl,
      stagingUrl: a.stagingUrl,
      techStack: a.techStack,
      environment: a.environment,
      status: a.status,
      notes: a.notes ? `${a.notes}\n\n[${SNAPSHOT_MARKER}]` : `[${SNAPSHOT_MARKER}]`,
    });
    inserted++;
  }
  return { inserted, skipped };
}

async function importTickets(dryRun: boolean): Promise<ImportTotalsEntry> {
  const db = getDb();
  if (!db) return { inserted: 0, skipped: SNAPSHOT_TICKETS.length };
  let inserted = 0;
  let skipped = 0;
  for (const t of SNAPSHOT_TICKETS) {
    if (dryRun) {
      inserted++;
      continue;
    }
    const exists = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(sql`${tickets.title} = ${t.title} and ${tickets.tags} ? ${SNAPSHOT_MARKER}`)
      .limit(1);
    if (exists.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(tickets).values({
      kind: t.kind,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      billingStatus: t.billingStatus,
      tags: [...(t.tags ?? []), SNAPSHOT_MARKER],
    });
    inserted++;
  }
  return { inserted, skipped };
}

async function importRenewals(dryRun: boolean): Promise<ImportTotalsEntry> {
  const db = getDb();
  if (!db) return { inserted: 0, skipped: SNAPSHOT_RENEWALS.length };
  let inserted = 0;
  let skipped = 0;
  for (const r of SNAPSHOT_RENEWALS) {
    if (dryRun) {
      inserted++;
      continue;
    }
    const exists = await db
      .select({ id: renewals.id })
      .from(renewals)
      .where(sql`${renewals.name} = ${r.name}`)
      .limit(1);
    if (exists.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(renewals).values({
      name: r.name,
      kind: r.kind,
      amount: r.amount,
      currency: r.currency,
      period: r.period,
      nextDueAt: r.nextDueAt,
      notes: r.notes ? `${r.notes}\n\n[${SNAPSHOT_MARKER}]` : `[${SNAPSHOT_MARKER}]`,
    });
    inserted++;
  }
  return { inserted, skipped };
}

async function importIncidents(dryRun: boolean): Promise<ImportTotalsEntry> {
  const db = getDb();
  if (!db) return { inserted: 0, skipped: SNAPSHOT_INCIDENTS.length };
  let inserted = 0;
  let skipped = 0;
  for (const i of SNAPSHOT_INCIDENTS) {
    if (dryRun) {
      inserted++;
      continue;
    }
    const exists = await db
      .select({ id: incidents.id })
      .from(incidents)
      .where(sql`${incidents.summary} = ${i.summary} and ${incidents.tags} ? ${SNAPSHOT_MARKER}`)
      .limit(1);
    if (exists.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(incidents).values({
      startedAt: i.startedAt,
      endedAt: i.endedAt,
      severity: i.severity,
      source: i.source,
      summary: i.summary,
      rootCause: i.rootCause,
      resolvedAt: i.resolvedAt,
      followupRequired: i.followupRequired,
      status: i.status,
      tags: [...(i.tags ?? []), SNAPSHOT_MARKER],
    });
    inserted++;
  }
  return { inserted, skipped };
}

async function importFindings(dryRun: boolean): Promise<ImportTotalsEntry> {
  const db = getDb();
  if (!db) return { inserted: 0, skipped: SNAPSHOT_FINDINGS.length };
  let inserted = 0;
  let skipped = 0;
  for (const f of SNAPSHOT_FINDINGS) {
    if (dryRun) {
      inserted++;
      continue;
    }
    const exists = await db
      .select({ id: auditFindings.id })
      .from(auditFindings)
      .where(sql`${auditFindings.title} = ${f.title}`)
      .limit(1);
    if (exists.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(auditFindings).values({
      kind: f.kind,
      severity: f.severity,
      entityType: f.entityType,
      entityRef: f.entityRef,
      title: f.title,
      detail: f.detail,
      status: f.status,
      source: 'seed',
      metadata: { ...(f.metadata ?? {}), source: 'snapshot_import' },
    });
    inserted++;
  }
  return { inserted, skipped };
}

export async function runSnapshotImport(input: {
  operatorSlug: string | null;
  dryRun: boolean;
}): Promise<ImportRunReport> {
  const startedAt = new Date();
  const start = startedAt.getTime();

  const db = getDb();
  if (!db) {
    const finishedAt = new Date();
    return {
      status: 'skipped',
      error: 'db_not_connected',
      totals: zeroTotals(),
      durationMs: finishedAt.getTime() - start,
      dryRun: input.dryRun,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
    };
  }

  const totals = zeroTotals();
  try {
    totals.divisions = await importDivisions(input.dryRun);
    totals.clients = await importClients(input.dryRun);
    totals.assets = await importAssets(input.dryRun);
    totals.tickets = await importTickets(input.dryRun);
    totals.renewals = await importRenewals(input.dryRun);
    totals.incidents = await importIncidents(input.dryRun);
    totals.findings = await importFindings(input.dryRun);

    const finishedAt = new Date();
    const report: ImportRunReport = {
      status: input.dryRun ? 'dry_run' : 'ok',
      totals,
      durationMs: finishedAt.getTime() - start,
      dryRun: input.dryRun,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
    };

    await writeAudit({
      operatorSlug: input.operatorSlug,
      action: 'seed_run',
      entityType: 'snapshot_import',
      diff: report as unknown as Record<string, unknown>,
    });
    return report;
  } catch (err) {
    const finishedAt = new Date();
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 'failed',
      totals,
      error: message,
      durationMs: finishedAt.getTime() - start,
      dryRun: input.dryRun,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
    };
  }
}
