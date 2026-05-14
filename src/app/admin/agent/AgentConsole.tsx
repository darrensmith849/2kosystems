'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentOutput } from '@/lib/agent-core/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function scoreColor(n: number) {
  if (n >= 81) return 'text-emerald-400';
  if (n >= 61) return 'text-green-400';
  if (n >= 31) return 'text-amber-400';
  return 'text-rose-400';
}
function scoreLabel(n: number) {
  if (n >= 81) return 'Priority lead';
  if (n >= 61) return 'Strong lead';
  if (n >= 31) return 'Possible lead';
  return 'Low fit';
}
function tempColor(t: string) {
  if (t === 'hot') return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
  if (t === 'warm') return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
  return 'text-[#71717a] border-[#27272a] bg-transparent';
}
function urgencyColor(u: string) {
  if (u === 'high') return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
  if (u === 'medium') return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
  return 'text-[#71717a] border-[#27272a] bg-transparent';
}
function fitColor(v: string) {
  if (v === 'high') return 'text-green-400';
  if (v === 'medium') return 'text-amber-400';
  return 'text-rose-400';
}
function slug(s: string) {
  return s.replace(/_/g, ' ');
}

// ─── copy hook ───────────────────────────────────────────────────────────────

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }, []);
  return { copy, copiedKey };
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 py-1.5 border-b border-[#1c1c1e] last:border-0">
      <span className="w-36 shrink-0 text-xs text-[#71717a]">{label}</span>
      <span className="text-xs text-[#f5f5f5] flex-1">{value}</span>
    </div>
  );
}

function Badge({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${className ?? 'text-[#a1a1aa] border-[#27272a]'}`}
    >
      {slug(text)}
    </span>
  );
}

function CopyBtn({
  text,
  label,
  id,
  copiedKey,
  onCopy,
}: {
  text: string;
  label: string;
  id: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const copied = copiedKey === id;
  return (
    <button
      onClick={() => onCopy(text, id)}
      className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1"
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

// ─── form state ──────────────────────────────────────────────────────────────

interface FormState {
  message: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  source: string;
}

const EMPTY_FORM: FormState = {
  message: '',
  subject: '',
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  source: 'admin_ui',
};

// ─── main component ───────────────────────────────────────────────────────────

export default function AgentConsole() {
  const router = useRouter();
  const { copy, copiedKey } = useCopy();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentOutput | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);

  function setField(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleAnalyse(e: React.FormEvent) {
    e.preventDefault();
    if (!form.message.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/agent/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        router.refresh();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Analysis failed');
        return;
      }

      setResult(data as AgentOutput);
      setTimeout(() => {
        document.getElementById('agent-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.refresh();
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setResult(null);
    setError(null);
    setJsonOpen(false);
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[99999] bg-[#0a0a0b] overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[#1c1c1e] bg-[#0a0a0b]/95 backdrop-blur-sm px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#71717a]">
            2KO Systems
          </span>
          <span className="text-[#27272a]">|</span>
          <span className="text-sm font-medium text-[#a1a1aa]">Agent Ops</span>
          {process.env.NODE_ENV !== 'production' && (
            <span className="text-[10px] font-mono text-amber-500 border border-amber-500/30 rounded-full px-2 py-0.5">
              mock mode may be active
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[#71717a] hover:text-[#f5f5f5] transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Input card */}
        <Card title="Enquiry input">
          <form onSubmit={handleAnalyse} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={setField('message')}
                rows={6}
                className="w-full rounded-xl border border-[#27272a] bg-[#0a0a0b] px-3.5 py-3 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors resize-y"
                placeholder="Paste or type the raw enquiry message here…"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={setField('subject')}
                  className="w-full rounded-xl border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
                  placeholder="Email subject or enquiry topic"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">
                  Source
                </label>
                <input
                  type="text"
                  value={form.source}
                  onChange={setField('source')}
                  className="w-full rounded-xl border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
                  placeholder="admin_ui"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">
                  Sender name
                </label>
                <input
                  type="text"
                  value={form.senderName}
                  onChange={setField('senderName')}
                  className="w-full rounded-xl border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
                  placeholder="Full name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">
                  Sender email
                </label>
                <input
                  type="email"
                  value={form.senderEmail}
                  onChange={setField('senderEmail')}
                  className="w-full rounded-xl border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
                  placeholder="email@example.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">
                  Sender phone
                </label>
                <input
                  type="tel"
                  value={form.senderPhone}
                  onChange={setField('senderPhone')}
                  className="w-full rounded-xl border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
                  placeholder="+27 00 000 0000"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading || !form.message.trim()}
                className="rounded-full bg-[#0f7b3a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Analysing…' : 'Analyse enquiry'}
              </button>
              {(result || form.message) && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="text-sm text-[#71717a] hover:text-[#f5f5f5] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Results */}
        {result && (
          <div id="agent-results" className="space-y-4">

            {/* Summary bar */}
            <div className="rounded-2xl border border-[#27272a] bg-[#111113] px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1">
                    Lead score
                  </p>
                  <p className={`text-2xl font-bold tabular-nums ${scoreColor(result.classification.leadScore)}`}>
                    {result.classification.leadScore}
                    <span className="text-sm font-normal ml-1 text-[#71717a]">/100</span>
                  </p>
                  <p className={`text-[11px] mt-0.5 ${scoreColor(result.classification.leadScore)}`}>
                    {scoreLabel(result.classification.leadScore)}
                  </p>
                </div>
                <div className="h-10 w-px bg-[#27272a] hidden sm:block" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">
                    Route
                  </p>
                  <p className="text-sm text-[#f5f5f5]">{slug(result.route.business)}</p>
                </div>
                <div className="h-10 w-px bg-[#27272a] hidden sm:block" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">
                    Enquiry type
                  </p>
                  <p className="text-sm text-[#f5f5f5]">{slug(result.route.enquiryType)}</p>
                </div>
                <div className="h-10 w-px bg-[#27272a] hidden sm:block" />
                <div className="flex gap-2 flex-wrap">
                  <Badge text={result.classification.temperature} className={tempColor(result.classification.temperature)} />
                  <Badge text={`urgency: ${result.classification.urgency}`} className={urgencyColor(result.classification.urgency)} />
                  <Badge text={`confidence: ${result.route.confidence}%`} />
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Suggested reply */}
              <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
                    Suggested reply
                  </p>
                  <CopyBtn
                    text={`Subject: ${result.suggestedReply.subject}\n\n${result.suggestedReply.body}`}
                    label="Copy reply"
                    id="reply"
                    copiedKey={copiedKey}
                    onCopy={copy}
                  />
                </div>
                <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Type</p>
                <p className="text-xs text-[#a1a1aa] mb-4">{slug(result.suggestedReply.draftType)}</p>
                <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Subject</p>
                <p className="text-sm text-[#f5f5f5] mb-4">{result.suggestedReply.subject}</p>
                <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Body</p>
                <pre className="text-sm text-[#f5f5f5] whitespace-pre-wrap font-sans leading-relaxed bg-[#0a0a0b] rounded-xl p-4 border border-[#1c1c1e]">
                  {result.suggestedReply.body}
                </pre>
                {result.suggestedReply.whyThisReplyFits && (
                  <>
                    <p className="text-[10px] font-mono text-[#3f3f46] mt-4 mb-1.5">Why this reply</p>
                    <p className="text-xs text-[#71717a] italic">{result.suggestedReply.whyThisReplyFits}</p>
                  </>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-4">

                {/* Classification */}
                <Card title="Classification">
                  <Row label="Commercial value" value={
                    <span className={fitColor(result.classification.commercialValue)}>
                      {result.classification.commercialValue}
                    </span>
                  } />
                  <Row label="Strategic fit" value={
                    <span className={fitColor(result.classification.strategicFit)}>
                      {result.classification.strategicFit}
                    </span>
                  } />
                  <Row label="Complexity" value={result.classification.complexity} />
                  <div className="mt-3">
                    <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.classification.categories.map((c) => (
                        <Badge key={c} text={c} />
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Internal notes */}
                <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
                      Internal notes
                    </p>
                    <CopyBtn
                      text={[
                        `Recommended offer: ${slug(result.internalNotes.recommendedOffer)}`,
                        `\nRisks:\n${result.internalNotes.risks.map((r) => `- ${r}`).join('\n')}`,
                        `\nOpportunities:\n${result.internalNotes.opportunities.map((o) => `- ${o}`).join('\n')}`,
                        `\nDiscovery angle: ${result.internalNotes.suggestedDiscoveryAngle}`,
                        `\nNext action: ${result.internalNotes.recommendedNextAction}`,
                      ].join('')}
                      label="Copy notes"
                      id="notes"
                      copiedKey={copiedKey}
                      onCopy={copy}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Recommended offer</p>
                  <p className="text-sm text-[#0f7b3a] mb-4">{slug(result.internalNotes.recommendedOffer)}</p>
                  {result.internalNotes.risks.length > 0 && (
                    <>
                      <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Risks</p>
                      <ul className="space-y-1 mb-4">
                        {result.internalNotes.risks.map((r, i) => (
                          <li key={i} className="text-xs text-rose-400 flex gap-2">
                            <span className="shrink-0">—</span>{r}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {result.internalNotes.opportunities.length > 0 && (
                    <>
                      <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Opportunities</p>
                      <ul className="space-y-1 mb-4">
                        {result.internalNotes.opportunities.map((o, i) => (
                          <li key={i} className="text-xs text-green-400 flex gap-2">
                            <span className="shrink-0">+</span>{o}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {result.internalNotes.suggestedDiscoveryAngle && (
                    <>
                      <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Discovery angle</p>
                      <p className="text-xs text-[#a1a1aa] mb-4">{result.internalNotes.suggestedDiscoveryAngle}</p>
                    </>
                  )}
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Next action</p>
                  <p className="text-xs text-[#f5f5f5]">{result.internalNotes.recommendedNextAction}</p>
                </div>

              </div>
            </div>

            {/* Context + follow-up row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Extracted context */}
              <Card title="Extracted context">
                <Row label="Lead name" value={result.context.leadName} />
                <Row label="Company" value={result.context.companyName} />
                <Row label="Industry" value={result.context.industry} />
                <Row label="Role" value={result.context.roleTitle} />
                <Row label="Email" value={result.context.email} />
                <Row label="Phone" value={result.context.phone} />
                <Row label="Website" value={result.context.website} />
                <Row label="Location" value={result.context.location} />
                {result.context.enquirySummary && (
                  <div className="pt-3">
                    <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Summary</p>
                    <p className="text-xs text-[#a1a1aa]">{result.context.enquirySummary}</p>
                  </div>
                )}
                {result.context.operationalPainPoint && (
                  <div className="pt-3">
                    <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Pain point</p>
                    <p className="text-xs text-[#f5f5f5]">{result.context.operationalPainPoint}</p>
                  </div>
                )}
                {result.context.budgetSignal && (
                  <div className="pt-3">
                    <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Budget signal</p>
                    <p className="text-xs text-[#a1a1aa]">{result.context.budgetSignal}</p>
                  </div>
                )}
                {result.context.missingInformation.length > 0 && (
                  <div className="pt-3">
                    <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Missing information</p>
                    <ul className="space-y-1">
                      {result.context.missingInformation.map((m, i) => (
                        <li key={i} className="text-xs text-amber-400 flex gap-2">
                          <span className="shrink-0">?</span>{m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Follow-up */}
              <div className="space-y-4">
                <Card title="Follow-up">
                  <Row label="Priority" value={
                    <Badge
                      text={result.followUp.priority}
                      className={urgencyColor(result.followUp.priority)}
                    />
                  } />
                  <Row label="Timing" value={result.followUp.suggestedTiming} />
                  {result.followUp.suggestedMessage && (
                    <div className="pt-3">
                      <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Suggested message</p>
                      <p className="text-xs text-[#a1a1aa] italic">{result.followUp.suggestedMessage}</p>
                    </div>
                  )}
                  {result.followUp.internalReason && (
                    <div className="pt-3">
                      <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Internal reason</p>
                      <p className="text-xs text-[#71717a]">{result.followUp.internalReason}</p>
                    </div>
                  )}
                </Card>

                {/* Safety audit */}
                <Card title="Audit / safety">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
                      <p className="text-[10px] font-mono text-[#71717a] mb-1">Human review</p>
                      <p className="text-sm font-semibold text-green-400">
                        {result.safety.humanReviewRequired ? 'Required' : 'Not required'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#27272a] bg-[#0a0a0b] p-3 text-center">
                      <p className="text-[10px] font-mono text-[#71717a] mb-1">Status</p>
                      <p className="text-sm font-semibold text-[#a1a1aa] capitalize">
                        {result.safety.approvalStatus}
                      </p>
                    </div>
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
                      <p className="text-[10px] font-mono text-[#71717a] mb-1">Auto-sent</p>
                      <p className="text-sm font-semibold text-green-400">
                        {result.safety.autoSent ? '⚠ Yes' : 'No'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
                      <p className="text-[10px] font-mono text-[#71717a] mb-1">Production action</p>
                      <p className="text-sm font-semibold text-green-400">
                        {result.safety.productionActionTaken ? '⚠ Yes' : 'None taken'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">What the agent did</p>
                  <p className="text-xs text-[#71717a] mb-3">{result.safety.whatAgentDid}</p>
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">What the agent did not do</p>
                  <p className="text-xs text-[#3f3f46]">{result.safety.whatAgentDidNotDo}</p>
                </Card>
              </div>
            </div>

            {/* Raw JSON */}
            <div className="rounded-2xl border border-[#27272a] bg-[#111113] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  onClick={() => setJsonOpen((o) => !o)}
                  className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
                    Raw JSON output
                  </p>
                  <span className="text-[#71717a] text-xs">{jsonOpen ? '▲' : '▼'}</span>
                </button>
                <CopyBtn
                  text={JSON.stringify(result, null, 2)}
                  label="Copy JSON"
                  id="json"
                  copiedKey={copiedKey}
                  onCopy={copy}
                />
              </div>
              {jsonOpen && (
                <pre className="px-5 pb-5 text-[11px] font-mono text-[#71717a] overflow-x-auto whitespace-pre leading-relaxed border-t border-[#1c1c1e]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>

            {/* Run another */}
            <div className="text-center pb-8">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  document.querySelector('textarea')?.focus();
                }}
                className="text-sm text-[#71717a] hover:text-[#f5f5f5] transition-colors"
              >
                ↑ Run another analysis
              </button>
            </div>

          </div>
        )}

        {!result && !loading && (
          <p className="text-center text-xs text-[#3f3f46] pb-8">
            Results will appear here after analysis.
          </p>
        )}
      </div>
    </div>
  );
}
