import 'server-only';
import { getDb } from '@/lib/db/client';
import {
  questionnaireSubmissions,
  type QuestionnaireSubmission,
  type NewQuestionnaireSubmission,
} from '@/lib/db/schema/questionnaires';
import { desc, eq } from 'drizzle-orm';

// Lightweight columns for the list view — never selects the heavy base64 PDF /
// logo blobs (those are only loaded on the detail/download routes).
export type SubmissionListItem = {
  id: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  priceAmount: string | null;
  currency: string | null;
  paymentMethod: string | null;
  status: string;
  emailSent: boolean;
  createdAt: Date;
  hasSla: boolean;
  hasBrief: boolean;
  hasLogo: boolean;
};

export async function insertSubmission(
  data: NewQuestionnaireSubmission,
): Promise<QuestionnaireSubmission | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.insert(questionnaireSubmissions).values(data).returning();
  return rows[0] ?? null;
}

export async function listSubmissions(): Promise<SubmissionListItem[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: questionnaireSubmissions.id,
      businessName: questionnaireSubmissions.businessName,
      contactName: questionnaireSubmissions.contactName,
      contactEmail: questionnaireSubmissions.contactEmail,
      priceAmount: questionnaireSubmissions.priceAmount,
      currency: questionnaireSubmissions.currency,
      paymentMethod: questionnaireSubmissions.paymentMethod,
      status: questionnaireSubmissions.status,
      emailSent: questionnaireSubmissions.emailSent,
      createdAt: questionnaireSubmissions.createdAt,
      slaPdf: questionnaireSubmissions.slaPdf,
      briefPdf: questionnaireSubmissions.briefPdf,
      logoBase64: questionnaireSubmissions.logoBase64,
    })
    .from(questionnaireSubmissions)
    .orderBy(desc(questionnaireSubmissions.createdAt))
    .limit(500);
  return rows.map((r) => ({
    id: r.id,
    businessName: r.businessName,
    contactName: r.contactName,
    contactEmail: r.contactEmail,
    priceAmount: r.priceAmount,
    currency: r.currency,
    paymentMethod: r.paymentMethod,
    status: r.status,
    emailSent: r.emailSent,
    createdAt: r.createdAt,
    hasSla: Boolean(r.slaPdf),
    hasBrief: Boolean(r.briefPdf),
    hasLogo: Boolean(r.logoBase64),
  }));
}

export async function getSubmission(id: string): Promise<QuestionnaireSubmission | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(questionnaireSubmissions)
    .where(eq(questionnaireSubmissions.id, id))
    .limit(1);
  return rows[0] ?? null;
}
