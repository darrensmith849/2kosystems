import 'server-only';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = '2ko_admin';
const SESSION_HOURS = 8;
const SESSION_MS = SESSION_HOURS * 60 * 60 * 1000;

function getSecret(): string | null {
  return process.env.AGENT_ADMIN_UI_PASSWORD ?? null;
}

// Simple string comparison — adequate for a private internal tool on a server secret
export function validateAdminPassword(input: string): boolean {
  const expected = getSecret();
  if (!expected || !input) return false;
  return input === expected;
}

export function createAdminSessionToken(): string {
  const secret = getSecret();
  if (!secret) throw new Error('AGENT_ADMIN_UI_PASSWORD is not configured');
  const exp = Date.now() + SESSION_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string): boolean {
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
