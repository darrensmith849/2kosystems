import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireOps, dbUnavailable } from '../../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { getSubmissionForQuestionnaire } from '@/lib/ops/questionnaires-service';

// Streams the stored SLA PDF for an operator to download from the detail page.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  const { id } = await params;
  const submission = await getSubmissionForQuestionnaire(id);
  if (!submission?.slaPdf) return NextResponse.json({ error: 'No SLA on file' }, { status: 404 });

  const bytes = Buffer.from(submission.slaPdf, 'base64');
  const safeName = (submission.businessName || 'client').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="2KO-SLA-${safeName || 'client'}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
