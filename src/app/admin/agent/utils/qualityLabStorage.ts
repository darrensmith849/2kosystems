import type { AgentOutput } from '@/lib/agent-core/types';
import type { TestCase } from './testCases';
import type { FormState } from './types';
import { BUILT_IN_TEST_CASES } from './testCases';

export interface AssertionResult {
  id: string;
  label: string;
  expected: string;
  actual: string;
  result: 'pass' | 'warn' | 'fail';
}

export interface TestRun {
  id: string;
  createdAt: number;
  caseId: string;
  caseTitle: string;
  form: FormState;
  output: AgentOutput;
  assertions: AssertionResult[];
  overallResult: 'pass' | 'warn' | 'fail';
  manualNote: string;
}

export const TEST_CASES_KEY = '2ko_custom_test_cases';
export const TEST_RUNS_KEY = '2ko_test_runs';
export const TEST_RUNS_MAX = 20;

export function loadCustomCases(): TestCase[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEST_CASES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TestCase[];
  } catch {
    return [];
  }
}

export function saveCustomCases(cases: TestCase[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEST_CASES_KEY, JSON.stringify(cases));
}

export function loadAllCases(): TestCase[] {
  return [...BUILT_IN_TEST_CASES, ...loadCustomCases()];
}

export function loadTestRuns(): TestRun[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEST_RUNS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TestRun[];
  } catch {
    return [];
  }
}

export function saveTestRuns(runs: TestRun[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEST_RUNS_KEY, JSON.stringify(runs.slice(0, TEST_RUNS_MAX)));
}

export function clearTestRuns(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TEST_RUNS_KEY);
}
