'use client';

import { useState } from 'react';
import type { TestCase } from '../utils/testCases';

const ENQUIRY_TYPES = [
  'new_business_lead', 'existing_client_support', 'website_or_system_build',
  'ai_automation_enquiry', 'crm_or_dashboard_enquiry', 'workflow_improvement_enquiry',
  'lead_management_enquiry', 'internal_software_enquiry', 'discovery_or_audit_request',
  'proposal_or_quote_request', 'partnership_or_referral', 'supplier_or_spam',
  'unclear_needs_review',
];

const ROUTES = ['two_ko_systems', 'unknown_or_mixed', 'not_relevant'];

const OFFERS = [
  'systems_opportunity_audit', 'proof_of_value_pilot', 'core_system_build',
  'managed_intelligence_retainer', 'website_or_web_system', 'crm_or_dashboard',
  'ai_agent_or_automation', 'existing_client_support', 'low_fit_or_refer_out',
  'unclear_needs_review',
];

function newCase(overrides: Partial<TestCase> = {}): TestCase {
  return {
    id: `tc-custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    title: '',
    scenarioType: '',
    isBuiltIn: false,
    message: '',
    subject: '',
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    source: 'quality_lab',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'new_business_lead',
    expectedMinScore: 50,
    expectedMaxScore: 80,
    expectedRecommendedOffer: '',
    notes: '',
    ...overrides,
  };
}

export function TestCaseEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: TestCase;
  onSave: (tc: TestCase) => void;
  onCancel: () => void;
}) {
  const [tc, setTc] = useState<TestCase>(() => initial ? { ...initial } : newCase());

  const inputClass = 'w-full rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3 py-2 text-xs text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors';
  const selectClass = inputClass;

  function set<K extends keyof TestCase>(k: K, v: TestCase[K]) {
    setTc((prev) => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    if (!tc.title.trim() || !tc.message.trim()) return;
    onSave(tc);
  }

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5 space-y-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a]">
        {initial ? 'Edit test case' : 'New test case'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Title *</label>
          <input type="text" value={tc.title} onChange={(e) => set('title', e.target.value)} className={inputClass} placeholder="Short descriptive title" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Scenario type</label>
          <input type="text" value={tc.scenarioType} onChange={(e) => set('scenarioType', e.target.value)} className={inputClass} placeholder="e.g. High-value new business" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Subject</label>
          <input type="text" value={tc.subject} onChange={(e) => set('subject', e.target.value)} className={inputClass} placeholder="Email subject" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Source</label>
          <input type="text" value={tc.source} onChange={(e) => set('source', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Sender name</label>
          <input type="text" value={tc.senderName} onChange={(e) => set('senderName', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Sender email</label>
          <input type="email" value={tc.senderEmail} onChange={(e) => set('senderEmail', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Message *</label>
        <textarea value={tc.message} onChange={(e) => set('message', e.target.value)} rows={5} className={`${inputClass} resize-y`} placeholder="Paste the test enquiry message" />
      </div>

      <div className="border-t border-[#1c1c1e] pt-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#71717a] mb-3">Expected outcomes</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Expected route</label>
            <select value={tc.expectedRoute} onChange={(e) => set('expectedRoute', e.target.value)} className={selectClass}>
              {ROUTES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Expected enquiry type</label>
            <select value={tc.expectedEnquiryType} onChange={(e) => set('expectedEnquiryType', e.target.value)} className={selectClass}>
              {ENQUIRY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Min score</label>
            <input type="number" min={0} max={100} value={tc.expectedMinScore} onChange={(e) => set('expectedMinScore', Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Max score</label>
            <input type="number" min={0} max={100} value={tc.expectedMaxScore} onChange={(e) => set('expectedMaxScore', Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Expected offer (optional)</label>
            <select value={tc.expectedRecommendedOffer ?? ''} onChange={(e) => set('expectedRecommendedOffer', e.target.value)} className={selectClass}>
              <option value="">— any —</option>
              {OFFERS.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#3f3f46] mb-1">Notes (what good looks like)</label>
            <input type="text" value={tc.notes ?? ''} onChange={(e) => set('notes', e.target.value)} className={inputClass} placeholder="Reviewer guidance" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={handleSave} disabled={!tc.title.trim() || !tc.message.trim()} className="rounded-full bg-[#0f7b3a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#B8C4C8] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {initial ? 'Save changes' : 'Add test case'}
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-[#71717a] hover:text-[#f5f5f5] transition-colors">Cancel</button>
      </div>
    </div>
  );
}
