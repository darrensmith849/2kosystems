import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { updateFindingStatus } from '@/lib/ops/findings-service';
import { writeAudit } from '@/lib/ops/audit';

const PatchSchema = z.object({
  status: z.enum(['open', 'acknowledged', 'resolved', 'wontfix']),
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
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const row = await updateFindingStatus({ id, status: parsed.data.status });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: parsed.data.status === 'open' ? 'finding_open' : 'finding_resolve',
    entityType: 'audit_finding',
    entityId: id,
    diff: { status: parsed.data.status },
  });

  return NextResponse.json({ finding: row });
}
