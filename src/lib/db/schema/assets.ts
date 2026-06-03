import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { divisions, operators } from './divisions';
import { clients } from './clients';

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id),
  divisionId: uuid('division_id').references(() => divisions.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // website | saas_app | portal | api | landing | internal_tool | database | service
  liveUrl: text('live_url'),
  stagingUrl: text('staging_url'),
  techStack: jsonb('tech_stack').$type<string[]>().notNull().default([]),
  responsibleOperatorId: uuid('responsible_operator_id').references(() => operators.id),
  environment: text('environment').notNull().default('production'), // production | staging | demo | test
  status: text('status').notNull().default('active'), // active | sunset | dormant
  lastDeployedAt: timestamp('last_deployed_at', { withTimezone: true }),
  lastAuditedAt: timestamp('last_audited_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const assetLinks = pgTable('asset_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id').notNull().references(() => assets.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // cloudflare_zone | cloudflare_pages | vercel_project | hetzner_server | domain | repo
  externalRef: text('external_ref').notNull(), // ID or slug of the linked thing
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type AssetLink = typeof assetLinks.$inferSelect;
export type NewAssetLink = typeof assetLinks.$inferInsert;
