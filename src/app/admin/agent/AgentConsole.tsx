'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentOutput } from '@/lib/agent-core/types';

// ─── constants ────────────────────────────────────────────────────────────────

const HISTORY_KEY = '2ko_agent_ops_history';
const HISTORY_MAX = 10;

// ─── types ────────────────────────────────────────────────────────────────────

interface FormState {
  message: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  source: string;
}

interface HistoryItem {
  id: string;
  ts: number;
  senderName: string | null;
  enquiryType: string;
  leadScore: number;
  temperature: string;
  recommendedOffer: string;
  enquirySummary: string;
  form: FormState;
  result: AgentOutput;
}

const EMPTY_FORM: FormState = {
  message: '',
  subject: '',
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  source: 'admin_ui',
};

// ─── presets ─────────────────────────────────────────────────────────────────

const PRESETS: { label: string; form: FormState }[] = [
  {
    label: 'Strong automation lead',
    form: {
      message:
        "Hi, I'm the operations manager at Hartley Mining (about 320 staff across 3 sites). We're drowning in manual approvals — capex requests, shift handovers, and incident reports are all done on paper or in email chains. We've been looking at ways to digitise these workflows and someone mentioned you build custom systems for mining operations. Would love to understand what a project like this looks like and what it costs. We have budget approved for this quarter.",
      subject: 'Workflow digitalisation enquiry — Hartley Mining',
      senderName: 'James Hartley',
      senderEmail: 'james@hartleymining.co.za',
      senderPhone: '+27 82 555 0012',
      source: 'contact_form',
    },
  },
  {
    label: 'Existing client support',
    form: {
      message:
        "Hi, it's Sarah from Agriwise. We use the purchase order approval system you built for us last year. Since last Thursday the email notifications for approved POs aren't going out — the purchase orders are approved in the system but the suppliers never receive the confirmation email. Can someone look at this urgently? We have deliveries scheduled this week.",
      subject: 'Urgent: PO approval notifications not sending',
      senderName: 'Sarah van Niekerk',
      senderEmail: 'sarah@agriwise.co.za',
      senderPhone: '+27 71 444 0098',
      source: 'email',
    },
  },
  {
    label: 'Low-fit supplier / spam',
    form: {
      message:
        "Hello, I represent Boost Digital Marketing. We specialise in SEO, Google Ads, and social media management for businesses in South Africa. We've helped dozens of companies increase their online visibility by 300%. I'd love to offer you a free audit of your website's current SEO performance. Would you be open to a quick 15-minute call this week?",
      subject: 'Free SEO Audit for 2KO Systems',
      senderName: 'Thabo Nkosi',
      senderEmail: 'thabo@boostdigital.co.za',
      senderPhone: '',
      source: 'contact_form',
    },
  },
  {
    label: 'Vague — needs review',
    form: {
      message:
        "Hey, I saw your website and I think you might be able to help us. We have some processes that need improvement. Can you let me know what you offer and how much it costs?",
      subject: 'Enquiry',
      senderName: 'Michael',
      senderEmail: 'michael.b@gmail.com',
      senderPhone: '',
      source: 'contact_form',
    },
  },
  {
    label: 'Website / system build',
    form: {
      message:
        "Hi, I run a mid-sized logistics company (Coastal Freight, 80 staff, Western Cape). We need a proper web-based system where our clients can log in, track their shipments, and submit new booking requests. Currently everything is done by phone and WhatsApp and it's becoming unmanageable. We also want a staff portal for our dispatchers to manage loads and assign drivers. Do you build this kind of thing?",
      subject: 'Client portal + dispatch system enquiry',
      senderName: 'Priya Naidoo',
      senderEmail: 'priya@coastalfreight.co.za',
      senderPhone: '+27 83 700 1122',
      source: 'contact_form',
    },
  },
  {
    label: 'CRM / dashboard enquiry',
    form: {
      message:
        "Hi there, we're a commercial cleaning company with 6 branches across Gauteng. We're trying to get visibility into which branches are profitable, which clients are at risk of churning, and how our teams are performing against targets. At the moment we have spreadsheets and nothing talks to each other. We've been told we need a CRM or a dashboard — honestly not sure which is right for us. Can you advise on what would actually help?",
      subject: 'CRM or dashboard for multi-branch operations',
      senderName: 'Brian Louw',
      senderEmail: 'brian@cleanco.co.za',
      senderPhone: '+27 79 311 5500',
      source: 'referral',
    },
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

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
function fmtDate(ts: number) {
  return new Date(ts).toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isSafe(safety: AgentOutput['safety']): boolean {
  return (
    safety.humanReviewRequired === true &&
    safety.approvalStatus === 'draft' &&
    safety.autoSent === false &&
    safety.productionActionTaken === false
  );
}

function buildMarkdown(result: AgentOutput, form: FormState): string {
  const lines: string[] = [
    '# 2KO Systems — Agent Analysis',
    '',
    `**Analysed:** ${new Date().toLocaleString('en-ZA')}`,
    '',
    '## Lead Summary',
    `- **Name:** ${result.context.leadName ?? 'Unknown'}`,
    `- **Company:** ${result.context.companyName ?? 'Unknown'}`,
    `- **Industry:** ${result.context.industry ?? 'Unknown'}`,
    `- **Source:** ${form.source}`,
    '',
    '## Classification',
    `- **Route:** ${slug(result.route.business)}`,
    `- **Enquiry type:** ${slug(result.route.enquiryType)}`,
    `- **Lead score:** ${result.classification.leadScore}/100 (${scoreLabel(result.classification.leadScore)})`,
    `- **Temperature:** ${result.classification.temperature}`,
    `- **Urgency:** ${result.classification.urgency}`,
    `- **Commercial value:** ${result.classification.commercialValue}`,
    `- **Strategic fit:** ${result.classification.strategicFit}`,
    `- **Categories:** ${result.classification.categories.map(slug).join(', ')}`,
    '',
    '## Enquiry Summary',
    result.context.enquirySummary,
    '',
    '## Operational Pain Point',
    result.context.operationalPainPoint ?? 'Not identified',
    '',
  ];

  if (result.context.missingInformation.length > 0) {
    lines.push('## Missing Information');
    result.context.missingInformation.forEach((m) => lines.push(`- ${m}`));
    lines.push('');
  }

  lines.push(
    '## Suggested Reply',
    '',
    `**Subject:** ${result.suggestedReply.subject}`,
    '',
    result.suggestedReply.body,
    '',
    '## Internal Notes',
    '',
    `**Recommended offer:** ${slug(result.internalNotes.recommendedOffer)}`,
    '',
  );

  if (result.internalNotes.risks.length > 0) {
    lines.push('**Risks:**');
    result.internalNotes.risks.forEach((r) => lines.push(`- ${r}`));
    lines.push('');
  }
  if (result.internalNotes.opportunities.length > 0) {
    lines.push('**Opportunities:**');
    result.internalNotes.opportunities.forEach((o) => lines.push(`- ${o}`));
    lines.push('');
  }

  lines.push(
    `**Discovery angle:** ${result.internalNotes.suggestedDiscoveryAngle}`,
    '',
    `**Next action:** ${result.internalNotes.recommendedNextAction}`,
    '',
    '## Follow-up',
    `- **Priority:** ${result.followUp.priority}`,
    `- **Timing:** ${result.followUp.suggestedTiming}`,
    `- **Suggested message:** ${result.followUp.suggestedMessage}`,
    '',
    '## Safety Confirmation',
    `- Human review required: **${result.safety.humanReviewRequired}**`,
    `- Approval status: **${result.safety.approvalStatus}**`,
    `- Auto-sent: **${result.safety.autoSent}**`,
    `- Production action taken: **${result.safety.productionActionTaken}**`,
    `- What the agent did: ${result.safety.whatAgentDid}`,
    `- What the agent did NOT do: ${result.safety.whatAgentDidNotDo}`,
  );

  return lines.join('\n');
}

function buildHandover(result: AgentOutput): string {
  return [
    'INTERNAL HANDOVER — 2KO Systems',
    '',
    `Lead: ${result.context.leadName ?? 'Unknown'} | ${result.context.companyName ?? 'Unknown company'}`,
    `Score: ${result.classification.leadScore}/100 — ${scoreLabel(result.classification.leadScore)}`,
    `Route: ${slug(result.route.business)} / ${slug(result.route.enquiryType)}`,
    `Recommended offer: ${slug(result.internalNotes.recommendedOffer)}`,
    '',
    'SUMMARY',
    result.context.enquirySummary,
    '',
    ...(result.context.operationalPainPoint
      ? [`PAIN POINT`, result.context.operationalPainPoint, '']
      : []),
    'NEXT ACTION',
    result.internalNotes.recommendedNextAction,
    '',
    `FOLLOW-UP: ${result.followUp.priority} priority — ${result.followUp.suggestedTiming}`,
    '',
    'SAFETY: Draft only. Human review required. No message sent. No production action taken.',
  ].join('\n');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function apiErrorMessage(status: number, serverMsg?: string): string {
  if (status === 401) return 'Session expired. You will be signed out.';
  if (status === 400)
    return serverMsg?.toLowerCase().includes('message')
      ? 'A message is required to run the analyser.'
      : (serverMsg ?? 'Invalid input — please check the form and try again.');
  if (status === 422)
    return 'The enquiry could not be processed. Please check the inputs and try again.';
  if (status >= 500)
    return 'The analyser could not complete this run. No message was sent and no production action was taken. Please try again or review manually.';
  return serverMsg ?? 'An unexpected error occurred. No production action was taken.';
}

// ─── copy hook ────────────────────────────────────────────────────────────────

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

// ─── history hook ─────────────────────────────────────────────────────────────

function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setItems(JSON.parse(raw) as HistoryItem[]);
    } catch {
      // ignore malformed storage
    }
  }, []);

  function persist(updated: HistoryItem[]) {
    setItems(updated);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // quota exceeded or private browsing
    }
  }

  function add(form: FormState, result: AgentOutput) {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
      senderName: result.context.leadName ?? (form.senderName || null),
      enquiryType: result.route.enquiryType,
      leadScore: result.classification.leadScore,
      temperature: result.classification.temperature,
      recommendedOffer: result.internalNotes.recommendedOffer,
      enquirySummary: result.context.enquirySummary,
      form,
      result,
    };
    persist([item, ...items].slice(0, HISTORY_MAX));
  }

  function remove(id: string) {
    persist(items.filter((i) => i.id !== id));
  }

  function clear() {
    setItems([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }

  return { items, add, remove, clear };
}

// ─── sub-components ───────────────────────────────────────────────────────────

function AdminCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">{title}</p>
        {action}
      </div>
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
  disabled,
}: {
  text: string;
  label: string;
  id: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  disabled?: boolean;
}) {
  const copied = copiedKey === id;
  return (
    <button
      type="button"
      onClick={() => !disabled && onCopy(text, id)}
      disabled={disabled}
      className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

// ─── safety panel ─────────────────────────────────────────────────────────────

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

function SafetyPanel({ safety }: { safety: AgentOutput['safety'] }) {
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
          <SafetyField
            label="approvalStatus"
            value={safety.approvalStatus}
            expected="draft"
          />
          <SafetyField
            label="autoSent"
            value={String(safety.autoSent)}
            expected="false"
          />
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
          <div key={label} className="rounded-xl border border-[#1c4a2e] bg-[#0a1410] p-3 text-center">
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

// ─── history panel ─────────────────────────────────────────────────────────────

function HistoryPanel({
  items,
  onReload,
  onDelete,
  onClear,
}: {
  items: HistoryItem[];
  onReload: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1c1c1e] bg-[#0d0d0f] px-5 py-3 flex items-center gap-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3f3f46]">
          Local history
        </p>
        <span className="text-xs text-[#3f3f46]">— no analyses this session</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1c1c1e] bg-[#0d0d0f] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
            Local history
          </p>
          <span className="text-[10px] font-mono text-[#3f3f46] border border-[#27272a] rounded-full px-2 py-0.5">
            {items.length}
          </span>
          <span className="text-[#3f3f46] text-[10px]">{open ? '▲' : '▼'}</span>
        </button>
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-[#3f3f46] hidden sm:block">
            Browser only — not saved to the backend
          </p>
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#1c1c1e]">
          <p className="px-5 py-2 text-[10px] text-[#3f3f46] border-b border-[#1c1c1e]">
            Temporary browser history — not saved to the backend. Cleared when browser data is cleared.
          </p>
          <div className="divide-y divide-[#1c1c1e]">
            {items.map((item) => (
              <div
                key={item.id}
                className="px-5 py-3 flex items-start gap-4 hover:bg-[#111113] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-sm font-semibold tabular-nums ${scoreColor(item.leadScore)}`}>
                      {item.leadScore}
                    </span>
                    <span className="text-xs text-[#a1a1aa]">
                      {item.senderName ?? 'Unknown sender'}
                    </span>
                    <Badge text={item.temperature} className={tempColor(item.temperature)} />
                    <span className="text-[10px] font-mono text-[#3f3f46]">
                      {fmtDate(item.ts)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717a] mb-0.5">
                    {slug(item.enquiryType)} · {slug(item.recommendedOffer)}
                  </p>
                  <p className="text-[11px] text-[#3f3f46] truncate">{item.enquirySummary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onReload(item)}
                    className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1"
                  >
                    Reload
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors w-6 text-center"
                    aria-label="Delete history item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AgentConsole() {
  const router = useRouter();
  const { copy, copiedKey } = useCopy();
  const history = useHistory();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentOutput | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);

  function setField(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function applyPreset(preset: (typeof PRESETS)[0]) {
    setForm(preset.form);
    setError(null);
  }

  function handleReloadHistory(item: HistoryItem) {
    setForm(item.form);
    setResult(item.result);
    setError(null);
    setJsonOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setResult(null);
    setError(null);
    setJsonOpen(false);
  }

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.refresh();
  }

  async function handleAnalyse(e: React.FormEvent) {
    e.preventDefault();
    if (!form.message.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/agent/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        setLoading(false);
        router.refresh();
        return;
      }

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        setError(
          'The analyser returned an unreadable response. No production action was taken.',
        );
        return;
      }

      if (!res.ok) {
        const msg = (data as { error?: string })?.error;
        setError(apiErrorMessage(res.status, msg));
        return;
      }

      const output = data as AgentOutput;
      if (!output?.route || !output?.classification || !output?.safety) {
        setError(
          'Unexpected response shape from the agent. No production action was taken.',
        );
        return;
      }

      setResult(output);
      history.add(form, output);
      setTimeout(() => {
        document.getElementById('agent-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setError(
        'Network error — the request did not reach the server. No production action was taken.',
      );
    } finally {
      setLoading(false);
    }
  }

  const safetyOk = result ? isSafe(result.safety) : true;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen overflow-y-auto">

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
          type="button"
          onClick={handleLogout}
          className="text-xs text-[#71717a] hover:text-[#f5f5f5] transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* Input card */}
        <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">

          {/* Presets */}
          <div className="mb-5 pb-5 border-b border-[#1c1c1e]">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-2.5">
              Quick-fill presets
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  disabled={loading}
                  className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#3f3f46] mt-2">
              Fills form fields only — click Analyse to run.
            </p>
          </div>

          {/* Form */}
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

            {/* Error state */}
            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-4 py-3">
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="rounded-xl border border-[#27272a] bg-[#0a0a0b] px-4 py-3 flex items-center gap-3">
                <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#0f7b3a] border-t-transparent animate-spin shrink-0" />
                <p className="text-sm text-[#71717a]">Analysing enquiry — this may take a moment</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading || !form.message.trim()}
                className="rounded-full bg-[#0f7b3a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Analysing…' : 'Analyse enquiry'}
              </button>
              {(result || form.message) && !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-[#71717a] hover:text-[#f5f5f5] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Local history */}
        <HistoryPanel
          items={history.items}
          onReload={handleReloadHistory}
          onDelete={history.remove}
          onClear={history.clear}
        />

        {/* Empty state */}
        {!result && !loading && (
          <p className="text-center text-xs text-[#3f3f46] py-6">
            Results will appear here after analysis.
          </p>
        )}

        {/* Results */}
        {result && (
          <div id="agent-results" className="space-y-4">

            {/* Safety panel — always first */}
            <SafetyPanel safety={result.safety} />

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
                  <Badge
                    text={result.classification.temperature}
                    className={tempColor(result.classification.temperature)}
                  />
                  <Badge
                    text={`urgency: ${result.classification.urgency}`}
                    className={urgencyColor(result.classification.urgency)}
                  />
                  <Badge text={`confidence: ${result.route.confidence}%`} />
                </div>
              </div>
            </div>

            {/* Export / copy bar */}
            {!safetyOk && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-4 py-3">
                <p className="text-sm text-rose-400">
                  Copy and download are disabled — safety fields contain unexpected values. Review manually before proceeding.
                </p>
              </div>
            )}
            <div className="rounded-2xl border border-[#27272a] bg-[#0d0d0f] px-5 py-3.5 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#3f3f46] mr-1">
                Copy
              </p>
              <CopyBtn
                text={result.suggestedReply.body}
                label="Reply body"
                id="reply-body"
                copiedKey={copiedKey}
                onCopy={copy}
                disabled={!safetyOk}
              />
              <CopyBtn
                text={`Subject: ${result.suggestedReply.subject}\n\n${result.suggestedReply.body}`}
                label="Reply (subject + body)"
                id="reply-full"
                copiedKey={copiedKey}
                onCopy={copy}
                disabled={!safetyOk}
              />
              <CopyBtn
                text={[
                  `Recommended offer: ${slug(result.internalNotes.recommendedOffer)}`,
                  `\nRisks:\n${result.internalNotes.risks.map((r) => `- ${r}`).join('\n')}`,
                  `\nOpportunities:\n${result.internalNotes.opportunities.map((o) => `- ${o}`).join('\n')}`,
                  `\nDiscovery angle: ${result.internalNotes.suggestedDiscoveryAngle}`,
                  `\nNext action: ${result.internalNotes.recommendedNextAction}`,
                ].join('')}
                label="Internal notes"
                id="notes-bar"
                copiedKey={copiedKey}
                onCopy={copy}
                disabled={!safetyOk}
              />
              {result.followUp.suggestedMessage && (
                <CopyBtn
                  text={result.followUp.suggestedMessage}
                  label="Follow-up message"
                  id="followup-bar"
                  copiedKey={copiedKey}
                  onCopy={copy}
                  disabled={!safetyOk}
                />
              )}
              <CopyBtn
                text={buildHandover(result)}
                label="Handover summary"
                id="handover"
                copiedKey={copiedKey}
                onCopy={copy}
                disabled={!safetyOk}
              />
              <CopyBtn
                text={JSON.stringify(result, null, 2)}
                label="Full JSON"
                id="json-copy"
                copiedKey={copiedKey}
                onCopy={copy}
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
                    JSON.stringify(
                      { analysedAt: new Date().toISOString(), input: form, output: result },
                      null,
                      2,
                    ),
                    `2ko-agent-${Date.now()}.json`,
                    'application/json',
                  )
                }
                className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
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
                className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↓ Markdown
              </button>
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
                    id="reply-card"
                    copiedKey={copiedKey}
                    onCopy={copy}
                    disabled={!safetyOk}
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
                    <p className="text-[10px] font-mono text-[#3f3f46] mt-4 mb-1.5">
                      Why this reply
                    </p>
                    <p className="text-xs text-[#71717a] italic">
                      {result.suggestedReply.whyThisReplyFits}
                    </p>
                  </>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-4">

                {/* Classification */}
                <AdminCard title="Classification">
                  <Row
                    label="Commercial value"
                    value={
                      <span className={fitColor(result.classification.commercialValue)}>
                        {result.classification.commercialValue}
                      </span>
                    }
                  />
                  <Row
                    label="Strategic fit"
                    value={
                      <span className={fitColor(result.classification.strategicFit)}>
                        {result.classification.strategicFit}
                      </span>
                    }
                  />
                  <Row label="Complexity" value={result.classification.complexity} />
                  <div className="mt-3">
                    <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.classification.categories.map((c) => (
                        <Badge key={c} text={c} />
                      ))}
                    </div>
                  </div>
                </AdminCard>

                {/* Internal notes */}
                <AdminCard
                  title="Internal notes"
                  action={
                    <CopyBtn
                      text={[
                        `Recommended offer: ${slug(result.internalNotes.recommendedOffer)}`,
                        `\nRisks:\n${result.internalNotes.risks.map((r) => `- ${r}`).join('\n')}`,
                        `\nOpportunities:\n${result.internalNotes.opportunities.map((o) => `- ${o}`).join('\n')}`,
                        `\nDiscovery angle: ${result.internalNotes.suggestedDiscoveryAngle}`,
                        `\nNext action: ${result.internalNotes.recommendedNextAction}`,
                      ].join('')}
                      label="Copy notes"
                      id="notes-card"
                      copiedKey={copiedKey}
                      onCopy={copy}
                      disabled={!safetyOk}
                    />
                  }
                >
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Recommended offer</p>
                  <p className="text-sm text-[#0f7b3a] mb-4">
                    {slug(result.internalNotes.recommendedOffer)}
                  </p>
                  {result.internalNotes.risks.length > 0 && (
                    <>
                      <p className="text-[10px] font-mono text-[#3f3f46] mb-2">Risks</p>
                      <ul className="space-y-1 mb-4">
                        {result.internalNotes.risks.map((r, i) => (
                          <li key={i} className="text-xs text-rose-400 flex gap-2">
                            <span className="shrink-0">—</span>
                            {r}
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
                            <span className="shrink-0">+</span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {result.internalNotes.suggestedDiscoveryAngle && (
                    <>
                      <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Discovery angle</p>
                      <p className="text-xs text-[#a1a1aa] mb-4">
                        {result.internalNotes.suggestedDiscoveryAngle}
                      </p>
                    </>
                  )}
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Next action</p>
                  <p className="text-xs text-[#f5f5f5]">
                    {result.internalNotes.recommendedNextAction}
                  </p>
                </AdminCard>

              </div>
            </div>

            {/* Context + follow-up */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Extracted context */}
              <AdminCard title="Extracted context">
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
                          <span className="shrink-0">?</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AdminCard>

              {/* Follow-up */}
              <AdminCard
                title="Follow-up"
                action={
                  result.followUp.suggestedMessage ? (
                    <CopyBtn
                      text={result.followUp.suggestedMessage}
                      label="Copy message"
                      id="followup-card"
                      copiedKey={copiedKey}
                      onCopy={copy}
                      disabled={!safetyOk}
                    />
                  ) : undefined
                }
              >
                <Row
                  label="Priority"
                  value={
                    <Badge
                      text={result.followUp.priority}
                      className={urgencyColor(result.followUp.priority)}
                    />
                  }
                />
                <Row label="Timing" value={result.followUp.suggestedTiming} />
                {result.followUp.suggestedMessage && (
                  <div className="pt-3">
                    <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Suggested message</p>
                    <p className="text-xs text-[#a1a1aa] italic">
                      {result.followUp.suggestedMessage}
                    </p>
                  </div>
                )}
                {result.followUp.internalReason && (
                  <div className="pt-3">
                    <p className="text-[10px] font-mono text-[#3f3f46] mb-1.5">Internal reason</p>
                    <p className="text-xs text-[#71717a]">{result.followUp.internalReason}</p>
                  </div>
                )}
              </AdminCard>
            </div>

            {/* Raw JSON */}
            <div className="rounded-2xl border border-[#27272a] bg-[#111113] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  type="button"
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
                  disabled={!safetyOk}
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
                type="button"
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

      </div>
    </div>
  );
}
