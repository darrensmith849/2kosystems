import type { LocalAgentJob } from './types';
import { scoreLabel, statusLabel, fmtDateTime } from './formatters';

function slug(s: string) {
  return s?.replace(/_/g, ' ') ?? '—';
}

export function buildHandoverReport(
  items: LocalAgentJob[],
  generatedAt = new Date().toLocaleString('en-ZA'),
): string {
  const lines: string[] = [];

  lines.push('# 2KO Systems — Lead Handover Report');
  lines.push('');
  lines.push(`Generated: ${generatedAt}`);
  lines.push(`Leads included: ${items.length}`);
  lines.push('');

  // Summary table
  lines.push('## Summary');
  lines.push('');
  lines.push('| # | Lead | Score | Type | Status | Temperature | Offer | Follow-up |');
  lines.push('|---|------|-------|------|--------|-------------|-------|-----------|');

  items.forEach((item, i) => {
    const name = item.senderName || item.result?.context?.leadName || '—';
    const score = `${item.leadScore} (${scoreLabel(item.leadScore)})`;
    const type = slug(item.result?.route?.enquiryType ?? '—');
    const status = statusLabel(item.localStatus);
    const temp = item.result?.classification?.temperature ?? '—';
    const offer = slug(item.result?.internalNotes?.recommendedOffer ?? '—');
    const followUp = item.localFollowUpDate
      ? new Date(item.localFollowUpDate).toLocaleDateString('en-ZA')
      : '—';
    lines.push(`| ${i + 1} | ${name} | ${score} | ${type} | ${status} | ${temp} | ${offer} | ${followUp} |`);
  });

  lines.push('');

  // Per-lead detail
  lines.push('---');
  lines.push('');
  lines.push('## Lead Detail');

  items.forEach((item, i) => {
    const result = item.result;
    const name = item.senderName || result?.context?.leadName || 'Unknown';
    lines.push('');
    lines.push(`### ${i + 1}. ${name}`);
    lines.push('');
    lines.push(`**Score:** ${item.leadScore}/100 — ${scoreLabel(item.leadScore)}`);
    lines.push(`**Analysed:** ${fmtDateTime(item.createdAt)}`);
    lines.push(`**Status:** ${statusLabel(item.localStatus)}`);
    if (item.localFollowUpDate) {
      lines.push(`**Follow-up date:** ${new Date(item.localFollowUpDate).toLocaleDateString('en-ZA')}`);
    }
    lines.push('');

    // Contact
    const contact: string[] = [];
    const ctx = result?.context;
    if (ctx?.email) contact.push(`Email: ${ctx.email}`);
    if (ctx?.phone) contact.push(`Phone: ${ctx.phone}`);
    if (ctx?.companyName) contact.push(`Company: ${ctx.companyName}`);
    if (ctx?.industry) contact.push(`Industry: ${ctx.industry}`);
    if (ctx?.roleTitle) contact.push(`Role: ${ctx.roleTitle}`);
    if (contact.length > 0) {
      lines.push('**Contact:**');
      contact.forEach((c) => lines.push(`- ${c}`));
      lines.push('');
    }

    // Enquiry summary
    if (item.enquirySummary) {
      lines.push('**Enquiry summary:**');
      lines.push(item.enquirySummary);
      lines.push('');
    }

    // Classification
    const cls = result?.classification;
    const route = result?.route;
    if (route || cls) {
      lines.push('**Classification:**');
      if (route) lines.push(`- Route: ${slug(route.business ?? '—')} / ${slug(route.enquiryType ?? '—')}`);
      if (cls) {
        lines.push(`- Temperature: ${cls.temperature ?? '—'}`);
        lines.push(`- Urgency: ${cls.urgency ?? '—'}`);
        lines.push(`- Commercial value: ${cls.commercialValue ?? '—'}`);
        lines.push(`- Strategic fit: ${cls.strategicFit ?? '—'}`);
      }
      lines.push('');
    }

    // Internal notes
    const notes = result?.internalNotes;
    if (notes) {
      lines.push('**Recommended offer:** ' + slug(notes.recommendedOffer ?? '—'));
      lines.push('');
      if (notes.opportunities?.length > 0) {
        lines.push('**Opportunities:**');
        notes.opportunities.forEach((o) => lines.push(`- ${o}`));
        lines.push('');
      }
      if (notes.risks?.length > 0) {
        lines.push('**Risks:**');
        notes.risks.forEach((r) => lines.push(`- ${r}`));
        lines.push('');
      }
      if (notes.recommendedNextAction) {
        lines.push('**Next action:** ' + notes.recommendedNextAction);
        lines.push('');
      }
    }

    // Admin note
    if (item.localAdminNote?.trim()) {
      lines.push('**Admin notes:**');
      lines.push(item.localAdminNote.trim());
      lines.push('');
    }

    lines.push('---');
  });

  return lines.join('\n');
}
