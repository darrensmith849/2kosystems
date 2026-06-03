import 'server-only';
import { NextResponse } from 'next/server';
import { requireOps } from '../../_helpers';
import { buildSnapshotMarkdown } from '@/lib/ops/snapshot-export';

export async function GET() {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  const body = buildSnapshotMarkdown();
  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': 'attachment; filename="2ko-ops-snapshot.md"',
      'cache-control': 'no-store',
    },
  });
}
