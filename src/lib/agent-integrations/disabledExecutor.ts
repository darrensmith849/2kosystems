// Disabled executor — rejects every action immediately.
// Replace individual methods with real implementations once
// the corresponding integration is provisioned and approved.
// Never auto-execute — every method requires an action with requiresApproval: true.

import type { AgentAction, SendEmailDraftAction, SendWhatsAppDraftAction, CreateCrmContactAction, UpdateCrmDealAction, SendInternalAlertAction } from './actionContracts';
import type { FutureIntegrationResult } from './types';

const DISABLED: FutureIntegrationResult = {
  status: 'disabled',
  actionType: 'unknown',
  message: 'This integration is not configured. Provision the required credentials and replace DisabledExecutor before enabling.',
  executedAt: null,
  externalId: null,
};

function disabled(actionType: string): FutureIntegrationResult {
  return { ...DISABLED, actionType };
}

export class DisabledIntegrationExecutor {
  async sendEmailDraft(action: SendEmailDraftAction): Promise<FutureIntegrationResult> {
    void action;
    return disabled(action.actionType);
  }

  async sendWhatsAppDraft(action: SendWhatsAppDraftAction): Promise<FutureIntegrationResult> {
    void action;
    return disabled(action.actionType);
  }

  async createCrmContact(action: CreateCrmContactAction): Promise<FutureIntegrationResult> {
    void action;
    return disabled(action.actionType);
  }

  async updateCrmDeal(action: UpdateCrmDealAction): Promise<FutureIntegrationResult> {
    void action;
    return disabled(action.actionType);
  }

  async sendInternalAlert(action: SendInternalAlertAction): Promise<FutureIntegrationResult> {
    void action;
    return disabled(action.actionType);
  }

  async execute(action: AgentAction): Promise<FutureIntegrationResult> {
    return disabled(action.actionType);
  }
}

export const disabledExecutor = new DisabledIntegrationExecutor();
