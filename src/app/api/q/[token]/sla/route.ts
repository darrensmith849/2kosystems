import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isQuestionnaireUnlocked } from '@/lib/questionnaire-auth';
import { isDbConfigured } from '@/lib/db/client';
import {
  getQuestionnaireByToken,
  getSubmissionForQuestionnaire,
} from '@/lib/ops/questionnaires-service';

export const runtime = 'nodejs';

// Re-serves the stored SLA PDF so the client can download it from the success
// page (and again later from the "already submitted" notice). Gated by the
// shared questionnaire password + possession of the token.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  if (!(await isQuestionnaireUnlocked())) {
    return NextResponse.json({ error: 'Locked' }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
  }

  const { token } = await params;
  const questionnaire = await getQuestionnaireByToken(token);
  if (!questionnaire) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const submission = await getSubmissionForQuestionnaire(questionnaire.id);
  if (!submission?.slaPdf) return NextResponse.json({ error: 'No SLA available yet' }, { status: 404 });

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
