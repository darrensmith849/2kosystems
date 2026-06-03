import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { addComment, getTicket } from '@/lib/ops/tickets-service';
import { writeAudit } from '@/lib/ops/audit';

const CreateCommentSchema = z.object({
  body: z.string().min(1).max(10000),
  internal: z.boolean().default(true),
});

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  const { id } = await ctx.params;
  const ticket = await getTicket(id);
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = CreateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  const comment = await addComment({
    ticketId: id,
    body: parsed.data.body.trim(),
    internal: parsed.data.internal,
    authorOperatorSlug: gate.operatorSlug,
  });
  if (!comment) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'create',
    entityType: 'ticket_comment',
    entityId: comment.id,
    diff: { ticketId: id, internal: comment.internal },
  });

  return NextResponse.json({ comment });
}
