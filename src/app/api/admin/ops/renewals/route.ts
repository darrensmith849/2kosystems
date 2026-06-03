import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { createRenewal } from '@/lib/ops/renewals-service';
import { writeAudit } from '@/lib/ops/audit';

const CreateRenewalSchema = z.object({
  name: z.string().min(1).max(200),
  kind: z.enum([
    'domain',
    'hosting',
    'ssl',
    'saas',
    'client_retainer',
    'supplier_subscription',
  ]),
  nextDueAt: z.string().min(1),
  amount: z.number().nonnegative().optional(),
  currency: z.string().min(1).max(8).default('ZAR'),
  period: z.enum(['monthly', 'annual', 'one_off']).optional(),
  clientId: z.string().uuid().nullable().optional(),
  externalLink: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
  autoRenew: z.boolean().optional(),
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
  const parsed = CreateRenewalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid body' },
      { status: 400 },
    );
  }

  const nextDueAt = new Date(parsed.data.nextDueAt);
  if (Number.isNaN(nextDueAt.getTime())) {
    return NextResponse.json({ error: 'Invalid nextDueAt' }, { status: 400 });
  }

  const renewal = await createRenewal({
    name: parsed.data.name.trim(),
    kind: parsed.data.kind,
    nextDueAt,
    amount: parsed.data.amount !== undefined ? String(parsed.data.amount) : null,
    currency: parsed.data.currency,
    period: parsed.data.period ?? null,
    clientId: parsed.data.clientId ?? null,
    externalLink: parsed.data.externalLink ?? null,
    notes: parsed.data.notes ?? null,
    autoRenew: parsed.data.autoRenew ?? null,
  });
  if (!renewal) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'create',
    entityType: 'renewal',
    entityId: renewal.id,
    diff: {
      name: renewal.name,
      kind: renewal.kind,
      nextDueAt: renewal.nextDueAt instanceof Date ? renewal.nextDueAt.toISOString() : renewal.nextDueAt,
    },
  });

  return NextResponse.json({ renewal });
}
