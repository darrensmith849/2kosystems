import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Single source of truth for whether the dashboard has a live DB connection.
// All db-touching code calls `getDb()`; if it returns null, callers MUST treat
// the dashboard as running in "no-database" mode and return appropriate
// "Database not connected" responses to the UI.

export type Db = PostgresJsDatabase<typeof schema>;

let cachedClient: postgres.Sql | null = null;
let cachedDb: Db | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Db | null {
  if (!isDbConfigured()) return null;
  if (cachedDb) return cachedDb;
  const url = process.env.DATABASE_URL!;
  cachedClient = postgres(url, {
    max: 5,
    idle_timeout: 20,
    prepare: false,
  });
  cachedDb = drizzle(cachedClient, { schema });
  return cachedDb;
}

export async function pingDb(): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: 'DATABASE_URL not set' };
  try {
    await cachedClient!`select 1`;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export { schema };
