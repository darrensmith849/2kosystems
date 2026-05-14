import 'server-only';
import type { AgentOutput, EnquiryInput } from './types';
import { buildSafetyAudit } from './safety';

// Returns deterministic mock analysis without calling any external LLM.
// Activated when AGENT_MOCK_MODE=true.
export function generateMockOutput(input: EnquiryInput): AgentOutput {
  const msg = (input.message ?? '').toLowerCase();

  const isSpam =
    msg.includes('seo') ||
    msg.includes('marketing agency') ||
    msg.includes('vendor') ||
    msg.includes('supplier') ||
    msg.includes('we offer') ||
    msg.includes('link building');

  const isExistingClient =
    msg.includes('our website') ||
    msg.includes('our system') ||
    msg.includes('the website you built') ||
    msg.includes('bug') ||
    msg.includes('not working') ||
    msg.includes('broken') ||
    msg.includes('existing');

  const isStrongLead =
    msg.includes('automation') ||
    msg.includes('crm') ||
    msg.includes('workflow') ||
    msg.includes('dashboard') ||
    msg.includes('system') ||
    msg.includes('process') ||
    msg.includes('manual') ||
    msg.includes('ai');

  const name = input.senderName ?? null;
  const greeting = name ? `Hi ${name},` : 'Hi there,';

  if (isSpam) {
    return {
      route: {
        business: 'not_relevant',
        enquiryType: 'supplier_or_spam',
        confidence: 90,
        reason: 'Mock mode: message classified as a supplier pitch or irrelevant outreach.',
      },
      classification: {
        categories: ['spam_or_supplier', 'low_fit_lead'],
        temperature: 'cold',
        urgency: 'low',
        commercialValue: 'low',
        strategicFit: 'low',
        complexity: 'low',
        leadScore: 5,
      },
      context: {
        leadName: name,
        companyName: null,
        website: null,
        email: input.senderEmail ?? null,
        phone: input.senderPhone ?? null,
        location: null,
        industry: null,
        roleTitle: null,
        enquirySummary:
          'Supplier pitch or irrelevant outreach. No operational need identified. No business value.',
        operationalPainPoint: null,
        requestedSolution: null,
        currentTools: null,
        currentProcess: null,
        budgetSignal: null,
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: [],
      },
      suggestedReply: {
        draftType: 'low_fit_polite_response',
        subject: 'Thank you for reaching out',
        body: [
          greeting,
          '',
          'Thank you for your message.',
          '',
          'We are not looking for external vendors or marketing services at this time.',
          '',
          'We wish you well.',
          '',
          '[DRAFT — DO NOT SEND WITHOUT REVIEW]',
        ].join('\n'),
        whyThisReplyFits:
          'Mock: Polite, brief decline appropriate for a supplier pitch or irrelevant outreach.',
      },
      internalNotes: {
        risks: ['No business value — supplier pitch.'],
        opportunities: [],
        recommendedOffer: 'low_fit_or_refer_out',
        suggestedDiscoveryAngle: 'No discovery needed — decline politely or archive.',
        recommendedNextAction: 'Archive or send polite decline. No further action required.',
      },
      followUp: {
        suggestedTiming: 'No follow-up needed',
        suggestedMessage: 'No follow-up required.',
        internalReason: 'Low-fit — spam or supplier pitch.',
        priority: 'low',
      },
      safety: buildSafetyAudit(
        'Mock mode: Classified enquiry as low-fit/spam. No LLM was called. No external actions were taken.'
      ),
    };
  }

  if (isExistingClient) {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'existing_client_support',
        confidence: 80,
        reason:
          'Mock mode: message suggests an existing client requesting support or a fix.',
      },
      classification: {
        categories: ['support_or_existing_client'],
        temperature: 'warm',
        urgency: 'medium',
        commercialValue: 'medium',
        strategicFit: 'high',
        complexity: 'low',
        leadScore: 55,
      },
      context: {
        leadName: name,
        companyName: null,
        website: null,
        email: input.senderEmail ?? null,
        phone: input.senderPhone ?? null,
        location: null,
        industry: null,
        roleTitle: null,
        enquirySummary:
          'Existing client requesting support or a fix with an existing system or website. Specific issue detail not yet provided.',
        operationalPainPoint: 'Issue with existing system or website.',
        requestedSolution: 'Support or fix from 2KO Systems.',
        currentTools: null,
        currentProcess: null,
        budgetSignal: 'Existing client — retained relationship.',
        urgencySignal: 'Moderate urgency implied.',
        authoritySignal: 'Existing client contact — likely authorised.',
        missingInformation: ['Specific issue details', 'Affected system, page, or feature'],
      },
      suggestedReply: {
        draftType: 'existing_client_support_response',
        subject: 'Re: Your Support Request',
        body: [
          greeting,
          '',
          'Thank you for getting in touch — we have picked up your message and will look into this shortly.',
          '',
          'Could you share a bit more detail about what you are seeing? A brief description or screenshot of the issue would help us respond as effectively as possible.',
          '',
          'We will be in touch soon.',
          '',
          '[DRAFT — DO NOT SEND WITHOUT REVIEW]',
        ].join('\n'),
        whyThisReplyFits:
          'Mock: Warm, prompt acknowledgement appropriate for an existing client support request.',
      },
      internalNotes: {
        risks: [
          'Urgency may be higher than initially detected — verify before responding.',
          'Issue scope unknown until more detail is shared.',
        ],
        opportunities: [
          'Potential to identify a retainer or ongoing support arrangement.',
          'Positive support experience strengthens client relationship.',
        ],
        recommendedOffer: 'existing_client_support',
        suggestedDiscoveryAngle:
          'Understand the specific issue, its impact on the client, and whether it points to a wider system improvement.',
        recommendedNextAction:
          'Respond promptly and request more detail — aim to reply within 2–4 hours.',
      },
      followUp: {
        suggestedTiming: 'Within 4 hours',
        suggestedMessage:
          'Hi — just following up on your support request. Have you had a chance to share more detail?',
        internalReason: 'Existing client — priority response expected.',
        priority: 'high',
      },
      safety: buildSafetyAudit(
        'Mock mode: Classified enquiry as existing client support. No LLM was called. No external actions were taken.'
      ),
    };
  }

  // Default: new business lead
  return {
    route: {
      business: 'two_ko_systems',
      enquiryType: isStrongLead ? 'ai_automation_enquiry' : 'new_business_lead',
      confidence: 78,
      reason:
        'Mock mode: message suggests a new business enquiry with relevance to 2KO Systems services.',
    },
    classification: {
      categories: isStrongLead
        ? ['ai_automation_enquiry', 'workflow_improvement', 'high_value_lead']
        : ['custom_system_enquiry', 'discovery_call_request'],
      temperature: 'warm',
      urgency: 'medium',
      commercialValue: 'high',
      strategicFit: 'high',
      complexity: 'medium',
      leadScore: 72,
    },
    context: {
      leadName: name,
      companyName: null,
      website: null,
      email: input.senderEmail ?? null,
      phone: input.senderPhone ?? null,
      location: null,
      industry: null,
      roleTitle: null,
      enquirySummary:
        'New business enquiry with potential for automation, workflow improvement, or a custom system build. Strong initial fit with 2KO Systems services. Discovery needed to confirm scope and budget.',
      operationalPainPoint: 'Manual or inefficient processes slowing the business down.',
      requestedSolution: 'Automation, a custom system, or workflow improvement.',
      currentTools: null,
      currentProcess: null,
      budgetSignal: null,
      urgencySignal: 'Moderate — not time-critical but motivated.',
      authoritySignal: 'Appears to be a business owner or senior decision-maker.',
      missingInformation: [
        'Budget range or investment appetite',
        'Team size and current tools in use',
        'Specific process or workflow to improve',
        'Timeline expectations',
        'Company name and industry',
      ],
    },
    suggestedReply: {
      draftType: 'discovery_call_suggestion',
      subject: "Your Enquiry — Let's Explore What's Possible",
      body: [
        greeting,
        '',
        "Thank you for reaching out — this sounds like exactly the kind of operational challenge we help businesses solve.",
        '',
        "Before we go into specifics, it would be most valuable to have a short discovery call to understand your current setup, where the bottlenecks are, and what a 'solved' version of this looks like for your business.",
        '',
        'From there we can give you a clear picture of what is possible and what would make the most sense as a practical starting point.',
        '',
        'Would you be open to a 30-minute call this week?',
        '',
        '[DRAFT — DO NOT SEND WITHOUT REVIEW]',
      ].join('\n'),
      whyThisReplyFits:
        'Mock: Warm, discovery-led response. Avoids jumping to a build before understanding the problem — consistent with 2KO Systems positioning.',
    },
    internalNotes: {
      risks: [
        'Budget not yet confirmed — could be early-stage or exploratory.',
        'Authority not fully confirmed.',
        'Scope requires discovery before any estimate is possible.',
      ],
      opportunities: [
        'Strong fit for a Systems Opportunity Audit as the first engagement.',
        'Potential for a core system build or managed retainer if fit is confirmed.',
        'Could become a case study if the outcome is strong.',
      ],
      recommendedOffer: 'systems_opportunity_audit',
      suggestedDiscoveryAngle:
        "Explore their current manual processes, what's slowing them down, team size, current tools, and what a 'fixed' version of their operations would look like. Identify where automation or a system would have the biggest leverage.",
      recommendedNextAction:
        'Book a 30-minute discovery call to map their operational setup and confirm fit.',
    },
    followUp: {
      suggestedTiming: '48 hours if no reply',
      suggestedMessage:
        'Hi — just following up on my previous message. Would a short call this week work for you?',
      internalReason:
        'Strong lead — worth a single polite follow-up if no reply within 48 hours.',
      priority: 'high',
    },
    safety: buildSafetyAudit(
      'Mock mode: Generated mock analysis for new business enquiry. No LLM was called. No external actions were taken.'
    ),
  };
}
