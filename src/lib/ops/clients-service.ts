import 'server-only';
import { getDb } from '@/lib/db/client';
import { clients, type Client, type NewClient } from '@/lib/db/schema/clients';
import { divisions, type Division } from '@/lib/db/schema/divisions';
import { eq, isNull, desc } from 'drizzle-orm';

export type ClientWithDivision = Client & { division: Division | null };

export async function listClients(): Promise<ClientWithDivision[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({
      client: clients,
      division: divisions,
    })
    .from(clients)
    .leftJoin(divisions, eq(divisions.id, clients.divisionId))
    .where(isNull(clients.archivedAt))
    .orderBy(desc(clients.updatedAt));
  return rows.map((r) => ({ ...r.client, division: r.division }));
}

export async function createClient(input: NewClient): Promise<Client | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.insert(clients).values(input).returning();
  return rows[0] ?? null;
}
