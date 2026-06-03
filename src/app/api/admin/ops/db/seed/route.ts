import 'server-only';
import { NextResponse } from 'next/server';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { seedFoundational } from '@/lib/db/seed';
import { writeAudit } from '@/lib/ops/audit';

export async function POST() {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();
  const result = await seedFoundational();
  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'seed_run',
    entityType: 'foundational',
    diff: result as unknown as Record<string, unknown>,
  });
  return NextResponse.json(result);
}
