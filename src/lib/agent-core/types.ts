// Agent Core — shared types for all business profiles
// Phase 2: extend with database record types when persistence is added

export type BusinessRoute = 'two_ko_systems' | 'unknown_or_mixed' | 'not_relevant';

export type EnquiryType =
  | 'new_business_lead'
  | 'existing_client_support'
  | 'website_or_system_build'
  | 'ai_automation_enquiry'
  | 'crm_or_dashboard_enquiry'
  | 'workflow_improvement_enquiry'
  | 'lead_management_enquiry'
  | 'internal_software_enquiry'
  | 'discovery_or_audit_request'
  | 'proposal_or_quote_request'
  | 'partnership_or_referral'
  | 'supplier_or_spam'
  | 'unclear_needs_review';

export type LeadCategory =
  | 'custom_system_enquiry'
  | 'ai_automation_enquiry'
  | 'workflow_improvement'
  | 'website_enquiry'
  | 'crm_or_dashboard'
  | 'operational_software'
  | 'lead_management_system'
  | 'internal_dashboard'
  | 'discovery_call_request'
  | 'systems_audit_request'
  | 'proof_of_value_pilot'
  | 'proposal_request'
  | 'quote_request'
  | 'support_or_existing_client'
  | 'high_value_lead'
  | 'low_fit_lead'
  | 'unclear_or_needs_review'
  | 'spam_or_supplier';

export type Temperature = 'cold' | 'warm' | 'hot';
export type Urgency = 'low' | 'medium' | 'high';
export type CommercialValue = 'low' | 'medium' | 'high';
export type StrategicFit = 'low' | 'medium' | 'high';
export type Complexity = 'low' | 'medium' | 'high';
export type Priority = 'low' | 'medium' | 'high';

export type RecommendedOffer =
  | 'systems_opportunity_audit'
  | 'proof_of_value_pilot'
  | 'core_system_build'
  | 'managed_intelligence_retainer'
  | 'website_or_web_system'
  | 'crm_or_dashboard'
  | 'ai_agent_or_automation'
  | 'existing_client_support'
  | 'low_fit_or_refer_out'
  | 'unclear_needs_review';

export type DraftType =
  | 'initial_enquiry_reply'
  | 'discovery_call_suggestion'
  | 'systems_audit_suggestion'
  | 'proof_of_value_pilot_suggestion'
  | 'follow_up_after_no_reply'
  | 'follow_up_after_call'
  | 'proposal_preparation_note'
  | 'existing_client_support_response'
  | 'low_fit_polite_response'
  | 'request_for_missing_information'
  | 'internal_handover_note'
  | 'short_whatsapp_style_draft'
  | 'formal_email_draft';

export interface EnquiryInput {
  businessKey: string;
  source: string;
  sourceUrl?: string;
  sourcePageType?: string;
  subject?: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  metadata?: Record<string, unknown>;
}

export interface BusinessRouteOutput {
  business: BusinessRoute;
  enquiryType: EnquiryType;
  confidence: number;
  reason: string;
}

export interface LeadClassification {
  categories: LeadCategory[];
  temperature: Temperature;
  urgency: Urgency;
  commercialValue: CommercialValue;
  strategicFit: StrategicFit;
  complexity: Complexity;
  leadScore: number;
}

export interface ExtractedContext {
  leadName: string | null;
  companyName: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  industry: string | null;
  roleTitle: string | null;
  enquirySummary: string;
  operationalPainPoint: string | null;
  requestedSolution: string | null;
  currentTools: string | null;
  currentProcess: string | null;
  budgetSignal: string | null;
  urgencySignal: string | null;
  authoritySignal: string | null;
  missingInformation: string[];
}

export interface SuggestedReply {
  draftType: DraftType;
  subject: string;
  body: string;
  whyThisReplyFits: string;
}

export interface InternalNotes {
  risks: string[];
  opportunities: string[];
  recommendedOffer: RecommendedOffer;
  suggestedDiscoveryAngle: string;
  recommendedNextAction: string;
}

export interface FollowUp {
  suggestedTiming: string;
  suggestedMessage: string;
  internalReason: string;
  priority: Priority;
}

export interface SafetyAudit {
  humanReviewRequired: true;
  approvalStatus: 'draft';
  autoSent: false;
  productionActionTaken: false;
  whatAgentDid: string;
  whatAgentDidNotDo: string;
}

export interface AgentOutput {
  route: BusinessRouteOutput;
  classification: LeadClassification;
  context: ExtractedContext;
  suggestedReply: SuggestedReply;
  internalNotes: InternalNotes;
  followUp: FollowUp;
  safety: SafetyAudit;
}

// Raw LLM output before safety enforcement is applied
export interface RawLLMOutput {
  route: BusinessRouteOutput;
  classification: LeadClassification;
  context: ExtractedContext;
  suggestedReply: SuggestedReply;
  internalNotes: InternalNotes;
  followUp: FollowUp;
}

// Contract every business profile must implement
export interface BusinessProfile {
  key: string;
  name: string;
  buildSystemPrompt: (input: EnquiryInput) => string;
  buildUserPrompt: (input: EnquiryInput) => string;
}
