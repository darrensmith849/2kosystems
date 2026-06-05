'use client';

import type { AgentOutput } from '@/lib/agent-core/types';
import type { FormState } from '../utils/types';
import { CopyBtn } from './ui';
import { buildMarkdown, buildHandover, buildNotesText, downloadFile } from '../utils/exportUtils';

export function ExportBar({
  result,
  form,
  copiedKey,
  onCopy,
  safetyOk,
}: {
  result: AgentOutput;
  form: FormState;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  safetyOk: boolean;
}) {
  return (
    <>
      {!safetyOk && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-4 py-3">
          <p className="text-sm text-rose-400">
            Copy and download are disabled — safety fields contain unexpected values. Review
            manually before proceeding.
          </p>
        </div>
      )}
      <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-[#0d0d0f] px-5 py-3.5 flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#3f3f46] mr-1">
          Copy
        </p>
        <CopyBtn
          text={result.suggestedReply.body}
          label="Reply body"
          id="reply-body"
          copiedKey={copiedKey}
          onCopy={onCopy}
          disabled={!safetyOk}
        />
        <CopyBtn
          text={`Subject: ${result.suggestedReply.subject}\n\n${result.suggestedReply.body}`}
          label="Reply (subject + body)"
          id="reply-full"
          copiedKey={copiedKey}
          onCopy={onCopy}
          disabled={!safetyOk}
        />
        <CopyBtn
          text={buildNotesText(result)}
          label="Internal notes"
          id="notes-bar"
          copiedKey={copiedKey}
          onCopy={onCopy}
          disabled={!safetyOk}
        />
        {result.followUp.suggestedMessage && (
          <CopyBtn
            text={result.followUp.suggestedMessage}
            label="Follow-up message"
            id="followup-bar"
            copiedKey={copiedKey}
            onCopy={onCopy}
            disabled={!safetyOk}
          />
        )}
        <CopyBtn
          text={buildHandover(result)}
          label="Handover summary"
          id="handover"
          copiedKey={copiedKey}
          onCopy={onCopy}
          disabled={!safetyOk}
        />
        <CopyBtn
          text={JSON.stringify(result, null, 2)}
          label="Full JSON"
          id="json-copy"
          copiedKey={copiedKey}
          onCopy={onCopy}
          disabled={!safetyOk}
        />
        <div className="w-px h-4 bg-[#27272a] mx-1 hidden sm:block" />
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#3f3f46] mr-1">
          Download
        </p>
        <button
          type="button"
          disabled={!safetyOk}
          onClick={() =>
            downloadFile(
              JSON.stringify({ analysedAt: new Date().toISOString(), input: form, output: result }, null, 2),
              `2ko-agent-${Date.now()}.json`,
              'application/json',
            )
          }
          className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ↓ JSON
        </button>
        <button
          type="button"
          disabled={!safetyOk}
          onClick={() =>
            downloadFile(
              buildMarkdown(result, form),
              `2ko-agent-${Date.now()}.md`,
              'text/markdown',
            )
          }
          className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ↓ Markdown
        </button>
      </div>
    </>
  );
}
