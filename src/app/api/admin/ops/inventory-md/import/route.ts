import 'server-only';
import { NextResponse } from 'next/server';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { importInventoryMd } from '@/lib/ops/inventory-importer';
import { writeAudit } from '@/lib/ops/audit';

export async function POST() {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();
  const result = await importInventoryMd({ operatorSlug: gate.operatorSlug, triggeredBy: 'manual' });
  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'seed_run',
    entityType: 'inventory_md',
    diff: result as unknown as Record<string, unknown>,
  });
  return NextResponse.json(result);
}
