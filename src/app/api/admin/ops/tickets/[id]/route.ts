import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { updateTicket } from '@/lib/ops/tickets-service';
import { writeAudit } from '@/lib/ops/audit';

const STATUSES = [
  'new', 'triage', 'waiting_client', 'in_progress', 'blocked', 'review', 'completed', 'archived',
] as const;
const PRIORITIES = ['low', 'med', 'high', 'urgent'] as const;
const BILLING_STATUSES = ['included', 'billable', 'quoted', 'approved', 'invoiced'] as const;

const PatchSchema = z
  .object({
    status: z.enum(STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    assigneeOperatorId: z.string().uuid().nullable().optional(),
    billingStatus: z.enum(BILLING_STATUSES).optional(),
    timeLoggedMinutes: z.number().int().min(0).optional(),
    dueAt: z.string().nullable().optional(),
  })
  .refine(
    (v) =>
      v.status !== undefined ||
      v.priority !== undefined ||
      v.assigneeOperatorId !== undefined ||
      v.billingStatus !== undefined ||
      v.timeLoggedMinutes !== undefined ||
      v.dueAt !== undefined,
    { message: 'At least one field required' },
  );

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
  if (parsed.data.priority !== undefined) patch.priority = parsed.data.priority;
  if (parsed.data.assigneeOperatorId !== undefined) patch.assigneeOperatorId = parsed.data.assigneeOperatorId;
  if (parsed.data.billingStatus !== undefined) patch.billingStatus = parsed.data.billingStatus;
  if (parsed.data.timeLoggedMinutes !== undefined) patch.timeLoggedMinutes = parsed.data.timeLoggedMinutes;
  if (parsed.data.dueAt !== undefined) patch.dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;

  const row = await updateTicket(id, patch);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'update',
    entityType: 'ticket',
    entityId: id,
    diff: patch,
  });

  return NextResponse.json({ ticket: row });
}
