import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { createAsset } from '@/lib/ops/assets-service';
import { writeAudit } from '@/lib/ops/audit';

const CreateAssetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['website', 'saas_app', 'portal', 'api', 'landing', 'internal_tool', 'database', 'service']),
  liveUrl: z.string().url().nullable().optional(),
  stagingUrl: z.string().url().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  divisionId: z.string().uuid().nullable().optional(),
  environment: z.enum(['production', 'staging', 'demo', 'test']).default('production'),
  status: z.enum(['active', 'sunset', 'dormant']).default('active'),
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
  const parsed = CreateAssetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  const asset = await createAsset({
    name: parsed.data.name.trim(),
    type: parsed.data.type,
    liveUrl: parsed.data.liveUrl ?? null,
    stagingUrl: parsed.data.stagingUrl ?? null,
    clientId: parsed.data.clientId ?? null,
    divisionId: parsed.data.divisionId ?? null,
    environment: parsed.data.environment,
    status: parsed.data.status,
  });
  if (!asset) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'create',
    entityType: 'asset',
    entityId: asset.id,
    diff: { name: asset.name, type: asset.type, clientId: asset.clientId },
  });

  return NextResponse.json({ asset });
}
