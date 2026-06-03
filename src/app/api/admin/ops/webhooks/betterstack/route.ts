import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getDb, isDbConfigured } from '@/lib/db/client';
import { incidents } from '@/lib/db/schema/incidents';
import { assets } from '@/lib/db/schema/assets';
import { createIncident, updateIncident } from '@/lib/ops/incidents-service';
import { writeAudit } from '@/lib/ops/audit';
import {
  verifyBetterStackSignature,
  mapBetterStackSeverity,
} from '@/lib/ops/betterstack-webhook-helper';

/*
 * BetterStack incident webhook receiver.
 *
 * Wiring:
 *   1. Configure a webhook in BetterStack -> Notifications, pointing it at
 *      https://<dashboard-host>/api/admin/ops/webhooks/betterstack with
 *      HMAC-SHA256 signing enabled.
 *   2. Set BETTERSTACK_WEBHOOK_SECRET in the dashboard's environment to the
 *      same shared secret BetterStack signs with. Without that env var this
 *      endpoint stays in a 503 "not yet configured" state on purpose so an
 *      unsigned attacker can never inject an incident.
 *   3. BetterStack POSTs an HMAC-SHA256 signature in `X-BetterStack-Signature`
 *      (we accept both `sha256=<hex>` and raw `<hex>` forms). We verify with
 *      a timing-safe comparison against the raw request body bytes.
 *
 * Behaviour summary:
 *   - No admin auth on this route by design — BetterStack calls it from
 *     their cloud. Signature verification is the only auth.
 *   - If DATABASE_URL is unset we still 200 with `skipped: 'db_not_connected'`
 *     so BetterStack does not retry forever.
 *   - We upsert on (source='betterstack', externalId=data.id).
 *   - We try to attach the incident to an existing asset by matching
 *     `data.attributes.url` against `assets.liveUrl` (best-effort; null if
 *     no match).
 *   - `writeAudit` records `operatorSlug='system_betterstack'`.
 *
 * Secrets are NEVER logged or echoed in any response.
 */

export async function POST(request: NextRequest) {
  const secret = process.env.BETTERSTACK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        reason:
          'BetterStack webhook not yet configured. Set BETTERSTACK_WEBHOOK_SECRET to enable.',
      },
      { status: 503 },
    );
  }

  // Read the raw body BEFORE parsing JSON — HMAC is computed against the
  // exact bytes BetterStack signed, and re-stringified JSON would differ.
  const rawBody = await request.text();
  const signature = request.headers.get('x-betterstack-signature');

  if (!verifyBetterStackSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseBetterStackPayload(payload);
  if (!parsed.externalId || !parsed.summary) {
    return NextResponse.json(
      { error: 'Missing required fields (data.id or data.attributes.name)' },
      { status: 400 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ ok: true, parsed: true, skipped: 'db_not_connected' });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ ok: true, parsed: true, skipped: 'db_not_connected' });
  }

  // Best-effort asset lookup by liveUrl. Falls back to null when no asset
  // matches — incidents are allowed to have null assetId.
  let assetId: string | null = null;
  if (parsed.affectedUrl) {
    const matched = await db
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.liveUrl, parsed.affectedUrl))
      .limit(1);
    if (matched[0]) assetId = matched[0].id;
  }

  const severity = mapBetterStackSeverity(payload);
  const status = mapStatus(parsed.status);
  const resolvedAt = parsed.resolvedAt;
  const startedAt = parsed.startedAt ?? new Date();

  const existing = await db
    .select({ id: incidents.id })
    .from(incidents)
    .where(and(eq(incidents.source, 'betterstack'), eq(incidents.externalId, parsed.externalId)))
    .limit(1);

  if (existing[0]) {
    const updated = await updateIncident(existing[0].id, {
      status,
      severity,
      resolvedAt: resolvedAt ?? undefined,
      endedAt: resolvedAt ?? undefined,
      rootCause: parsed.cause ?? undefined,
      assetId: assetId ?? undefined,
    });
    await writeAudit({
      operatorSlug: 'system_betterstack',
      action: 'update',
      entityType: 'incident',
      entityId: existing[0].id,
      diff: { status, severity, source: 'betterstack', externalId: parsed.externalId },
    });
    return NextResponse.json({
      ok: true,
      action: 'updated',
      incidentId: updated?.id ?? existing[0].id,
    });
  }

  const created = await createIncident({
    startedAt,
    severity,
    status,
    source: 'betterstack',
    externalId: parsed.externalId,
    summary: parsed.summary,
    rootCause: parsed.cause ?? null,
    assetId,
    clientId: null,
    resolvedAt: resolvedAt ?? null,
    endedAt: resolvedAt ?? null,
    tags: [],
  });

  if (!created) {
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }

  await writeAudit({
    operatorSlug: 'system_betterstack',
    action: 'create',
    entityType: 'incident',
    entityId: created.id,
    diff: { status, severity, source: 'betterstack', externalId: parsed.externalId },
  });

  return NextResponse.json({ ok: true, action: 'created', incidentId: created.id });
}

interface ParsedPayload {
  externalId: string | null;
  summary: string | null;
  affectedUrl: string | null;
  cause: string | null;
  status: string | null;
  startedAt: Date | null;
  resolvedAt: Date | null;
}

function parseBetterStackPayload(payload: unknown): ParsedPayload {
  const empty: ParsedPayload = {
    externalId: null,
    summary: null,
    affectedUrl: null,
    cause: null,
    status: null,
    startedAt: null,
    resolvedAt: null,
  };
  if (!isRecord(payload)) return empty;
  const data = isRecord(payload.data) ? payload.data : null;
  if (!data) return empty;
  const attrs = isRecord(data.attributes) ? data.attributes : {};
  return {
    externalId: stringOrNull(data.id),
    summary: stringOrNull(attrs.name),
    affectedUrl: stringOrNull(attrs.url),
    cause: stringOrNull(attrs.cause),
    status: stringOrNull(attrs.status),
    startedAt: dateOrNull(attrs.started_at),
    resolvedAt: dateOrNull(attrs.resolved_at),
  };
}

function mapStatus(raw: string | null): string {
  if (!raw) return 'open';
  const v = raw.toLowerCase();
  if (v === 'resolved') return 'resolved';
  if (v === 'acknowledged') return 'investigating';
  if (v === 'started') return 'open';
  return 'open';
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function stringOrNull(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function dateOrNull(v: unknown): Date | null {
  if (typeof v !== 'string' || v.trim().length === 0) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
