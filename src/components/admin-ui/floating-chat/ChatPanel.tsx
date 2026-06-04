'use client';

// Stateful conversation surface used by the floating drawer (and reusable on
// the Ask page). Owns history via useChatHistory, wires up postQuery, and
// renders the header, search-mode notice, scroll area, suggested prompts,
// and composer.

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/admin-ui';
import { ChatBubbles } from './ChatBubbles';
import { ChatComposer } from './ChatComposer';
import { SuggestedPrompts } from './SuggestedPrompts';
import { postQuery } from './postQuery';
import { useChatHistory } from './useChatHistory';
import type { ChatMessage, ChatStage, PageContext } from './chatTypes';

export type ChatPanelProps = {
  /** localStorage key for this surface (drawer vs page have distinct keys). */
  storageKey: string;
  /** Optional page context sent to the API for grounding. */
  pageContext?: PageContext;
  /** Header title. Defaults to "2KO Ops Assistant". */
  title?: string;
  /** Header subtitle. Defaults to read-only notice. */
  subtitle?: string;
  /** Optional close button (e.g. drawer X). Rendered in the header. */
  onClose?: () => void;
  /** Initial composer placeholder. */
  placeholder?: string;
};

const DISMISSED_BANNER_KEY = '2ko_ops_chat_search_banner_dismissed_v1';

function readBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DISMISSED_BANNER_KEY) === '1';
  } catch {
    return false;
  }
}

function writeBannerDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DISMISSED_BANNER_KEY, '1');
  } catch {
    /* silent */
  }
}

export function ChatPanel({
  storageKey,
  pageContext,
  title = '2KO Ops Assistant',
  subtitle = 'Searches dashboard data. Read-only.',
  onClose,
  placeholder = 'Ask about clients, assets, renewals…',
}: ChatPanelProps) {
  const { messages, append, clear, hydrated } = useChatHistory(storageKey);
  const [input, setInput] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [stage, setStage] = useState<ChatStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setBannerDismissed(readBannerDismissed());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, stage, error]);

  // Cancel any in-flight request on unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const lastAssistant = [...messages]
    .reverse()
    .find((m): m is ChatMessage & { role: 'assistant' } => m.role === 'assistant');

  const isSearchMode =
    !!lastAssistant &&
    (lastAssistant.mode === 'search_only' ||
      (lastAssistant.warnings ?? []).includes('ai_key_missing'));

  const showSearchBanner = isSearchMode && !bannerDismissed;
  const hasMessages = messages.length > 0;

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setError(null);
    setBusy(true);
    setStage('searching');

    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      ts: Date.now(),
    };
    append(userMsg);
    setInput('');

    // Light UX cue while waiting on AI.
    const stageTimer = window.setTimeout(() => {
      setStage((s) => (s === 'searching' ? 'generating' : s));
    }, 350);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const answer = await postQuery(trimmed, {
        pageContext,
        signal: controller.signal,
      });
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: answer.answer,
        ts: Date.now(),
        sources: answer.sources,
        warnings: answer.warnings,
        mode: answer.mode,
        followUps: answer.followUps,
      };
      append(assistantMsg);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      append({
        role: 'assistant',
        content: `I couldn't reach the assistant. ${message}`,
        ts: Date.now(),
        warnings: [],
        mode: 'search_only',
      });
    } finally {
      window.clearTimeout(stageTimer);
      setBusy(false);
      setStage('idle');
    }
  }

  function handleClear() {
    if (messages.length === 0) return;
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Clear this chat and start over?');
      if (!ok) return;
    }
    clear();
    setError(null);
  }

  function dismissBanner() {
    setBannerDismissed(true);
    writeBannerDismissed();
  }

  const modeBadgeText = isSearchMode ? 'Search mode' : 'AI mode';
  const modeBadgeTone: 'green' | 'blue' = isSearchMode ? 'blue' : 'green';

  return (
    <div className="flex h-full flex-col bg-[#0a0a0b]">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-[#1c1c1e] bg-[#111113] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#f5f5f5] truncate">
              {title}
            </h2>
            <Badge text={modeBadgeText} tone={modeBadgeTone} />
          </div>
          <p className="mt-0.5 text-[11px] text-[#71717a] truncate">{subtitle}</p>
          {pageContext && (
            <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#52525b] truncate">
              Context · {pageContext.sectionTitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasMessages || busy}
            className="rounded-md border border-[#27272a] hover:border-emerald-400/40 hover:text-emerald-200 px-2 py-1 text-[11px] text-[#a1a1aa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            New chat
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="rounded-md border border-[#27272a] hover:border-rose-400/40 hover:text-rose-200 px-2 py-1 text-[#a1a1aa] transition-colors"
            >
              <span aria-hidden className="block leading-none text-sm">×</span>
            </button>
          )}
        </div>
      </header>

      {/* Search-mode notice */}
      {showSearchBanner && (
        <div className="border-b border-[#1c1c1e] bg-emerald-400/[0.04] px-4 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] text-emerald-200/90 leading-snug">
              <span className="font-mono uppercase tracking-[0.18em] text-emerald-300/90">
                Search mode
              </span>{' '}
              — I can answer using dashboard data already available. Full AI
              answers can be enabled later.
            </p>
            <button
              type="button"
              onClick={dismissBanner}
              className="text-emerald-300/70 hover:text-emerald-200 text-xs leading-none px-1"
              aria-label="Dismiss search-mode notice"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4"
      >
        {!hydrated ? null : !hasMessages ? (
          <SuggestedPrompts onPick={(p) => void send(p)} disabled={busy} />
        ) : (
          <ChatBubbles
            messages={messages}
            onFollowUpClick={(p) => void send(p)}
            busy={busy}
            busyLabel={stage === 'generating' ? 'Thinking…' : 'Checking the dashboard…'}
          />
        )}

        {error && !busy && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-400/[0.04] px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-[#1c1c1e] bg-[#0a0a0b] p-3">
        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={(v) => void send(v)}
          busy={busy}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
