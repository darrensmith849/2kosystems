import 'server-only';
import type { AgentOutput, EnquiryInput, RawLLMOutput, SafetyAudit } from './types';

const WHAT_AGENT_DID_NOT_DO =
  'Did not send any messages, emails, WhatsApps, calendar invites, proposals, or any other ' +
  'external communications. Did not write to any database. Did not take any production action.';

// Safety fields are always written here in code — the LLM cannot set or override these.
export function buildSafetyAudit(whatAgentDid: string): SafetyAudit {
  return {
    humanReviewRequired: true,
    approvalStatus: 'draft',
    autoSent: false,
    productionActionTaken: false,
    whatAgentDid,
    whatAgentDidNotDo: WHAT_AGENT_DID_NOT_DO,
  };
}

// Merges whatever partial output we have with safe defaults, then enforces safety fields.
// Used when the LLM fails, returns unparseable output, or is in error.
export function enforceSafetyFields(
  raw: Partial<RawLLMOutput>,
  input: EnquiryInput,
  agentError?: string
): AgentOutput {
  const errorNote = agentError ? `Agent error: ${agentError}` : 'Safety fallback applied — manual review required.';

  return {
    route: raw.route ?? {
      business: 'unknown_or_mixed',
      enquiryType: 'unclear_needs_review',
      confidence: 0,
      reason: errorNote,
    },
    classification: raw.classification ?? {
      categories: ['unclear_or_needs_review'],
      temperature: 'cold',
      urgency: 'low',
      commercialValue: 'low',
      strategicFit: 'low',
      complexity: 'low',
      leadScore: 0,
    },
    context: raw.context ?? {
      leadName: input.senderName ?? null,
      companyName: null,
      website: null,
      email: input.senderEmail ?? null,
      phone: input.senderPhone ?? null,
      location: null,
      industry: null,
      roleTitle: null,
      enquirySummary: input.message,
      operationalPainPoint: null,
      requestedSolution: null,
      currentTools: null,
      currentProcess: null,
      budgetSignal: null,
      urgencySignal: null,
      authoritySignal: null,
      missingInformation: ['Agent output unavailable — full manual review required'],
    },
    suggestedReply: raw.suggestedReply ?? {
      draftType: 'request_for_missing_information',
      subject: 'Your Enquiry — Manual Review Required',
      body: [
        `Thank you for reaching out.`,
        ``,
        `We have received your message and will be in touch shortly to discuss how we can help.`,
        ``,
        `[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
      ].join('\n'),
      whyThisReplyFits: 'Fallback reply — agent output was unavailable.',
    },
    internalNotes: {
      risks: [
        errorNote,
        ...(raw.internalNotes?.risks ?? []),
      ],
      opportunities: raw.internalNotes?.opportunities ?? [],
      recommendedOffer: raw.internalNotes?.recommendedOffer ?? 'unclear_needs_review',
      suggestedDiscoveryAngle:
        raw.internalNotes?.suggestedDiscoveryAngle ??
        'Manually review this enquiry to determine the correct next step.',
      recommendedNextAction:
        raw.internalNotes?.recommendedNextAction ??
        'Manually review before any response is sent.',
    },
    followUp: raw.followUp ?? {
      suggestedTiming: 'Within 24 hours',
      suggestedMessage: 'Manual follow-up required — agent did not complete analysis.',
      internalReason: 'Agent fallback triggered',
      priority: 'medium',
    },
    safety: buildSafetyAudit(
      'Processed enquiry through safety fallback. No analysis was sent to an LLM. No external actions were taken.'
    ),
  };
}
