'use client';

import type { AgentOutput } from '@/lib/agent-core/types';
import { isSafe } from '../utils/safety';

function SafetyField({
  label,
  value,
  expected,
}: {
  label: string;
  value: string;
  expected: string;
}) {
  const ok = value === expected;
  return (
    <div className={`rounded-lg border ${ok ? 'border-[#27272a]' : 'border-rose-500/40'} p-2`}>
      <p className="text-[10px] text-[#71717a] mb-0.5 font-mono">{label}</p>
      <p className={`text-xs font-mono ${ok ? 'text-[#4ade80]' : 'text-rose-400'}`}>{value}</p>
    </div>
  );
}

export function SafetyPanel({ safety }: { safety: AgentOutput['safety'] }) {
  const safe = isSafe(safety);

  if (!safe) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-rose-400 mb-3">
          Safety warning — unexpected values
        </p>
        <p className="text-sm text-rose-300 mb-4">
          One or more safety fields returned an unexpected value. Review manually before taking any
          action. Copy and download actions are disabled until this is resolved.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <SafetyField
            label="humanReviewRequired"
            value={String(safety.humanReviewRequired)}
            expected="true"
          />
          <SafetyField label="approvalStatus" value={safety.approvalStatus} expected="draft" />
          <SafetyField label="autoSent" value={String(safety.autoSent)} expected="false" />
          <SafetyField
            label="productionActionTaken"
            value={String(safety.productionActionTaken)}
            expected="false"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1c4a2e] bg-[#0d1a11] p-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-3">
        Safety status
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Human review', value: 'Required' },
          { label: 'Approval status', value: 'Draft' },
          { label: 'Auto-sent', value: 'No' },
          { label: 'Production action', value: 'None taken' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-[#1c4a2e] bg-[#0a1410] p-3 text-center"
          >
            <p className="text-[10px] font-mono text-[#71717a] mb-1">{label}</p>
            <p className="text-sm font-semibold text-[#4ade80]">{value}</p>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-[#1c1c1e] grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-mono text-[#3f3f46] mb-1">What the agent did</p>
          <p className="text-xs text-[#71717a]">{safety.whatAgentDid}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-[#3f3f46] mb-1">What the agent did not do</p>
          <p className="text-xs text-[#3f3f46]">{safety.whatAgentDidNotDo}</p>
        </div>
      </div>
    </div>
  );
}
