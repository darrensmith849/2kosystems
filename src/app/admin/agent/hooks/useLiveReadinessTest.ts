'use client';

import { useState } from 'react';

export interface LiveReadinessResult {
  status: 'mock_mode_active' | 'misconfigured' | 'live_test_passed' | 'error';
  message?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output?: any;
  safetyCheck?: {
    humanReviewRequired: boolean;
    autoSent: boolean;
    productionActionTaken: boolean;
  };
}

export function useLiveReadinessTest() {
  const [result, setResult] = useState<LiveReadinessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/agent/live-readiness-test', {
        method: 'POST',
      });
      if (res.status === 401) {
        setError('Session expired — please sign in again.');
        return;
      }
      let json: unknown;
      try {
        json = await res.json();
      } catch {
        setError('Could not parse live readiness test response.');
        return;
      }
      if (!res.ok) {
        const r = json as { error?: string; status?: string };
        setResult({ status: 'error', error: r?.error ?? 'Live readiness test failed.' });
        return;
      }
      setResult(json as LiveReadinessResult);
    } catch {
      setError('Network error — could not reach the live readiness test endpoint.');
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, run };
}
