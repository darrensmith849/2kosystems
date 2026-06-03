import { pgTable, text, timestamp, uuid, jsonb, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { divisions } from './divisions';
import { clients } from './clients';

export const githubRepos = pgTable('github_repos', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner: text('owner').notNull(),
  name: text('name').notNull(),
  visibility: text('visibility').notNull().default('private'),
  defaultBranch: text('default_branch').notNull().default('main'),
  description: text('description'),
  language: text('language'),
  topics: jsonb('topics').$type<string[]>().notNull().default([]),
  pushedAt: timestamp('pushed_at', { withTimezone: true }),
  isArchived: boolean('is_archived').notNull().default(false),
  isFork: boolean('is_fork').notNull().default(false),
  category: text('category').notNull().default('unknown_unmapped'),
  // 2ko_africa | 2ko_systems | six_sigma | sigmaphi_portal | sigmaphi_stats |
  // shared_internal | external_client | personal_excluded | legacy_stale | unknown_unmapped
  divisionId: uuid('division_id').references(() => divisions.id),
  clientId: uuid('client_id').references(() => clients.id),
  notes: text('notes'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  ownerNameUnique: uniqueIndex('github_repos_owner_name_uniq').on(t.owner, t.name),
}));

export const vercelTeams = pgTable('vercel_teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const vercelProjects = pgTable('vercel_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => vercelTeams.id),
  teamSlug: text('team_slug').notNull(),
  vercelProjectId: text('vercel_project_id'),
  name: text('name').notNull(),
  framework: text('framework'),
  productionUrl: text('production_url'),
  latestDeploymentStatus: text('latest_deployment_status'),
  linkedRepo: text('linked_repo'),
  nodeVersion: text('node_version'),
  state: text('state').notNull().default('unknown'),
  // live | migrated_to_hetzner | dormant | deleted | unknown
  notes: text('notes'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  teamNameUnique: uniqueIndex('vercel_projects_team_name_uniq').on(t.teamSlug, t.name),
}));

export const domains = pgTable('domains', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  registrar: text('registrar'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  autoRenew: boolean('auto_renew'),
  dnssec: boolean('dnssec'),
  clientId: uuid('client_id').references(() => clients.id),
  divisionId: uuid('division_id').references(() => divisions.id),
  cloudflareZoneId: text('cloudflare_zone_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const integrationStatus = pgTable('integration_status', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: text('provider').notNull().unique(),
  // cloudflare | hetzner | vercel | github | betterstack | brevo
  isConfigured: boolean('is_configured').notNull().default(false),
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
  lastOkAt: timestamp('last_ok_at', { withTimezone: true }),
  lastError: text('last_error'),
  details: jsonb('details').$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type GithubRepo = typeof githubRepos.$inferSelect;
export type NewGithubRepo = typeof githubRepos.$inferInsert;
export type VercelTeam = typeof vercelTeams.$inferSelect;
export type VercelProject = typeof vercelProjects.$inferSelect;
export type NewVercelProject = typeof vercelProjects.$inferInsert;
export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;
export type IntegrationStatus = typeof integrationStatus.$inferSelect;
