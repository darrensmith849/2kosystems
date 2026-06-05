'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminCard } from '@/components/admin-ui';
import {
  REVIEW_SESSION_KEY,
  loadObject,
  persistObject,
  type ReviewSession,
} from '@/lib/ops/saved-workspace-local-state';
import {
  LOCAL_REVIEW_KEY,
  REVIEW_STATUS_LABEL,
  type LocalReviewEntry,
  type LocalReviewState,
  type ReviewStatus,
} from '@/lib/ops/review-local-state';

// Local-only review-session companion to DecisionsClient. Owns the
// REVIEW_SESSION_KEY (reviewer / notes / started-at) and READS — but never
// writes — LOCAL_REVIEW_KEY to render session stats + build exports.
// DecisionsClient remains the sole writer of LOCAL_REVIEW_KEY.

const STATUS_ORDER: ReviewStatus[] = [
  'none',
  'accepted',
  'discussion',
  'blocked',
  'rejected',
  'resolved_externally',
];

const STAT_LABEL: Record<ReviewStatus, string> = {
  none: 'unresolved',
  accepted: 'accepted',
  discussion: 'discussion',
  blocked: 'blocked',
  rejected: 'rejected',
  resolved_externally: 'resolved externally',
};

const NOTES_MAX = 500;

function emptySession(): ReviewSession {
  return { reviewerName: '', startedAt: '', localNotes: '' };
}

function safeReadDecisionState(): LocalReviewState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_REVIEW_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as LocalReviewState;
    }
    return {};
  } catch {
    return {};
  }
}

function fileDateSlug(iso: string): string {
  // Derive YYYY-MM-DD from an ISO timestamp, falling back to a fresh date if
  // the input is malformed.
  const d = new Date(iso);
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  const y = safe.getUTCFullYear();
  const m = String(safe.getUTCMonth() + 1).padStart(2, '0');
  const day = String(safe.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function triggerDownload(filename: string, content: string, mime: string): void {
  if (typeof window === 'undefined') return;
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after a tick so Safari has time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch {
    // silent: browser may block blob downloads in private mode
  }
}

export default function ReviewSessionClient() {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<ReviewSession>(emptySession());
  const [reviewerDraft, setReviewerDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [decisionState, setDecisionState] = useState<LocalReviewState>({});

  // Hydrate both stores on mount.
  useEffect(() => {
    const fromStorage = loadObject<ReviewSession>(REVIEW_SESSION_KEY);
    const initial: ReviewSession = fromStorage ?? emptySession();
    setSession(initial);
    setReviewerDraft(initial.reviewerName);
    setNotesDraft(initial.localNotes);
    setDecisionState(safeReadDecisionState());
    setHydrated(true);
  }, []);

  // Keep the decision-state snapshot fresh: rehydrate on focus and when
  // another tab writes to LOCAL_REVIEW_KEY.
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    const refresh = () => setDecisionState(safeReadDecisionState());
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_REVIEW_KEY) refresh();
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);
    // Also poll lightly so same-tab edits in DecisionsClient appear in the
    // stats without the user having to refocus the window.
    const interval = window.setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, [hydrated]);

  const persist = useCallback((next: ReviewSession) => {
    setSession(next);
    persistObject(REVIEW_SESSION_KEY, next);
  }, []);

  // Set started-at on first interaction if empty. Returns the (possibly
  // newly-stamped) session so callers can chain further updates.
  const stampStartedAt = useCallback(
    (base: ReviewSession): ReviewSession => {
      if (base.startedAt) return base;
      return { ...base, startedAt: new Date().toISOString() };
    },
    [],
  );

  const commitReviewerName = useCallback(() => {
    const trimmed = reviewerDraft.slice(0, 120);
    if (trimmed === session.reviewerName) return;
    const next = stampStartedAt({ ...session, reviewerName: trimmed });
    persist(next);
  }, [reviewerDraft, session, stampStartedAt, persist]);

  const commitNotes = useCallback(() => {
    const trimmed = notesDraft.slice(0, NOTES_MAX);
    if (trimmed === session.localNotes) return;
    const next = stampStartedAt({ ...session, localNotes: trimmed });
    persist(next);
  }, [notesDraft, session, stampStartedAt, persist]);

  const resetSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(
      'Reset the local review session? Reviewer, start time, and local notes will be cleared from this browser. Per-decision statuses are NOT affected.',
    );
    if (!ok) return;
    persistObject<ReviewSession>(REVIEW_SESSION_KEY, null);
    const fresh = emptySession();
    setSession(fresh);
    setReviewerDraft('');
    setNotesDraft('');
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(
      'Clear local review session? Reviewer, start time, and notes will be cleared. Per-decision statuses (LOCAL_REVIEW_KEY) are NOT affected.',
    );
    if (!ok) return;
    persistObject<ReviewSession>(REVIEW_SESSION_KEY, null);
    const fresh = emptySession();
    setSession(fresh);
    setReviewerDraft('');
    setNotesDraft('');
  }, []);

  // --- Stats ----------------------------------------------------------
  // Tally entries from LOCAL_REVIEW_KEY. Only ids the user actually
  // touched live there; `reviewed` is the count of entries with a non-
  // 'none' status. `unresolved` is entries explicitly stored with
  // status 'none' (rare — usually only present if a note was set).
  const stats = useMemo(() => {
    const tally: Record<ReviewStatus, number> = {
      none: 0,
      accepted: 0,
      discussion: 0,
      blocked: 0,
      rejected: 0,
      resolved_externally: 0,
    };
    let reviewed = 0;
    for (const entry of Object.values(decisionState)) {
      if (!entry || typeof entry !== 'object') continue;
      const s = (entry as LocalReviewEntry).status;
      if (!STATUS_ORDER.includes(s)) continue;
      tally[s] += 1;
      if (s !== 'none') reviewed += 1;
    }
    return { ...tally, reviewed };
  }, [decisionState]);

  // --- Exports --------------------------------------------------------
  const buildExportPayload = useCallback(() => {
    const exportedAt = new Date().toISOString();
    const ensured = stampStartedAt(session);
    const decisions = Object.entries(decisionState).map(([id, entry]) => ({
      id,
      status: entry.status,
      note: entry.note,
      updatedAt: entry.updatedAt,
    }));
    return {
      reviewerName: ensured.reviewerName,
      startedAt: ensured.startedAt,
      exportedAt,
      localNotes: ensured.localNotes,
      decisions,
    };
  }, [session, decisionState, stampStartedAt]);

  const exportJson = useCallback(() => {
    const payload = buildExportPayload();
    const slug = fileDateSlug(payload.exportedAt);
    triggerDownload(
      `2ko-review-session-${slug}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    );
  }, [buildExportPayload]);

  const exportMarkdown = useCallback(() => {
    const payload = buildExportPayload();
    const slug = fileDateSlug(payload.exportedAt);
    const lines: string[] = [];
    lines.push('# 2KO Systems — local review session');
    lines.push('');
    lines.push(`# Reviewer: ${payload.reviewerName || '(unset)'}`);
    lines.push('');
    lines.push(`Started at: ${payload.startedAt || '(unset)'}`);
    lines.push('');
    lines.push(`Exported at: ${payload.exportedAt}`);
    lines.push('');
    lines.push('## Local notes');
    lines.push('');
    lines.push(payload.localNotes ? payload.localNotes : '(no notes)');
    lines.push('');
    lines.push('## Decisions');
    lines.push('');
    if (payload.decisions.length === 0) {
      lines.push('_No decisions recorded yet._');
    } else {
      lines.push('| id | status | updated | note |');
      lines.push('| --- | --- | --- | --- |');
      for (const d of payload.decisions) {
        const status = REVIEW_STATUS_LABEL[d.status as ReviewStatus] ?? d.status;
        const note = (d.note || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
        lines.push(`| ${d.id} | ${status} | ${d.updatedAt || ''} | ${note} |`);
      }
    }
    lines.push('');
    triggerDownload(
      `2ko-review-session-${slug}.md`,
      lines.join('\n'),
      'text/markdown',
    );
  }, [buildExportPayload]);

  return (
    <AdminCard title="Local review session">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="review-session-reviewer"
            className="block text-[10px] uppercase tracking-wider text-zinc-500 dark:text-[#52525b] mb-1.5"
          >
            Reviewer name
          </label>
          <input
            id="review-session-reviewer"
            type="text"
            value={reviewerDraft}
            onChange={(e) => setReviewerDraft(e.target.value.slice(0, 120))}
            onBlur={commitReviewerName}
            placeholder="Your name (saved locally on blur)"
            maxLength={120}
            className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-800 dark:text-[#e4e4e7] placeholder:text-zinc-500 dark:text-[#52525b] focus:outline-none focus:border-[#3f3f46]"
          />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="font-mono text-[11px] text-zinc-500 dark:text-[#71717a]">
            Started at:{' '}
            <span className="text-zinc-600 dark:text-[#a1a1aa]">
              {hydrated
                ? session.startedAt || '— not started —'
                : 'loading…'}
            </span>
          </p>
          <button
            type="button"
            onClick={resetSession}
            className="text-[10px] font-mono uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-zinc-200 dark:border-[#27272a] text-zinc-600 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:bg-[#1c1c1e] transition-colors"
          >
            Reset session
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-[#52525b] mb-2">
            Session stats
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <StatTile label="decisions reviewed" value={stats.reviewed} />
            <StatTile label={STAT_LABEL.accepted} value={stats.accepted} />
            <StatTile label={STAT_LABEL.blocked} value={stats.blocked} />
            <StatTile label={STAT_LABEL.rejected} value={stats.rejected} />
            <StatTile label={STAT_LABEL.discussion} value={stats.discussion} />
            <StatTile
              label={STAT_LABEL.resolved_externally}
              value={stats.resolved_externally}
            />
            <StatTile label={STAT_LABEL.none} value={stats.none} />
          </div>
        </div>

        <div>
          <label
            htmlFor="review-session-notes"
            className="block text-[10px] uppercase tracking-wider text-zinc-500 dark:text-[#52525b] mb-1.5"
          >
            Local notes
          </label>
          <textarea
            id="review-session-notes"
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value.slice(0, NOTES_MAX))}
            onBlur={commitNotes}
            maxLength={NOTES_MAX}
            rows={3}
            placeholder="Session notes (saved locally on blur, max 500 chars)"
            className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-800 dark:text-[#e4e4e7] placeholder:text-zinc-500 dark:text-[#52525b] focus:outline-none focus:border-[#3f3f46] resize-none"
          />
          <p className="mt-1 text-[10px] text-zinc-500 dark:text-[#52525b] text-right">
            {notesDraft.length}/{NOTES_MAX}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={exportJson}
            className="text-[10px] font-mono uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/5 transition-colors"
          >
            Export session JSON
          </button>
          <button
            type="button"
            onClick={exportMarkdown}
            className="text-[10px] font-mono uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/5 transition-colors"
          >
            Export session Markdown
          </button>
          <button
            type="button"
            onClick={clearSession}
            className="text-[10px] font-mono uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-rose-400/30 text-rose-300 hover:bg-rose-400/5 transition-colors"
          >
            Clear local review session
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-[#71717a] leading-relaxed">
          Local browser only — not synced until <code className="font-mono text-[10px] text-zinc-600 dark:text-[#a1a1aa]">DATABASE_URL</code> is connected.
        </p>
      </div>
    </AdminCard>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#111113] px-3 py-2">
      <p className="font-mono text-base text-zinc-900 dark:text-[#f5f5f5]">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-[#71717a]">
        {label}
      </p>
    </div>
  );
}
