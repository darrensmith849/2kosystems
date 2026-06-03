import 'server-only';
import { getDb } from '@/lib/db/client';
import { hetznerServers, type HetznerServer } from '@/lib/db/schema/infra';
import { syncRuns } from '@/lib/db/schema/sync';
import { hetznerConnectivity, listHetznerServers } from '@/lib/integrations/hetzner';
import { eq, lt } from 'drizzle-orm';

export type HetznerServerRow = HetznerServer;

export async function listStoredHetznerServers(): Promise<HetznerServerRow[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(hetznerServers);
}

export async function syncHetzner(input: {
  operatorSlug: string | null;
  triggeredBy: 'manual' | 'cron' | 'seed';
}): Promise<{ ok: boolean; itemsSeen: number; itemsCreated: number; itemsUpdated: number; error?: string }> {
  const db = getDb();
  if (!db) return { ok: false, itemsSeen: 0, itemsCreated: 0, itemsUpdated: 0, error: 'no_database' };
  const conn = hetznerConnectivity();
  if (conn.status !== 'connected') {
    await db.insert(syncRuns).values({
      provider: 'hetzner',
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
      provider: 'hetzner',
      status: 'running',
      triggeredBy: input.triggeredBy,
      triggeredByOperatorSlug: input.operatorSlug,
    })
    .returning();
  const runId = runRows[0]?.id;
  const startedAt = new Date();

  try {
    const servers = await listHetznerServers();
    let created = 0;
    let updated = 0;
    for (const s of servers) {
      const result = await db
        .insert(hetznerServers)
        .values({
          hzServerId: s.id,
          name: s.name,
          status: s.status,
          serverType: s.serverType,
          location: s.location,
          publicIpv4: s.publicIpv4,
          publicIpv6: s.publicIpv6,
          privateIps: s.privateIps,
          labels: s.labels,
          createdAtCloud: s.createdAt ? new Date(s.createdAt) : null,
          state: 'seen',
          lastSyncedAt: new Date(),
          lastSeenAt: new Date(),
        })
        .onConflictDoUpdate({
          target: hetznerServers.hzServerId,
          set: {
            name: s.name,
            status: s.status,
            serverType: s.serverType,
            location: s.location,
            publicIpv4: s.publicIpv4,
            publicIpv6: s.publicIpv6,
            privateIps: s.privateIps,
            labels: s.labels,
            state: 'seen',
            lastSyncedAt: new Date(),
            lastSeenAt: new Date(),
            updatedAt: new Date(),
          },
        })
        .returning({ id: hetznerServers.id, createdAt: hetznerServers.createdAt, updatedAt: hetznerServers.updatedAt });
      const row = result[0];
      if (row && row.createdAt && row.updatedAt && row.createdAt.getTime() === row.updatedAt.getTime()) created++;
      else if (row) updated++;
    }
    // Mark any servers we didn't see as vanished — never delete.
    await db
      .update(hetznerServers)
      .set({ state: 'vanished', updatedAt: new Date() })
      .where(lt(hetznerServers.lastSeenAt, startedAt));

    if (runId) {
      await db
        .update(syncRuns)
        .set({
          status: 'ok',
          finishedAt: new Date(),
          itemsSeen: servers.length,
          itemsCreated: created,
          itemsUpdated: updated,
        })
        .where(eq(syncRuns.id, runId));
    }
    return { ok: true, itemsSeen: servers.length, itemsCreated: created, itemsUpdated: updated };
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
