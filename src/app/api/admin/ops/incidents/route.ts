import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { createIncident } from '@/lib/ops/incidents-service';
import { writeAudit } from '@/lib/ops/audit';

const SEVERITIES = ['info', 'minor', 'major', 'critical'] as const;
const SOURCES = ['manual', 'betterstack', 'cloudflare', 'hetzner', 'vercel'] as const;

const CreateIncidentSchema = z.object({
  startedAt: z.string().datetime().optional(),
  severity: z.enum(SEVERITIES).default('minor'),
  source: z.enum(SOURCES).default('manual'),
  summary: z.string().min(1).max(500),
  assetId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  externalId: z.string().max(200).nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = CreateIncidentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  const startedAt = parsed.data.startedAt ? new Date(parsed.data.startedAt) : new Date();

  const incident = await createIncident({
    startedAt,
    severity: parsed.data.severity,
    source: parsed.data.source,
    summary: parsed.data.summary.trim(),
    assetId: parsed.data.assetId ?? null,
    clientId: parsed.data.clientId ?? null,
    externalId: parsed.data.externalId ?? null,
    tags: parsed.data.tags ?? [],
  });
  if (!incident) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'create',
    entityType: 'incident',
    entityId: incident.id,
    diff: { severity: incident.severity, summary: incident.summary },
  });

  return NextResponse.json({ incident });
}
