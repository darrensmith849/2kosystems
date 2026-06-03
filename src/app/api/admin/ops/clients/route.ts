import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { createClient } from '@/lib/ops/clients-service';
import { writeAudit } from '@/lib/ops/audit';

const CreateClientSchema = z.object({
  name: z.string().min(1).max(200),
  status: z.enum(['lead', 'active', 'paused', 'archived', 'former']).default('active'),
  legalName: z.string().max(200).optional(),
  divisionId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
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
  const parsed = CreateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  const client = await createClient({
    name: parsed.data.name.trim(),
    status: parsed.data.status,
    legalName: parsed.data.legalName ?? null,
    divisionId: parsed.data.divisionId ?? null,
    notes: parsed.data.notes ?? null,
  });
  if (!client) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'create',
    entityType: 'client',
    entityId: client.id,
    diff: { name: client.name, status: client.status },
  });

  return NextResponse.json({ client });
}
