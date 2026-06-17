import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';

// Lightweight shared-password gate for the client onboarding questionnaire
// (/q/[token]). Fully separate from the admin/ops session (own cookie + own
// secret) so an invited client can never reach /admin/*. The single shared
// password is held in QUESTIONNAIRE_PASSWORD (e.g. "systems123!").

export const QUESTIONNAIRE_COOKIE_NAME = '2ko_q';
const SESSION_DAYS = 30;
export const QUESTIONNAIRE_SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

function getSecret(): string | null {
  return process.env.QUESTIONNAIRE_PASSWORD ?? null;
}

// Simple string comparison — adequate for a private client-facing link
// gated on a server secret (mirrors validateAdminPassword).
export function validateQuestionnairePassword(input: string): boolean {
  const expected = getSecret();
  if (!expected || !input) return false;
  return input === expected;
}

export function createQuestionnaireToken(): string {
  const secret = getSecret();
  if (!secret) throw new Error('QUESTIONNAIRE_PASSWORD is not configured');
  const exp = Date.now() + QUESTIONNAIRE_SESSION_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyQuestionnaireToken(token: string): boolean {
  try {
    const secret = getSecret();
    if (!secret) return false;
    const dot = token.lastIndexOf('.');
    if (dot < 1) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (sig.length !== expectedSig.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

// Server-side check used by the page and the submit/upload API routes.
export async function isQuestionnaireUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(QUESTIONNAIRE_COOKIE_NAME)?.value;
  return token ? verifyQuestionnaireToken(token) : false;
}
