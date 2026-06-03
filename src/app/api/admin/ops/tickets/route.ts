import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOps, dbUnavailable } from '../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { createTicket } from '@/lib/ops/tickets-service';
import { writeAudit } from '@/lib/ops/audit';

const TICKET_KINDS = ['support', 'bug', 'change_request', 'content_update', 'emergency', 'billing'] as const;
const PRIORITIES = ['low', 'med', 'high', 'urgent'] as const;

const CreateTicketSchema = z.object({
  kind: z.enum(TICKET_KINDS),
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  priority: z.enum(PRIORITIES).default('med'),
  clientId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
  assigneeOperatorId: z.string().uuid().optional(),
  dueAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = CreateTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  const ticket = await createTicket({
    kind: parsed.data.kind,
    title: parsed.data.title.trim(),
    description: parsed.data.description?.trim() || null,
    priority: parsed.data.priority,
    clientId: parsed.data.clientId ?? null,
    assetId: parsed.data.assetId ?? null,
    assigneeOperatorId: parsed.data.assigneeOperatorId ?? null,
    dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
  });
  if (!ticket) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'create',
    entityType: 'ticket',
    entityId: ticket.id,
    diff: { title: ticket.title, kind: ticket.kind, priority: ticket.priority },
  });

  return NextResponse.json({ ticket });
}
