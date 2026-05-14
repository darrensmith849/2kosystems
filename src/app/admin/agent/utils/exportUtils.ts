import type { AgentOutput } from '@/lib/agent-core/types';
import type { FormState } from './types';
import { slug, scoreLabel } from './formatters';

export function buildMarkdown(result: AgentOutput, form: FormState): string {
  const lines: string[] = [
    '# 2KO Systems — Agent Analysis',
    '',
    `**Analysed:** ${new Date().toLocaleString('en-ZA')}`,
    '',
    '## Lead Summary',
    `- **Name:** ${result.context.leadName ?? 'Unknown'}`,
    `- **Company:** ${result.context.companyName ?? 'Unknown'}`,
    `- **Industry:** ${result.context.industry ?? 'Unknown'}`,
    `- **Source:** ${form.source}`,
    '',
    '## Classification',
    `- **Route:** ${slug(result.route.business)}`,
    `- **Enquiry type:** ${slug(result.route.enquiryType)}`,
    `- **Lead score:** ${result.classification.leadScore}/100 (${scoreLabel(result.classification.leadScore)})`,
    `- **Temperature:** ${result.classification.temperature}`,
    `- **Urgency:** ${result.classification.urgency}`,
    `- **Commercial value:** ${result.classification.commercialValue}`,
    `- **Strategic fit:** ${result.classification.strategicFit}`,
    `- **Categories:** ${result.classification.categories.map(slug).join(', ')}`,
    '',
    '## Enquiry Summary',
    result.context.enquirySummary,
    '',
    '## Operational Pain Point',
    result.context.operationalPainPoint ?? 'Not identified',
    '',
  ];

  if (result.context.missingInformation.length > 0) {
    lines.push('## Missing Information');
    result.context.missingInformation.forEach((m) => lines.push(`- ${m}`));
    lines.push('');
  }

  lines.push(
    '## Suggested Reply',
    '',
    `**Subject:** ${result.suggestedReply.subject}`,
    '',
    result.suggestedReply.body,
    '',
    '## Internal Notes',
    '',
    `**Recommended offer:** ${slug(result.internalNotes.recommendedOffer)}`,
    '',
  );

  if (result.internalNotes.risks.length > 0) {
    lines.push('**Risks:**');
    result.internalNotes.risks.forEach((r) => lines.push(`- ${r}`));
    lines.push('');
  }
  if (result.internalNotes.opportunities.length > 0) {
    lines.push('**Opportunities:**');
    result.internalNotes.opportunities.forEach((o) => lines.push(`- ${o}`));
    lines.push('');
  }

  lines.push(
    `**Discovery angle:** ${result.internalNotes.suggestedDiscoveryAngle}`,
    '',
    `**Next action:** ${result.internalNotes.recommendedNextAction}`,
    '',
    '## Follow-up',
    `- **Priority:** ${result.followUp.priority}`,
    `- **Timing:** ${result.followUp.suggestedTiming}`,
    `- **Suggested message:** ${result.followUp.suggestedMessage}`,
    '',
    '## Safety Confirmation',
    `- Human review required: **${result.safety.humanReviewRequired}**`,
    `- Approval status: **${result.safety.approvalStatus}**`,
    `- Auto-sent: **${result.safety.autoSent}**`,
    `- Production action taken: **${result.safety.productionActionTaken}**`,
    `- What the agent did: ${result.safety.whatAgentDid}`,
    `- What the agent did NOT do: ${result.safety.whatAgentDidNotDo}`,
  );

  return lines.join('\n');
}

export function buildHandover(result: AgentOutput): string {
  return [
    'INTERNAL HANDOVER — 2KO Systems',
    '',
    `Lead: ${result.context.leadName ?? 'Unknown'} | ${result.context.companyName ?? 'Unknown company'}`,
    `Score: ${result.classification.leadScore}/100 — ${scoreLabel(result.classification.leadScore)}`,
    `Route: ${slug(result.route.business)} / ${slug(result.route.enquiryType)}`,
    `Recommended offer: ${slug(result.internalNotes.recommendedOffer)}`,
    '',
    'SUMMARY',
    result.context.enquirySummary,
    '',
    ...(result.context.operationalPainPoint
      ? ['PAIN POINT', result.context.operationalPainPoint, '']
      : []),
    'NEXT ACTION',
    result.internalNotes.recommendedNextAction,
    '',
    `FOLLOW-UP: ${result.followUp.priority} priority — ${result.followUp.suggestedTiming}`,
    '',
    'SAFETY: Draft only. Human review required. No message sent. No production action taken.',
  ].join('\n');
}

export function buildNotesText(result: AgentOutput): string {
  return [
    `Recommended offer: ${slug(result.internalNotes.recommendedOffer)}`,
    `\nRisks:\n${result.internalNotes.risks.map((r) => `- ${r}`).join('\n')}`,
    `\nOpportunities:\n${result.internalNotes.opportunities.map((o) => `- ${o}`).join('\n')}`,
    `\nDiscovery angle: ${result.internalNotes.suggestedDiscoveryAngle}`,
    `\nNext action: ${result.internalNotes.recommendedNextAction}`,
  ].join('');
}

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
