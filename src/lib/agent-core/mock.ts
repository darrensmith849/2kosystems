import 'server-only';
import type { AgentOutput, EnquiryInput } from './types';
import { buildSafetyAudit } from './safety';

// Returns deterministic mock analysis without calling any external LLM.
// Activated when AGENT_MOCK_MODE=true.
export function generateMockOutput(input: EnquiryInput): AgentOutput {
  const text = ((input.message ?? '') + ' ' + (input.subject ?? '')).toLowerCase();
  const name = input.senderName ?? null;
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const safety = buildSafetyAudit('Mock mode — no LLM was called. Output is deterministic based on message keywords.');

  // Detection — checked in priority order
  const isSpam =
    text.includes('seo') ||
    text.includes('digital marketing') ||
    text.includes('marketing agency') ||
    text.includes('link building') ||
    text.includes('we offer') ||
    text.includes('vendor') ||
    text.includes('supplier') ||
    text.includes('white-label') ||
    text.includes('partnership opportunity');

  const isExistingClientSupport =
    text.includes('bug') ||
    text.includes('not working') ||
    text.includes('broken') ||
    text.includes('error on') ||
    text.includes('the system') ||
    text.includes('our system') ||
    text.includes('support retainer') ||
    text.includes('the booking module') ||
    text.includes('the website you built');

  const isRetainerEnquiry =
    text.includes('retainer') ||
    text.includes('monthly') ||
    text.includes('ongoing support') ||
    text.includes('ongoing maintenance') ||
    text.includes('sla') ||
    text.includes('managed service') ||
    text.includes('per month');

  const isDiscoveryRequest =
    text.includes('discovery call') ||
    text.includes('book a call') ||
    text.includes('schedule a call') ||
    text.includes('intro call') ||
    text.includes('initial call');

  const isHighValue =
    (text.includes('r500') ||
      text.includes('r 500') ||
      text.includes('500,000') ||
      text.includes('budget') && text.includes('ceo') ||
      text.includes('phase one') && text.includes('r')) &&
    (text.includes('ceo') || text.includes('managing director') || text.includes('owner'));

  const isCrmOrDashboard =
    text.includes('crm') ||
    text.includes('customer relationship') ||
    text.includes('dashboard') ||
    text.includes('reporting') ||
    text.includes('management system') ||
    text.includes('pipeline') ||
    text.includes('leads system');

  const isWebsiteOrPortal =
    text.includes('portal') ||
    text.includes('client portal') ||
    text.includes('staff portal') ||
    text.includes('website') ||
    text.includes('web app') ||
    text.includes('online booking') ||
    text.includes('booking system');

  const isVague =
    text.split(' ').length < 20 ||
    (text.includes('technology') && !text.includes('crm') && !text.includes('system') && !text.includes('workflow'));

  // isWorkflowOrAutomation: default for anything with process/automation language
  // used as the fallback for any recognisable 2KO-fit enquiry

  function spamOutput(): AgentOutput {
    return {
      route: {
        business: 'not_relevant',
        enquiryType: 'supplier_or_spam',
        confidence: 92,
        reason: 'Mock: message is a supplier pitch or unsolicited outreach.',
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
        enquirySummary: 'Unsolicited outreach or supplier pitch — not a genuine business enquiry.',
        operationalPainPoint: null,
        requestedSolution: null,
        currentTools: null,
        currentProcess: null,
        budgetSignal: null,
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: ['This is not a lead — no follow-up required.'],
      },
      suggestedReply: {
        draftType: 'low_fit_polite_response',
        subject: 'Re: Your enquiry',
        body: `${greeting}\n\nThank you for reaching out. We are not looking for external service providers or partners at this time.\n\nWe will keep your details on file.\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'Short, polite dismissal with no commitment. Appropriate for unsolicited outreach.',
      },
      internalNotes: {
        risks: ['Spam or supplier pitch — no commercial value.'],
        opportunities: [],
        recommendedOffer: 'low_fit_or_refer_out',
        suggestedDiscoveryAngle: 'None — not a genuine lead.',
        recommendedNextAction: 'Archive and do not follow up.',
      },
      followUp: {
        suggestedTiming: 'No follow-up needed.',
        suggestedMessage: '',
        internalReason: 'Spam classification — no value in follow-up.',
        priority: 'low',
      },
      safety,
    };
  }

  function existingClientSupportOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'existing_client_support',
        confidence: 88,
        reason: 'Mock: existing client reporting a bug or requesting support.',
      },
      classification: {
        categories: ['support_or_existing_client'],
        temperature: 'warm',
        urgency: 'high',
        commercialValue: 'medium',
        strategicFit: 'high',
        complexity: 'medium',
        leadScore: 58,
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
        enquirySummary: 'Existing client reporting an issue or requesting support. Urgent response required.',
        operationalPainPoint: 'System issue or bug affecting operations.',
        requestedSolution: 'Bug fix or technical support.',
        currentTools: null,
        currentProcess: null,
        budgetSignal: 'Existing retainer client — support covered.',
        urgencySignal: 'Active issue reported.',
        authoritySignal: null,
        missingInformation: ['Specific error details or steps to reproduce.'],
      },
      suggestedReply: {
        draftType: 'existing_client_support_response',
        subject: 'Re: Support request — we\'re on it',
        body: `${greeting}\n\nThanks for flagging this — we'll take a look straight away.\n\nCould you share any error messages or steps that trigger the issue? That will help us isolate it faster.\n\nWe'll update you as soon as we have more information.\n\nBest,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'Existing client support response — direct, action-oriented, no sales language.',
      },
      internalNotes: {
        risks: ['Issue may be time-sensitive if affecting live operations.'],
        opportunities: ['Good support response reinforces retention.'],
        recommendedOffer: 'existing_client_support',
        suggestedDiscoveryAngle: 'Understand the issue scope before committing to a fix timeline.',
        recommendedNextAction: 'Investigate and respond within 2 hours.',
      },
      followUp: {
        suggestedTiming: 'Within 2 hours.',
        suggestedMessage: 'Following up on the issue you reported — have you been able to reproduce it consistently?',
        internalReason: 'Active client issue requires prompt follow-up.',
        priority: 'high',
      },
      safety,
    };
  }

  function retainerOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'new_business_lead',
        confidence: 82,
        reason: 'Mock: enquiry explicitly requesting a retainer or managed service arrangement.',
      },
      classification: {
        categories: ['support_or_existing_client', 'high_value_lead'],
        temperature: 'warm',
        urgency: 'medium',
        commercialValue: 'high',
        strategicFit: 'high',
        complexity: 'medium',
        leadScore: 74,
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
        enquirySummary: 'Business seeking an ongoing retainer or managed technology partner. Strong recurring revenue potential.',
        operationalPainPoint: 'Need for reliable technology support and continuous system evolution.',
        requestedSolution: 'Monthly retainer or managed intelligence service.',
        currentTools: null,
        currentProcess: null,
        budgetSignal: 'Monthly retainer arrangement mentioned.',
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: ['Current system details', 'Monthly budget range', 'Team size'],
      },
      suggestedReply: {
        draftType: 'discovery_call_suggestion',
        subject: 'Re: Ongoing technology retainer',
        body: `${greeting}\n\nA managed retainer arrangement is something we actively work with — it allows us to act as your ongoing technology partner rather than a series of one-off projects.\n\nBefore we discuss scope and pricing, it would be useful to understand your current setup, what you need supported, and what new capabilities you're looking to build over time.\n\nWould you be available for a 30-minute discovery call this week?\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'Retainer enquiry with strong recurring revenue fit. Discovery call to scope the engagement before quoting.',
      },
      internalNotes: {
        risks: ['Scope of retainer unclear — could be under or over-specified.'],
        opportunities: ['High-value recurring revenue opportunity.', 'Potential to expand beyond initial support scope.'],
        recommendedOffer: 'managed_intelligence_retainer',
        suggestedDiscoveryAngle: 'Current tech stack, pain points, desired monthly scope, team size, and growth plans.',
        recommendedNextAction: 'Book discovery call to scope retainer.',
      },
      followUp: {
        suggestedTiming: '48 hours if no reply.',
        suggestedMessage: 'Just following up on the retainer discussion — keen to find a time to connect.',
        internalReason: 'High-value lead — prompt follow-up important.',
        priority: 'high',
      },
      safety,
    };
  }

  function discoveryRequestOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'discovery_or_audit_request',
        confidence: 85,
        reason: 'Mock: lead explicitly requesting a discovery call or initial conversation.',
      },
      classification: {
        categories: ['discovery_call_request'],
        temperature: 'warm',
        urgency: 'medium',
        commercialValue: 'medium',
        strategicFit: 'medium',
        complexity: 'low',
        leadScore: 64,
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
        enquirySummary: 'Lead requesting a discovery call. Intent confirmed but scope and budget unknown.',
        operationalPainPoint: null,
        requestedSolution: 'Discovery call to discuss fit and opportunities.',
        currentTools: null,
        currentProcess: null,
        budgetSignal: null,
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: ['Business context', 'Problem area', 'Budget signal'],
      },
      suggestedReply: {
        draftType: 'discovery_call_suggestion',
        subject: 'Re: Discovery call',
        body: `${greeting}\n\nAbsolutely — a discovery call is a great starting point.\n\nBefore we book a time, it would help to know a bit more about your business and what you're looking to solve. Could you share:\n\n- What industry are you in, and roughly how big is the team?\n- What's the core problem or opportunity you're trying to address?\n- Have you worked with a technology partner on this kind of project before?\n\nOnce we have that context, we can make sure the call is as useful as possible.\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'Discovery call request with missing context. Pre-qualify before booking to ensure a productive conversation.',
      },
      internalNotes: {
        risks: ['Limited information — may not be a qualified lead.'],
        opportunities: ['Confirmed intent to engage — good conversion potential.'],
        recommendedOffer: 'proof_of_value_pilot',
        suggestedDiscoveryAngle: 'Problem definition, current setup, budget signal, and decision timeline.',
        recommendedNextAction: 'Respond and gather pre-call context before booking.',
      },
      followUp: {
        suggestedTiming: '72 hours if no reply.',
        suggestedMessage: 'Following up — still keen to connect and learn more about what you\'re working on.',
        internalReason: 'Warm lead with confirmed intent — worth following up.',
        priority: 'medium',
      },
      safety,
    };
  }

  function highValueOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'proposal_or_quote_request',
        confidence: 88,
        reason: 'Mock: high-value lead with confirmed budget, authority signal, and short decision timeline.',
      },
      classification: {
        categories: ['high_value_lead', 'custom_system_enquiry'],
        temperature: 'hot',
        urgency: 'high',
        commercialValue: 'high',
        strategicFit: 'high',
        complexity: 'high',
        leadScore: 88,
      },
      context: {
        leadName: name,
        companyName: null,
        website: null,
        email: input.senderEmail ?? null,
        phone: input.senderPhone ?? null,
        location: null,
        industry: null,
        roleTitle: 'CEO / Senior Leader',
        enquirySummary: 'Priority lead: confirmed budget, decision-maker, short timeline, clear scope. Respond urgently.',
        operationalPainPoint: 'Large-scale operational system requirement.',
        requestedSolution: 'Full operational system build.',
        currentTools: null,
        currentProcess: null,
        budgetSignal: 'Budget confirmed — R500,000+ range indicated.',
        urgencySignal: 'Decision within 3 weeks — competitive situation.',
        authoritySignal: 'CEO or equivalent — decision-maker confirmed.',
        missingInformation: [],
      },
      suggestedReply: {
        draftType: 'discovery_call_suggestion',
        subject: 'Re: Operational system overhaul — let\'s talk',
        body: `${greeting}\n\nThank you — this sounds like exactly the kind of engagement we specialise in.\n\nBefore we can speak meaningfully to scope and approach, we'd want to spend 45 minutes understanding your current setup, the key pain points across each function, and your priorities for phase one.\n\nI'd suggest we treat that initial conversation as a structured discovery session — we'll come prepared, and you'll leave with a clear sense of whether we're the right fit and what a realistic engagement looks like.\n\nAre you available this week or early next week?\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'High-value priority lead with confirmed authority and budget. Structured discovery call positions 2KO as a strategic partner, not just a vendor.',
      },
      internalNotes: {
        risks: ['Competitive situation — other vendors in the process.', 'Large scope may require detailed scoping before proposal.'],
        opportunities: ['Flagship engagement potential.', 'Case study opportunity.', 'Long-term relationship and retainer potential.'],
        recommendedOffer: 'systems_opportunity_audit',
        suggestedDiscoveryAngle: 'Full scope across ERP, scheduling, portals, dashboards. Prioritise quick wins for phase one.',
        recommendedNextAction: 'Respond within 2 hours and book a call for this week.',
      },
      followUp: {
        suggestedTiming: 'Same day — urgent.',
        suggestedMessage: 'Following up to confirm a time — keen to make sure we can connect before your decision deadline.',
        internalReason: 'Priority lead with competitive pressure — fast follow-up is critical.',
        priority: 'high',
      },
      safety,
    };
  }

  function crmDashboardOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'crm_or_dashboard_enquiry',
        confidence: 80,
        reason: 'Mock: CRM, reporting dashboard, or data visibility request.',
      },
      classification: {
        categories: ['crm_or_dashboard', 'custom_system_enquiry'],
        temperature: 'warm',
        urgency: 'medium',
        commercialValue: 'medium',
        strategicFit: 'high',
        complexity: 'medium',
        leadScore: 67,
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
        enquirySummary: 'Business requesting a custom CRM or management dashboard. Good strategic fit.',
        operationalPainPoint: 'Lack of visibility across customer data or operational metrics.',
        requestedSolution: 'Custom CRM or dashboard.',
        currentTools: 'Spreadsheets or generic tools.',
        currentProcess: null,
        budgetSignal: null,
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: ['Budget range', 'Number of users', 'Existing data sources and tools'],
      },
      suggestedReply: {
        draftType: 'systems_audit_suggestion',
        subject: 'Re: Custom CRM / dashboard enquiry',
        body: `${greeting}\n\nA custom CRM or management dashboard is a core part of what we build at 2KO Systems — so this is well within our wheelhouse.\n\nBefore we go further, it would help to understand your current setup: what tools you're using now, what data you're trying to see, and how many people would be using the system day-to-day.\n\nWould a short discovery call work to map that out? That way we can give you a realistic sense of what's involved and where to start.\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'CRM/dashboard enquiry with good fit. Discovery call to scope before proposing.',
      },
      internalNotes: {
        risks: ['Budget unknown — could be under-scoped.'],
        opportunities: ['Core 2KO service area.', 'Potential for ongoing managed service post-build.'],
        recommendedOffer: 'systems_opportunity_audit',
        suggestedDiscoveryAngle: 'Current tools, data sources, team size, reporting needs, and integration requirements.',
        recommendedNextAction: 'Book discovery call.',
      },
      followUp: {
        suggestedTiming: '48 hours if no reply.',
        suggestedMessage: 'Just following up — happy to set up a quick call to discuss your CRM or dashboard requirements.',
        internalReason: 'Good fit lead — worth a follow-up.',
        priority: 'medium',
      },
      safety,
    };
  }

  function websitePortalOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'website_or_system_build',
        confidence: 78,
        reason: 'Mock: website, client portal, or staff portal build request.',
      },
      classification: {
        categories: ['website_enquiry', 'custom_system_enquiry'],
        temperature: 'warm',
        urgency: 'low',
        commercialValue: 'medium',
        strategicFit: 'medium',
        complexity: 'medium',
        leadScore: 63,
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
        enquirySummary: 'Request for a website, client portal, or staff portal. Moderate complexity.',
        operationalPainPoint: 'Clients or staff lack a self-service interface.',
        requestedSolution: 'Portal or web system build.',
        currentTools: null,
        currentProcess: null,
        budgetSignal: null,
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: ['User volume', 'Integration requirements', 'Budget range'],
      },
      suggestedReply: {
        draftType: 'discovery_call_suggestion',
        subject: 'Re: Portal build enquiry',
        body: `${greeting}\n\nBuilding client-facing or staff portals is something we do regularly — the key is making sure it's built around how your team and clients actually work, not just a generic template.\n\nTo give you a realistic sense of scope and cost, we'd need to understand: who the users are, what they need to do in the portal, and what systems it needs to connect to.\n\nWould it be useful to set up a quick call to walk through the requirements?\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'Portal build with moderate fit. Discovery call to understand integration complexity before scoping.',
      },
      internalNotes: {
        risks: ['Integration complexity unknown.', 'Budget may be below minimum if just a basic website.'],
        opportunities: ['Portal builds often lead to further operational system work.'],
        recommendedOffer: 'website_or_web_system',
        suggestedDiscoveryAngle: 'User flows, integration requirements, existing systems, and target go-live.',
        recommendedNextAction: 'Book discovery call.',
      },
      followUp: {
        suggestedTiming: '48 hours if no reply.',
        suggestedMessage: 'Following up on the portal enquiry — happy to set up a call to discuss.',
        internalReason: 'Moderate fit — worth a follow-up.',
        priority: 'medium',
      },
      safety,
    };
  }

  function vagueOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'unclear_needs_review',
        confidence: 40,
        reason: 'Mock: vague or underdefined enquiry — insufficient information to classify.',
      },
      classification: {
        categories: ['unclear_or_needs_review'],
        temperature: 'cold',
        urgency: 'low',
        commercialValue: 'low',
        strategicFit: 'low',
        complexity: 'low',
        leadScore: 22,
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
        enquirySummary: 'Vague enquiry with insufficient detail to assess fit, scope, or commercial value.',
        operationalPainPoint: null,
        requestedSolution: null,
        currentTools: null,
        currentProcess: null,
        budgetSignal: null,
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: [
          'Business name and industry',
          'Specific problem or need',
          'Contact details',
          'Rough budget or investment appetite',
        ],
      },
      suggestedReply: {
        draftType: 'request_for_missing_information',
        subject: 'Re: Your enquiry — a few questions',
        body: `${greeting}\n\nThank you for getting in touch.\n\nTo make sure we can give you a useful response, could you share a bit more about what you're looking to solve? Specifically:\n\n- What does your business do, and what's the core challenge you're facing?\n- Is there a specific system, process, or capability you're looking to build or improve?\n- What's your rough timeline and budget range?\n\nWith a bit more context we can let you know whether we're the right fit and what a next step might look like.\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'Vague enquiry — politely request the minimum information needed to assess fit.',
      },
      internalNotes: {
        risks: ['May not be a genuine lead.', 'Low information makes scoring unreliable.'],
        opportunities: ['Could develop into a real lead with more information.'],
        recommendedOffer: 'unclear_needs_review',
        suggestedDiscoveryAngle: 'Gather basic business context and problem definition first.',
        recommendedNextAction: 'Send information request and wait for response before investing further time.',
      },
      followUp: {
        suggestedTiming: '5 days if no reply.',
        suggestedMessage: "Just following up — we'd love to understand more about what you're looking to build.",
        internalReason: 'Low-intent enquiry — one follow-up is sufficient.',
        priority: 'low',
      },
      safety,
    };
  }

  function workflowAutomationOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'workflow_improvement_enquiry',
        confidence: 78,
        reason: 'Mock: workflow improvement or automation enquiry.',
      },
      classification: {
        categories: ['workflow_improvement', 'ai_automation_enquiry'],
        temperature: 'warm',
        urgency: 'medium',
        commercialValue: 'medium',
        strategicFit: 'high',
        complexity: 'medium',
        leadScore: 70,
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
        enquirySummary: 'Business looking to automate manual processes or improve operational workflows. Good strategic fit for 2KO.',
        operationalPainPoint: 'Manual or inefficient business processes consuming staff time.',
        requestedSolution: 'Workflow automation or operational system.',
        currentTools: 'Spreadsheets or manual processes.',
        currentProcess: null,
        budgetSignal: null,
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: ['Specific process details', 'Team size', 'Budget signal'],
      },
      suggestedReply: {
        draftType: 'systems_audit_suggestion',
        subject: 'Re: Workflow automation enquiry',
        body: `${greeting}\n\nManual processes consuming too much of your team's time is one of the most common problems we help businesses solve — and often the highest-leverage starting point for automation.\n\nThe right approach usually starts with understanding which processes are causing the most friction and what a realistic win looks like within your current constraints.\n\nWe offer a Systems Opportunity Audit that maps your operations and identifies the highest-leverage starting points for automation. Would that be a useful conversation to have?\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'Workflow/automation enquiry with good fit. Positions the Systems Opportunity Audit as the natural next step.',
      },
      internalNotes: {
        risks: ['Scope may be broad — need to focus on highest-leverage areas.'],
        opportunities: ['Core 2KO service area.', 'Audit likely to reveal multiple opportunities.'],
        recommendedOffer: 'systems_opportunity_audit',
        suggestedDiscoveryAngle: 'Which processes are most painful, how many staff are affected, and what tools they currently use.',
        recommendedNextAction: 'Propose a Systems Opportunity Audit.',
      },
      followUp: {
        suggestedTiming: '48 hours if no reply.',
        suggestedMessage: 'Following up on the workflow discussion — happy to walk you through our audit process.',
        internalReason: 'Good fit lead with real pain point — worth following up.',
        priority: 'medium',
      },
      safety,
    };
  }

  function newBusinessOutput(): AgentOutput {
    return {
      route: {
        business: 'two_ko_systems',
        enquiryType: 'new_business_lead',
        confidence: 72,
        reason: 'Mock: new business enquiry with general fit for 2KO services.',
      },
      classification: {
        categories: ['custom_system_enquiry'],
        temperature: 'warm',
        urgency: 'medium',
        commercialValue: 'medium',
        strategicFit: 'medium',
        complexity: 'medium',
        leadScore: 60,
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
        enquirySummary: 'New business enquiry with reasonable fit for 2KO services. Needs further qualification.',
        operationalPainPoint: 'Operational or technology challenge requiring a custom solution.',
        requestedSolution: 'Custom system or technology engagement.',
        currentTools: null,
        currentProcess: null,
        budgetSignal: null,
        urgencySignal: null,
        authoritySignal: null,
        missingInformation: ['Business context', 'Specific problem', 'Budget signal', 'Decision timeline'],
      },
      suggestedReply: {
        draftType: 'discovery_call_suggestion',
        subject: 'Re: Your enquiry to 2KO Systems',
        body: `${greeting}\n\nThank you for reaching out.\n\nTo make sure we can give you a useful and honest response, it would help to understand a bit more about your business and what you're looking to solve. A 30-minute discovery call is usually the best starting point — it lets us ask the right questions and gives you a clear sense of whether we're the right fit.\n\nWould you be available for a call this week or early next?\n\nBest regards,\nThe 2KO Systems Team\n\n[DRAFT — DO NOT SEND WITHOUT REVIEW]`,
        whyThisReplyFits: 'General new business enquiry. Discovery call to qualify and understand the problem.',
      },
      internalNotes: {
        risks: ['Limited information — qualification needed before investing time.'],
        opportunities: ['Could develop into a meaningful engagement with the right brief.'],
        recommendedOffer: 'systems_opportunity_audit',
        suggestedDiscoveryAngle: 'Business context, problem definition, current tools, budget, and timeline.',
        recommendedNextAction: 'Book a 30-minute discovery call.',
      },
      followUp: {
        suggestedTiming: '48 hours if no reply.',
        suggestedMessage: 'Following up on your enquiry — we\'d love to find a time to connect.',
        internalReason: 'Warm enquiry — worth a follow-up.',
        priority: 'medium',
      },
      safety,
    };
  }

  // Route in priority order
  if (isSpam) return spamOutput();
  if (isExistingClientSupport) return existingClientSupportOutput();
  if (isRetainerEnquiry) return retainerOutput();
  if (isDiscoveryRequest) return discoveryRequestOutput();
  if (isHighValue) return highValueOutput();
  if (isCrmOrDashboard) return crmDashboardOutput();
  if (isWebsiteOrPortal) return websitePortalOutput();
  if (isVague) return vagueOutput();
  return workflowAutomationOutput();
}
