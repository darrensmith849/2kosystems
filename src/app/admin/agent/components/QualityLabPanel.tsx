'use client';

import { useState } from 'react';
import type { TestCase } from '../utils/testCases';
import type { TestRun } from '../utils/qualityLabStorage';
import { buildTestRun } from '../utils/qualityLabAssertions';
import { downloadFile } from '../utils/exportUtils';
import { TestCaseEditor } from './TestCaseEditor';
import { TestRunResult } from './TestRunResult';
import type { FormState } from '../utils/types';

function resultColor(r: 'pass' | 'warn' | 'fail') {
  if (r === 'pass') return 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/5';
  if (r === 'warn') return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
  return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
}
function resultIcon(r: 'pass' | 'warn' | 'fail') {
  return r === 'pass' ? '✓' : r === 'warn' ? '⚠' : '✗';
}

export function QualityLabPanel({
  allCases,
  testRuns,
  onAddCustomCase,
  onUpdateCustomCase,
  onDeleteCustomCase,
  onAddTestRun,
  onDeleteTestRun,
  onUpdateTestRunNote,
  onClearTestRuns,
}: {
  allCases: TestCase[];
  testRuns: TestRun[];
  onAddCustomCase: (tc: TestCase) => void;
  onUpdateCustomCase: (tc: TestCase) => void;
  onDeleteCustomCase: (id: string) => void;
  onAddTestRun: (run: TestRun) => void;
  onDeleteTestRun: (id: string) => void;
  onUpdateTestRunNote: (id: string, note: string) => void;
  onClearTestRuns: () => void;
}) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(allCases[0]?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [latestRun, setLatestRun] = useState<TestRun | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCase, setEditingCase] = useState<TestCase | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const selectedCase = allCases.find((tc) => tc.id === selectedCaseId) ?? null;

  async function handleRunTest() {
    if (!selectedCase || loading) return;
    setLoading(true);
    setRunError(null);

    const form: FormState = {
      message: selectedCase.message,
      subject: selectedCase.subject,
      senderName: selectedCase.senderName,
      senderEmail: selectedCase.senderEmail,
      senderPhone: selectedCase.senderPhone,
      source: selectedCase.source,
    };

    try {
      const res = await fetch('/api/admin/agent/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 401) { setRunError('Session expired — please sign in again.'); return; }

      let data: unknown;
      try { data = await res.json(); } catch { setRunError('Agent returned an unreadable response.'); return; }

      if (!res.ok) { setRunError((data as { error?: string })?.error ?? 'Agent returned an error.'); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const output = data as any;
      if (!output?.route || !output?.classification || !output?.safety) {
        setRunError('Unexpected response shape from agent.'); return;
      }

      const run: TestRun = { ...buildTestRun(selectedCase, form, output), manualNote: '' };
      setLatestRun(run);
      onAddTestRun(run);
    } catch {
      setRunError('Network error — could not reach the agent.');
    } finally {
      setLoading(false);
    }
  }

  function handleExportRuns() {
    downloadFile(
      JSON.stringify({ exportedAt: new Date().toISOString(), runs: testRuns }, null, 2),
      `2ko-test-runs-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json',
    );
  }

  const passCount = testRuns.filter((r) => r.overallResult === 'pass').length;
  const warnCount = testRuns.filter((r) => r.overallResult === 'warn').length;
  const failCount = testRuns.filter((r) => r.overallResult === 'fail').length;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">Quality Lab</p>
          <button
            type="button"
            onClick={() => { setEditingCase(null); setShowEditor(true); }}
            className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 transition-colors"
          >
            + Custom test case
          </button>
        </div>
        <p className="text-xs text-[#3f3f46]">
          Run realistic enquiries through the agent and check output against expected values.
          All runs are localStorage only — nothing is saved to the backend.
        </p>
      </div>

      {/* Editor */}
      {showEditor && (
        <TestCaseEditor
          initial={editingCase ?? undefined}
          onSave={(tc) => {
            if (editingCase) onUpdateCustomCase(tc);
            else onAddCustomCase(tc);
            setShowEditor(false);
            setEditingCase(null);
            setSelectedCaseId(tc.id);
          }}
          onCancel={() => { setShowEditor(false); setEditingCase(null); }}
        />
      )}

      {/* Test case selector + run */}
      <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-[#71717a] mb-1.5">Test case</label>
            <select
              value={selectedCaseId ?? ''}
              onChange={(e) => { setSelectedCaseId(e.target.value); setLatestRun(null); setRunError(null); }}
              className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3 py-2 text-xs text-[#f5f5f5] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
            >
              <optgroup label="Built-in">
                {allCases.filter((tc) => tc.isBuiltIn).map((tc) => (
                  <option key={tc.id} value={tc.id}>{tc.title}</option>
                ))}
              </optgroup>
              {allCases.filter((tc) => !tc.isBuiltIn).length > 0 && (
                <optgroup label="Custom">
                  {allCases.filter((tc) => !tc.isBuiltIn).map((tc) => (
                    <option key={tc.id} value={tc.id}>{tc.title}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div className="pt-6 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRunTest}
              disabled={!selectedCase || loading}
              className="rounded-full bg-[#0f7b3a] px-5 py-2 text-xs font-semibold text-white hover:bg-[#B8C4C8] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Running…
                </span>
              ) : 'Run test'}
            </button>
            {selectedCase && !selectedCase.isBuiltIn && (
              <>
                <button type="button" onClick={() => { setEditingCase(selectedCase); setShowEditor(true); }} className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] border border-[#27272a] rounded-full px-3 py-1.5 transition-colors">Edit</button>
                <button type="button" onClick={() => { onDeleteCustomCase(selectedCase.id); setSelectedCaseId(allCases[0]?.id ?? null); }} className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors">Delete</button>
              </>
            )}
          </div>
        </div>

        {/* Selected case details */}
        {selectedCase && (
          <div className="border-t border-[#1c1c1e] pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Scenario type</p>
                <p className="text-xs text-[#71717a]">{selectedCase.scenarioType || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Expected route</p>
                <p className="text-xs text-[#71717a]">{selectedCase.expectedRoute.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Expected enquiry type</p>
                <p className="text-xs text-[#71717a]">{selectedCase.expectedEnquiryType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Expected score band</p>
                <p className="text-xs text-[#71717a]">{selectedCase.expectedMinScore}–{selectedCase.expectedMaxScore}</p>
              </div>
              {selectedCase.expectedRecommendedOffer && (
                <div>
                  <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Expected offer</p>
                  <p className="text-xs text-[#71717a]">{selectedCase.expectedRecommendedOffer.replace(/_/g, ' ')}</p>
                </div>
              )}
            </div>
            {selectedCase.notes && (
              <div>
                <p className="text-[10px] font-mono text-[#3f3f46] mb-1">What good looks like</p>
                <p className="text-xs text-[#71717a] italic">{selectedCase.notes}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-mono text-[#3f3f46] mb-1">Message preview</p>
              <p className="text-[11px] text-[#3f3f46] line-clamp-3">{selectedCase.message}</p>
            </div>
          </div>
        )}

        {/* Run error */}
        {runError && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-4 py-3">
            <p className="text-xs text-rose-400">{runError}</p>
          </div>
        )}

        {/* Latest run result */}
        {latestRun && (
          <div className="border-t border-[#1c1c1e] pt-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#71717a] mb-3">Latest test result</p>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${resultColor(latestRun.overallResult)}`}>
                {resultIcon(latestRun.overallResult)} {latestRun.overallResult.toUpperCase()}
              </span>
              <span className="text-xs text-[#71717a]">
                Score: {latestRun.output?.classification?.leadScore}/100 ·{' '}
                {latestRun.assertions.filter((a) => a.result === 'pass').length} pass ·{' '}
                {latestRun.assertions.filter((a) => a.result === 'warn').length} warn ·{' '}
                {latestRun.assertions.filter((a) => a.result === 'fail').length} fail
              </span>
            </div>
            <div className="space-y-1">
              {latestRun.assertions.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-start gap-2 px-3 py-1.5 rounded-lg text-[11px] ${
                    a.result === 'pass' ? 'bg-[#0a1410] border border-[#1c4a2e]'
                      : a.result === 'warn' ? 'bg-amber-400/5 border border-amber-400/20'
                      : 'bg-rose-400/5 border border-rose-400/25'
                  }`}
                >
                  <span className={`shrink-0 font-mono ${a.result === 'pass' ? 'text-[#4ade80]' : a.result === 'warn' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {resultIcon(a.result)}
                  </span>
                  <div>
                    <span className="text-[#a1a1aa]">{a.label}</span>
                    <span className="text-[#3f3f46] ml-2">({a.expected} → {a.actual})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test run history */}
      <div className="rounded-2xl border border-[#1c1c1e] bg-[#0d0d0f] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <button type="button" onClick={() => setHistoryOpen((o) => !o)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">Test run history</p>
            <span className="text-[10px] font-mono text-[#3f3f46] border border-[#27272a] rounded-full px-2 py-0.5">{testRuns.length}</span>
            {testRuns.length > 0 && (
              <>
                <span className="text-[10px] font-mono text-[#4ade80]">{passCount}✓</span>
                {warnCount > 0 && <span className="text-[10px] font-mono text-amber-400">{warnCount}⚠</span>}
                {failCount > 0 && <span className="text-[10px] font-mono text-rose-400">{failCount}✗</span>}
              </>
            )}
            <span className="text-[#3f3f46] text-[10px]">{historyOpen ? '▲' : '▼'}</span>
          </button>
          {testRuns.length > 0 && (
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleExportRuns} className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors">↓ Export</button>
              <button type="button" onClick={onClearTestRuns} className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors">Clear all</button>
            </div>
          )}
        </div>
        {historyOpen && (
          <div className="border-t border-[#1c1c1e]">
            {testRuns.length === 0 ? (
              <p className="px-5 py-4 text-xs text-[#3f3f46]">No test runs yet. Select a test case above and click Run test.</p>
            ) : (
              testRuns.map((run) => (
                <TestRunResult key={run.id} run={run} onDelete={onDeleteTestRun} onUpdateNote={onUpdateTestRunNote} />
              ))
            )}
            <p className="px-5 py-2 text-[10px] text-[#3f3f46] border-t border-[#1c1c1e]">localStorage only — max 20 runs. Not saved to backend.</p>
          </div>
        )}
      </div>
    </div>
  );
}
