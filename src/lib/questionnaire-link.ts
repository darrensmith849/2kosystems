import 'server-only';
import crypto from 'crypto';

// Stateless, tamper-proof questionnaire links — no database.
//
// Format:  <name-slug>~<cents>.<currency>.<expDays>.<sig>
//   e.g.   virgin-estate-agents~120000.USD.20620.Ab3xK9dQ1m
//
// The readable slug makes the link recognisable (and pre-fills the company
// name). The price (in cents — it's already shown on the form, so not secret),
// currency and day-granular expiry are plain and compact. A truncated HMAC
// (QUESTIONNAIRE_LINK_SECRET) signs the lot so the client can't change the
// price. Payment terms are fixed server-side. Kept deliberately short.

const SIG_BYTES = 10; // 80-bit truncated HMAC — infeasible to forge, compact
const DAY_MS = 24 * 60 * 60 * 1000;

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

function sign(message: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest().subarray(0, SIG_BYTES).toString('base64url');
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
  const cents = Math.round(parseFloat(input.priceAmount) * 100);
  const currency = input.currency.toUpperCase();
  const expDays = Math.floor((Date.now() + (input.expiresInDays ?? 60) * DAY_MS) / DAY_MS);
  const message = `${slug}.${cents}.${currency}.${expDays}`;
  return `${slug}~${cents}.${currency}.${expDays}.${sign(message, secret)}`;
}

export function verifyQuestionnaireLink(token: string): QuestionnaireLink | null {
  try {
    const secret = getSecret();
    if (!secret) return null;
    const tilde = token.indexOf('~');
    if (tilde < 1) return null;
    const slug = token.slice(0, tilde);
    const parts = token.slice(tilde + 1).split('.');
    if (parts.length !== 4) return null;
    const [centsStr, currency, expDaysStr, sig] = parts;
    const expected = sign(`${slug}.${centsStr}.${currency}.${expDaysStr}`, secret);
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const cents = Number(centsStr);
    const expDays = Number(expDaysStr);
    if (!Number.isFinite(cents) || cents < 0 || !currency || !Number.isFinite(expDays)) return null;
    if (Date.now() > expDays * DAY_MS) return null;
    return { clientName: deslugify(slug), priceAmount: (cents / 100).toFixed(2), currency, exp: expDays * DAY_MS };
  } catch {
    return null;
  }
}
