import 'server-only';
import { getDb } from '@/lib/db/client';
import { renewals, type Renewal, type NewRenewal } from '@/lib/db/schema/renewals';
import { clients, type Client } from '@/lib/db/schema/clients';
import { domains, type Domain } from '@/lib/db/schema/infra';
import { and, asc, eq, lte, isNull } from 'drizzle-orm';
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

export async function listRenewalsForClient(clientId: string): Promise<RenewalWithRefs[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ renewal: renewals, client: clients })
    .from(renewals)
    .leftJoin(clients, eq(clients.id, renewals.clientId))
    .where(eq(renewals.clientId, clientId))
    .orderBy(asc(renewals.nextDueAt));
  return rows.map((r) => ({ ...r.renewal, client: r.client }));
}

export async function listRenewalsForSubject(
  subjectType: string,
  subjectId: string,
): Promise<RenewalWithRefs[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ renewal: renewals, client: clients })
    .from(renewals)
    .leftJoin(clients, eq(clients.id, renewals.clientId))
    .where(and(eq(renewals.subjectType, subjectType), eq(renewals.subjectId, subjectId)))
    .orderBy(asc(renewals.nextDueAt));
  return rows.map((r) => ({ ...r.renewal, client: r.client }));
}

export async function countRenewalsByWindow(): Promise<Record<RenewalWindow, number>> {
  const empty: Record<RenewalWindow, number> = {
    overdue: 0,
    due: 0,
    within_7: 0,
    within_14: 0,
    within_30: 0,
    within_60: 0,
    future: 0,
  };
  const db = getDb();
  if (!db) return empty;
  const rows = await listRenewals(undefined);
  for (const r of rows) {
    const w = computeRenewalWindow(r.nextDueAt);
    empty[w] += 1;
  }
  return empty;
}

/**
 * Lightweight domain picker — id + name only, for subject pickers.
 * Excludes archived rows.
 */
export async function listDomainOptions(): Promise<Pick<Domain, 'id' | 'name'>[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ id: domains.id, name: domains.name })
    .from(domains)
    .where(isNull(domains.archivedAt))
    .orderBy(asc(domains.name));
  return rows;
}
