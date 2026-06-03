import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { ASSET_LINK_KINDS, createLink, getAsset, listCandidates, listLinksForAsset } from '@/lib/ops/asset-links-service';
import { writeAudit } from '@/lib/ops/audit';

const CreateSchema = z.object({
  kind: z.enum(ASSET_LINK_KINDS as [string, ...string[]]),
  externalRef: z.string().min(1).max(300),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  const { id } = await ctx.params;
  const asset = await getAsset(id);
  if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  const links = await listLinksForAsset(id);

  const candidatesParam = request.nextUrl.searchParams.get('candidates');
  if (candidatesParam && ASSET_LINK_KINDS.includes(candidatesParam as never)) {
    const candidates = await listCandidates(candidatesParam as never);
    return NextResponse.json({ asset, links, candidates });
  }
  return NextResponse.json({ asset, links });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  const { id } = await ctx.params;
  const asset = await getAsset(id);
  if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

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

  const link = await createLink({
    assetId: id,
    kind: parsed.data.kind,
    externalRef: parsed.data.externalRef,
    metadata: parsed.data.metadata ?? {},
  });
  if (!link) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'create',
    entityType: 'asset_link',
    entityId: link.id,
    diff: { assetId: id, kind: parsed.data.kind, externalRef: parsed.data.externalRef },
  });

  return NextResponse.json({ link });
}
