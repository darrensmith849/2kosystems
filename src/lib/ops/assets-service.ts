import 'server-only';
import { getDb } from '@/lib/db/client';
import { assets, type Asset, type NewAsset } from '@/lib/db/schema/assets';
import { clients, type Client } from '@/lib/db/schema/clients';
import { divisions, type Division } from '@/lib/db/schema/divisions';
import { eq, isNull, desc } from 'drizzle-orm';

export type AssetWithRefs = Asset & { client: Client | null; division: Division | null };

export async function listAssets(): Promise<AssetWithRefs[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ asset: assets, client: clients, division: divisions })
    .from(assets)
    .leftJoin(clients, eq(clients.id, assets.clientId))
    .leftJoin(divisions, eq(divisions.id, assets.divisionId))
    .where(isNull(assets.archivedAt))
    .orderBy(desc(assets.updatedAt));
  return rows.map((r) => ({ ...r.asset, client: r.client, division: r.division }));
}

export async function createAsset(input: NewAsset): Promise<Asset | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.insert(assets).values(input).returning();
  return rows[0] ?? null;
}
