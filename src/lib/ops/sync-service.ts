import 'server-only';
import { getDb } from '@/lib/db/client';
import { syncRuns, type SyncRun } from '@/lib/db/schema/sync';
import { desc } from 'drizzle-orm';

export async function listRecentSyncRuns(limit = 50): Promise<SyncRun[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(limit);
}
