import 'server-only';

import type { IndexItem } from './ops-knowledge-index';
import type { SearchResult } from './ops-search';

// --------------------------------------------------------------- Public types

export type AssistantWarning = 'db_missing' | 'ai_key_missing' | 'snapshot_mode' | 'no_results';

export type AssistantSource = {
  id: string;
  type: IndexItem['type'];
  title: string;
  url?: string;
  source: IndexItem['source'];
};

export type AssistantAnswer = {
  mode: 'ai' | 'search_only';
  answer: string;
  warnings: AssistantWarning[];
  sources: AssistantSource[];
  followUps: string[];
};

// --------------------------------------------------------------- Env checks

export function isAiKeyConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// --------------------------------------------------------------- System prompt

export const SYSTEM_PROMPT = [
  'You are the 2KO Systems Ops Dashboard internal analyst.',
  '',
  'Hard rules:',
  '- Answer ONLY from the supplied SOURCES below. If the answer is not there, say "I don\'t know from the dashboard data."',
  '- Never expose any secret, token, password, private key, or DB credential. If a user asks for one, refuse and explain that the dashboard only reads presence flags.',
  '- Never invent infrastructure state. Never claim live data when sources show source=snapshot.',
  '- Never suggest you have completed a destructive action — you cannot execute anything. You can only describe what an operator would do.',
  '- Always label whether a finding is in Snapshot Mode (no DB yet) versus Live (DB connected) when it matters to the answer.',
  '- Always cite the dashboard route when one is available so the user can click through. Use the url field on the source.',
  '- When suggesting a next step, prefer the safest option and reference the runbook by file path (e.g. docs/runbooks/ops-db-setup.md).',
  '- Bullet lists are preferred for multi-item answers. Keep responses tight; the user is operational, not casual.',
  '- Never claim a number is current if the source is snapshot — say "as of the snapshot".',
].join('\n');

// --------------------------------------------------------------- Group helpers

const TYPE_LABEL: Record<IndexItem['type'], string> = {
  division: 'Divisions',
  client: 'Clients',
  asset: 'Assets',
  github_repo: 'GitHub repos',
  vercel_project: 'Vercel projects',
  hetzner_server: 'Hetzner servers',
  cloudflare_zone: 'Cloudflare zones',
  domain: 'Domains',
  ticket: 'Tickets',
  renewal: 'Renewals',
  incident: 'Incidents',
  audit_finding: 'Audit findings',
  review_decision: 'Review decisions',
  import_readiness: 'Import readiness',
  activation_step: 'Activation steps',
  runbook: 'Runbooks',
};

const TYPE_ORDER: IndexItem['type'][] = [
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
];

function formatSourceTag(source: IndexItem['source']): string {
  if (source === 'snapshot') return '_(snapshot)_';
  if (source === 'db') return '_(live)_';
  if (source === 'docs') return '_(docs)_';
  return '_(readiness)_';
}

function formatExtras(item: IndexItem): string {
  const parts: string[] = [];
  if (item.status) parts.push(`status=${item.status}`);
  if (item.confidence && item.confidence !== 'confirmed') parts.push(`confidence=${item.confidence}`);
  if (item.blockedBy && item.blockedBy.length > 0) parts.push(`blocked by ${item.blockedBy.join('/')}`);
  return parts.length === 0 ? '' : ` — ${parts.join(', ')}`;
}

// --------------------------------------------------------------- Fallback answer

export function buildFallbackAnswer(
  question: string,
  results: SearchResult[],
  warnings: AssistantWarning[],
): string {
  // The 'question' parameter is part of the signature so future versions
  // can echo it. Currently the deterministic answer is purely structural.
  void question;

  const lines: string[] = [];

  if (warnings.includes('ai_key_missing')) {
    lines.push('AI response disabled — showing grounded search results instead.');
    lines.push('');
  }

  if (results.length === 0) {
    lines.push("I don't know from the dashboard data.");
  } else {
    lines.push(`Found ${results.length} result${results.length === 1 ? '' : 's'} matching your search:`);
    lines.push('');

    const byType = new Map<IndexItem['type'], SearchResult[]>();
    for (const r of results) {
      const list = byType.get(r.item.type) ?? [];
      list.push(r);
      byType.set(r.item.type, list);
    }

    for (const type of TYPE_ORDER) {
      const group = byType.get(type);
      if (!group || group.length === 0) continue;
      lines.push(`**${TYPE_LABEL[type]}**`);
      for (const r of group) {
        const link = r.item.url ? `[${r.item.title}](${r.item.url})` : r.item.title;
        const tag = formatSourceTag(r.item.source);
        const extras = formatExtras(r.item);
        lines.push(`- ${link} ${tag}${extras}`);
      }
      lines.push('');
    }
  }

  if (warnings.includes('snapshot_mode')) {
    lines.push('');
    lines.push('This is read-only snapshot data. Real DB activates next week per docs/runbooks/ops-hetzner-activation.md.');
  }

  return lines.join('\n').trim();
}

// --------------------------------------------------------------- AI context block

export function buildAiContextBlock(results: SearchResult[]): string {
  const top = results.slice(0, 12);
  const lines: string[] = ['SOURCES:'];
  top.forEach((r, idx) => {
    const item = r.item;
    const excerpt = item.body.replace(/\s+/g, ' ').slice(0, 240);
    const parts = [
      `[${idx + 1}]`,
      `type=${item.type}`,
      `title="${item.title.replace(/"/g, '\\"')}"`,
    ];
    if (item.url) parts.push(`url=${item.url}`);
    parts.push(`source=${item.source}`);
    if (item.status) parts.push(`status=${item.status}`);
    if (item.confidence) parts.push(`confidence=${item.confidence}`);
    if (item.blockedBy && item.blockedBy.length > 0) parts.push(`blockedBy=${item.blockedBy.join('|')}`);
    lines.push(`${parts.join(' ')} — ${excerpt}`);
  });
  if (top.length === 0) {
    lines.push('(no matching items)');
  }
  return lines.join('\n');
}
