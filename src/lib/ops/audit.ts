import 'server-only';
import { getDb } from '@/lib/db/client';
import { auditLog } from '@/lib/db/schema/audits';

export type AuditAction =
  | 'create'
  | 'update'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'sync_started'
  | 'sync_finished'
  | 'finding_resolve'
  | 'finding_open'
  | 'settings_change'
  | 'operator_set'
  | 'operator_clear'
  | 'seed_run';

export async function writeAudit(input: {
  operatorSlug: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  diff?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  const db = getDb();
  if (!db) return; // Audit log silently skipped in no-DB mode; routes already 503 for mutations.
  try {
    await db.insert(auditLog).values({
      actorOperatorSlug: input.operatorSlug,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      diff: input.diff ?? {},
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    });
  } catch (err) {
    // Audit failures must never break the calling action.
    console.warn('[audit] write failed', err instanceof Error ? err.message : err);
  }
}
