import 'server-only';
import { getDb } from '@/lib/db/client';
import { operators, type Operator } from '@/lib/db/schema/divisions';
import { eq } from 'drizzle-orm';

export async function listOperators(): Promise<Operator[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(operators).where(eq(operators.isActive, true));
}

export async function findOperatorBySlug(slug: string): Promise<Operator | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(operators).where(eq(operators.slug, slug));
  return rows[0] ?? null;
}

export async function createOperator(input: { slug: string; displayName: string; email?: string | null }): Promise<Operator | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .insert(operators)
    .values({ slug: input.slug, displayName: input.displayName, email: input.email ?? null })
    .onConflictDoNothing({ target: operators.slug })
    .returning();
  return rows[0] ?? (await findOperatorBySlug(input.slug));
}
