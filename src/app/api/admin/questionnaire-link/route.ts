import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { signQuestionnaireLink } from '@/lib/questionnaire-link';

// Admin-only: signs a questionnaire link with the price baked in. Gated by the
// shared admin session cookie (same one used by /admin/ops, /admin/agent).
const Schema = z.object({
  clientName: z.string().min(1).max(300),
  priceAmount: z.coerce.number().nonnegative().max(1_000_000_000),
  currency: z.string().min(1).max(8).default('ZAR'),
  expiresInDays: z.coerce.number().int().positive().max(365).optional(),
});

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
  }

  let signed: string;
  try {
    signed = signQuestionnaireLink({
      clientName: parsed.data.clientName.trim(),
      priceAmount: parsed.data.priceAmount.toFixed(2),
      currency: parsed.data.currency.trim().toUpperCase(),
      paymentTerms: '50% upfront, 50% on completion',
      expiresInDays: parsed.data.expiresInDays,
    });
  } catch {
    return NextResponse.json(
      { error: 'Link signing is not configured (QUESTIONNAIRE_LINK_SECRET).' },
      { status: 503 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin;
  return NextResponse.json({ link: `${origin}/q/${signed}`, token: signed });
}
