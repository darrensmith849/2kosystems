import 'server-only';
import { NextResponse } from 'next/server';
import { requireOps } from '../../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { previewDecisionToTicket } from '@/lib/ops/decision-to-ticket';

// GET /api/admin/ops/decisions/to-tickets/preview
// Always 200 when authorised. Returns the bridge preview plus the dbConfigured
// flag so the UI can hide / disable run buttons before DATABASE_URL is set.

export async function GET() {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;

  const preview = await previewDecisionToTicket();
  return NextResponse.json({
    ...preview,
    dbConfigured: isDbConfigured(),
  });
}
