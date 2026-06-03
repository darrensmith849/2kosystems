import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorised, OPERATOR_COOKIE_NAME } from '@/lib/ops/auth';
import { createOperator } from '@/lib/ops/operators';
import { writeAudit } from '@/lib/ops/audit';

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const slug = typeof b.slug === 'string' ? b.slug.trim().toLowerCase() : '';
  const displayName = typeof b.displayName === 'string' ? b.displayName.trim() : '';
  if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  if (displayName) {
    await createOperator({ slug, displayName });
  }
  const res = NextResponse.json({ ok: true, slug });
  res.cookies.set(OPERATOR_COOKIE_NAME, slug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  await writeAudit({
    operatorSlug: slug,
    action: 'operator_set',
    entityType: 'operator',
    entityId: slug,
    diff: { displayName },
  });
  return res;
}

export async function DELETE() {
  if (!(await isAdminAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OPERATOR_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  await writeAudit({
    operatorSlug: null,
    action: 'operator_clear',
    entityType: 'operator',
  });
  return res;
}
