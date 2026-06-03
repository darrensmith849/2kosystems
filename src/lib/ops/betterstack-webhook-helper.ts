import 'server-only';
import crypto from 'node:crypto';

/**
 * BetterStack webhook helpers.
 *
 * Verification + payload-parsing utilities used by
 * src/app/api/admin/ops/webhooks/betterstack/route.ts. Kept in a separate
 * module so the route stays small and the verify logic is unit-testable
 * in isolation.
 *
 * Secrets are NEVER logged or returned. Comparisons are timing-safe.
 */

/**
 * Verify an HMAC-SHA256 signature from BetterStack.
 *
 * @param rawBody The exact raw request body bytes (the string from
 *   `request.text()`). Re-stringifying parsed JSON would produce a
 *   different byte sequence and the signature would not match.
 * @param signatureHeader The value of `X-BetterStack-Signature`. May be
 *   `null` if the header is missing — in which case we return false.
 * @param secret The shared secret (the value of
 *   `process.env.BETTERSTACK_WEBHOOK_SECRET`). Never logged.
 * @returns true if the signature matches, false otherwise (including any
 *   error path).
 */
export function verifyBetterStackSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  try {
    // BetterStack documents the signature as a hex-encoded HMAC-SHA256.
    // Some integrations prefix the value (e.g. "sha256="). Strip a known
    // prefix if present so we accept both forms.
    const provided = signatureHeader.startsWith('sha256=')
      ? signatureHeader.slice(7)
      : signatureHeader;

    const expectedHex = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    // timingSafeEqual requires equal-length Buffers; bail early when the
    // lengths differ to avoid a throw (and obviously also to fail the
    // verification).
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    const providedBuf = Buffer.from(provided, 'hex');
    if (expectedBuf.length === 0 || providedBuf.length === 0) return false;
    if (expectedBuf.length !== providedBuf.length) return false;

    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

/**
 * Map a BetterStack payload to one of our internal severities.
 *
 * Defensive — accepts an `unknown` shape and falls back to 'minor' for any
 * missing / weird input. BetterStack itself doesn't ship a strict severity
 * enum on every payload, so we look at a few common signals:
 *
 *   - data.attributes.severity (if present)
 *   - data.attributes.status   ('Started' etc.)
 *   - data.attributes.cause    (heuristic — 'down' implies major)
 *
 * Internal mapping:
 *   - 'critical'  -> a confirmed outage / "down" cause on a started/acked incident
 *   - 'major'     -> a started/acked incident without an obvious outage signal
 *   - 'minor'     -> default, resolved incidents, anything unknown
 */
export function mapBetterStackSeverity(
  payload: unknown,
): 'minor' | 'major' | 'critical' {
  if (!isRecord(payload)) return 'minor';
  const data = isRecord(payload.data) ? payload.data : null;
  const attrs = data && isRecord(data.attributes) ? data.attributes : null;
  if (!attrs) return 'minor';

  // 1. Explicit severity field if BetterStack provides one.
  const explicit = typeof attrs.severity === 'string' ? attrs.severity.toLowerCase() : '';
  if (explicit === 'critical' || explicit === 'sev1' || explicit === 'high') {
    return 'critical';
  }
  if (explicit === 'major' || explicit === 'sev2' || explicit === 'medium') {
    return 'major';
  }
  if (explicit === 'minor' || explicit === 'sev3' || explicit === 'low') {
    return 'minor';
  }

  const status = typeof attrs.status === 'string' ? attrs.status.toLowerCase() : '';
  const cause = typeof attrs.cause === 'string' ? attrs.cause.toLowerCase() : '';

  // 2. Resolved incidents are downgraded to minor unless explicitly flagged.
  if (status === 'resolved') return 'minor';

  // 3. Cause-based heuristic.
  const looksLikeOutage =
    cause.includes('down') ||
    cause.includes('unreachable') ||
    cause.includes('5xx') ||
    cause.includes('500') ||
    cause.includes('503') ||
    cause.includes('timeout');

  if (looksLikeOutage && (status === 'started' || status === 'acknowledged')) {
    return 'critical';
  }
  if (status === 'started' || status === 'acknowledged') {
    return 'major';
  }

  return 'minor';
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
