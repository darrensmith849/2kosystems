import { useState, useCallback } from 'react';
import type { AgentOutput } from '@/lib/agent-core/types';
import type { FormState } from '../utils/types';

function apiErrorMessage(status: number, serverMsg?: string): string {
  if (status === 401) return 'Session expired. You will be signed out.';
  if (status === 400)
    return serverMsg?.toLowerCase().includes('message')
      ? 'A message is required to run the analyser.'
      : (serverMsg ?? 'Invalid input — please check the form and try again.');
  if (status === 422)
    return 'The enquiry could not be processed. Please check the inputs and try again.';
  if (status >= 500)
    return 'The analyser could not complete this run. No message was sent and no production action was taken. Please try again or review manually.';
  return serverMsg ?? 'An unexpected error occurred. No production action was taken.';
}

export function useAgentAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentOutput | null>(null);

  const run = useCallback(
    async (form: FormState, onUnauthorised: () => void): Promise<AgentOutput | null> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/admin/agent/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        if (res.status === 401) {
          onUnauthorised();
          return null;
        }

        let data: unknown;
        try {
          data = await res.json();
        } catch {
          setError('The analyser returned an unreadable response. No production action was taken.');
          return null;
        }

        if (!res.ok) {
          const msg = (data as { error?: string })?.error;
          setError(apiErrorMessage(res.status, msg));
          return null;
        }

        const output = data as AgentOutput;
        if (!output?.route || !output?.classification || !output?.safety) {
          setError('Unexpected response shape from the agent. No production action was taken.');
          return null;
        }

        setResult(output);
        return output;
      } catch {
        setError(
          'Network error — the request did not reach the server. No production action was taken.',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, result, setResult, run, reset, clearError };
}
