import 'server-only';
import { NextResponse } from 'next/server';
import { requireOps } from '../../../_helpers';
import { previewSnapshotImport } from '@/lib/ops/snapshot-import';

// Always returns 200 with the preview. When DATABASE_URL is unset the body
// includes { dbConfigured: false } so the client renders disabled action
// buttons rather than erroring.

export async function GET() {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  const preview = await previewSnapshotImport();
  return NextResponse.json(preview);
}
