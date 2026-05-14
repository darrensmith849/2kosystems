import type { AgentOutput } from '@/lib/agent-core/types';

export function isSafe(safety: AgentOutput['safety']): boolean {
  return (
    safety.humanReviewRequired === true &&
    safety.approvalStatus === 'draft' &&
    safety.autoSent === false &&
    safety.productionActionTaken === false
  );
}
