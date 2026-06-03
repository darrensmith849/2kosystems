import 'server-only';
import { getDb } from '@/lib/db/client';
import {
  tickets,
  ticketComments,
  type Ticket,
  type NewTicket,
  type TicketComment,
  type NewTicketComment,
} from '@/lib/db/schema/tickets';
import { clients, type Client } from '@/lib/db/schema/clients';
import { assets, type Asset } from '@/lib/db/schema/assets';
import { and, asc, desc, eq, notInArray } from 'drizzle-orm';

export type TicketWithRefs = Ticket & { client: Client | null; asset: Asset | null };

export async function listTickets(opts?: { status?: string }): Promise<TicketWithRefs[]> {
  const db = getDb();
  if (!db) return [];
  const where = opts?.status ? and(eq(tickets.status, opts.status)) : undefined;
  const base = db
    .select({ ticket: tickets, client: clients, asset: assets })
    .from(tickets)
    .leftJoin(clients, eq(clients.id, tickets.clientId))
    .leftJoin(assets, eq(assets.id, tickets.assetId))
    .orderBy(desc(tickets.updatedAt));
  const rows = where ? await base.where(where) : await base;
  return rows.map((r) => ({ ...r.ticket, client: r.client, asset: r.asset }));
}

export async function getTicket(id: string): Promise<TicketWithRefs | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select({ ticket: tickets, client: clients, asset: assets })
    .from(tickets)
    .leftJoin(clients, eq(clients.id, tickets.clientId))
    .leftJoin(assets, eq(assets.id, tickets.assetId))
    .where(eq(tickets.id, id))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  return { ...r.ticket, client: r.client, asset: r.asset };
}

export async function createTicket(input: NewTicket): Promise<Ticket | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.insert(tickets).values(input).returning();
  return rows[0] ?? null;
}

export async function updateTicket(id: string, patch: Partial<NewTicket>): Promise<Ticket | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .update(tickets)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(tickets.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function listComments(ticketId: string): Promise<TicketComment[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(ticketComments)
    .where(eq(ticketComments.ticketId, ticketId))
    .orderBy(asc(ticketComments.createdAt));
}

export async function addComment(input: NewTicketComment): Promise<TicketComment | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.insert(ticketComments).values(input).returning();
  return rows[0] ?? null;
}

export async function listTicketsForClient(clientId: string): Promise<TicketWithRefs[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ ticket: tickets, client: clients, asset: assets })
    .from(tickets)
    .leftJoin(clients, eq(clients.id, tickets.clientId))
    .leftJoin(assets, eq(assets.id, tickets.assetId))
    .where(eq(tickets.clientId, clientId))
    .orderBy(desc(tickets.updatedAt));
  return rows.map((r) => ({ ...r.ticket, client: r.client, asset: r.asset }));
}

export async function listTicketsForAsset(assetId: string): Promise<TicketWithRefs[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ ticket: tickets, client: clients, asset: assets })
    .from(tickets)
    .leftJoin(clients, eq(clients.id, tickets.clientId))
    .leftJoin(assets, eq(assets.id, tickets.assetId))
    .where(eq(tickets.assetId, assetId))
    .orderBy(desc(tickets.updatedAt));
  return rows.map((r) => ({ ...r.ticket, client: r.client, asset: r.asset }));
}

const CLOSED_STATUSES = ['completed', 'archived'];

export async function countOpenTickets(): Promise<{ total: number; byPriority: Record<string, number> }> {
  const db = getDb();
  const byPriority: Record<string, number> = { urgent: 0, high: 0, med: 0, low: 0 };
  if (!db) return { total: 0, byPriority };
  const rows = await db
    .select({ priority: tickets.priority })
    .from(tickets)
    .where(notInArray(tickets.status, CLOSED_STATUSES));
  let total = 0;
  for (const r of rows) {
    total += 1;
    byPriority[r.priority] = (byPriority[r.priority] ?? 0) + 1;
  }
  return { total, byPriority };
}
