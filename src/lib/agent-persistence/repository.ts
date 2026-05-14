// Repository interface — implemented by a real DB adapter in Phase 2.
// The disabled stub below satisfies this interface and throws on every call.

import type {
  AgentJob,
  AgentJobCreateInput,
  AgentJobAnalysisUpdate,
  AgentJobWorkflowUpdate,
  AgentJobApprovalUpdate,
  AgentJobListOptions,
  AgentJobPage,
  AgentJobAuditEntry,
} from './types';

export interface AgentJobRepository {
  // ── Write ────────────────────────────────────────────────────────────────
  create(input: AgentJobCreateInput): Promise<AgentJob>;
  applyAnalysis(id: string, update: AgentJobAnalysisUpdate): Promise<AgentJob>;
  updateWorkflow(id: string, update: AgentJobWorkflowUpdate): Promise<AgentJob>;
  applyApproval(id: string, update: AgentJobApprovalUpdate): Promise<AgentJob>;
  delete(id: string): Promise<void>;

  // ── Read ─────────────────────────────────────────────────────────────────
  findById(id: string): Promise<AgentJob | null>;
  list(options?: AgentJobListOptions): Promise<AgentJobPage>;

  // ── Audit ────────────────────────────────────────────────────────────────
  getAuditLog(jobId: string): Promise<AgentJobAuditEntry[]>;
}
