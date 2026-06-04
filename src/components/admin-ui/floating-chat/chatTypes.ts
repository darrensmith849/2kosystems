// Shared chat types for the floating chat widget and the full-page Ask client.
// Both surfaces persist ChatMessage[] to localStorage and exchange the same
// AssistantAnswer payload with /api/admin/ops/assistant/query.

import type {
  AssistantAnswer,
  AssistantSource,
  AssistantWarning,
} from '@/lib/ops/ops-assistant-context';

export type { AssistantAnswer, AssistantSource, AssistantWarning };

export type ChatMessage =
  | { role: 'user'; content: string; ts: number }
  | {
      role: 'assistant';
      content: string;
      ts: number;
      sources?: AssistantSource[];
      warnings?: AssistantWarning[];
      mode?: 'ai' | 'search_only';
      followUps?: string[];
    };

export type ChatStage = 'idle' | 'searching' | 'generating';

export type PageContext = {
  route: string;
  sectionTitle: string;
};

// The 8 official suggested prompts (source of truth — used on both the
// floating widget and the rebuilt Ask page).
export const SUGGESTED_PROMPTS: readonly string[] = [
  'What is blocking activation?',
  'What belongs to SigmaPhi?',
  'What is on ma130-apps?',
  'Which Vercel projects are dormant?',
  'Which repos are duplicated?',
  'Show me upcoming renewals.',
  'Which incidents need attention?',
  'What can I work on before the DB is connected?',
] as const;

export const WARNING_LABEL: Record<AssistantWarning, string> = {
  db_missing: 'Database not connected',
  ai_key_missing: 'Search mode',
  snapshot_mode: 'Preview data',
  no_results: 'No matches',
};

export const WARNING_TONE: Record<
  AssistantWarning,
  'neutral' | 'green' | 'amber' | 'rose' | 'blue'
> = {
  db_missing: 'amber',
  ai_key_missing: 'blue',
  snapshot_mode: 'green',
  no_results: 'neutral',
};
