'use client';

import { useState, useCallback } from 'react';
import type { AgentOutput } from '@/lib/agent-core/types';
import type { BatchItem } from '../utils/batchInboxStorage';
import { loadBatchInbox, saveBatchInbox, clearBatchInbox } from '../utils/batchInboxStorage';

export function useBatchInbox() {
  const [items, setItems] = useState<BatchItem[]>(() => loadBatchInbox());

  const persist = useCallback((next: BatchItem[]) => {
    setItems(next);
    saveBatchInbox(next);
  }, []);

  const addItems = useCallback((newItems: BatchItem[]) => {
    setItems((prev) => {
      const next = [...prev, ...newItems];
      saveBatchInbox(next);
      return next;
    });
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<BatchItem>) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...patch } : i));
      saveBatchInbox(next);
      return next;
    });
  }, []);

  const markAnalysed = useCallback((id: string, result: AgentOutput, jobId?: string) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, status: 'analysed' as const, result, jobId } : i,
      );
      saveBatchInbox(next);
      return next;
    });
  }, []);

  const markError = useCallback((id: string, msg: string) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, status: 'error' as const, errorMessage: msg } : i,
      );
      saveBatchInbox(next);
      return next;
    });
  }, []);

  const markSkipped = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, status: 'skipped' as const } : i,
      );
      saveBatchInbox(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveBatchInbox(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    clearBatchInbox();
    setItems([]);
  }, []);

  return {
    items,
    addItems,
    updateItem,
    markAnalysed,
    markError,
    markSkipped,
    removeItem,
    clear,
    persist,
  };
}
