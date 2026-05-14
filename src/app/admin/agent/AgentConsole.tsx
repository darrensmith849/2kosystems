'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCopy } from './hooks/useCopy';
import { useLocalHistory } from './hooks/useLocalHistory';
import { useAgentAnalysis } from './hooks/useAgentAnalysis';
import { useQualityLab } from './hooks/useQualityLab';
import { useBatchInbox } from './hooks/useBatchInbox';
import { isSafe } from './utils/safety';
import { scoreColor, scoreLabel, tempColor, urgencyColor } from './utils/formatters';
import { EMPTY_FORM, type FormState } from './utils/types';
import { Badge } from './components/ui';
import { AdminTabs, readSavedTab, saveTab, type AdminTab } from './components/AdminTabs';
import { AgentInputForm } from './components/AgentInputForm';
import { SafetyPanel } from './components/SafetyPanel';
import { ExportBar } from './components/ExportBar';
import { SuggestedReplyCard } from './components/SuggestedReplyCard';
import { ClassificationCard } from './components/ClassificationCard';
import { InternalNotesCard } from './components/InternalNotesCard';
import { ContextCard } from './components/ContextCard';
import { FollowUpCard } from './components/FollowUpCard';
import { RawJsonCard } from './components/RawJsonCard';
import { AboutPanel } from './components/AboutPanel';
import { SafetyChecklistPanel } from './components/SafetyChecklistPanel';
import { LocalHistoryPanel } from './components/LocalHistoryPanel';
import { LocalImportExport } from './components/LocalImportExport';
import { HandoverBuilder } from './components/HandoverBuilder';
import { QualityLabPanel } from './components/QualityLabPanel';
import { BatchInboxPanel } from './components/BatchInboxPanel';

export default function AgentConsole() {
  const router = useRouter();
  const { copy, copiedKey } = useCopy();
  const history = useLocalHistory();
  const analysis = useAgentAnalysis();
  const qualityLab = useQualityLab();
  const batchInbox = useBatchInbox();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(() => readSavedTab());

  function setField(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    analysis.reset();
    setJsonOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.message.trim() || analysis.loading) return;
    const output = await analysis.run(form, () => router.refresh());
    if (output) {
      history.add(form, output);
      setTimeout(() => {
        document.getElementById('agent-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.refresh();
  }

  function handleTabChange(tab: AdminTab) {
    setActiveTab(tab);
    saveTab(tab);
  }

  function handleLoadToForm(f: FormState) {
    setForm(f);
    analysis.clearError();
    handleTabChange('analyse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const result = analysis.result;
  const safetyOk = result ? isSafe(result.safety) : true;

  const tabCounts: Partial<Record<AdminTab, number>> = {
    workflow: history.items.length > 0 ? history.items.length : undefined,
    batch: batchInbox.items.filter((i) => i.status === 'queued').length || undefined,
    quality: qualityLab.testRuns.length > 0 ? qualityLab.testRuns.length : undefined,
  };

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

      {/* Tab navigation */}
      <div className="sticky top-[53px] z-10 bg-[#0a0a0b]/95 backdrop-blur-sm px-6">
        <AdminTabs
          active={activeTab}
          onChange={handleTabChange}
          counts={tabCounts}
        />
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* ── Analyse tab ── */}
        {activeTab === 'analyse' && (
          <>
            <AgentInputForm
              form={form}
              loading={analysis.loading}
              error={analysis.error}
              hasResult={!!result}
              onFieldChange={setField}
              onPreset={(f) => {
                setForm(f);
                analysis.clearError();
              }}
              onSubmit={handleSubmit}
              onClear={handleClear}
            />

            {!result && !analysis.loading && (
              <p className="text-center text-xs text-[#3f3f46] py-6">
                Results will appear here after analysis.
              </p>
            )}

            {result && (
              <div id="agent-results" className="space-y-4">
                <SafetyPanel safety={result.safety} />

                {/* Summary bar */}
                <div className="rounded-2xl border border-[#27272a] bg-[#111113] px-5 py-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1">Lead score</p>
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
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">Route</p>
                      <p className="text-sm text-[#f5f5f5]">{result.route.business.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="h-10 w-px bg-[#27272a] hidden sm:block" />
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-1.5">Enquiry type</p>
                      <p className="text-sm text-[#f5f5f5]">{result.route.enquiryType.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="h-10 w-px bg-[#27272a] hidden sm:block" />
                    <div className="flex gap-2 flex-wrap">
                      <Badge text={result.classification.temperature} className={tempColor(result.classification.temperature)} />
                      <Badge text={`urgency: ${result.classification.urgency}`} className={urgencyColor(result.classification.urgency)} />
                      <Badge text={`confidence: ${result.route.confidence}%`} />
                    </div>
                  </div>
                </div>

                <ExportBar result={result} form={form} copiedKey={copiedKey} onCopy={copy} safetyOk={safetyOk} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SuggestedReplyCard reply={result.suggestedReply} copiedKey={copiedKey} onCopy={copy} safetyOk={safetyOk} />
                  <div className="space-y-4">
                    <ClassificationCard classification={result.classification} />
                    <InternalNotesCard notes={result.internalNotes} copiedKey={copiedKey} onCopy={copy} safetyOk={safetyOk} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ContextCard context={result.context} />
                  <FollowUpCard followUp={result.followUp} copiedKey={copiedKey} onCopy={copy} safetyOk={safetyOk} />
                </div>

                <RawJsonCard result={result} copiedKey={copiedKey} onCopy={copy} safetyOk={safetyOk} open={jsonOpen} onToggle={() => setJsonOpen((o) => !o)} />

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
          </>
        )}

        {/* ── Workflow tab ── */}
        {activeTab === 'workflow' && (
          <LocalHistoryPanel
            items={history.items}
            onReload={(item) => {
              setForm(item.form);
              analysis.setResult(item.result);
              analysis.clearError();
              setJsonOpen(false);
              handleTabChange('analyse');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDelete={history.remove}
            onUpdate={history.update}
            onClear={history.clear}
            onImport={history.importItems}
          />
        )}

        {/* ── Quality Lab tab ── */}
        {activeTab === 'quality' && (
          <QualityLabPanel
            allCases={qualityLab.allCases}
            testRuns={qualityLab.testRuns}
            onAddCustomCase={qualityLab.addCustomCase}
            onUpdateCustomCase={qualityLab.updateCustomCase}
            onDeleteCustomCase={qualityLab.deleteCustomCase}
            onAddTestRun={qualityLab.addTestRun}
            onDeleteTestRun={qualityLab.deleteTestRun}
            onUpdateTestRunNote={qualityLab.updateTestRunNote}
            onClearTestRuns={qualityLab.clearAllTestRuns}
          />
        )}

        {/* ── Batch Inbox tab ── */}
        {activeTab === 'batch' && (
          <BatchInboxPanel
            items={batchInbox.items}
            onAddItems={batchInbox.addItems}
            onMarkAnalysed={batchInbox.markAnalysed}
            onMarkError={batchInbox.markError}
            onMarkSkipped={batchInbox.markSkipped}
            onRemoveItem={batchInbox.removeItem}
            onClear={batchInbox.clear}
            onLoadToForm={handleLoadToForm}
            onSaveToHistory={(f, output) => history.add(f, output)}
          />
        )}

        {/* ── Export tab ── */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <LocalImportExport items={history.items} onImport={history.importItems} />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-4">Handover report builder</p>
              <HandoverBuilder items={history.items} />
            </div>
          </div>
        )}

        {/* ── Help tab ── */}
        {activeTab === 'help' && (
          <div className="space-y-4">
            <AboutPanel />
            <SafetyChecklistPanel />
          </div>
        )}

      </div>
    </div>
  );
}
