'use client';

import { useState } from 'react';

export interface DiagnosticsCheck {
  configured: boolean;
  required?: boolean;
  safeLabel?: string;
  valueLabel?: string;
}

export interface DiagnosticsData {
  runtimeMode: 'mock' | 'live';
  overallStatus: string;
  checks: {
    adminUiPassword: DiagnosticsCheck;
    adminApiKey: DiagnosticsCheck;
    mockMode: DiagnosticsCheck;
    anthropicApiKey: DiagnosticsCheck;
    agentModel: DiagnosticsCheck;
    aiProvider: DiagnosticsCheck;
  };
  nextSteps: string[];
}

export function useDiagnostics() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/agent/diagnostics');
      if (res.status === 401) {
        setError('Session expired — please sign in again.');
        return;
      }
      let json: unknown;
      try {
        json = await res.json();
      } catch {
        setError('Could not parse diagnostics response.');
        return;
      }
      if (!res.ok) {
        setError((json as { error?: string })?.error ?? 'Diagnostics request failed.');
        return;
      }
      setData(json as DiagnosticsData);
    } catch {
      setError('Network error — could not reach the diagnostics endpoint.');
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, refresh };
}
