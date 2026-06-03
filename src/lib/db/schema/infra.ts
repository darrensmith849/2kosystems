import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';
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
  // live | migrated_to_hetzner | dormant | deleted | unknown | vanished
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

// --- Cloudflare (Phase 1B additions) ---------------------------------------

export const cloudflareZones = pgTable('cloudflare_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  cfZoneId: text('cf_zone_id').notNull().unique(),
  name: text('name').notNull(),
  status: text('status'),
  plan: text('plan'),
  nameServers: jsonb('name_servers').$type<string[]>().notNull().default([]),
  domainId: uuid('domain_id').references(() => domains.id),
  state: text('state').notNull().default('seen'), // seen | vanished
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cloudflarePagesProjects = pgTable('cloudflare_pages_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  cfProjectId: text('cf_project_id').notNull().unique(),
  name: text('name').notNull(),
  subdomain: text('subdomain'),
  productionBranch: text('production_branch'),
  latestDeploymentStatus: text('latest_deployment_status'),
  customDomains: jsonb('custom_domains').$type<string[]>().notNull().default([]),
  state: text('state').notNull().default('seen'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const dnsRecords = pgTable('dns_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  cfRecordId: text('cf_record_id').notNull().unique(),
  cfZoneId: text('cf_zone_id').notNull(),
  type: text('type').notNull(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  proxied: boolean('proxied').notNull().default(false),
  ttl: integer('ttl'),
  state: text('state').notNull().default('seen'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- Hetzner (Phase 1B additions) ------------------------------------------

export const hetznerServers = pgTable('hetzner_servers', {
  id: uuid('id').primaryKey().defaultRandom(),
  hzServerId: integer('hz_server_id').notNull().unique(),
  name: text('name').notNull(),
  status: text('status'),
  serverType: text('server_type'),
  location: text('location'),
  publicIpv4: text('public_ipv4'),
  publicIpv6: text('public_ipv6'),
  privateIps: jsonb('private_ips').$type<string[]>().notNull().default([]),
  labels: jsonb('labels').$type<Record<string, string>>().notNull().default({}),
  createdAtCloud: timestamp('created_at_cloud', { withTimezone: true }),
  state: text('state').notNull().default('seen'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
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
export type CloudflareZone = typeof cloudflareZones.$inferSelect;
export type NewCloudflareZone = typeof cloudflareZones.$inferInsert;
export type CloudflarePagesProject = typeof cloudflarePagesProjects.$inferSelect;
export type NewCloudflarePagesProject = typeof cloudflarePagesProjects.$inferInsert;
export type DnsRecord = typeof dnsRecords.$inferSelect;
export type NewDnsRecord = typeof dnsRecords.$inferInsert;
export type HetznerServer = typeof hetznerServers.$inferSelect;
export type NewHetznerServer = typeof hetznerServers.$inferInsert;
