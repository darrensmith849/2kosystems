'use client';

import type { AgentOutput } from '@/lib/agent-core/types';
import { AdminCard, Row } from './ui';

export function ContextCard({ context }: { context: AgentOutput['context'] }) {
  return (
    <AdminCard title="Extracted context">
      <Row label="Lead name" value={context.leadName} />
      <Row label="Company" value={context.companyName} />
      <Row label="Industry" value={context.industry} />
      <Row label="Role" value={context.roleTitle} />
      <Row label="Email" value={context.email} />
      <Row label="Phone" value={context.phone} />
      <Row label="Website" value={context.website} />
      <Row label="Location" value={context.location} />
      {context.enquirySummary && (
        <div className="pt-3">
          <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Summary</p>
          <p className="text-xs text-[#a1a1aa]">{context.enquirySummary}</p>
        </div>
      )}
      {context.operationalPainPoint && (
        <div className="pt-3">
          <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Pain point</p>
          <p className="text-xs text-[#f5f5f5]">{context.operationalPainPoint}</p>
        </div>
      )}
      {context.budgetSignal && (
        <div className="pt-3">
          <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Budget signal</p>
          <p className="text-xs text-[#a1a1aa]">{context.budgetSignal}</p>
        </div>
      )}
      {context.missingInformation.length > 0 && (
        <div className="pt-3">
          <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Missing information</p>
          <ul className="space-y-1">
            {context.missingInformation.map((m, i) => (
              <li key={i} className="text-xs text-amber-400 flex gap-2">
                <span className="shrink-0">?</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminCard>
  );
}
