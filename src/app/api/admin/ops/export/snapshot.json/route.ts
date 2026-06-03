import 'server-only';
import { NextResponse } from 'next/server';
import { requireOps } from '../../_helpers';
import { buildSnapshotJson } from '@/lib/ops/snapshot-export';

export async function GET() {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  const payload = buildSnapshotJson();
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': 'attachment; filename="2ko-ops-snapshot.json"',
      'cache-control': 'no-store',
    },
  });
}
