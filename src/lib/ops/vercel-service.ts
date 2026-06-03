import 'server-only';
import { getDb } from '@/lib/db/client';
import { vercelProjects, vercelTeams, type VercelProject } from '@/lib/db/schema/infra';
import { syncRuns } from '@/lib/db/schema/sync';
import { listVercelProjects, vercelConnectivity } from '@/lib/integrations/vercel';
import { eq } from 'drizzle-orm';

const KNOWN_TEAM_SLUGS = ['pumpbots-projects', 'impart-global'];

// Heuristic state classifier — uses inventory knowledge to mark known-migrated
// or known-dormant projects. Conservative: anything we can't be sure about
// stays as `unknown`.
function classifyState(name: string, productionUrl: string | null): VercelProject['state'] {
  const lower = name.toLowerCase();
  const migrated = new Set([
    'sa_private_schools', 'taxo', 'sigmafy-web', 'sigmafy-admin',
    'sigmafynew', 'sigmafy-tools', 'tori_trades_trading_bot', 'crewter',
  ]);
  if (migrated.has(lower)) return 'migrated_to_hetzner';
  const dormant = new Set([
    'ukama', 'pumpbot', 'lovelace-moki', 'strongtower', 'coupex',
    'website-while-you-wait', 'toritradestodamoon', 'schools_near_me_us',
    'base_test_2', 'im-kade', 'edenlang', 'anniversaryclaude', 'rileyscarwash',
    'highendtravel', 'darreniscool', 'allthe_glory', 'alltheglory101',
    'slabheadcodex', 'slabhead.co.za', 'danielpeter', 'smarthomearchitects_website',
    '2ko_website', 'sigmafy-funnel-public',
  ]);
  if (dormant.has(lower)) return 'dormant';
  // Live with a real custom domain (not *.vercel.app)
  if (productionUrl && !productionUrl.includes('.vercel.app')) return 'live';
  return 'unknown';
}

export async function listStoredVercelProjects(): Promise<VercelProject[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(vercelProjects);
}

export async function syncVercelProjects(input: {
  operatorSlug: string | null;
  triggeredBy: 'manual' | 'cron' | 'seed';
}): Promise<{ ok: boolean; itemsSeen: number; itemsCreated: number; itemsUpdated: number; error?: string }> {
  const db = getDb();
  if (!db) return { ok: false, itemsSeen: 0, itemsCreated: 0, itemsUpdated: 0, error: 'no_database' };
  const conn = vercelConnectivity();
  if (conn.status !== 'connected') {
    await db.insert(syncRuns).values({
      provider: 'vercel',
      status: 'skipped',
      triggeredBy: input.triggeredBy,
      triggeredByOperatorSlug: input.operatorSlug,
      finishedAt: new Date(),
      details: { reason: conn.reason, detail: conn.detail },
    });
    return { ok: false, itemsSeen: 0, itemsCreated: 0, itemsUpdated: 0, error: conn.reason };
  }

  const runRows = await db
    .insert(syncRuns)
    .values({
      provider: 'vercel',
      status: 'running',
      triggeredBy: input.triggeredBy,
      triggeredByOperatorSlug: input.operatorSlug,
    })
    .returning();
  const runId = runRows[0]?.id;

  try {
    const teams = await db.select().from(vercelTeams);
    const teamMap = new Map(teams.map((t) => [t.slug, t.id] as const));
    const projects = await listVercelProjects(KNOWN_TEAM_SLUGS);
    let created = 0;
    let updated = 0;
    for (const p of projects) {
      const state = classifyState(p.name, p.productionUrl);
      const teamId = teamMap.get(p.teamSlug) ?? null;
      const result = await db
        .insert(vercelProjects)
        .values({
          teamId,
          teamSlug: p.teamSlug,
          vercelProjectId: p.projectId,
          name: p.name,
          framework: p.framework,
          productionUrl: p.productionUrl,
          latestDeploymentStatus: p.latestDeploymentStatus,
          linkedRepo: p.linkedRepo,
          nodeVersion: p.nodeVersion,
          state,
          lastSyncedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [vercelProjects.teamSlug, vercelProjects.name],
          set: {
            vercelProjectId: p.projectId,
            framework: p.framework,
            productionUrl: p.productionUrl,
            latestDeploymentStatus: p.latestDeploymentStatus,
            linkedRepo: p.linkedRepo,
            nodeVersion: p.nodeVersion,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          },
        })
        .returning({ id: vercelProjects.id, createdAt: vercelProjects.createdAt, updatedAt: vercelProjects.updatedAt });
      const row = result[0];
      if (row && row.createdAt && row.updatedAt && row.createdAt.getTime() === row.updatedAt.getTime()) {
        created++;
      } else if (row) {
        updated++;
      }
    }
    if (runId) {
      await db
        .update(syncRuns)
        .set({
          status: 'ok',
          finishedAt: new Date(),
          itemsSeen: projects.length,
          itemsCreated: created,
          itemsUpdated: updated,
        })
        .where(eq(syncRuns.id, runId));
    }
    return { ok: true, itemsSeen: projects.length, itemsCreated: created, itemsUpdated: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (runId) {
      await db
        .update(syncRuns)
        .set({ status: 'failed', finishedAt: new Date(), errorMessage: message.slice(0, 500) })
        .where(eq(syncRuns.id, runId));
    }
    return { ok: false, itemsSeen: 0, itemsCreated: 0, itemsUpdated: 0, error: message };
  }
}
