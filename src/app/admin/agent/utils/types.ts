import type { AgentOutput } from '@/lib/agent-core/types';

export interface FormState {
  message: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  source: string;
}

export const EMPTY_FORM: FormState = {
  message: '',
  subject: '',
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  source: 'admin_ui',
};

export type LocalStatus =
  | 'new'
  | 'needs_review'
  | 'draft_ready'
  | 'replied'
  | 'waiting_for_response'
  | 'follow_up_due'
  | 'qualified'
  | 'unqualified'
  | 'archived';

export const LOCAL_STATUSES: LocalStatus[] = [
  'new',
  'needs_review',
  'draft_ready',
  'replied',
  'waiting_for_response',
  'follow_up_due',
  'qualified',
  'unqualified',
  'archived',
];

// Future agent_jobs DB mapping (Phase 1F):
// id            → agent_jobs.id            (uuid)
// createdAt     → agent_jobs.created_at    (timestamptz)
// updatedAt     → agent_jobs.updated_at    (timestamptz)
// businessKey   → agent_jobs.business_key  (varchar)
// form          → agent_jobs.input_payload (jsonb)
// result        → agent_jobs.output_payload (jsonb)
// senderName    → agent_jobs.sender_name   (varchar, denormalised)
// leadScore     → agent_jobs.lead_score    (int, denormalised)
// localStatus   → agent_jobs.status        (enum)
// localFollowUpDate → agent_jobs.follow_up_date (date)
// localAdminNote    → agent_jobs.admin_note     (text)
export interface LocalAgentJob {
  id: string;
  createdAt: number;
  updatedAt: number;
  businessKey: string;
  form: FormState;
  result: AgentOutput;
  // Denormalised from result for list display
  senderName: string | null;
  enquiryType: string;
  leadScore: number;
  temperature: string;
  recommendedOffer: string;
  enquirySummary: string;
  // Local workflow state
  localStatus: LocalStatus;
  localFollowUpDate: string | null; // ISO date YYYY-MM-DD
  localAdminNote: string;
}

// Phase 1F: versioned localStorage wrapper
export interface LocalHistoryStore {
  schemaVersion: 1;
  items: LocalAgentJob[];
}
