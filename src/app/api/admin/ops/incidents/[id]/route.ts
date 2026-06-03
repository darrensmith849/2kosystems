import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { updateIncident } from '@/lib/ops/incidents-service';
import { writeAudit } from '@/lib/ops/audit';

const STATUSES = ['open', 'investigating', 'resolved', 'postmortem_done'] as const;
const SEVERITIES = ['info', 'minor', 'major', 'critical'] as const;

const PatchSchema = z.object({
  status: z.enum(STATUSES).optional(),
  severity: z.enum(SEVERITIES).optional(),
  rootCause: z.string().max(2000).nullable().optional(),
  clientNotifiedAt: z.string().datetime().nullable().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
  endedAt: z.string().datetime().nullable().optional(),
  followupRequired: z.boolean().optional(),
  summary: z.string().min(1).max(500).optional(),
});

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.severity !== undefined) patch.severity = parsed.data.severity;
  if (parsed.data.rootCause !== undefined) patch.rootCause = parsed.data.rootCause;
  if (parsed.data.clientNotifiedAt !== undefined) {
    patch.clientNotifiedAt = parsed.data.clientNotifiedAt ? new Date(parsed.data.clientNotifiedAt) : null;
  }
  if (parsed.data.resolvedAt !== undefined) {
    patch.resolvedAt = parsed.data.resolvedAt ? new Date(parsed.data.resolvedAt) : null;
  }
  if (parsed.data.endedAt !== undefined) {
    patch.endedAt = parsed.data.endedAt ? new Date(parsed.data.endedAt) : null;
  }
  if (parsed.data.followupRequired !== undefined) patch.followupRequired = parsed.data.followupRequired;
  if (parsed.data.summary !== undefined) patch.summary = parsed.data.summary.trim();

  // If status moves to resolved or postmortem_done and we don't have a resolvedAt yet, set it now.
  if (
    (parsed.data.status === 'resolved' || parsed.data.status === 'postmortem_done') &&
    parsed.data.resolvedAt === undefined
  ) {
    patch.resolvedAt = new Date();
  }

  const row = await updateIncident(id, patch);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'update',
    entityType: 'incident',
    entityId: id,
    diff: patch,
  });

  return NextResponse.json({ incident: row });
}
