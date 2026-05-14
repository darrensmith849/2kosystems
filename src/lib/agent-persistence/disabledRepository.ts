// Disabled repository — used when no database is configured.
// Every method throws immediately so callers fail loudly rather than silently.
// Replace this with a real implementation (e.g. DrizzleAgentJobRepository)
// once Railway/Postgres access is provisioned.

import type { AgentJobRepository } from './repository';
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

const NOT_CONFIGURED =
  'Agent persistence is not configured. Railway/database access is required before this method can be used.';

export class DisabledAgentJobRepository implements AgentJobRepository {
  async create(_input: AgentJobCreateInput): Promise<AgentJob> {
    throw new Error(NOT_CONFIGURED);
  }

  async applyAnalysis(_id: string, _update: AgentJobAnalysisUpdate): Promise<AgentJob> {
    throw new Error(NOT_CONFIGURED);
  }

  async updateWorkflow(_id: string, _update: AgentJobWorkflowUpdate): Promise<AgentJob> {
    throw new Error(NOT_CONFIGURED);
  }

  async applyApproval(_id: string, _update: AgentJobApprovalUpdate): Promise<AgentJob> {
    throw new Error(NOT_CONFIGURED);
  }

  async delete(_id: string): Promise<void> {
    throw new Error(NOT_CONFIGURED);
  }

  async findById(_id: string): Promise<AgentJob | null> {
    throw new Error(NOT_CONFIGURED);
  }

  async list(_options?: AgentJobListOptions): Promise<AgentJobPage> {
    throw new Error(NOT_CONFIGURED);
  }

  async getAuditLog(_jobId: string): Promise<AgentJobAuditEntry[]> {
    throw new Error(NOT_CONFIGURED);
  }
}

export const disabledRepository: AgentJobRepository = new DisabledAgentJobRepository();
