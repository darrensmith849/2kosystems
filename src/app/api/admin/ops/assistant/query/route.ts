import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { requireOps } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { search } from '@/lib/ops/ops-search';
import type { SearchResult } from '@/lib/ops/ops-search';
import type { IndexItem, IndexItemType } from '@/lib/ops/ops-knowledge-index';
import {
  SYSTEM_PROMPT,
  isAiKeyConfigured,
  buildFallbackAnswer,
  buildAiContextBlock,
  buildSmallTalkAnswer,
  detectAssistantIntent,
  SMALL_TALK_SUGGESTIONS,
  type AssistantAnswer,
  type AssistantSource,
  type AssistantWarning,
} from '@/lib/ops/ops-assistant-context';

// --------------------------------------------------------------- Schema

const IndexTypeEnum = z.enum([
  'division',
  'client',
  'asset',
  'github_repo',
  'vercel_project',
  'hetzner_server',
  'cloudflare_zone',
  'domain',
  'ticket',
  'renewal',
  'incident',
  'audit_finding',
  'review_decision',
  'import_readiness',
  'activation_step',
  'runbook',
]);

const SourceEnum = z.enum(['snapshot', 'db', 'docs', 'readiness']);

const FiltersSchema = z
  .object({
    q: z.string().optional(),
    types: z.array(IndexTypeEnum).optional(),
    sources: z.array(SourceEnum).optional(),
    blockedBy: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    divisionCode: z.string().optional(),
    clientId: z.string().optional(),
  })
  .strict();

// Optional, ignored-by-default conversational context — accepted so the
// floating chatbot widget and the Ask page can send route context (and, in
// future, multi-turn history) without tripping the strict schema. The server
// uses pageContext only as a single grounding line; history is accepted but
// not yet wired into the prompt (forward-compat).
const PageContextSchema = z
  .object({
    route: z.string().max(200).optional(),
    sectionTitle: z.string().max(120).optional(),
  })
  .strict();

const HistoryItemSchema = z
  .object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(4000),
  })
  .strict();

const BodySchema = z
  .object({
    question: z.string().min(1).max(1000),
    filters: FiltersSchema.optional(),
    mode: z.enum(['search_only', 'ai_if_available']).optional().default('ai_if_available'),
    pageContext: PageContextSchema.optional(),
    history: z.array(HistoryItemSchema).max(20).optional(),
  })
  .strict();

// --------------------------------------------------------------- Helpers

function toSource(item: IndexItem): AssistantSource {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    url: item.url,
    source: item.source,
  };
}

function buildFollowUps(results: SearchResult[]): string[] {
  const followUps: string[] = [];
  const seenTypes = new Set<IndexItemType>();
  for (const r of results) {
    if (followUps.length >= 3) break;
    const item = r.item;
    if (seenTypes.has(item.type)) continue;
    switch (item.type) {
      case 'client':
        followUps.push(`What assets belong to ${item.title}?`);
        seenTypes.add(item.type);
        break;
      case 'asset':
        followUps.push(`What incidents are linked to ${item.title}?`);
        seenTypes.add(item.type);
        break;
      case 'review_decision':
        followUps.push(`What's the recommendation for ${item.title}?`);
        seenTypes.add(item.type);
        break;
      case 'vercel_project':
        followUps.push(`Is ${item.title} dormant or active?`);
        seenTypes.add(item.type);
        break;
      case 'github_repo':
        followUps.push(`Which repo cluster does ${item.title} belong to?`);
        seenTypes.add(item.type);
        break;
      case 'hetzner_server':
        followUps.push(`What is running on ${item.title}?`);
        seenTypes.add(item.type);
        break;
      case 'cloudflare_zone':
        followUps.push(`Is ${item.title} an active zone?`);
        seenTypes.add(item.type);
        break;
      case 'domain':
        followUps.push(`Who is the registrar for ${item.title}?`);
        seenTypes.add(item.type);
        break;
      case 'ticket':
        followUps.push(`What's the current status of ticket "${item.title}"?`);
        seenTypes.add(item.type);
        break;
      case 'renewal':
        followUps.push(`When is "${item.title}" next due?`);
        seenTypes.add(item.type);
        break;
      case 'incident':
        followUps.push(`What's the root cause of "${item.title}"?`);
        seenTypes.add(item.type);
        break;
      case 'audit_finding':
        followUps.push(`How do I resolve "${item.title}"?`);
        seenTypes.add(item.type);
        break;
      case 'activation_step':
        followUps.push(`What blocks "${item.title}"?`);
        seenTypes.add(item.type);
        break;
      case 'runbook':
        followUps.push(`Summarise the runbook "${item.title}".`);
        seenTypes.add(item.type);
        break;
      case 'import_readiness':
        followUps.push(`What needs to happen for "${item.title}"?`);
        seenTypes.add(item.type);
        break;
      case 'division':
        followUps.push(`Which clients are in ${item.title}?`);
        seenTypes.add(item.type);
        break;
    }
  }
  // Pad with safe defaults if needed.
  const defaults = [
    'What can I safely work on before the DB is connected?',
    'What is blocking Hetzner activation?',
    'Which assets are unmapped?',
  ];
  for (const d of defaults) {
    if (followUps.length >= 3) break;
    if (!followUps.includes(d)) followUps.push(d);
  }
  return followUps.slice(0, 3);
}

// --------------------------------------------------------------- POST

export async function POST(request: NextRequest) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { question, filters, mode, pageContext } = parsed.data;
  // `history` is accepted but intentionally unused this iteration — keeping the
  // schema forward-compatible so a later commit can wire multi-turn into the
  // Anthropic messages array without another client-side change.

  // 0. Intent gate. Greetings, thanks, capability questions, and very-short
  //    inputs short-circuit BEFORE any dashboard search so the user never
  //    sees random source cards in response to "hi" or "thanks".
  const intent = detectAssistantIntent(question);
  if (intent !== 'dashboard_search') {
    const smallTalkWarnings: AssistantWarning[] = [];
    if (!isDbConfigured()) smallTalkWarnings.push('db_missing');
    if (!isAiKeyConfigured()) smallTalkWarnings.push('ai_key_missing');
    if (!isDbConfigured()) smallTalkWarnings.push('snapshot_mode');
    const payload: AssistantAnswer = {
      mode: isAiKeyConfigured() ? 'ai' : 'search_only',
      answer: buildSmallTalkAnswer(intent),
      warnings: smallTalkWarnings,
      sources: [],
      followUps: [...SMALL_TALK_SUGGESTIONS],
    };
    return NextResponse.json(payload);
  }

  // 1. Run search.
  const searchFilters = { ...(filters ?? {}), q: question };
  const searchResp = await search(searchFilters, { limit: 25 });
  const results = searchResp.results;

  // 2. Warnings.
  const warnings: AssistantWarning[] = [];
  if (!isDbConfigured()) warnings.push('db_missing');
  if (!isAiKeyConfigured()) warnings.push('ai_key_missing');
  if (!isDbConfigured()) warnings.push('snapshot_mode');
  if (results.length === 0) warnings.push('no_results');

  const sources = results.slice(0, 8).map((r) => toSource(r.item));
  const followUps = buildFollowUps(results);

  // 3 + 4. Decide mode.
  const useSearchOnly = mode === 'search_only' || !isAiKeyConfigured();

  if (useSearchOnly) {
    const answer = buildFallbackAnswer(question, results, warnings);
    const payload: AssistantAnswer = {
      mode: 'search_only',
      answer,
      warnings,
      sources,
      followUps,
    };
    return NextResponse.json(payload);
  }

  // AI mode.
  try {
    const ctxBlock = buildAiContextBlock(results);
    const pageHint =
      pageContext && (pageContext.sectionTitle || pageContext.route)
        ? `\n\nCURRENT PAGE: ${pageContext.sectionTitle ?? '—'}${pageContext.route ? ` (${pageContext.route})` : ''}`
        : '';
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system:
        SYSTEM_PROMPT +
        '\n\nDashboard sources are provided in the user message. Use ONLY those.',
      messages: [
        {
          role: 'user',
          content: `SOURCES:\n${ctxBlock}${pageHint}\n\nQUESTION: ${question}`,
        },
      ],
    });

    const block = response.content[0];
    if (!block || block.type !== 'text') {
      throw new Error('Non-text response from provider');
    }

    const payload: AssistantAnswer = {
      mode: 'ai',
      answer: block.text,
      warnings,
      sources,
      followUps,
    };
    return NextResponse.json(payload);
  } catch {
    // Silent fallback to grounded search; surface a warning chip.
    const augmented: AssistantWarning[] = warnings.includes('ai_key_missing')
      ? warnings
      : [...warnings, 'ai_key_missing'];
    const baseAnswer = buildFallbackAnswer(question, results, augmented);
    const answer = `AI unavailable — falling back to grounded search.\n\n${baseAnswer}`;
    const payload: AssistantAnswer = {
      mode: 'search_only',
      answer,
      warnings: augmented,
      sources,
      followUps,
    };
    return NextResponse.json(payload);
  }
}
