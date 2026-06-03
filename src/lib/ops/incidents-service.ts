import 'server-only';
import { getDb } from '@/lib/db/client';
import { incidents, type Incident, type NewIncident } from '@/lib/db/schema/incidents';
import { assets, type Asset } from '@/lib/db/schema/assets';
import { clients, type Client } from '@/lib/db/schema/clients';
import { eq, desc, and } from 'drizzle-orm';

export type IncidentWithRefs = Incident & { asset: Asset | null; client: Client | null };

export async function listIncidents(opts?: { status?: string }): Promise<IncidentWithRefs[]> {
  const db = getDb();
  if (!db) return [];
  const where = opts?.status ? and(eq(incidents.status, opts.status)) : undefined;
  const base = db
    .select({ incident: incidents, asset: assets, client: clients })
    .from(incidents)
    .leftJoin(assets, eq(assets.id, incidents.assetId))
    .leftJoin(clients, eq(clients.id, incidents.clientId))
    .orderBy(desc(incidents.startedAt));
  const rows = await (where ? base.where(where) : base);
  return rows.map((r) => ({ ...r.incident, asset: r.asset, client: r.client }));
}

export async function getIncident(id: string): Promise<IncidentWithRefs | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select({ incident: incidents, asset: assets, client: clients })
    .from(incidents)
    .leftJoin(assets, eq(assets.id, incidents.assetId))
    .leftJoin(clients, eq(clients.id, incidents.clientId))
    .where(eq(incidents.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return { ...row.incident, asset: row.asset, client: row.client };
}

export async function createIncident(input: NewIncident): Promise<Incident | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.insert(incidents).values(input).returning();
  return rows[0] ?? null;
}

export async function updateIncident(
  id: string,
  patch: Partial<Omit<NewIncident, 'id' | 'createdAt'>>,
): Promise<Incident | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .update(incidents)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(incidents.id, id))
    .returning();
  return rows[0] ?? null;
}
