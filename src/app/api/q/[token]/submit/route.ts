import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isQuestionnaireUnlocked } from '@/lib/questionnaire-auth';
import { verifyQuestionnaireLink } from '@/lib/questionnaire-link';
import { generateSlaPdf } from '@/lib/sla/generate';
import { DEFAULT_PAYMENT_TERMS } from '@/lib/sla/template';
import { sendSlaEmail } from '@/lib/brevo';

export const runtime = 'nodejs';

const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg'];

const SubmitSchema = z.object({
  businessName: z.string().min(1).max(300),
  contactName: z.string().min(1).max(200),
  contactEmail: z.string().email().max(200),
  contactPhone: z.string().max(60).optional().default(''),
  physicalAddress: z.string().max(500).optional().default(''),
  hasExistingWebsite: z.boolean().optional().default(false),
  existingWebsiteUrl: z.string().max(500).optional().default(''),
  businessAim: z.string().max(4000).optional().default(''),
  businessType: z.string().max(120).optional().default(''),
  offering: z.string().max(600).optional().default(''),
  catalogueSize: z.string().max(120).optional().default(''),
  siteGoals: z.string().max(4000).optional().default(''),
  notes: z.string().max(4000).optional().default(''),
  paymentMethod: z.enum(['cash', 'eft']),
  termsAccepted: z.literal(true),
  signedName: z.string().min(1).max(200),
  idNumber: z.string().max(60).optional().default(''),
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
    return NextResponse.json(
      { ok: false, error: 'Session expired — please refresh and re-enter the password.' },
      { status: 401 },
    );
  }

  const { token } = await params;
  const link = verifyQuestionnaireLink(token);
  if (!link) {
    return NextResponse.json({ ok: false, error: 'This link is invalid or has expired.' }, { status: 410 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Keep the logo only if it's a supported image type.
  let logoBase64: string | null = null;
  let logoContentType: string | null = null;
  if (d.logoBase64 && ALLOWED_LOGO_TYPES.includes(d.logoContentType)) {
    logoBase64 = d.logoBase64.includes(',') ? d.logoBase64.slice(d.logoBase64.indexOf(',') + 1) : d.logoBase64;
    logoContentType = d.logoContentType;
  }

  // Price/terms come from the SIGNED link — never from the client body.
  const priceFormatted = formatMoney(link.priceAmount, link.currency);
  const paymentMethodLabel = d.paymentMethod === 'eft' ? 'Bank transfer (EFT)' : 'Cash';
  const signedAt = new Date();
  const signedIp = clientIp(request);
  const safeName = d.businessName.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'client';
  const fileName = `2KO-SLA-${safeName}.pdf`;

  const offeringSummary = [
    d.businessType.trim(),
    d.offering.trim(),
    d.catalogueSize.trim() ? `Catalogue size: ${d.catalogueSize.trim()}` : '',
  ]
    .filter((s) => s)
    .join(' — ');

  let pdfBase64: string;
  try {
    const pdfBytes = await generateSlaPdf({
      companyName: d.businessName.trim(),
      clientAddress: d.physicalAddress.trim() || null,
      businessAim: d.businessAim.trim() || null,
      offering: offeringSummary || null,
      siteGoals: d.siteGoals.trim() || null,
      priceFormatted,
      paymentTerms: DEFAULT_PAYMENT_TERMS,
      paymentMethodLabel,
      agreementDate: signedAt.toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }),
      signedName: d.signedName.trim(),
      signedIdNumber: d.idNumber.trim() || null,
      signedAtText: `Signed electronically on ${signedAt.toLocaleString('en-ZA')}`,
      signedIp,
      logo:
        logoBase64 && logoContentType
          ? { bytes: Buffer.from(logoBase64, 'base64'), contentType: logoContentType }
          : null,
    });
    pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  } catch (err) {
    console.error('[q/submit] SLA generation failed', err);
    return NextResponse.json(
      { ok: false, error: "We couldn't generate your SLA just now — please try again, or contact us." },
      { status: 500 },
    );
  }

  // Email the SLA to the client + internal cc. Non-fatal on failure — the
  // client still gets the on-page download from the response below.
  let warning: string | null = null;
  try {
    const result = await sendSlaEmail({
      toEmail: d.contactEmail.trim().toLowerCase(),
      toName: d.contactName.trim(),
      clientName: d.businessName.trim(),
      slaPdfBase64: pdfBase64,
      slaFileName: fileName,
      priceFormatted,
      paymentTerms: DEFAULT_PAYMENT_TERMS,
      paymentMethodLabel,
    });
    if (!result.sent && result.reason && result.reason !== 'dryrun') {
      warning = `${result.reason} You can still download your SLA below.`;
    }
  } catch (err) {
    console.error('[q/submit] SLA email failed', err);
    warning = "Your SLA is ready to download below, but the confirmation email didn't go through.";
  }

  return NextResponse.json({ ok: true, pdfBase64, fileName, warning: warning ?? undefined });
}
