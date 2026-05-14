// Future persistence types — no DB connection exists yet.
// These contracts are written now so Phase 2 DB work can slot in without
// changing any business logic that imports from this module.

import type { AgentOutput, EnquiryInput } from '@/lib/agent-core/types';

// ── Status enums ──────────────────────────────────────────────────────────────

export type AgentJobStatus =
  | 'received'           // job created, not yet analysed
  | 'analysing'          // LLM call in progress
  | 'analysis_failed'    // LLM call errored
  | 'needs_review'       // analysis complete, awaiting human review
  | 'draft_ready'        // reply drafted, awaiting approval
  | 'approved'           // admin approved, ready to send
  | 'rejected'           // admin rejected this draft
  | 'sending'            // outbound action in progress
  | 'sent'               // reply sent successfully
  | 'send_failed'        // outbound action failed
  | 'replied'            // confirmed human reply sent externally
  | 'waiting_on_lead'    // reply sent, awaiting lead's response
  | 'follow_up_due'      // follow-up date reached
  | 'follow_up_sent'     // follow-up sent
  | 'qualified'          // lead moved to qualified pipeline
  | 'unqualified'        // lead disqualified after review
  | 'archived'           // manually archived
  | 'spam'               // confirmed spam
  | 'duplicate'          // identified as duplicate
  | 'error';             // unexpected error state

export type AgentJobApprovalStatus =
  | 'draft'              // always the initial state from agent
  | 'pending_approval'   // submitted for admin approval
  | 'approved'           // approved by admin
  | 'rejected';          // rejected by admin

// ── Core DB record ────────────────────────────────────────────────────────────

export interface AgentJob {
  id: string;                          // uuid
  businessKey: string;                 // e.g. 'two_ko_systems'
  status: AgentJobStatus;
  approvalStatus: AgentJobApprovalStatus;

  // Input payload — the raw enquiry as received
  inputPayload: EnquiryInput;

  // Output payload — full AgentOutput from orchestrator (nullable until analysis complete)
  outputPayload: AgentOutput | null;

  // Denormalised fields for fast list queries (populated after analysis)
  senderName: string | null;
  senderEmail: string | null;
  enquiryType: string | null;
  leadScore: number | null;
  temperature: string | null;
  recommendedOffer: string | null;
  enquirySummary: string | null;

  // Workflow fields
  adminNote: string;
  followUpDate: string | null;         // ISO date YYYY-MM-DD
  approvedBy: string | null;           // admin identifier
  approvedAt: string | null;           // ISO datetime

  // Audit
  createdAt: string;                   // ISO datetime
  updatedAt: string;                   // ISO datetime
  analysedAt: string | null;           // ISO datetime
  sentAt: string | null;               // ISO datetime
}

// ── Create / update inputs ────────────────────────────────────────────────────

export interface AgentJobCreateInput {
  businessKey: string;
  inputPayload: EnquiryInput;
  // outputPayload is set after analysis — not on create
}

export interface AgentJobAnalysisUpdate {
  outputPayload: AgentOutput;
  senderName: string | null;
  senderEmail: string | null;
  enquiryType: string;
  leadScore: number;
  temperature: string;
  recommendedOffer: string;
  enquirySummary: string;
  status: AgentJobStatus;
  analysedAt: string;
}

export interface AgentJobWorkflowUpdate {
  status?: AgentJobStatus;
  adminNote?: string;
  followUpDate?: string | null;
}

export interface AgentJobApprovalUpdate {
  approvalStatus: AgentJobApprovalStatus;
  approvedBy: string;
  approvedAt: string;
}

// ── List / query ──────────────────────────────────────────────────────────────

export interface AgentJobListOptions {
  businessKey?: string;
  status?: AgentJobStatus | AgentJobStatus[];
  minLeadScore?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'leadScore' | 'updatedAt';
  orderDir?: 'asc' | 'desc';
}

export interface AgentJobPage {
  items: AgentJob[];
  total: number;
  limit: number;
  offset: number;
}

// ── Audit log ─────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'created'
  | 'analysed'
  | 'status_changed'
  | 'approved'
  | 'rejected'
  | 'sent'
  | 'note_updated'
  | 'follow_up_set'
  | 'archived';

export interface AgentJobAuditEntry {
  id: string;
  jobId: string;
  action: AuditAction;
  actor: string;              // 'system' or admin identifier
  previousStatus: AgentJobStatus | null;
  nextStatus: AgentJobStatus | null;
  note: string | null;
  createdAt: string;          // ISO datetime
}
