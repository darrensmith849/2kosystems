import 'server-only';
import crypto from 'crypto';

// Stateless, tamper-proof questionnaire links — no database.
//
// Format:  <name-slug>~<payloadB64>.<sig>
//   e.g.   virgin-estate-agents~MTIwMHxVU0R8MTc4Njg3NA.Ab3Kf...
//
// The readable slug makes the link recognisable (and pre-fills the company
// name on the form). The compact payload carries only price|currency|expiry,
// HMAC-signed with QUESTIONNAIRE_LINK_SECRET (truncated to 128 bits) so the
// client can't change the price. Payment terms are fixed server-side, so they
// don't need to live in the link. Much shorter than encoding the whole record.

export type QuestionnaireLink = {
  clientName: string; // de-slugified from the path, used to pre-fill the form
  priceAmount: string;
  currency: string;
  exp: number; // ms epoch
};

function getSecret(): string | null {
  return process.env.QUESTIONNAIRE_LINK_SECRET ?? null;
}

export function slugifyClientName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'client';
}

function deslugify(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function sign(slug: string, payloadB64: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${slug}.${payloadB64}`)
    .digest()
    .subarray(0, 16)
    .toString('base64url');
}

export function signQuestionnaireLink(input: {
  clientName: string;
  priceAmount: string;
  currency: string;
  expiresInDays?: number;
}): string {
  const secret = getSecret();
  if (!secret) throw new Error('QUESTIONNAIRE_LINK_SECRET is not configured');
  const slug = slugifyClientName(input.clientName);
  const expSec = Math.floor((Date.now() + (input.expiresInDays ?? 60) * 24 * 60 * 60 * 1000) / 1000);
  const payloadB64 = Buffer.from(`${input.priceAmount}|${input.currency}|${expSec}`).toString('base64url');
  const sig = sign(slug, payloadB64, secret);
  return `${slug}~${payloadB64}.${sig}`;
}

export function verifyQuestionnaireLink(token: string): QuestionnaireLink | null {
  try {
    const secret = getSecret();
    if (!secret) return null;
    const tilde = token.indexOf('~');
    if (tilde < 1) return null;
    const slug = token.slice(0, tilde);
    const rest = token.slice(tilde + 1);
    const dot = rest.lastIndexOf('.');
    if (dot < 1) return null;
    const payloadB64 = rest.slice(0, dot);
    const sig = rest.slice(dot + 1);
    const expected = sign(slug, payloadB64, secret);
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const [priceAmount, currency, expSecStr] = Buffer.from(payloadB64, 'base64url').toString('utf8').split('|');
    const expSec = Number(expSecStr);
    if (!priceAmount || !currency || !expSec || Date.now() > expSec * 1000) return null;
    return { clientName: deslugify(slug), priceAmount, currency, exp: expSec * 1000 };
  } catch {
    return null;
  }
}
