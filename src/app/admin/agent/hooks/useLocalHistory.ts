import { useState, useEffect, useCallback } from 'react';
import type { LocalAgentJob, FormState, LocalStatus } from '../utils/types';
import type { AgentOutput } from '@/lib/agent-core/types';
import { loadHistory, saveHistory, clearHistory, HISTORY_MAX } from '../utils/storage';

function computeDefaultStatus(result: AgentOutput): LocalStatus {
  if (!result?.safety || !result?.classification) return 'needs_review';
  const score = result.classification.leadScore;
  if (score >= 61) return 'draft_ready';
  if (score >= 31) return 'needs_review';
  return 'unqualified';
}

export function useLocalHistory() {
  const [items, setItems] = useState<LocalAgentJob[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const add = useCallback((form: FormState, result: AgentOutput): string => {
    const job: LocalAgentJob = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      businessKey: 'two_ko_systems',
      form,
      result,
      senderName: result.context.leadName ?? (form.senderName || null),
      enquiryType: result.route.enquiryType,
      leadScore: result.classification.leadScore,
      temperature: result.classification.temperature,
      recommendedOffer: result.internalNotes.recommendedOffer,
      enquirySummary: result.context.enquirySummary,
      localStatus: computeDefaultStatus(result),
      localFollowUpDate: null,
      localAdminNote: '',
    };
    setItems((current) => {
      const updated = [job, ...current].slice(0, HISTORY_MAX);
      saveHistory(updated);
      return updated;
    });
    return job.id;
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => {
      const updated = current.filter((i) => i.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const update = useCallback(
    (
      id: string,
      patch: Partial<Pick<LocalAgentJob, 'localStatus' | 'localFollowUpDate' | 'localAdminNote'>>,
    ) => {
      setItems((current) => {
        const updated = current.map((item) =>
          item.id === id ? { ...item, ...patch, updatedAt: Date.now() } : item,
        );
        saveHistory(updated);
        return updated;
      });
    },
    [],
  );

  const clear = useCallback(() => {
    setItems([]);
    clearHistory();
  }, []);

  const importItems = useCallback((incoming: LocalAgentJob[], mode: 'merge' | 'replace') => {
    setItems((current) => {
      const base = mode === 'replace' ? [] : current;
      const merged = [...incoming, ...base];
      const seen = new Set<string>();
      const deduped = merged.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      const trimmed = deduped.slice(0, HISTORY_MAX);
      saveHistory(trimmed);
      return trimmed;
    });
  }, []);

  return { items, add, remove, update, clear, importItems } as const;
}
