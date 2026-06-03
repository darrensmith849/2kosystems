import { pgTable, text, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { assets } from './assets';

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id').references(() => assets.id),
  clientId: uuid('client_id').references(() => clients.id),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  severity: text('severity').notNull().default('minor'), // info | minor | major | critical
  source: text('source').notNull().default('manual'),
  // manual | betterstack | cloudflare | hetzner | vercel
  externalId: text('external_id'),
  summary: text('summary').notNull(),
  rootCause: text('root_cause'),
  clientNotifiedAt: timestamp('client_notified_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  followupRequired: boolean('followup_required').notNull().default(false),
  status: text('status').notNull().default('open'),
  // open | investigating | resolved | postmortem_done
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const uptimeChecks = pgTable('uptime_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id').references(() => assets.id),
  checkUrl: text('check_url').notNull(),
  monitorProvider: text('monitor_provider').notNull().default('manual'),
  // manual | betterstack | other
  monitorExternalId: text('monitor_external_id'),
  currentStatus: text('current_status').notNull().default('unknown'),
  // unknown | up | down | degraded | paused
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
  lastStatusChangeAt: timestamp('last_status_change_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
export type UptimeCheck = typeof uptimeChecks.$inferSelect;
export type NewUptimeCheck = typeof uptimeChecks.$inferInsert;
