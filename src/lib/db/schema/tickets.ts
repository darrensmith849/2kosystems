import { pgTable, text, timestamp, uuid, jsonb, boolean, integer } from 'drizzle-orm/pg-core';
import { operators } from './divisions';
import { clients, contacts } from './clients';
import { assets } from './assets';

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id),
  assetId: uuid('asset_id').references(() => assets.id),
  kind: text('kind').notNull(),
  // support | bug | change_request | content_update | emergency | billing
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('new'),
  // new | triage | waiting_client | in_progress | blocked | review | completed | archived
  priority: text('priority').notNull().default('med'), // low | med | high | urgent
  assigneeOperatorId: uuid('assignee_operator_id').references(() => operators.id),
  submittedByContactId: uuid('submitted_by_contact_id').references(() => contacts.id),
  dueAt: timestamp('due_at', { withTimezone: true }),
  timeLoggedMinutes: integer('time_logged_minutes').notNull().default(0),
  billingStatus: text('billing_status').notNull().default('included'),
  // included | billable | quoted | approved | invoiced
  emailRefs: jsonb('email_refs').$type<string[]>().notNull().default([]),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const ticketComments = pgTable('ticket_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  authorOperatorSlug: text('author_operator_slug'),
  body: text('body').notNull(),
  internal: boolean('internal').notNull().default(true),
  attachments: jsonb('attachments').$type<Record<string, unknown>[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketComment = typeof ticketComments.$inferSelect;
export type NewTicketComment = typeof ticketComments.$inferInsert;
