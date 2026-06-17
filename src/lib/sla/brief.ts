import 'server-only';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { COMPANY_LEGAL_NAME } from './template';
import { drawBrandFooter } from './generate';

// A plain "Project Brief" PDF built from the client's questionnaire answers, so
// 2KO can see exactly what the client wants on their site. Sent alongside the
// SLA. Separate from generate.ts so the legal document and the brief stay
// independent.

export type BriefInput = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  physicalAddress?: string | null;
  businessType?: string | null;
  offering?: string | null;
  catalogueSize?: string | null;
  businessAim?: string | null;
  hasExistingWebsite?: boolean;
  existingWebsiteUrl?: string | null;
  siteGoals?: string | null;
  notes?: string | null;
  priceFormatted: string;
  paymentTerms: string;
  paymentMethodLabel: string;
  startDate?: string | null;
  finishDate?: string | null;
  signedName: string;
  signedIdNumber?: string | null;
  signedAtText: string;
  logo?: { bytes: Uint8Array; contentType: string } | null;
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 52;
const CONTENT_W = PAGE_W - MARGIN * 2;

const GREEN = rgb(0x16 / 255, 0xa3 / 255, 0x4a / 255);
const DEEP = rgb(0x0a / 255, 0x35 / 255, 0x17 / 255);
const TEXT = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.85, 0.86, 0.87);

export async function generateBriefPdf(input: BriefInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Project Brief — ${input.companyName}`);
  pdf.setAuthor(COMPANY_LEGAL_NAME);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  function newPage() {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  }
  function ensure(space: number) {
    if (y - space < MARGIN) newPage();
  }
  function wrap(text: string, f: PDFFont, size: number, maxWidth: number): string[] {
    const out: string[] = [];
    for (const rawLine of text.split('\n')) {
      const words = rawLine.split(/\s+/).filter(Boolean);
      let line = '';
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
          out.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      out.push(line);
    }
    return out;
  }
  function heading(text: string) {
    ensure(22);
    page.drawText(text.toUpperCase(), { x: MARGIN, y: y - 10, size: 9, font: bold, color: GREEN });
    y -= 18;
  }
  function row(label: string, value: string) {
    if (!value) return;
    ensure(14);
    page.drawText(label, { x: MARGIN, y: y - 10, size: 9.5, font: bold, color: TEXT });
    const valueX = MARGIN + 150;
    const lines = wrap(value, font, 9.5, CONTENT_W - 150);
    lines.forEach((ln, i) => {
      if (i > 0) {
        ensure(13);
        y -= 13;
      }
      page.drawText(ln, { x: valueX, y: y - 10, size: 9.5, font, color: TEXT });
    });
    y -= 16;
  }
  function block(label: string, value: string) {
    if (!value) return;
    ensure(16);
    page.drawText(label, { x: MARGIN, y: y - 10, size: 9.5, font: bold, color: TEXT });
    y -= 15;
    for (const ln of wrap(value, font, 9.5, CONTENT_W)) {
      ensure(13);
      page.drawText(ln, { x: MARGIN, y: y - 10, size: 9.5, font, color: MUTED });
      y -= 13;
    }
    y -= 6;
  }
  function gap(h: number) {
    y -= h;
  }
  function divider() {
    ensure(12);
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.75, color: LINE });
    y -= 14;
  }

  // Header
  let headerBottom = y;
  if (input.logo && input.logo.bytes.length > 0) {
    try {
      const img =
        input.logo.contentType === 'image/png'
          ? await pdf.embedPng(input.logo.bytes)
          : await pdf.embedJpg(input.logo.bytes);
      const scale = Math.min(46 / img.height, 150 / img.width, 1);
      page.drawImage(img, { x: MARGIN, y: y - img.height * scale, width: img.width * scale, height: img.height * scale });
      headerBottom = y - img.height * scale;
    } catch {
      /* skip unreadable logo */
    }
  }
  page.drawText('Project Brief', { x: MARGIN, y: headerBottom - 24, size: 17, font: bold, color: DEEP });
  page.drawText(`${input.companyName} — from their onboarding questionnaire`, {
    x: MARGIN,
    y: headerBottom - 40,
    size: 9.5,
    font,
    color: MUTED,
  });
  y = headerBottom - 52;
  divider();

  heading('Contact');
  row('Business name', input.companyName);
  row('Contact person', input.contactName);
  row('Email', input.contactEmail);
  if (input.contactPhone) row('Phone', input.contactPhone);
  if (input.physicalAddress) row('Address', input.physicalAddress.replace(/\n+/g, ', '));
  gap(4);

  heading('The business');
  if (input.businessType) row('Mainly offers', input.businessType);
  if (input.catalogueSize) row('Catalogue size', input.catalogueSize);
  if (input.offering) row('Sells / provides', input.offering);
  if (input.businessAim) block('About the business', input.businessAim);
  gap(2);

  heading('Website');
  row('Existing website', input.hasExistingWebsite ? input.existingWebsiteUrl || 'Yes' : 'No / not yet');
  if (input.siteGoals) block('What they want the site to do', input.siteGoals);
  if (input.notes) block('Anything else', input.notes);
  gap(2);

  heading('Commercials');
  row('Project fee', input.priceFormatted);
  row('Payment terms', input.paymentTerms);
  row('Payment method', input.paymentMethodLabel);
  if (input.startDate) row('Preferred start', input.startDate);
  if (input.finishDate) row('Expected completion', input.finishDate);
  gap(4);

  divider();
  heading('Signed by');
  row('Name', input.signedName);
  if (input.signedIdNumber) row('ID / passport', input.signedIdNumber);
  row('When', input.signedAtText.replace(/^Signed electronically on /, ''));

  drawBrandFooter(pdf, font, bold);
  return pdf.save();
}
