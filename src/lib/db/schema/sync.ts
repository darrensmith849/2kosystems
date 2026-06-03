import { pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';

export const syncRuns = pgTable('sync_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: text('provider').notNull(), // github | vercel | cloudflare | hetzner | inventory_md
  status: text('status').notNull().default('running'), // running | ok | partial | failed | skipped
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  triggeredBy: text('triggered_by'), // cron | manual | seed
  triggeredByOperatorSlug: text('triggered_by_operator_slug'),
  itemsSeen: integer('items_seen').notNull().default(0),
  itemsCreated: integer('items_created').notNull().default(0),
  itemsUpdated: integer('items_updated').notNull().default(0),
  itemsSkipped: integer('items_skipped').notNull().default(0),
  errorMessage: text('error_message'),
  details: jsonb('details').$type<Record<string, unknown>>().notNull().default({}),
});

export type SyncRun = typeof syncRuns.$inferSelect;
export type NewSyncRun = typeof syncRuns.$inferInsert;
