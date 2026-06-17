import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import {
  getQuestionnaireById,
  getSubmissionForQuestionnaire,
  revokeQuestionnaire,
} from '@/lib/ops/questionnaires-service';
import { writeAudit } from '@/lib/ops/audit';

const PatchSchema = z.object({ action: z.literal('revoke') });

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  const { id } = await params;
  const questionnaire = await getQuestionnaireById(id);
  if (!questionnaire) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const submission = await getSubmissionForQuestionnaire(id);
  return NextResponse.json({ questionnaire, submission });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  const updated = await revokeQuestionnaire(id);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'archive',
    entityType: 'questionnaire',
    entityId: updated.id,
    diff: { status: 'revoked' },
  });

  return NextResponse.json({ questionnaire: updated });
}
