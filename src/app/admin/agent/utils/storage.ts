import type { LocalAgentJob, LocalHistoryStore } from './types';

export const HISTORY_KEY = '2ko_agent_ops_history';
export const HISTORY_MAX = 10;

// Phase 1C raw array item shape — used only for migration
interface LegacyHistoryItem {
  id: string;
  ts: number;
  senderName: string | null;
  enquiryType: string;
  leadScore: number;
  temperature: string;
  recommendedOffer: string;
  enquirySummary: string;
  form: unknown;
  result: unknown;
}

function migrateFromPhase1C(items: LegacyHistoryItem[]): LocalAgentJob[] {
  return items.map((item) => ({
    id: item.id,
    createdAt: item.ts,
    updatedAt: item.ts,
    businessKey: 'two_ko_systems',
    form: item.form as LocalAgentJob['form'],
    result: item.result as LocalAgentJob['result'],
    senderName: item.senderName,
    enquiryType: item.enquiryType,
    leadScore: item.leadScore,
    temperature: item.temperature,
    recommendedOffer: item.recommendedOffer,
    enquirySummary: item.enquirySummary,
    localStatus: (item.leadScore >= 61
      ? 'draft_ready'
      : item.leadScore >= 31
        ? 'needs_review'
        : 'unqualified') as LocalAgentJob['localStatus'],
    localFollowUpDate: null,
    localAdminNote: '',
  }));
}

export function loadHistory(): LocalAgentJob[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Phase 1C migration: stored as raw array
    if (Array.isArray(parsed)) {
      return migrateFromPhase1C(parsed as LegacyHistoryItem[]);
    }
    // Phase 1D+ versioned store
    const store = parsed as LocalHistoryStore;
    if (store?.schemaVersion === 1 && Array.isArray(store.items)) {
      return store.items;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveHistory(items: LocalAgentJob[]): void {
  try {
    const store: LocalHistoryStore = { schemaVersion: 1, items };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded or private browsing — silent fail
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export function validateImportPayload(raw: unknown): LocalAgentJob[] | null {
  try {
    if (!raw || typeof raw !== 'object') return null;
    const store = raw as LocalHistoryStore;
    if (store.schemaVersion !== 1 || !Array.isArray(store.items)) return null;
    // Basic per-item validation
    for (const item of store.items) {
      if (typeof item.id !== 'string') return null;
      if (typeof item.createdAt !== 'number') return null;
      if (!item.result?.safety) return null;
    }
    return store.items;
  } catch {
    return null;
  }
}
