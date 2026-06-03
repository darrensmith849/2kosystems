import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { deleteLink } from '@/lib/ops/asset-links-service';
import { writeAudit } from '@/lib/ops/audit';

export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();
  const { id } = await ctx.params;
  const ok = await deleteLink(id);
  if (!ok) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'delete',
    entityType: 'asset_link',
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
