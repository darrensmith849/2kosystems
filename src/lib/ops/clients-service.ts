import 'server-only';
import { getDb } from '@/lib/db/client';
import { clients, contacts, type Client, type NewClient, type Contact } from '@/lib/db/schema/clients';
import { divisions, type Division } from '@/lib/db/schema/divisions';
import { assets, type Asset } from '@/lib/db/schema/assets';
import { eq, isNull, desc, and } from 'drizzle-orm';

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

export async function getClient(id: string): Promise<ClientWithDivision | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select({ client: clients, division: divisions })
    .from(clients)
    .leftJoin(divisions, eq(divisions.id, clients.divisionId))
    .where(eq(clients.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return { ...row.client, division: row.division };
}

export async function listContactsForClient(clientId: string): Promise<Contact[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(contacts)
    .where(and(eq(contacts.clientId, clientId), isNull(contacts.archivedAt)))
    .orderBy(desc(contacts.updatedAt));
}

export async function listAssetsForClient(clientId: string): Promise<Asset[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(assets)
    .where(and(eq(assets.clientId, clientId), isNull(assets.archivedAt)))
    .orderBy(desc(assets.updatedAt));
}
