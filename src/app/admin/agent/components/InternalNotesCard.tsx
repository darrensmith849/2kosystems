'use client';

import type { AgentOutput } from '@/lib/agent-core/types';
import { AdminCard } from './ui';
import { CopyBtn } from './ui';
import { slug } from '../utils/formatters';

function notesText(notes: AgentOutput['internalNotes']): string {
  return [
    `Recommended offer: ${slug(notes.recommendedOffer)}`,
    `\nRisks:\n${notes.risks.map((r) => `- ${r}`).join('\n')}`,
    `\nOpportunities:\n${notes.opportunities.map((o) => `- ${o}`).join('\n')}`,
    `\nDiscovery angle: ${notes.suggestedDiscoveryAngle}`,
    `\nNext action: ${notes.recommendedNextAction}`,
  ].join('');
}

export function InternalNotesCard({
  notes,
  copiedKey,
  onCopy,
  safetyOk,
}: {
  notes: AgentOutput['internalNotes'];
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  safetyOk: boolean;
}) {
  return (
    <AdminCard
      title="Internal notes"
      action={
        <CopyBtn
          text={notesText(notes)}
          label="Copy notes"
          id="notes-card"
          copiedKey={copiedKey}
          onCopy={onCopy}
          disabled={!safetyOk}
        />
      }
    >
      <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Recommended offer</p>
      <p className="text-sm text-[#0f7b3a] mb-4">{slug(notes.recommendedOffer)}</p>
      {notes.risks.length > 0 && (
        <>
          <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Risks</p>
          <ul className="space-y-1 mb-4">
            {notes.risks.map((r, i) => (
              <li key={i} className="text-xs text-rose-400 flex gap-2">
                <span className="shrink-0">—</span>
                {r}
              </li>
            ))}
          </ul>
        </>
      )}
      {notes.opportunities.length > 0 && (
        <>
          <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Opportunities</p>
          <ul className="space-y-1 mb-4">
            {notes.opportunities.map((o, i) => (
              <li key={i} className="text-xs text-green-400 flex gap-2">
                <span className="shrink-0">+</span>
                {o}
              </li>
            ))}
          </ul>
        </>
      )}
      {notes.suggestedDiscoveryAngle && (
        <>
          <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Discovery angle</p>
          <p className="text-xs text-[#a1a1aa] mb-4">{notes.suggestedDiscoveryAngle}</p>
        </>
      )}
      <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Next action</p>
      <p className="text-xs text-[#f5f5f5]">{notes.recommendedNextAction}</p>
    </AdminCard>
  );
}
