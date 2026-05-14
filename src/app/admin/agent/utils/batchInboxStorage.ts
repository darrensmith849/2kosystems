import type { AgentOutput } from '@/lib/agent-core/types';

export type BatchItemStatus = 'queued' | 'analysed' | 'skipped' | 'error';

export interface BatchItem {
  id: string;
  createdAt: number;
  subject: string;
  message: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  source: string;
  status: BatchItemStatus;
  result?: AgentOutput;
  jobId?: string;
  errorMessage?: string;
}

export interface BatchStore {
  items: BatchItem[];
}

export const BATCH_INBOX_KEY = '2ko_batch_inbox';
export const BATCH_MAX = 50;

export function loadBatchInbox(): BatchItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BATCH_INBOX_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw) as BatchStore;
    return Array.isArray(store.items) ? store.items : [];
  } catch {
    return [];
  }
}

export function saveBatchInbox(items: BatchItem[]): void {
  if (typeof window === 'undefined') return;
  const store: BatchStore = { items: items.slice(0, BATCH_MAX) };
  localStorage.setItem(BATCH_INBOX_KEY, JSON.stringify(store));
}

export function clearBatchInbox(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BATCH_INBOX_KEY);
}
