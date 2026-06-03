import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { divisions } from './divisions';

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  divisionId: uuid('division_id').references(() => divisions.id),
  name: text('name').notNull(),
  legalName: text('legal_name'),
  status: text('status').notNull().default('active'), // lead | active | paused | archived | former
  since: timestamp('since', { withTimezone: true }),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  role: text('role'), // billing | technical | exec | other
  email: text('email'),
  phone: text('phone'),
  isPrimary: text('is_primary').notNull().default('false'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
