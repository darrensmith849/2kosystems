'use client';

import { useState, useCallback } from 'react';
import type { TestCase } from '../utils/testCases';
import { BUILT_IN_TEST_CASES } from '../utils/testCases';
import type { TestRun } from '../utils/qualityLabStorage';
import {
  loadCustomCases,
  saveCustomCases,
  loadTestRuns,
  saveTestRuns,
  clearTestRuns,
} from '../utils/qualityLabStorage';

export function useQualityLab() {
  const [customCases, setCustomCases] = useState<TestCase[]>(() => loadCustomCases());
  const [testRuns, setTestRuns] = useState<TestRun[]>(() => loadTestRuns());

  const allCases = [...BUILT_IN_TEST_CASES, ...customCases];

  const addCustomCase = useCallback((tc: TestCase) => {
    setCustomCases((prev) => {
      const next = [...prev, tc];
      saveCustomCases(next);
      return next;
    });
  }, []);

  const updateCustomCase = useCallback((tc: TestCase) => {
    setCustomCases((prev) => {
      const next = prev.map((c) => (c.id === tc.id ? tc : c));
      saveCustomCases(next);
      return next;
    });
  }, []);

  const deleteCustomCase = useCallback((id: string) => {
    setCustomCases((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCustomCases(next);
      return next;
    });
  }, []);

  const addTestRun = useCallback((run: TestRun) => {
    setTestRuns((prev) => {
      const next = [run, ...prev].slice(0, 20);
      saveTestRuns(next);
      return next;
    });
  }, []);

  const deleteTestRun = useCallback((id: string) => {
    setTestRuns((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveTestRuns(next);
      return next;
    });
  }, []);

  const updateTestRunNote = useCallback((id: string, note: string) => {
    setTestRuns((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, manualNote: note } : r));
      saveTestRuns(next);
      return next;
    });
  }, []);

  const clearAllTestRuns = useCallback(() => {
    clearTestRuns();
    setTestRuns([]);
  }, []);

  return {
    allCases,
    testRuns,
    addCustomCase,
    updateCustomCase,
    deleteCustomCase,
    addTestRun,
    deleteTestRun,
    updateTestRunNote,
    clearAllTestRuns,
  };
}
