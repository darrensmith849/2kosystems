import { pgTable, text, timestamp, uuid, boolean, numeric } from 'drizzle-orm/pg-core';

// Stored record of every completed questionnaire.
//
// The live flow uses stateless signed links (no per-link parent row), so this
// is a flat, standalone log of each submission — for the private team tracking
// dashboard. Writing here is OPTIONAL: rows are only inserted when DATABASE_URL
// is configured. The questionnaire + email work with or without a database.

export const questionnaireSubmissions = pgTable('questionnaire_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Commercials carried by the signed link
  clientName: text('client_name'), // de-slugified company name embedded in the link
  priceAmount: numeric('price_amount', { precision: 12, scale: 2 }),
  currency: text('currency'),
  paymentTerms: text('payment_terms'),
  paymentMethod: text('payment_method'), // cash | eft

  // What the client entered on the form
  businessName: text('business_name').notNull(),
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  physicalAddress: text('physical_address'),
  businessType: text('business_type'),
  offering: text('offering'),
  catalogueSize: text('catalogue_size'),
  businessAim: text('business_aim'),
  hasExistingWebsite: boolean('has_existing_website'),
  existingWebsiteUrl: text('existing_website_url'),
  siteGoals: text('site_goals'),
  notes: text('notes'),
  startDate: text('start_date'),
  finishDate: text('finish_date'),

  // Assets + generated documents (base64)
  logoBase64: text('logo_base64'),
  logoContentType: text('logo_content_type'),
  slaPdf: text('sla_pdf'),
  briefPdf: text('brief_pdf'),

  // Signature
  signedName: text('signed_name'),
  signedIdNumber: text('signed_id_number'),
  signedAt: timestamp('signed_at', { withTimezone: true }),
  signedIp: text('signed_ip'),

  emailSent: boolean('email_sent').notNull().default(false),
  status: text('status').notNull().default('submitted'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type QuestionnaireSubmission = typeof questionnaireSubmissions.$inferSelect;
export type NewQuestionnaireSubmission = typeof questionnaireSubmissions.$inferInsert;
