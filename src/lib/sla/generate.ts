import 'server-only';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { COMPANY_LEGAL_NAME, SLA_TITLE, SLA_CLAUSES, fillClause } from './template';

export type SlaInput = {
  companyName: string;
  businessAim?: string | null;
  siteGoals?: string | null;
  priceFormatted: string;
  paymentTerms: string;
  paymentMethodLabel: string;
  agreementDate: string;
  signedName: string;
  signedAtText: string;
  signedIp?: string | null;
  logo?: { bytes: Uint8Array; contentType: string } | null;
};

const PAGE_W = 595.28; // A4 portrait, points
const PAGE_H = 841.89;
const MARGIN = 52;
const CONTENT_W = PAGE_W - MARGIN * 2;

const GREEN = rgb(0x16 / 255, 0xa3 / 255, 0x4a / 255);
const DEEP = rgb(0x0a / 255, 0x35 / 255, 0x17 / 255);
const TEXT = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.85, 0.86, 0.87);

export async function generateSlaPdf(input: SlaInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${SLA_TITLE} — ${input.companyName}`);
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
  function paragraph(
    text: string,
    opts: { f?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; gap?: number; indent?: number } = {},
  ) {
    const f = opts.f ?? font;
    const size = opts.size ?? 10;
    const color = opts.color ?? TEXT;
    const gap = opts.gap ?? 4;
    const indent = opts.indent ?? 0;
    for (const ln of wrap(text, f, size, CONTENT_W - indent)) {
      ensure(size + gap);
      page.drawText(ln, { x: MARGIN + indent, y: y - size, size, font: f, color });
      y -= size + gap;
    }
  }
  function gap(h: number) {
    y -= h;
  }
  function divider() {
    ensure(12);
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.75, color: LINE });
    y -= 14;
  }
  function heading(text: string) {
    ensure(22);
    page.drawText(text.toUpperCase(), { x: MARGIN, y: y - 10, size: 9, font: bold, color: GREEN });
    y -= 18;
  }
  function detailRow(label: string, value: string) {
    ensure(14);
    page.drawText(label, { x: MARGIN, y: y - 10, size: 9.5, font: bold, color: TEXT });
    const valueX = MARGIN + 130;
    const lines = wrap(value, font, 9.5, CONTENT_W - 130);
    lines.forEach((ln, i) => {
      if (i > 0) {
        ensure(13);
        y -= 13;
      }
      page.drawText(ln, { x: valueX, y: y - 10, size: 9.5, font, color: TEXT });
    });
    y -= 16;
  }

  // ---- Header: client logo + title ----
  let headerBottom = y;
  if (input.logo && input.logo.bytes.length > 0) {
    try {
      const img =
        input.logo.contentType === 'image/png'
          ? await pdf.embedPng(input.logo.bytes)
          : await pdf.embedJpg(input.logo.bytes);
      const maxH = 46;
      const maxW = 150;
      const scale = Math.min(maxH / img.height, maxW / img.width, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: MARGIN, y: y - h, width: w, height: h });
      headerBottom = y - h;
    } catch {
      // Unreadable image — skip the logo rather than failing the whole PDF.
    }
  }

  page.drawText(SLA_TITLE, { x: MARGIN, y: headerBottom - 24, size: 17, font: bold, color: DEEP });
  page.drawText(`Prepared by ${COMPANY_LEGAL_NAME} for ${input.companyName}`, {
    x: MARGIN,
    y: headerBottom - 40,
    size: 9.5,
    font,
    color: MUTED,
  });
  y = headerBottom - 52;
  divider();

  // ---- Parties & date ----
  heading('Agreement');
  detailRow('Service provider', COMPANY_LEGAL_NAME);
  detailRow('Client', input.companyName);
  detailRow('Date', input.agreementDate);
  gap(4);

  // ---- Project ----
  if (input.businessAim || input.siteGoals) {
    heading('Project');
    if (input.businessAim) {
      paragraph('About the business', { f: bold, size: 9.5 });
      paragraph(input.businessAim, { color: MUTED });
      gap(4);
    }
    if (input.siteGoals) {
      paragraph('What the website should achieve', { f: bold, size: 9.5 });
      paragraph(input.siteGoals, { color: MUTED });
    }
    gap(6);
  }

  // ---- Fee & payment ----
  heading('Fee & payment');
  detailRow('Project fee', input.priceFormatted);
  detailRow('Payment terms', input.paymentTerms);
  detailRow('Payment method', input.paymentMethodLabel);
  gap(6);

  // ---- Terms ----
  heading('Terms');
  for (const clause of SLA_CLAUSES) {
    paragraph(clause.title, { f: bold, size: 9.5 });
    paragraph(fillClause(clause.body, input.companyName), { color: MUTED, gap: 3 });
    gap(5);
  }

  // ---- Signature ----
  gap(4);
  divider();
  heading('Signed');
  paragraph(`Signed electronically by ${input.signedName}, on behalf of ${input.companyName}.`, { size: 10 });
  paragraph(`${input.signedAtText}${input.signedIp ? ` · IP ${input.signedIp}` : ''}`, { size: 8.5, color: MUTED });
  gap(8);
  paragraph(`Accepted by ${COMPANY_LEGAL_NAME}.`, { size: 10 });

  return pdf.save();
}
