import { pgTable, text, timestamp, uuid, jsonb, boolean, numeric } from 'drizzle-orm/pg-core';
import { operators } from './divisions';
import { clients } from './clients';

export const renewals = pgTable('renewals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g. "Domain: sigmafy.co"
  kind: text('kind').notNull(),
  // domain | hosting | ssl | saas | client_retainer | supplier_subscription
  subjectType: text('subject_type'), // asset | domain | service | client
  subjectId: uuid('subject_id'), // polymorphic — no FK constraint
  clientId: uuid('client_id').references(() => clients.id),
  amount: numeric('amount', { precision: 12, scale: 2 }),
  currency: text('currency').notNull().default('ZAR'),
  period: text('period'), // monthly | annual | one_off
  nextDueAt: timestamp('next_due_at', { withTimezone: true }).notNull(),
  autoRenew: boolean('auto_renew'),
  responsibleOperatorId: uuid('responsible_operator_id').references(() => operators.id),
  lastRemindedAt: timestamp('last_reminded_at', { withTimezone: true }),
  reminderState: text('reminder_state').notNull().default('none'),
  // none | notified_60 | notified_30 | notified_14 | notified_7 | due | overdue
  externalLink: text('external_link'),
  notes: text('notes'),
  emailRefs: jsonb('email_refs').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export type Renewal = typeof renewals.$inferSelect;
export type NewRenewal = typeof renewals.$inferInsert;
