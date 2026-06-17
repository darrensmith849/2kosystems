import { pgTable, text, timestamp, uuid, boolean, numeric } from 'drizzle-orm/pg-core';

// Client onboarding questionnaire.
//
// `questionnaires` is the per-client LINK an operator generates in the ops
// dashboard. The operator sets the price + currency server-side; the client
// never sees or edits it in the URL. `token` is the unguessable URL slug.
//
// `questionnaireSubmissions` is what the client fills in (one per link). The
// generated SLA PDF is stored as base64 on the submission so the on-page
// download and the emailed copy are byte-identical, and so nothing depends on
// external object storage (keeps the stack portable to Hetzner/Cloudflare).

export const questionnaires = pgTable('questionnaires', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  clientName: text('client_name').notNull(),
  priceAmount: numeric('price_amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('ZAR'),
  paymentTerms: text('payment_terms').notNull().default('50% upfront, 50% on completion'),
  status: text('status').notNull().default('sent'),
  // sent | opened | submitted | revoked | expired
  createdByOperatorSlug: text('created_by_operator_slug'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const questionnaireSubmissions = pgTable('questionnaire_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionnaireId: uuid('questionnaire_id')
    .notNull()
    .references(() => questionnaires.id, { onDelete: 'cascade' }),
  businessName: text('business_name').notNull(),
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  hasExistingWebsite: boolean('has_existing_website'),
  existingWebsiteUrl: text('existing_website_url'),
  businessAim: text('business_aim'), // what the business does / its aim
  siteGoals: text('site_goals'), // what they want from the website
  notes: text('notes'),
  logoBase64: text('logo_base64'), // raw base64 (no data: prefix)
  logoContentType: text('logo_content_type'), // image/png | image/jpeg
  paymentMethod: text('payment_method').notNull(), // cash | eft
  termsAccepted: boolean('terms_accepted').notNull().default(false),
  signedName: text('signed_name').notNull(),
  signedAt: timestamp('signed_at', { withTimezone: true }).notNull().defaultNow(),
  signedIp: text('signed_ip'),
  slaPdf: text('sla_pdf'), // base64 of the generated SLA PDF
  emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Questionnaire = typeof questionnaires.$inferSelect;
export type NewQuestionnaire = typeof questionnaires.$inferInsert;
export type QuestionnaireSubmission = typeof questionnaireSubmissions.$inferSelect;
export type NewQuestionnaireSubmission = typeof questionnaireSubmissions.$inferInsert;
