// Action contracts — every outbound action must satisfy one of these interfaces.
// ALL actions require explicit admin approval before execution.
// No action may be executed automatically by the agent.

export interface BaseAction {
  readonly requiresApproval: true;      // invariant — never false
  readonly actionType: string;
  jobId: string;
  businessKey: string;
  approvedBy: string;
  approvedAt: string;                   // ISO datetime
}

// ── Email ─────────────────────────────────────────────────────────────────────

export interface SendEmailDraftAction extends BaseAction {
  readonly actionType: 'send_email_draft';
  to: string;
  toName: string | null;
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  replyTo?: string;
  fromName?: string;
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export interface SendWhatsAppDraftAction extends BaseAction {
  readonly actionType: 'send_whatsapp_draft';
  toPhone: string;                      // E.164 format
  body: string;
  templateName?: string;                // Twilio/Meta template if required
}

// ── CRM ───────────────────────────────────────────────────────────────────────

export interface CreateCrmContactAction extends BaseAction {
  readonly actionType: 'create_crm_contact';
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  leadScore: number;
  tags: string[];
  sourceNote: string;
}

export interface UpdateCrmDealAction extends BaseAction {
  readonly actionType: 'update_crm_deal';
  externalDealId: string;
  newStatus: string;
  noteBody: string;
}

// ── Internal notification ─────────────────────────────────────────────────────

export interface SendInternalAlertAction extends BaseAction {
  readonly actionType: 'send_internal_alert';
  channel: 'slack' | 'email' | 'webhook';
  subject: string;
  body: string;
  urgency: 'low' | 'medium' | 'high';
}

// ── Union ─────────────────────────────────────────────────────────────────────

export type AgentAction =
  | SendEmailDraftAction
  | SendWhatsAppDraftAction
  | CreateCrmContactAction
  | UpdateCrmDealAction
  | SendInternalAlertAction;
