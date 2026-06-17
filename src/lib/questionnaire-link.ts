import 'server-only';
import crypto from 'crypto';

// Stateless, tamper-proof questionnaire links — no database required.
//
// An operator generates a link by HMAC-signing the client name + price +
// currency + terms into the URL token. The /q/[token] page and the submit
// route verify the signature, so the client cannot change the price (any edit
// breaks the signature). Signed with QUESTIONNAIRE_LINK_SECRET, which only the
// server knows — deliberately NOT the client-facing gate password.

export type QuestionnaireLink = {
  clientName: string;
  priceAmount: string; // kept as a string, e.g. "15000.00"
  currency: string;
  paymentTerms: string;
  exp: number; // ms epoch expiry
};

function getSecret(): string | null {
  return process.env.QUESTIONNAIRE_LINK_SECRET ?? null;
}

export function signQuestionnaireLink(input: {
  clientName: string;
  priceAmount: string;
  currency: string;
  paymentTerms: string;
  expiresInDays?: number;
}): string {
  const secret = getSecret();
  if (!secret) throw new Error('QUESTIONNAIRE_LINK_SECRET is not configured');
  const payload: QuestionnaireLink = {
    clientName: input.clientName,
    priceAmount: input.priceAmount,
    currency: input.currency,
    paymentTerms: input.paymentTerms,
    exp: Date.now() + (input.expiresInDays ?? 60) * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyQuestionnaireLink(token: string): QuestionnaireLink | null {
  try {
    const secret = getSecret();
    if (!secret) return null;
    const dot = token.lastIndexOf('.');
    if (dot < 1) return null;
    const body = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as QuestionnaireLink;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    if (!payload.clientName || !payload.priceAmount || !payload.currency) return null;
    return payload;
  } catch {
    return null;
  }
}
