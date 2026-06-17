import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { createQuestionnaire, listQuestionnaires } from '@/lib/ops/questionnaires-service';
import { writeAudit } from '@/lib/ops/audit';

const CreateSchema = z.object({
  clientName: z.string().min(1).max(300),
  priceAmount: z.coerce.number().nonnegative().max(1_000_000_000),
  currency: z.string().min(1).max(8).default('ZAR'),
  expiresInDays: z.coerce.number().int().positive().max(365).optional(),
});

export async function GET() {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();
  const rows = await listQuestionnaires();
  return NextResponse.json({ questionnaires: rows });
}

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
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const created = await createQuestionnaire({
    clientName: parsed.data.clientName.trim(),
    priceAmount: parsed.data.priceAmount.toFixed(2),
    currency: parsed.data.currency.trim().toUpperCase(),
    createdByOperatorSlug: gate.operatorSlug,
    expiresAt,
  });
  if (!created) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'create',
    entityType: 'questionnaire',
    entityId: created.id,
    diff: { clientName: created.clientName, priceAmount: created.priceAmount, currency: created.currency },
  });

  return NextResponse.json({ questionnaire: created });
}
