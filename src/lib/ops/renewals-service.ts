import 'server-only';
import { getDb } from '@/lib/db/client';
import { renewals, type Renewal, type NewRenewal } from '@/lib/db/schema/renewals';
import { clients, type Client } from '@/lib/db/schema/clients';
import { and, asc, eq, lte } from 'drizzle-orm';
import { computeRenewalWindow, type RenewalWindow, type ReminderState } from './renewals-window';

export type RenewalWithRefs = Renewal & { client: Client | null };

// Re-export pure helpers from the client-safe module so existing server-side
// imports of these names from '@/lib/ops/renewals-service' keep working.
export { computeRenewalWindow };
export type { RenewalWindow, ReminderState };

const DAY_MS = 86_400_000;

export async function listRenewals(opts?: { windowDays?: number }): Promise<RenewalWithRefs[]> {
  const db = getDb();
  if (!db) return [];
  const baseSelect = db
    .select({ renewal: renewals, client: clients })
    .from(renewals)
    .leftJoin(clients, eq(clients.id, renewals.clientId));

  const rows = opts?.windowDays !== undefined
    ? await baseSelect
        .where(and(lte(renewals.nextDueAt, new Date(Date.now() + opts.windowDays * DAY_MS))))
        .orderBy(asc(renewals.nextDueAt))
    : await baseSelect.orderBy(asc(renewals.nextDueAt));

  return rows.map((r) => ({ ...r.renewal, client: r.client }));
}

export async function createRenewal(input: NewRenewal): Promise<Renewal | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.insert(renewals).values(input).returning();
  return rows[0] ?? null;
}

export async function updateRenewal(
  id: string,
  patch: Partial<NewRenewal>,
): Promise<Renewal | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .update(renewals)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(renewals.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function markReminded(
  id: string,
  reminderState: ReminderState,
): Promise<Renewal | null> {
  const db = getDb();
  if (!db) return null;
  const now = new Date();
  const rows = await db
    .update(renewals)
    .set({
      lastRemindedAt: now,
      reminderState,
      updatedAt: now,
    })
    .where(eq(renewals.id, id))
    .returning();
  return rows[0] ?? null;
}

// computeRenewalWindow is implemented in renewals-window.ts (client-safe) and
// re-exported above so this file remains the canonical service import path.
