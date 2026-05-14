'use client';

import { useDiagnostics, type DiagnosticsCheck } from '../hooks/useAgentDiagnostics';

function statusBadge(overallStatus: string) {
  if (overallStatus === 'ready_for_mock_testing') {
    return (
      <span className="text-[10px] font-mono text-[#4ade80] border border-[#4ade80]/30 bg-[#4ade80]/5 rounded-full px-2.5 py-0.5">
        Ready for mock testing
      </span>
    );
  }
  if (overallStatus === 'ready_for_live_llm') {
    return (
      <span className="text-[10px] font-mono text-emerald-400 border border-emerald-400/30 bg-emerald-400/5 rounded-full px-2.5 py-0.5">
        Ready for live LLM
      </span>
    );
  }
  if (overallStatus === 'missing_anthropic_key') {
    return (
      <span className="text-[10px] font-mono text-amber-400 border border-amber-400/30 bg-amber-400/5 rounded-full px-2.5 py-0.5">
        Missing Anthropic key
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono text-rose-400 border border-rose-400/30 bg-rose-400/5 rounded-full px-2.5 py-0.5">
      Misconfigured
    </span>
  );
}

function checkIcon(check: DiagnosticsCheck, label: string) {
  if (label === 'mockMode') {
    // Mock mode is always shown as neutral info
    return (
      <span className="text-[10px] font-mono text-[#a1a1aa]">
        {check.valueLabel ?? (check.configured ? 'configured' : 'not set')}
      </span>
    );
  }
  if (check.configured) {
    return (
      <span className="text-[10px] font-mono text-[#4ade80]">
        {check.safeLabel ?? 'configured'}
      </span>
    );
  }
  if (check.required) {
    return (
      <span className="text-[10px] font-mono text-rose-400">
        {check.safeLabel ?? 'not set'}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono text-[#71717a]">
      {check.safeLabel ?? 'not set'}
    </span>
  );
}

const CHECK_LABELS: Record<string, string> = {
  adminUiPassword: 'AGENT_ADMIN_UI_PASSWORD',
  adminApiKey: 'AGENT_ADMIN_API_KEY',
  mockMode: 'AGENT_MOCK_MODE',
  anthropicApiKey: 'ANTHROPIC_API_KEY',
  agentModel: 'AGENT_MODEL',
  aiProvider: 'AI_PROVIDER',
};

const SECURITY_CHECKLIST = [
  'Admin-only page (protected login)',
  'Protected analyser proxy (requires session cookie)',
  'No public trigger for the analyser',
  'No public links to this console',
  'No chatbot integration',
  'No auto-send actions',
  'No backend persistence',
  'No Railway/database connection',
];

export function DiagnosticsPanel() {
  const { data, loading, error, refresh } = useDiagnostics();

  return (
    <div className="space-y-4">

      {/* Header card */}
      <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
            Environment Diagnostics
          </p>
          {data && statusBadge(data.overallStatus)}
        </div>
        <p className="text-xs text-[#3f3f46] mb-4">
          Check that all required environment variables are configured correctly. No secret values are shown.
        </p>

        {!data && !loading && !error && (
          <p className="text-xs text-[#3f3f46] italic mb-4">
            Click &apos;Load diagnostics&apos; to check your environment configuration.
          </p>
        )}

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] border border-[#27272a] hover:border-[#3f3f46] rounded-full px-4 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading…' : data ? 'Refresh diagnostics' : 'Load diagnostics'}
        </button>

        {error && (
          <p className="mt-3 text-xs text-rose-400">{error}</p>
        )}
      </div>

      {/* Results */}
      {data && (
        <>
          {/* Env var checks */}
          <div className="rounded-2xl border border-[#27272a] bg-[#111113] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1c1c1e]">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
                Environment variables
              </p>
            </div>
            <div className="divide-y divide-[#1c1c1e]">
              {Object.entries(data.checks).map(([key, check]) => (
                <div key={key} className="px-5 py-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#a1a1aa] font-mono">{CHECK_LABELS[key] ?? key}</span>
                  {checkIcon(check as DiagnosticsCheck, key)}
                </div>
              ))}
            </div>
          </div>

          {/* Runtime mode */}
          <div className="rounded-2xl border border-[#27272a] bg-[#111113] px-5 py-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">
              Runtime mode
            </p>
            <p className="text-sm text-[#f5f5f5] font-medium">
              {data.runtimeMode === 'mock' ? 'Mock mode' : 'Live LLM mode'}
            </p>
          </div>

          {/* Next steps */}
          {data.nextSteps.length > 0 && (
            <div className="rounded-2xl border border-[#27272a] bg-[#111113] px-5 py-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-3">
                Next steps
              </p>
              <ul className="space-y-1.5">
                {data.nextSteps.map((step, i) => (
                  <li key={i} className="text-xs text-[#a1a1aa] flex gap-2">
                    <span className="text-[#3f3f46] shrink-0">→</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Security confirmation checklist — hardcoded, always shown */}
      <div className="rounded-2xl border border-[#1c1c1e] bg-[#0d0d0f] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1c1c1e]">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3f3f46]">
            Security confirmation
          </p>
        </div>
        <div className="px-5 py-4 space-y-2">
          {SECURITY_CHECKLIST.map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <span className="text-[#4ade80] text-[10px] mt-0.5 shrink-0">✓</span>
              <span className="text-xs text-[#71717a]">{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
