import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { operators } from './divisions';

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorOperatorSlug: text('actor_operator_slug'),
  actorOperatorId: uuid('actor_operator_id').references(() => operators.id),
  action: text('action').notNull(), // create | update | archive | sync | settings_change | ...
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  diff: jsonb('diff').$type<Record<string, unknown>>().notNull().default({}),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditFindings = pgTable('audit_findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: text('kind').notNull(), // dns | cloudflare | hetzner | vercel | ssl | backup | renewal | access | client_asset | uptime | repo_health | operational
  severity: text('severity').notNull().default('info'), // info | low | med | high | critical
  entityType: text('entity_type'),
  entityRef: text('entity_ref'),
  title: text('title').notNull(),
  detail: text('detail'),
  status: text('status').notNull().default('open'), // open | acknowledged | resolved | wontfix
  source: text('source').notNull().default('manual'), // manual | seed | sync | audit_run
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolvedByOperatorId: uuid('resolved_by_operator_id').references(() => operators.id),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
export type AuditFinding = typeof auditFindings.$inferSelect;
export type NewAuditFinding = typeof auditFindings.$inferInsert;
