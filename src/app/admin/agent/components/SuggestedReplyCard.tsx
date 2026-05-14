'use client';

import type { AgentOutput } from '@/lib/agent-core/types';
import { CopyBtn } from './ui';
import { slug } from '../utils/formatters';

export function SuggestedReplyCard({
  reply,
  copiedKey,
  onCopy,
  safetyOk,
}: {
  reply: AgentOutput['suggestedReply'];
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  safetyOk: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
          Suggested reply
        </p>
        <CopyBtn
          text={`Subject: ${reply.subject}\n\n${reply.body}`}
          label="Copy reply"
          id="reply-card"
          copiedKey={copiedKey}
          onCopy={onCopy}
          disabled={!safetyOk}
        />
      </div>
      <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Type</p>
      <p className="text-xs text-[#a1a1aa] mb-4">{slug(reply.draftType)}</p>
      <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Subject</p>
      <p className="text-sm text-[#f5f5f5] mb-4">{reply.subject}</p>
      <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Body</p>
      <pre className="text-sm text-[#f5f5f5] whitespace-pre-wrap font-sans leading-relaxed bg-[#0a0a0b] rounded-xl p-4 border border-[#1c1c1e]">
        {reply.body}
      </pre>
      {reply.whyThisReplyFits && (
        <>
          <p className="text-[10px] font-mono text-[#3f3f46] mt-4 mb-1.5">Why this reply</p>
          <p className="text-xs text-[#71717a] italic">{reply.whyThisReplyFits}</p>
        </>
      )}
    </div>
  );
}
