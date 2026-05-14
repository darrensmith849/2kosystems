// Pure mapper: LocalAgentJob → AgentJobCreateInput
// No side effects, no network calls, no DB connection.
// Used by FutureDatabaseImportPreview to show what the import payload
// will look like once Phase 2 DB access is provisioned.

import type { LocalAgentJob } from './types';
import type { AgentJobCreateInput } from '@/lib/agent-persistence/types';
import type { EnquiryInput } from '@/lib/agent-core/types';

export function mapLocalJobToCreateInput(job: LocalAgentJob): AgentJobCreateInput {
  const input: EnquiryInput = {
    businessKey: job.businessKey,
    source: job.form.source || 'admin_ui',
    subject: job.form.subject || undefined,
    message: job.form.message,
    senderName: job.form.senderName || undefined,
    senderEmail: job.form.senderEmail || undefined,
    senderPhone: job.form.senderPhone || undefined,
  };

  return {
    businessKey: job.businessKey,
    inputPayload: input,
  };
}

export interface ImportPreviewItem {
  localId: string;
  senderName: string | null;
  leadScore: number;
  enquiryType: string;
  createdAt: string;
  createInput: AgentJobCreateInput;
  warnings: string[];
}

export function buildImportPreview(jobs: LocalAgentJob[]): ImportPreviewItem[] {
  return jobs.map((job) => {
    const warnings: string[] = [];

    if (!job.form.senderEmail) warnings.push('No sender email — contact record may be incomplete');
    if (!job.form.senderName) warnings.push('No sender name');
    if (!job.result?.safety) warnings.push('Missing safety audit — data may be from an older schema');
    if (job.result?.safety?.autoSent !== false) warnings.push('Safety flag autoSent is not false — do not import');
    if (job.result?.safety?.approvalStatus !== 'draft') warnings.push('Approval status is not draft — verify before import');

    return {
      localId: job.id,
      senderName: job.senderName,
      leadScore: job.leadScore,
      enquiryType: job.enquiryType,
      createdAt: new Date(job.createdAt).toISOString(),
      createInput: mapLocalJobToCreateInput(job),
      warnings,
    };
  });
}
