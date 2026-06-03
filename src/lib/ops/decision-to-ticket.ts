import 'server-only';

import { getDb, isDbConfigured } from '@/lib/db/client';
import { tickets } from '@/lib/db/schema/tickets';
import { sql } from 'drizzle-orm';
import { createTicket } from '@/lib/ops/tickets-service';
import { writeAudit } from '@/lib/ops/audit';
import { listSnapshotDecisionItems, type SnapshotDecision } from '@/lib/ops/ops-snapshot-data';

// Decision-to-ticket bridge.
//
// Translates each SnapshotDecision into a candidate ticket so the operator can
// import the open decisions as a ticket backlog the moment DATABASE_URL is
// connected. Behaviour is fully graceful when the DB is missing — preview
// returns synthetic counts and the run report records `status: 'skipped'`.
//
// Existing ticket detection uses the `tags` jsonb column (already a string[]).
// Each bridged ticket is tagged with the constants below so the run is
// idempotent: re-running won't double-insert tickets for the same decision.

const TAG_BRIDGE = 'decision_bridge';
const TAG_SNAPSHOT = 'snapshot_import';

function decisionIdTag(decisionId: string): string {
  return `decision_id:${decisionId}`;
}

type Priority = 'low' | 'med' | 'high' | 'urgent';

function mapPriority(risk: SnapshotDecision['risk']): Priority {
  switch (risk) {
    case 'high':
      return 'urgent';
    case 'med':
      return 'high';
    case 'low':
    default:
      return 'med';
  }
}

function buildTicketTitle(d: SnapshotDecision): string {
  return d.title;
}

function buildDescription(d: SnapshotDecision): string {
  const blocked = d.blockedBy.length === 0 ? 'none' : d.blockedBy.join(', ');
  return [
    d.context,
    '',
    `Recommendation: ${d.recommendation}`,
    '',
    `Action: ${d.action}`,
    '',
    `Blocked by: ${blocked}`,
  ].join('\n');
}

function buildTags(d: SnapshotDecision): string[] {
  return [TAG_BRIDGE, TAG_SNAPSHOT, d.cluster, decisionIdTag(d.id)];
}

export type DecisionToTicketPreview = {
  totalDecisions: number;
  toCreate: number;
  toSkip: number;
  byCluster: Record<string, number>;
  items: {
    decisionId: string;
    clusterTitle: string;
    ticketTitle: string;
    priority: Priority;
    tags: string[];
  }[];
};

export type DecisionToTicketRunReport = {
  status: 'ok' | 'dry_run' | 'skipped' | 'failed';
  created: number;
  skipped: number;
  error?: string;
  durationMs: number;
  dryRun: boolean;
};

async function decisionAlreadyExists(decisionId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    const idTag = decisionIdTag(decisionId);
    const rows = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(sql`${tickets.tags} ? ${TAG_BRIDGE} and ${tickets.tags} ? ${idTag}`)
      .limit(1);
    return rows.length > 0;
  } catch {
    // Be defensive — if the query throws (schema drift, etc.) treat as missing.
    return false;
  }
}

export async function previewDecisionToTicket(): Promise<DecisionToTicketPreview> {
  const decisions = listSnapshotDecisionItems();
  const byCluster: Record<string, number> = {};
  const items: DecisionToTicketPreview['items'] = decisions.map((d) => {
    byCluster[d.cluster] = (byCluster[d.cluster] ?? 0) + 1;
    return {
      decisionId: d.id,
      clusterTitle: d.cluster,
      ticketTitle: buildTicketTitle(d),
      priority: mapPriority(d.risk),
      tags: buildTags(d),
    };
  });

  const total = decisions.length;

  if (!isDbConfigured()) {
    return {
      totalDecisions: total,
      toCreate: total,
      toSkip: 0,
      byCluster,
      items,
    };
  }

  let toSkip = 0;
  for (const d of decisions) {
    try {
      if (await decisionAlreadyExists(d.id)) toSkip += 1;
    } catch {
      // Defensive — ignore per-row failures, treat as not-existing.
    }
  }

  return {
    totalDecisions: total,
    toCreate: Math.max(0, total - toSkip),
    toSkip,
    byCluster,
    items,
  };
}

export async function runDecisionToTicket(input: {
  operatorSlug: string | null;
  dryRun: boolean;
}): Promise<DecisionToTicketRunReport> {
  const start = Date.now();

  if (!isDbConfigured()) {
    return {
      status: 'skipped',
      created: 0,
      skipped: 0,
      error: 'db_not_connected',
      durationMs: Date.now() - start,
      dryRun: input.dryRun,
    };
  }

  let created = 0;
  let skipped = 0;

  try {
    for (const d of listSnapshotDecisionItems()) {
      const exists = await decisionAlreadyExists(d.id);
      if (exists) {
        skipped += 1;
        continue;
      }
      if (input.dryRun) {
        created += 1;
        continue;
      }
      const inserted = await createTicket({
        kind: 'change_request',
        title: buildTicketTitle(d),
        description: buildDescription(d),
        priority: mapPriority(d.risk),
        tags: buildTags(d),
      });
      if (inserted) {
        created += 1;
      } else {
        skipped += 1;
      }
    }

    const report: DecisionToTicketRunReport = {
      status: input.dryRun ? 'dry_run' : 'ok',
      created,
      skipped,
      durationMs: Date.now() - start,
      dryRun: input.dryRun,
    };

    await writeAudit({
      operatorSlug: input.operatorSlug,
      action: 'seed_run',
      entityType: 'decision_to_ticket',
      diff: report as unknown as Record<string, unknown>,
    });

    return report;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 'failed',
      created,
      skipped,
      error: message,
      durationMs: Date.now() - start,
      dryRun: input.dryRun,
    };
  }
}
