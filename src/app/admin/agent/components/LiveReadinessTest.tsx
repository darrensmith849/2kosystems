'use client';

import { useLiveReadinessTest } from '../hooks/useLiveReadinessTest';
import type { DiagnosticsData } from '../hooks/useAgentDiagnostics';

export function LiveReadinessTest({ diagnostics }: { diagnostics: DiagnosticsData | null }) {
  const { result, loading, error, run } = useLiveReadinessTest();
  const isMockMode = diagnostics?.runtimeMode === 'mock';

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-700 dark:text-[#71717a] mb-1">
          Live readiness test
        </p>
        <p className="text-xs text-[#3f3f46]">
          Sends a single safe test payload through the agent. No production actions are taken.
        </p>
      </div>

      {/* Warning / mock notice */}
      {isMockMode ? (
        <div className="rounded-xl border border-[#4ade80]/20 bg-[#4ade80]/5 px-4 py-3">
          <p className="text-xs text-[#4ade80]">
            Mock mode is enabled — no live LLM call will be made. The test will use the deterministic mock response.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <p className="text-xs text-amber-400">
            This will make one live LLM call if mock mode is disabled. It will not send any message or take any production action.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-4 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Running test…' : 'Run live readiness test'}
      </button>

      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}

      {result && (
        <div className="border-t border-zinc-200 dark:border-[#1c1c1e] pt-4 space-y-3">
          {/* Status */}
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a]">Status</p>
            {result.status === 'live_test_passed' && (
              <span className="text-[10px] font-mono text-[#4ade80] border border-[#4ade80]/30 bg-[#4ade80]/5 rounded-full px-2.5 py-0.5">
                Live test passed
              </span>
            )}
            {result.status === 'mock_mode_active' && (
              <span className="text-[10px] font-mono text-zinc-700 dark:text-[#a1a1aa] border border-[#3f3f46] bg-zinc-100 dark:bg-[#1c1c1e] rounded-full px-2.5 py-0.5">
                Mock mode active
              </span>
            )}
            {result.status === 'misconfigured' && (
              <span className="text-[10px] font-mono text-amber-400 border border-amber-400/30 bg-amber-400/5 rounded-full px-2.5 py-0.5">
                Misconfigured
              </span>
            )}
            {result.status === 'error' && (
              <span className="text-[10px] font-mono text-rose-400 border border-rose-400/30 bg-rose-400/5 rounded-full px-2.5 py-0.5">
                Error
              </span>
            )}
          </div>

          {/* Message or error */}
          {result.message && (
            <p className="text-xs text-zinc-700 dark:text-[#a1a1aa]">{result.message}</p>
          )}
          {result.error && (
            <p className="text-xs text-rose-400">{result.error}</p>
          )}

          {/* Safety check */}
          {result.safetyCheck && (
            <div className="rounded-xl border border-zinc-200 dark:border-[#1c1c1e] bg-[#0d0d0f] px-4 py-3 space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#3f3f46] mb-2">
                Safety verification
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#4ade80] text-[10px]">✓</span>
                <span className="text-xs text-zinc-700 dark:text-[#71717a]">humanReviewRequired: {String(result.safetyCheck.humanReviewRequired)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#4ade80] text-[10px]">✓</span>
                <span className="text-xs text-zinc-700 dark:text-[#71717a]">autoSent: {String(result.safetyCheck.autoSent)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#4ade80] text-[10px]">✓</span>
                <span className="text-xs text-zinc-700 dark:text-[#71717a]">productionActionTaken: {String(result.safetyCheck.productionActionTaken)}</span>
              </div>
            </div>
          )}

          {/* Agent output summary */}
          {result.output && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#3f3f46]">Agent output summary</p>
              {result.output.classification?.leadScore !== undefined && (
                <p className="text-xs text-zinc-700 dark:text-[#71717a]">
                  Lead score: <span className="text-zinc-700 dark:text-[#a1a1aa]">{result.output.classification.leadScore}/100</span>
                </p>
              )}
              {result.output.route?.enquiryType && (
                <p className="text-xs text-zinc-700 dark:text-[#71717a]">
                  Enquiry type: <span className="text-zinc-700 dark:text-[#a1a1aa]">{result.output.route.enquiryType.replace(/_/g, ' ')}</span>
                </p>
              )}
              {result.output.safety?.approvalStatus && (
                <p className="text-xs text-zinc-700 dark:text-[#71717a]">
                  Approval status: <span className="text-zinc-700 dark:text-[#a1a1aa]">{result.output.safety.approvalStatus}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
