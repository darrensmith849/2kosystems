import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminPassword,
  createAdminSessionToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const password = typeof b?.password === 'string' ? b.password : '';

  if (!validateAdminPassword(password)) {
    // Deliberate pause to slow brute-force attempts
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  let token: string;
  try {
    token = createAdminSessionToken();
  } catch {
    return NextResponse.json({ error: 'Admin access is not configured on this server' }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60,
  });
  return response;
}
