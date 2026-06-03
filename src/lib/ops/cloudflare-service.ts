import 'server-only';
import { getDb } from '@/lib/db/client';
import {
  cloudflareZones,
  cloudflarePagesProjects,
  dnsRecords,
  type CloudflareZone,
  type CloudflarePagesProject,
} from '@/lib/db/schema/infra';
import { syncRuns } from '@/lib/db/schema/sync';
import {
  cloudflareConnectivity,
  listCloudflareZones,
  listCloudflarePagesProjects,
  listCloudflareDnsRecords,
} from '@/lib/integrations/cloudflare';
import { eq, inArray, lt, and } from 'drizzle-orm';

export type CloudflareZoneRow = CloudflareZone;
export type CloudflarePagesProjectRow = CloudflarePagesProject;

export async function listStoredCloudflareZones(): Promise<CloudflareZoneRow[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(cloudflareZones);
}

export async function listStoredCloudflarePagesProjects(): Promise<CloudflarePagesProjectRow[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(cloudflarePagesProjects);
}

type SyncResult = {
  ok: boolean;
  itemsSeen: number;
  itemsCreated: number;
  itemsUpdated: number;
  error?: string;
  details?: Record<string, unknown>;
};

export async function syncCloudflare(input: {
  operatorSlug: string | null;
  triggeredBy: 'manual' | 'cron' | 'seed';
}): Promise<SyncResult> {
  const db = getDb();
  if (!db) return { ok: false, itemsSeen: 0, itemsCreated: 0, itemsUpdated: 0, error: 'no_database' };
  const conn = cloudflareConnectivity();
  if (conn.status !== 'connected') {
    await db.insert(syncRuns).values({
      provider: 'cloudflare',
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
      provider: 'cloudflare',
      status: 'running',
      triggeredBy: input.triggeredBy,
      triggeredByOperatorSlug: input.operatorSlug,
    })
    .returning();
  const runId = runRows[0]?.id;
  const startedAt = new Date();

  try {
    const zones = await listCloudflareZones();
    const pages = await listCloudflarePagesProjects();
    let created = 0;
    let updated = 0;
    let seen = 0;

    // --- Zones --------------------------------------------------------------
    const zoneIdsSeen: string[] = [];
    for (const z of zones) {
      seen++;
      zoneIdsSeen.push(z.zoneId);
      const result = await db
        .insert(cloudflareZones)
        .values({
          cfZoneId: z.zoneId,
          name: z.name,
          status: z.status,
          plan: z.plan,
          nameServers: z.nameServers,
          state: 'seen',
          lastSyncedAt: new Date(),
          lastSeenAt: new Date(),
        })
        .onConflictDoUpdate({
          target: cloudflareZones.cfZoneId,
          set: {
            name: z.name,
            status: z.status,
            plan: z.plan,
            nameServers: z.nameServers,
            state: 'seen',
            lastSyncedAt: new Date(),
            lastSeenAt: new Date(),
            updatedAt: new Date(),
          },
        })
        .returning({ id: cloudflareZones.id, createdAt: cloudflareZones.createdAt, updatedAt: cloudflareZones.updatedAt });
      const row = result[0];
      if (row && row.createdAt && row.updatedAt && row.createdAt.getTime() === row.updatedAt.getTime()) created++;
      else if (row) updated++;
    }
    // Mark zones not seen this run as vanished.
    if (zoneIdsSeen.length > 0) {
      await db
        .update(cloudflareZones)
        .set({ state: 'vanished', updatedAt: new Date() })
        .where(
          and(
            lt(cloudflareZones.lastSeenAt, startedAt),
            // not in the seen list
            // drizzle's NOT IN is composed via .notInArray or notInArray
            // but we want IS NULL or older — using lastSeenAt < startedAt covers it.
          ),
        );
    }

    // --- DNS records (per zone) --------------------------------------------
    const allRecordIdsSeen: string[] = [];
    for (const z of zones) {
      const records = await listCloudflareDnsRecords(z.zoneId);
      for (const r of records) {
        seen++;
        allRecordIdsSeen.push(r.recordId);
        const result = await db
          .insert(dnsRecords)
          .values({
            cfRecordId: r.recordId,
            cfZoneId: r.zoneId,
            type: r.type,
            name: r.name,
            content: r.content,
            proxied: r.proxied,
            ttl: r.ttl,
            state: 'seen',
            lastSyncedAt: new Date(),
            lastSeenAt: new Date(),
          })
          .onConflictDoUpdate({
            target: dnsRecords.cfRecordId,
            set: {
              type: r.type,
              name: r.name,
              content: r.content,
              proxied: r.proxied,
              ttl: r.ttl,
              state: 'seen',
              lastSyncedAt: new Date(),
              lastSeenAt: new Date(),
              updatedAt: new Date(),
            },
          })
          .returning({ id: dnsRecords.id, createdAt: dnsRecords.createdAt, updatedAt: dnsRecords.updatedAt });
        const row = result[0];
        if (row && row.createdAt && row.updatedAt && row.createdAt.getTime() === row.updatedAt.getTime()) created++;
        else if (row) updated++;
      }
    }
    // Mark DNS records not seen this run as vanished.
    await db
      .update(dnsRecords)
      .set({ state: 'vanished', updatedAt: new Date() })
      .where(lt(dnsRecords.lastSeenAt, startedAt));

    // --- Pages projects ----------------------------------------------------
    const pagesIdsSeen: string[] = [];
    for (const p of pages) {
      seen++;
      pagesIdsSeen.push(p.projectId);
      const result = await db
        .insert(cloudflarePagesProjects)
        .values({
          cfProjectId: p.projectId,
          name: p.name,
          subdomain: p.subdomain,
          productionBranch: p.productionBranch,
          latestDeploymentStatus: p.latestDeploymentStatus,
          customDomains: p.customDomains,
          state: 'seen',
          lastSyncedAt: new Date(),
          lastSeenAt: new Date(),
        })
        .onConflictDoUpdate({
          target: cloudflarePagesProjects.cfProjectId,
          set: {
            name: p.name,
            subdomain: p.subdomain,
            productionBranch: p.productionBranch,
            latestDeploymentStatus: p.latestDeploymentStatus,
            customDomains: p.customDomains,
            state: 'seen',
            lastSyncedAt: new Date(),
            lastSeenAt: new Date(),
            updatedAt: new Date(),
          },
        })
        .returning({ id: cloudflarePagesProjects.id, createdAt: cloudflarePagesProjects.createdAt, updatedAt: cloudflarePagesProjects.updatedAt });
      const row = result[0];
      if (row && row.createdAt && row.updatedAt && row.createdAt.getTime() === row.updatedAt.getTime()) created++;
      else if (row) updated++;
    }
    // Mark missing pages projects as vanished.
    if (pagesIdsSeen.length > 0) {
      await db
        .update(cloudflarePagesProjects)
        .set({ state: 'vanished', updatedAt: new Date() })
        .where(lt(cloudflarePagesProjects.lastSeenAt, startedAt));
    }

    if (runId) {
      await db
        .update(syncRuns)
        .set({
          status: 'ok',
          finishedAt: new Date(),
          itemsSeen: seen,
          itemsCreated: created,
          itemsUpdated: updated,
          details: {
            zones: zones.length,
            pagesProjects: pages.length,
            recordsSeen: allRecordIdsSeen.length,
          },
        })
        .where(eq(syncRuns.id, runId));
    }
    return { ok: true, itemsSeen: seen, itemsCreated: created, itemsUpdated: updated };
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

// Helper to keep the linter happy if inArray is referenced elsewhere later.
export { inArray };
