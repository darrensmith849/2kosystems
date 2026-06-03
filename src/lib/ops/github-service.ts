import 'server-only';
import { getDb } from '@/lib/db/client';
import { githubRepos, type GithubRepo } from '@/lib/db/schema/infra';
import { syncRuns } from '@/lib/db/schema/sync';
import { listGithubRepos, classifyRepo, githubConnectivity } from '@/lib/integrations/github';
import { eq, sql } from 'drizzle-orm';

export type GithubRepoRow = GithubRepo;

export async function listStoredGithubRepos(): Promise<GithubRepoRow[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(githubRepos);
}

export async function syncGithubRepos(input: {
  owner: string;
  operatorSlug: string | null;
  triggeredBy: 'manual' | 'cron' | 'seed';
}): Promise<{ ok: boolean; itemsSeen: number; itemsCreated: number; itemsUpdated: number; error?: string }> {
  const db = getDb();
  if (!db) return { ok: false, itemsSeen: 0, itemsCreated: 0, itemsUpdated: 0, error: 'no_database' };
  const conn = githubConnectivity();
  if (conn.status !== 'connected') {
    await db.insert(syncRuns).values({
      provider: 'github',
      status: 'skipped',
      triggeredBy: input.triggeredBy,
      triggeredByOperatorSlug: input.operatorSlug,
      finishedAt: new Date(),
      details: { reason: conn.reason, detail: conn.detail },
    });
    return { ok: false, itemsSeen: 0, itemsCreated: 0, itemsUpdated: 0, error: conn.reason };
  }

  const runRows = await db
    .insert(syncRuns)
    .values({
      provider: 'github',
      status: 'running',
      triggeredBy: input.triggeredBy,
      triggeredByOperatorSlug: input.operatorSlug,
    })
    .returning();
  const runId = runRows[0]?.id;

  try {
    const repos = await listGithubRepos(input.owner);
    let created = 0;
    let updated = 0;
    for (const r of repos) {
      const category = classifyRepo(r.name, r.topics);
      const result = await db
        .insert(githubRepos)
        .values({
          owner: r.owner,
          name: r.name,
          visibility: r.visibility,
          defaultBranch: r.defaultBranch,
          description: r.description,
          language: r.language,
          topics: r.topics,
          pushedAt: r.pushedAt ? new Date(r.pushedAt) : null,
          isArchived: r.isArchived,
          isFork: r.isFork,
          category,
          lastSyncedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [githubRepos.owner, githubRepos.name],
          set: {
            visibility: r.visibility,
            defaultBranch: r.defaultBranch,
            description: r.description,
            language: r.language,
            topics: r.topics,
            pushedAt: r.pushedAt ? new Date(r.pushedAt) : null,
            isArchived: r.isArchived,
            isFork: r.isFork,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
            // Do not overwrite category if operator has already classified it.
            category: sql`coalesce(${githubRepos.category}, excluded.category)`,
          },
        })
        .returning({ id: githubRepos.id, updatedAt: githubRepos.updatedAt, createdAt: githubRepos.createdAt });
      const row = result[0];
      if (row && row.createdAt && row.updatedAt && row.createdAt.getTime() === row.updatedAt.getTime()) {
        created++;
      } else if (row) {
        updated++;
      }
    }
    if (runId) {
      await db
        .update(syncRuns)
        .set({
          status: 'ok',
          finishedAt: new Date(),
          itemsSeen: repos.length,
          itemsCreated: created,
          itemsUpdated: updated,
        })
        .where(eq(syncRuns.id, runId));
    }
    return { ok: true, itemsSeen: repos.length, itemsCreated: created, itemsUpdated: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (runId) {
      await db
        .update(syncRuns)
        .set({ status: 'failed', finishedAt: new Date(), errorMessage: message.slice(0, 500) })
        .where(eq(syncRuns.id, runId));
    }
    return { ok: false, itemsSeen: 0, itemsCreated: 0, itemsUpdated: 0, error: message };
  }
}
