import 'server-only';
import { NextResponse } from 'next/server';

/*
 * BetterStack incident webhook receiver.
 *
 * Phase 2A: STUB. Returns 503 so the route is reachable and visibly
 * "not yet configured" rather than silently 404'ing. No authentication is
 * required to hit this endpoint by design — it is a public webhook target.
 *
 * Phase 2B TODO (when BETTERSTACK_WEBHOOK_SECRET is provisioned):
 *   1. Read the raw request body (NOT request.json() — we need the bytes
 *      for HMAC).
 *   2. Verify the signature header (BetterStack sends an HMAC-SHA256
 *      signature in `X-BetterStack-Signature` or similar) using
 *      `process.env.BETTERSTACK_WEBHOOK_SECRET`. Reject 401 on mismatch.
 *   3. Parse the JSON payload. BetterStack sends incident.created /
 *      incident.acknowledged / incident.resolved events with monitor info.
 *   4. Look up the matching `assets` row by BetterStack monitor name or
 *      by an `asset_links` row of kind=betterstack_monitor.
 *   5. Upsert into `incidents`: use (source='betterstack', externalId)
 *      as the dedup key. On created -> open. On acknowledged ->
 *      investigating. On resolved -> resolved + set resolvedAt + endedAt.
 *   6. writeAudit with operatorSlug='system' so the source of the change
 *      is traceable.
 *   7. Return 200 { ok: true } so BetterStack stops retrying.
 *
 * Until then this endpoint MUST return 503 with a clear reason so ops
 * engineers know to wire the secret before pointing BetterStack at it.
 */

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      reason:
        'BetterStack webhook not yet configured. Set BETTERSTACK_WEBHOOK_SECRET to enable in Phase 2B.',
    },
    { status: 503 },
  );
}
