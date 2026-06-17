import 'server-only';
import crypto from 'crypto';
import { getDb } from '@/lib/db/client';
import {
  questionnaires,
  questionnaireSubmissions,
  type Questionnaire,
  type QuestionnaireSubmission,
  type NewQuestionnaireSubmission,
} from '@/lib/db/schema/questionnaires';
import { eq, desc } from 'drizzle-orm';

export type QuestionnaireStatus = 'sent' | 'opened' | 'submitted' | 'revoked' | 'expired';

export function generateQuestionnaireTokenSlug(): string {
  return crypto.randomBytes(16).toString('base64url');
}

export async function listQuestionnaires(): Promise<Questionnaire[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(questionnaires).orderBy(desc(questionnaires.createdAt));
}

export async function createQuestionnaire(input: {
  clientName: string;
  priceAmount: string; // numeric is read/written as a string by drizzle
  currency: string;
  paymentTerms?: string;
  createdByOperatorSlug?: string | null;
  expiresAt?: Date | null;
}): Promise<Questionnaire | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .insert(questionnaires)
    .values({
      token: generateQuestionnaireTokenSlug(),
      clientName: input.clientName,
      priceAmount: input.priceAmount,
      currency: input.currency,
      paymentTerms: input.paymentTerms ?? undefined,
      createdByOperatorSlug: input.createdByOperatorSlug ?? null,
      expiresAt: input.expiresAt ?? null,
    })
    .returning();
  return rows[0] ?? null;
}

export async function getQuestionnaireById(id: string): Promise<Questionnaire | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(questionnaires).where(eq(questionnaires.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getQuestionnaireByToken(token: string): Promise<Questionnaire | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(questionnaires).where(eq(questionnaires.token, token)).limit(1);
  return rows[0] ?? null;
}

// Bumps `sent` -> `opened` when the client first loads the form. Never moves a
// link backwards or out of a terminal state (submitted/revoked/expired).
export async function markQuestionnaireOpened(id: string, current: string): Promise<void> {
  const db = getDb();
  if (!db || current !== 'sent') return;
  await db
    .update(questionnaires)
    .set({ status: 'opened', updatedAt: new Date() })
    .where(eq(questionnaires.id, id));
}

export async function revokeQuestionnaire(id: string): Promise<Questionnaire | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .update(questionnaires)
    .set({ status: 'revoked', archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(questionnaires.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function getSubmissionForQuestionnaire(
  questionnaireId: string,
): Promise<QuestionnaireSubmission | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(questionnaireSubmissions)
    .where(eq(questionnaireSubmissions.questionnaireId, questionnaireId))
    .orderBy(desc(questionnaireSubmissions.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertSubmission(
  input: NewQuestionnaireSubmission,
): Promise<QuestionnaireSubmission | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.insert(questionnaireSubmissions).values(input).returning();
  return rows[0] ?? null;
}

export async function markQuestionnaireSubmitted(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(questionnaires)
    .set({ status: 'submitted', updatedAt: new Date() })
    .where(eq(questionnaires.id, id));
}

export async function attachSlaToSubmission(
  submissionId: string,
  slaPdfBase64: string,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(questionnaireSubmissions)
    .set({ slaPdf: slaPdfBase64 })
    .where(eq(questionnaireSubmissions.id, submissionId));
}

export async function markSubmissionEmailed(submissionId: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(questionnaireSubmissions)
    .set({ emailSentAt: new Date() })
    .where(eq(questionnaireSubmissions.id, submissionId));
}
