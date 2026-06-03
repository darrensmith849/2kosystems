import 'server-only';
import { NextResponse } from 'next/server';
import { checkOpsGate } from '@/lib/ops/auth';

// Shared helpers for all /api/admin/ops routes.

export type GateOk = { operatorSlug: string };

export async function requireOps(): Promise<NextResponse | GateOk> {
  const gate = await checkOpsGate();
  if (gate.kind === 'unauth') return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (gate.kind === 'no_operator') return NextResponse.json({ error: 'Operator not selected' }, { status: 412 });
  return { operatorSlug: gate.operatorSlug };
}

export function dbUnavailable(): NextResponse {
  return NextResponse.json(
    { error: 'Database not connected. Set DATABASE_URL.' },
    { status: 503 },
  );
}
