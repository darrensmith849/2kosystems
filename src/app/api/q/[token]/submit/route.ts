import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isQuestionnaireUnlocked } from '@/lib/questionnaire-auth';
import { isDbConfigured } from '@/lib/db/client';
import {
  getQuestionnaireByToken,
  insertSubmission,
  attachSlaToSubmission,
  markQuestionnaireSubmitted,
  markSubmissionEmailed,
} from '@/lib/ops/questionnaires-service';
import { generateSlaPdf } from '@/lib/sla/generate';
import { sendSlaEmail } from '@/lib/brevo';

export const runtime = 'nodejs';

const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg'];

const SubmitSchema = z.object({
  businessName: z.string().min(1).max(300),
  contactName: z.string().min(1).max(200),
  contactEmail: z.string().email().max(200),
  contactPhone: z.string().max(60).optional().default(''),
  hasExistingWebsite: z.boolean().optional().default(false),
  existingWebsiteUrl: z.string().max(500).optional().default(''),
  businessAim: z.string().max(4000).optional().default(''),
  siteGoals: z.string().max(4000).optional().default(''),
  notes: z.string().max(4000).optional().default(''),
  paymentMethod: z.enum(['cash', 'eft']),
  termsAccepted: z.literal(true),
  signedName: z.string().min(1).max(200),
  logoBase64: z.string().max(4_000_000).optional().default(''),
  logoContentType: z.string().max(100).optional().default(''),
});

function formatMoney(amount: string, currency: string): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function clientIp(request: NextRequest): string | null {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return request.headers.get('x-real-ip');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  if (!(await isQuestionnaireUnlocked())) {
    return NextResponse.json({ ok: false, error: 'Session expired — please refresh and re-enter the password.' }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, error: 'The form is not connected to its database.' }, { status: 503 });
  }

  const { token } = await params;
  const questionnaire = await getQuestionnaireByToken(token);
  if (!questionnaire) {
    return NextResponse.json({ ok: false, error: 'This link could not be found.' }, { status: 404 });
  }
  if (questionnaire.status === 'revoked') {
    return NextResponse.json({ ok: false, error: 'This link has been revoked.' }, { status: 410 });
  }
  if (questionnaire.status === 'submitted') {
    return NextResponse.json({ ok: false, error: 'This questionnaire has already been submitted.' }, { status: 409 });
  }
  if (questionnaire.expiresAt && questionnaire.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'This link has expired.' }, { status: 410 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' }, { status: 400 });
  }
  const d = parsed.data;

  // Normalise the logo: accept raw base64 or a data: URL, only keep png/jpeg.
  let logoBase64: string | null = null;
  let logoContentType: string | null = null;
  if (d.logoBase64 && ALLOWED_LOGO_TYPES.includes(d.logoContentType)) {
    logoBase64 = d.logoBase64.includes(',') ? d.logoBase64.slice(d.logoBase64.indexOf(',') + 1) : d.logoBase64;
    logoContentType = d.logoContentType;
  }

  const signedAt = new Date();
  const submission = await insertSubmission({
    questionnaireId: questionnaire.id,
    businessName: d.businessName.trim(),
    contactName: d.contactName.trim(),
    contactEmail: d.contactEmail.trim().toLowerCase(),
    contactPhone: d.contactPhone.trim() || null,
    hasExistingWebsite: d.hasExistingWebsite,
    existingWebsiteUrl: d.hasExistingWebsite ? d.existingWebsiteUrl.trim() || null : null,
    businessAim: d.businessAim.trim() || null,
    siteGoals: d.siteGoals.trim() || null,
    notes: d.notes.trim() || null,
    logoBase64,
    logoContentType,
    paymentMethod: d.paymentMethod,
    termsAccepted: true,
    signedName: d.signedName.trim(),
    signedAt,
    signedIp: clientIp(request),
  });
  if (!submission) {
    return NextResponse.json({ ok: false, error: 'Could not save your submission.' }, { status: 500 });
  }

  // Mark the link submitted so it can't be reused even if a later step fails.
  await markQuestionnaireSubmitted(questionnaire.id);

  const priceFormatted = formatMoney(questionnaire.priceAmount, questionnaire.currency);
  const paymentMethodLabel = d.paymentMethod === 'eft' ? 'Bank transfer (EFT)' : 'Cash';

  // Generate the SLA PDF. A failure here shouldn't lose the submission.
  let slaPdfBase64: string | null = null;
  let warning: string | null = null;
  try {
    const pdfBytes = await generateSlaPdf({
      companyName: d.businessName.trim(),
      businessAim: d.businessAim.trim() || null,
      siteGoals: d.siteGoals.trim() || null,
      priceFormatted,
      paymentTerms: questionnaire.paymentTerms,
      paymentMethodLabel,
      agreementDate: signedAt.toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }),
      signedName: d.signedName.trim(),
      signedAtText: `Signed electronically on ${signedAt.toLocaleString('en-ZA')}`,
      signedIp: clientIp(request),
      logo: logoBase64 && logoContentType ? { bytes: Buffer.from(logoBase64, 'base64'), contentType: logoContentType } : null,
    });
    slaPdfBase64 = Buffer.from(pdfBytes).toString('base64');
    await attachSlaToSubmission(submission.id, slaPdfBase64);
  } catch (err) {
    console.error('[q/submit] SLA generation failed', err);
    warning = "Your details were saved, but we couldn't generate the SLA automatically — we'll send it to you shortly.";
  }

  // Email the SLA (client + internal cc). Non-fatal on failure.
  if (slaPdfBase64) {
    const safeName = d.businessName.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'client';
    try {
      const result = await sendSlaEmail({
        toEmail: d.contactEmail.trim().toLowerCase(),
        toName: d.contactName.trim(),
        clientName: d.businessName.trim(),
        slaPdfBase64,
        slaFileName: `2KO-SLA-${safeName}.pdf`,
        priceFormatted,
        paymentTerms: questionnaire.paymentTerms,
        paymentMethodLabel,
      });
      if (result.sent) {
        await markSubmissionEmailed(submission.id);
      } else if (result.reason && result.reason !== 'dryrun') {
        warning = `${result.reason} Your SLA is saved — you can download it below.`;
      }
    } catch (err) {
      console.error('[q/submit] SLA email failed', err);
      warning = "Your SLA was generated and saved — you can download it below — but the email didn't go through.";
    }
  }

  return NextResponse.json({ ok: true, warning: warning ?? undefined });
}
