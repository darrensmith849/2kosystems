// Pure adapter functions — no network calls, no side effects, no imports that touch DB or SDKs.
// Maps contact form payloads to EnquiryInput so the orchestrator can process them.
// Call mapContactFormToEnquiryInput() in the contact form POST route once
// you're ready to connect the public form to the agent pipeline.

import type { EnquiryInput } from '@/lib/agent-core/types';

// Shape of the existing public contact form POST body
export interface ContactFormPayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  source?: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Shape of the existing audit / systems-review form POST body
export interface AuditFormPayload {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  currentTools?: string;
  mainChallenge?: string;
  teamSize?: string;
  timeframe?: string;
  source?: string;
  pageUrl?: string;
}

export function mapContactFormToEnquiryInput(form: ContactFormPayload): EnquiryInput {
  const parts: string[] = [form.message.trim()];

  return {
    businessKey: 'two_ko_systems',
    source: form.source ?? 'contact_form',
    sourceUrl: form.pageUrl,
    subject: form.subject?.trim() || undefined,
    message: parts.join('\n\n'),
    senderName: form.name?.trim() || undefined,
    senderEmail: form.email?.trim() || undefined,
    senderPhone: form.phone?.trim() || undefined,
    metadata: {
      utmSource: form.utmSource,
      utmMedium: form.utmMedium,
      utmCampaign: form.utmCampaign,
    },
  };
}

export function mapAuditFormToEnquiryInput(form: AuditFormPayload): EnquiryInput {
  const bodyParts: string[] = [];

  if (form.companyName) bodyParts.push(`Company: ${form.companyName}`);
  if (form.teamSize) bodyParts.push(`Team size: ${form.teamSize}`);
  if (form.currentTools) bodyParts.push(`Current tools: ${form.currentTools}`);
  if (form.mainChallenge) bodyParts.push(`Main challenge: ${form.mainChallenge}`);
  if (form.timeframe) bodyParts.push(`Timeframe: ${form.timeframe}`);

  const message = bodyParts.length > 0
    ? `Systems audit request.\n\n${bodyParts.join('\n')}`
    : 'Systems audit request.';

  return {
    businessKey: 'two_ko_systems',
    source: form.source ?? 'audit_form',
    sourceUrl: form.pageUrl,
    subject: 'Systems Opportunity Audit Request',
    message,
    senderName: form.name?.trim() || undefined,
    senderEmail: form.email?.trim() || undefined,
    senderPhone: form.phone?.trim() || undefined,
  };
}

// Validates that a payload has the minimum required fields for agent processing.
// Returns an array of missing field labels (empty = valid).
export function validateContactFormPayload(form: ContactFormPayload): string[] {
  const missing: string[] = [];
  if (!form.message?.trim()) missing.push('message');
  return missing;
}

export function validateAuditFormPayload(form: AuditFormPayload): string[] {
  const missing: string[] = [];
  if (!form.mainChallenge?.trim()) missing.push('mainChallenge');
  return missing;
}
