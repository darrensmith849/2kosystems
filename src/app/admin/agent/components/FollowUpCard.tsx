'use client';

import type { AgentOutput } from '@/lib/agent-core/types';
import { AdminCard, Row, Badge } from './ui';
import { CopyBtn } from './ui';
import { urgencyColor } from '../utils/formatters';

export function FollowUpCard({
  followUp,
  copiedKey,
  onCopy,
  safetyOk,
}: {
  followUp: AgentOutput['followUp'];
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  safetyOk: boolean;
}) {
  return (
    <AdminCard
      title="Follow-up"
      action={
        followUp.suggestedMessage ? (
          <CopyBtn
            text={followUp.suggestedMessage}
            label="Copy message"
            id="followup-card"
            copiedKey={copiedKey}
            onCopy={onCopy}
            disabled={!safetyOk}
          />
        ) : undefined
      }
    >
      <Row
        label="Priority"
        value={
          <Badge text={followUp.priority} className={urgencyColor(followUp.priority)} />
        }
      />
      <Row label="Timing" value={followUp.suggestedTiming} />
      {followUp.suggestedMessage && (
        <div className="pt-3">
          <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Suggested message</p>
          <p className="text-xs text-[#a1a1aa] italic">{followUp.suggestedMessage}</p>
        </div>
      )}
      {followUp.internalReason && (
        <div className="pt-3">
          <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Internal reason</p>
          <p className="text-xs text-[#71717a]">{followUp.internalReason}</p>
        </div>
      )}
    </AdminCard>
  );
}
