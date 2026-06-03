import 'server-only';

import { buildIndex, type IndexItem, type SearchFilters } from './ops-knowledge-index';

// --------------------------------------------------------------- Public types

export type SearchResult = {
  item: IndexItem;
  score: number;
  reasons: string[];
};

export type SearchResponse = {
  results: SearchResult[];
  total: number;
  query: SearchFilters;
  durationMs: number;
};

// --------------------------------------------------------------- Tokenization

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'for',
  'to',
  'in',
  'is',
  'what',
  'which',
  'who',
  'show',
  'me',
  'all',
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/\s+/g)
    .map((t) => t.replace(/[^a-z0-9_./-]/g, ''))
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t));
}

// --------------------------------------------------------------- Filters

function passesStructural(item: IndexItem, filters: SearchFilters): boolean {
  if (filters.types && filters.types.length > 0 && !filters.types.includes(item.type)) return false;
  if (filters.sources && filters.sources.length > 0 && !filters.sources.includes(item.source)) return false;
  if (filters.status && filters.status.length > 0) {
    if (!item.status || !filters.status.includes(item.status)) return false;
  }
  if (filters.blockedBy && filters.blockedBy.length > 0) {
    const itemBlocked = item.blockedBy ?? [];
    const hasAny = filters.blockedBy.some((b) => itemBlocked.includes(b));
    if (!hasAny) return false;
  }
  if (filters.divisionCode) {
    if (item.relations?.divisionCode !== filters.divisionCode) return false;
  }
  if (filters.clientId) {
    if (item.relations?.clientId !== filters.clientId) return false;
  }
  return true;
}

// --------------------------------------------------------------- Scoring

function countOccurrences(haystack: string, needle: string): number {
  if (!haystack || !needle) return 0;
  let count = 0;
  let pos = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const next = haystack.indexOf(needle, pos);
    if (next === -1) break;
    count += 1;
    pos = next + needle.length;
  }
  return count;
}

function scoreItem(item: IndexItem, tokens: string[]): { score: number; reasons: string[] } {
  if (tokens.length === 0) return { score: 1, reasons: [] };
  const title = item.title.toLowerCase();
  const subtitle = (item.subtitle ?? '').toLowerCase();
  const body = item.body.toLowerCase();
  const tags = item.tags.map((t) => t.toLowerCase());

  let score = 0;
  const reasons: string[] = [];
  let tokensInBody = 0;

  for (const token of tokens) {
    const titleHits = countOccurrences(title, token);
    const subtitleHits = countOccurrences(subtitle, token);
    const bodyHits = countOccurrences(body, token);
    const tagHits = tags.reduce((acc, tag) => acc + (tag.includes(token) ? 1 : 0), 0);

    if (titleHits > 0) {
      score += titleHits * 5;
      reasons.push(`title:${token}`);
    }
    if (subtitleHits > 0) {
      score += subtitleHits * 3;
      reasons.push(`subtitle:${token}`);
    }
    if (tagHits > 0) {
      score += tagHits * 3;
      reasons.push(`tag:${token}`);
    }
    if (bodyHits > 0) {
      score += bodyHits * 1;
      tokensInBody += 1;
      reasons.push(`body:${token}`);
    }
  }

  if (tokensInBody === tokens.length && tokens.length > 1) {
    score += 2;
    reasons.push('all_tokens_in_body');
  }

  return { score, reasons };
}

// --------------------------------------------------------------- Public API

export async function search(
  filters: SearchFilters,
  opts?: { limit?: number; index?: IndexItem[] },
): Promise<SearchResponse> {
  const start = Date.now();
  const limit = opts?.limit ?? 25;
  const index = opts?.index ?? (await buildIndex());

  const tokens = filters.q ? tokenize(filters.q) : [];
  const hasQuery = tokens.length > 0;

  const candidates: SearchResult[] = [];
  for (const item of index) {
    if (!passesStructural(item, filters)) continue;
    if (hasQuery) {
      const { score, reasons } = scoreItem(item, tokens);
      if (score <= 0) continue;
      candidates.push({ item, score, reasons });
    } else {
      candidates.push({ item, score: 1, reasons: [] });
    }
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.title.localeCompare(b.item.title);
  });

  const durationMs = Date.now() - start;
  return {
    results: candidates.slice(0, limit),
    total: candidates.length,
    query: filters,
    durationMs,
  };
}

export function describeFilters(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.q) parts.push(`q="${filters.q}"`);
  if (filters.types?.length) parts.push(`type=${filters.types.join('|')}`);
  if (filters.sources?.length) parts.push(`source=${filters.sources.join('|')}`);
  if (filters.status?.length) parts.push(`status=${filters.status.join('|')}`);
  if (filters.blockedBy?.length) parts.push(`blocked by ${filters.blockedBy.join('|')}`);
  if (filters.divisionCode) parts.push(`division=${filters.divisionCode}`);
  if (filters.clientId) parts.push(`client=${filters.clientId}`);
  return parts.length === 0 ? 'no filters' : parts.join(', ');
}
