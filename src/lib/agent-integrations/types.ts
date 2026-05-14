// Future integration types — no send SDKs installed, no connections.
// Written now so Phase 2 integration work has clear contracts to implement.

import type { AgentOutput, EnquiryInput } from '@/lib/agent-core/types';

// ── Incoming event (from contact form, webhook, etc.) ─────────────────────────

export interface EnquirySourceMetadata {
  pageUrl?: string;
  pageType?: string;
  referrer?: string;
  userAgent?: string;
  ipCountry?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface ExternalContactIdentity {
  email?: string;
  phone?: string;
  name?: string;
  companyName?: string;
  externalCrmId?: string;       // e.g. HubSpot contact ID
  externalDealId?: string;
}

export interface IncomingEnquiryEvent {
  eventId: string;              // idempotency key — dedup on this
  receivedAt: string;           // ISO datetime
  source: string;               // e.g. 'contact_form', 'whatsapp_webhook'
  businessKey: string;
  enquiryInput: EnquiryInput;
  contactIdentity?: ExternalContactIdentity;
  sourceMetadata?: EnquirySourceMetadata;
}

// ── Integration result ────────────────────────────────────────────────────────

export type FutureIntegrationStatus =
  | 'disabled'           // integration not configured (current state)
  | 'pending_approval'   // queued, awaiting admin approval
  | 'approved'           // admin approved the action
  | 'sent'               // action executed successfully
  | 'failed'             // action execution failed
  | 'skipped';           // skipped by policy

export interface FutureIntegrationResult {
  status: FutureIntegrationStatus;
  actionType: string;
  message: string;
  executedAt: string | null;
  externalId: string | null;    // e.g. email message ID, WhatsApp message SID
}
