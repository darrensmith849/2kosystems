import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps } from '../../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { runSnapshotImport } from '@/lib/ops/snapshot-import';

const InputSchema = z.object({ dryRun: z.boolean() });

export async function POST(req: Request) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        error: 'db_not_connected',
        message: 'Snapshot import activates once DATABASE_URL is set.',
      },
      { status: 503 },
    );
  }

  const report = await runSnapshotImport({
    operatorSlug: gate.operatorSlug,
    dryRun: parsed.data.dryRun,
  });
  return NextResponse.json(report);
}
