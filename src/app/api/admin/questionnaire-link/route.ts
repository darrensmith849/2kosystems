import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isQuestionnaireUnlocked } from '@/lib/questionnaire-auth';
import { signQuestionnaireLink } from '@/lib/questionnaire-link';

// Signs a questionnaire link with the price baked in. Gated by the same shared
// questionnaire password (systems123!) as the client form, so there is one
// password to remember.
const Schema = z.object({
  clientName: z.string().min(1).max(300),
  priceAmount: z.coerce.number().nonnegative().max(1_000_000_000),
  currency: z.string().min(1).max(8).default('ZAR'),
  expiresInDays: z.coerce.number().int().positive().max(365).optional(),
});

export async function POST(request: NextRequest) {
  if (!(await isQuestionnaireUnlocked())) {
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

  // Trim whitespace/newlines — the configured NEXT_PUBLIC_SITE_URL has a
  // trailing newline that would otherwise break the link.
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  const origin = envOrigin || new URL(request.url).origin;
  return NextResponse.json({ link: `${origin}/q/${signed}`, token: signed });
}
