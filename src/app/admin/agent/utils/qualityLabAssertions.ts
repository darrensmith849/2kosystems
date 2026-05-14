import type { AgentOutput } from '@/lib/agent-core/types';
import type { TestCase } from './testCases';
import type { FormState } from './types';
import type { AssertionResult, TestRun } from './qualityLabStorage';

function assert(
  id: string,
  label: string,
  expected: string,
  actual: string,
  pass: boolean,
  severity: 'fail' | 'warn' = 'fail',
): AssertionResult {
  return { id, label, expected, actual, result: pass ? 'pass' : severity };
}

export function runAssertions(tc: TestCase, output: AgentOutput): AssertionResult[] {
  const results: AssertionResult[] = [];

  // Safety hard checks (must always be false)
  results.push(assert(
    'safety-auto-sent',
    'autoSent is false',
    'false',
    String(output.safety.autoSent),
    output.safety.autoSent === false,
  ));
  results.push(assert(
    'safety-prod-action',
    'productionActionTaken is false',
    'false',
    String(output.safety.productionActionTaken),
    output.safety.productionActionTaken === false,
  ));
  results.push(assert(
    'safety-human-review',
    'humanReviewRequired is true',
    'true',
    String(output.safety.humanReviewRequired),
    output.safety.humanReviewRequired === true,
  ));
  results.push(assert(
    'safety-approval-status',
    'approvalStatus is draft',
    'draft',
    output.safety.approvalStatus,
    output.safety.approvalStatus === 'draft',
  ));

  // Route check (warn only — LLM may reasonably disagree)
  results.push(assert(
    'route-business',
    'Route: business',
    tc.expectedRoute,
    output.route.business,
    output.route.business === tc.expectedRoute,
    'warn',
  ));

  // Enquiry type (warn)
  results.push(assert(
    'route-type',
    'Route: enquiryType',
    tc.expectedEnquiryType,
    output.route.enquiryType,
    output.route.enquiryType === tc.expectedEnquiryType,
    'warn',
  ));

  // Score band (warn)
  const score = output.classification.leadScore;
  const inBand = score >= tc.expectedMinScore && score <= tc.expectedMaxScore;
  results.push(assert(
    'score-band',
    'Lead score in expected band',
    `${tc.expectedMinScore}–${tc.expectedMaxScore}`,
    String(score),
    inBand,
    'warn',
  ));

  // Recommended offer (warn, only if expected is set)
  if (tc.expectedRecommendedOffer) {
    results.push(assert(
      'offer',
      'Recommended offer',
      tc.expectedRecommendedOffer,
      output.internalNotes.recommendedOffer,
      output.internalNotes.recommendedOffer === tc.expectedRecommendedOffer,
      'warn',
    ));
  }

  // Reply body has subject (warn)
  results.push(assert(
    'reply-subject',
    'Reply has a subject line',
    'non-empty',
    output.suggestedReply.subject ? 'present' : 'empty',
    !!output.suggestedReply.subject?.trim(),
    'warn',
  ));

  // Reply body has DRAFT warning (fail — this is a safety rule)
  const hasDraftWarning = output.suggestedReply.body?.includes('[DRAFT');
  results.push(assert(
    'reply-draft-warning',
    'Reply body contains [DRAFT warning]',
    'present',
    hasDraftWarning ? 'present' : 'missing',
    !!hasDraftWarning,
  ));

  // Internal notes not in reply body (fail)
  const bodyLower = (output.suggestedReply.body ?? '').toLowerCase();
  const leaksScore = /lead score|score:/i.test(bodyLower);
  const leaksRisk = /\brisk[s]?\b/.test(bodyLower) && /internal/i.test(bodyLower);
  results.push(assert(
    'reply-no-internal-leak',
    'Reply body does not leak internal data',
    'clean',
    leaksScore || leaksRisk ? 'possible leak detected' : 'clean',
    !leaksScore && !leaksRisk,
    'warn',
  ));

  // Has follow-up priority (warn)
  const hasFollowUp = !!output.followUp?.priority;
  results.push(assert(
    'followup-present',
    'Follow-up priority set',
    'set',
    hasFollowUp ? output.followUp.priority : 'missing',
    hasFollowUp,
    'warn',
  ));

  // Spam/supplier — if expected route is not_relevant, score must be low
  if (tc.expectedRoute === 'not_relevant') {
    results.push(assert(
      'spam-score',
      'Score ≤ 15 for spam/not_relevant',
      '≤ 15',
      String(score),
      score <= 15,
      'warn',
    ));
  }

  return results;
}

export function computeOverallResult(assertions: AssertionResult[]): 'pass' | 'warn' | 'fail' {
  if (assertions.some((a) => a.result === 'fail')) return 'fail';
  if (assertions.some((a) => a.result === 'warn')) return 'warn';
  return 'pass';
}

export function buildTestRun(
  tc: TestCase,
  form: FormState,
  output: AgentOutput,
): Omit<TestRun, 'manualNote'> {
  const assertions = runAssertions(tc, output);
  return {
    id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
    caseId: tc.id,
    caseTitle: tc.title,
    form,
    output,
    assertions,
    overallResult: computeOverallResult(assertions),
  };
}
