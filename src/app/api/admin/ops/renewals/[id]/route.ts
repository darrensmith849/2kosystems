import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { updateRenewal, markReminded } from '@/lib/ops/renewals-service';
import { writeAudit } from '@/lib/ops/audit';
import type { NewRenewal } from '@/lib/db/schema/renewals';

const ReminderStateEnum = z.enum([
  'none',
  'notified_60',
  'notified_30',
  'notified_14',
  'notified_7',
  'due',
  'overdue',
]);

const PatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nextDueAt: z.string().min(1).optional(),
  amount: z.number().nonnegative().nullable().optional(),
  autoRenew: z.boolean().nullable().optional(),
  externalLink: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
  reminderState: ReminderStateEnum.optional(),
  subjectType: z.enum(['asset', 'domain', 'service', 'client']).nullable().optional(),
  subjectId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid body' },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // If the only field is reminderState, route through markReminded so
  // last_reminded_at is set in a single place.
  const keys = Object.keys(data);
  if (keys.length === 1 && keys[0] === 'reminderState' && data.reminderState) {
    const row = await markReminded(id, data.reminderState);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await writeAudit({
      operatorSlug: gate.operatorSlug,
      action: 'update',
      entityType: 'renewal',
      entityId: id,
      diff: { reminderState: data.reminderState },
    });
    return NextResponse.json({ renewal: row });
  }

  const patch: Partial<NewRenewal> = {};
  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.nextDueAt !== undefined) {
    const d = new Date(data.nextDueAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'Invalid nextDueAt' }, { status: 400 });
    }
    patch.nextDueAt = d;
  }
  if (data.amount !== undefined) patch.amount = data.amount === null ? null : String(data.amount);
  if (data.autoRenew !== undefined) patch.autoRenew = data.autoRenew;
  if (data.externalLink !== undefined) patch.externalLink = data.externalLink;
  if (data.notes !== undefined) patch.notes = data.notes;
  if (data.reminderState !== undefined) {
    patch.reminderState = data.reminderState;
    patch.lastRemindedAt = new Date();
  }
  if (data.subjectType !== undefined) patch.subjectType = data.subjectType;
  if (data.subjectId !== undefined) patch.subjectId = data.subjectId;
  if (data.clientId !== undefined) patch.clientId = data.clientId;

  const row = await updateRenewal(id, patch);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'update',
    entityType: 'renewal',
    entityId: id,
    diff: data as Record<string, unknown>,
  });

  return NextResponse.json({ renewal: row });
}
