'use client';

import { useState } from 'react';
import type { BatchItem } from '../utils/batchInboxStorage';
import { parseBatchInput } from '../utils/batchParser';
import { downloadFile } from '../utils/exportUtils';
import { buildHandover } from '../utils/exportUtils';
import { BatchQueueItem } from './BatchQueueItem';
import type { FormState } from '../utils/types';
import type { AgentOutput } from '@/lib/agent-core/types';

function newManualItem(overrides: Partial<BatchItem> = {}): BatchItem {
  return {
    id: `bi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
    subject: '',
    message: '',
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    source: 'batch_import',
    status: 'queued',
    ...overrides,
  };
}

export function BatchInboxPanel({
  items,
  onAddItems,
  onMarkAnalysed,
  onMarkError,
  onMarkSkipped,
  onRemoveItem,
  onClear,
  onLoadToForm,
  onSaveToHistory,
}: {
  items: BatchItem[];
  onAddItems: (items: BatchItem[]) => void;
  onMarkAnalysed: (id: string, result: AgentOutput, jobId?: string) => void;
  onMarkError: (id: string, msg: string) => void;
  onMarkSkipped: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  onLoadToForm: (form: FormState) => void;
  onSaveToHistory: (form: FormState, result: AgentOutput) => string | undefined;
}) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [analysingId, setAnalysingId] = useState<string | null>(null);
  const [manual, setManual] = useState<Partial<BatchItem>>({ source: 'batch_manual' });

  const queued = items.filter((i) => i.status === 'queued').length;
  const analysed = items.filter((i) => i.status === 'analysed').length;

  function handleParse() {
    setPasteError(null);
    const result = parseBatchInput(pasteText);
    if (result.format === 'error') {
      setPasteError(result.error ?? 'Could not parse input.');
      return;
    }
    onAddItems(result.items);
    setPasteText('');
    setPasteOpen(false);
  }

  function handleAddManual() {
    if (!manual.message?.trim()) return;
    onAddItems([newManualItem(manual)]);
    setManual({ source: 'batch_manual' });
    setManualOpen(false);
  }

  async function handleAnalyse(item: BatchItem) {
    if (analysingId) return;
    setAnalysingId(item.id);

    const form: FormState = {
      message: item.message,
      subject: item.subject,
      senderName: item.senderName,
      senderEmail: item.senderEmail,
      senderPhone: item.senderPhone,
      source: item.source,
    };

    try {
      const res = await fetch('/api/admin/agent/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      let data: unknown;
      try { data = await res.json(); } catch {
        onMarkError(item.id, 'Agent returned an unreadable response.');
        return;
      }

      if (!res.ok) {
        onMarkError(item.id, (data as { error?: string })?.error ?? `HTTP ${res.status}`);
        return;
      }

      const output = data as AgentOutput;
      if (!output?.route || !output?.classification || !output?.safety) {
        onMarkError(item.id, 'Unexpected response shape from agent.');
        return;
      }

      const jobId = onSaveToHistory(form, output);
      onMarkAnalysed(item.id, output, jobId);
    } catch {
      onMarkError(item.id, 'Network error — could not reach the agent.');
    } finally {
      setAnalysingId(null);
    }
  }

  function handleExportQueue() {
    downloadFile(
      JSON.stringify({ exportedAt: new Date().toISOString(), items }, null, 2),
      `2ko-batch-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json',
    );
  }

  function handleExportMarkdown() {
    const analysedItems = items.filter((i) => i.status === 'analysed' && i.result);
    if (analysedItems.length === 0) return;
    const lines = analysedItems.map((item) => {
      const result = item.result!;
      return ['---', `# ${item.senderName || item.senderEmail || 'Unknown'}`, buildHandover(result), ''].join('\n');
    });
    downloadFile(
      `# 2KO Systems — Batch Analysis Handover\n\nGenerated: ${new Date().toLocaleString('en-ZA')}\n\n${lines.join('\n')}`,
      `2ko-batch-handover-${new Date().toISOString().slice(0, 10)}.md`,
      'text/markdown',
    );
  }

  const inputClass = 'w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors';

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-700 dark:text-[#71717a]">Batch Inbox</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { setManualOpen((o) => !o); setPasteOpen(false); }} className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 transition-colors">
              + Add one
            </button>
            <button type="button" onClick={() => { setPasteOpen((o) => !o); setManualOpen(false); }} className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 transition-colors">
              Paste / import
            </button>
          </div>
        </div>
        <p className="text-xs text-[#3f3f46]">
          Paste multiple enquiries for local-only batch testing. Analyse one at a time.
          Results save to workflow history. Nothing is sent or stored on the backend.
        </p>
        {items.length > 0 && (
          <p className="text-[11px] text-zinc-700 dark:text-[#71717a] mt-2">
            {items.length} items · {queued} queued · {analysed} analysed
          </p>
        )}
      </div>

      {/* Manual add form */}
      {manualOpen && (
        <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a]">Add single enquiry</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Subject</label>
              <input type="text" value={manual.subject ?? ''} onChange={(e) => setManual((m) => ({ ...m, subject: e.target.value }))} className={inputClass} placeholder="Email subject" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Source</label>
              <input type="text" value={manual.source ?? 'batch_manual'} onChange={(e) => setManual((m) => ({ ...m, source: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Sender name</label>
              <input type="text" value={manual.senderName ?? ''} onChange={(e) => setManual((m) => ({ ...m, senderName: e.target.value }))} className={inputClass} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Sender email</label>
              <input type="email" value={manual.senderEmail ?? ''} onChange={(e) => setManual((m) => ({ ...m, senderEmail: e.target.value }))} className={inputClass} placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Sender phone</label>
              <input type="tel" value={manual.senderPhone ?? ''} onChange={(e) => setManual((m) => ({ ...m, senderPhone: e.target.value }))} className={inputClass} placeholder="+27 00 000 0000" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Message *</label>
            <textarea value={manual.message ?? ''} onChange={(e) => setManual((m) => ({ ...m, message: e.target.value }))} rows={4} className={`${inputClass} resize-y`} placeholder="Paste the raw enquiry message" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleAddManual} disabled={!manual.message?.trim()} className="rounded-full bg-[#0f7b3a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#B8C4C8] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Add to queue</button>
            <button type="button" onClick={() => setManualOpen(false)} className="text-xs text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Paste / import */}
      {pasteOpen && (
        <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a]">Paste batch input</p>
          <p className="text-[11px] text-[#3f3f46]">
            Paste a JSON array <code className="text-zinc-700 dark:text-[#71717a]">[&#123;message, subject, senderName, ...&#125;]</code>, or plain text blocks separated by <code className="text-zinc-700 dark:text-[#71717a]">---</code> or <code className="text-zinc-700 dark:text-[#71717a]">###</code> on their own line.
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => { setPasteText(e.target.value); setPasteError(null); }}
            rows={8}
            className={`${inputClass} resize-y font-mono`}
            placeholder="Paste JSON array or plain text blocks here…"
          />
          {pasteError && <p className="text-xs text-rose-400">{pasteError}</p>}
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleParse} disabled={!pasteText.trim()} className="rounded-full bg-[#0f7b3a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#B8C4C8] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Parse and add to queue</button>
            <button type="button" onClick={() => { setPasteOpen(false); setPasteText(''); setPasteError(null); }} className="text-xs text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Queue */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 dark:border-[#1c1c1e] bg-[#0d0d0f] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-[#1c1c1e]">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a]">Queue</p>
            <div className="flex items-center gap-3">
              {analysed > 0 && (
                <>
                  <button type="button" onClick={handleExportMarkdown} className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors">↓ Handover MD</button>
                  <button type="button" onClick={handleExportQueue} className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors">↓ JSON</button>
                </>
              )}
              <button type="button" onClick={onClear} className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors">Clear all</button>
            </div>
          </div>
          <div>
            {items.map((item) => (
              <BatchQueueItem
                key={item.id}
                item={item}
                analysing={analysingId === item.id}
                onAnalyse={handleAnalyse}
                onLoadToForm={(i) => onLoadToForm({
                  message: i.message, subject: i.subject,
                  senderName: i.senderName, senderEmail: i.senderEmail,
                  senderPhone: i.senderPhone, source: i.source,
                })}
                onSkip={onMarkSkipped}
                onDelete={onRemoveItem}
              />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && !pasteOpen && !manualOpen && (
        <p className="text-center text-xs text-[#3f3f46] py-6">
          No enquiries in the batch queue. Add one manually or paste a batch above.
        </p>
      )}
    </div>
  );
}
