import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import {
  validateQuestionnairePassword,
  createQuestionnaireToken,
  QUESTIONNAIRE_COOKIE_NAME,
  QUESTIONNAIRE_SESSION_MS,
} from '@/lib/questionnaire-auth';

// Unlocks the client questionnaire gate. Mirrors the admin login route but
// uses its own cookie + secret and sameSite:'lax' so the link works when the
// client opens it straight from an email.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const password = typeof b?.password === 'string' ? b.password : '';

  if (!validateQuestionnairePassword(password)) {
    // Deliberate pause to slow brute-force attempts.
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  let token: string;
  try {
    token = createQuestionnaireToken();
  } catch {
    return NextResponse.json(
      { error: 'The questionnaire is not configured on this server' },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(QUESTIONNAIRE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(QUESTIONNAIRE_SESSION_MS / 1000),
  });
  return response;
}
