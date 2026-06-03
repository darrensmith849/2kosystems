import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps } from '../../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { runDecisionToTicket } from '@/lib/ops/decision-to-ticket';

// POST /api/admin/ops/decisions/to-tickets/run
// Body: { dryRun: boolean }
// 503 when DATABASE_URL is missing; otherwise returns the run report.

const RunSchema = z.object({ dryRun: z.boolean() });

export async function POST(request: NextRequest) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;

  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        error: 'db_not_connected',
        message: 'Decision-to-ticket bridge activates after DATABASE_URL is set.',
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = RunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid body' },
      { status: 400 },
    );
  }

  const report = await runDecisionToTicket({
    operatorSlug: gate.operatorSlug,
    dryRun: parsed.data.dryRun,
  });
  return NextResponse.json(report);
}
