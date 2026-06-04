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

// --------------------------------------------------------------- Fallback answer
//
// In search-only mode (no AI key) this builder is what the user actually
// sees as the assistant's reply. It MUST read like a real chat answer, not a
// database dump. We detect intent from the question and produce a short
// conversational paragraph followed by a tight bulleted summary and a link
// back to the relevant dashboard section. Generic queries fall back to a
// grouped summary that still leads with prose, not a bare list of records.

type IntentKey =
  | 'blocking_activation'
  | 'belongs_to'
  | 'on_server'
  | 'dormant_vercel'
  | 'duplicate_repos'
  | 'renewals_upcoming'
  | 'incidents_attention'
  | 'before_db_work'
  | 'generic';

function detectIntent(question: string): IntentKey {
  const q = question.toLowerCase();
  if (
    /(block|blocker|holding|stopping|preventing).*activat/.test(q) ||
    /activat.*(block|blocker|holding|stopping|preventing|left|outstanding|remaining|next step)/.test(q) ||
    /what (is|are|am i) (blocking|blocked|preventing|stopping)/.test(q)
  ) {
    return 'blocking_activation';
  }
  if (/(belong|owned by|part of|under)\s+/.test(q) || /what.*(in|under|owned by|part of)\s+(sigma|2ko|six|client|division)/.test(q)) {
    return 'belongs_to';
  }
  if (/ma130[-_]?(apps|data|tori)/.test(q) || /\bon ma130\b/.test(q) || /running on ma130/.test(q) || /what.*(hetzner|server).*(host|run)/.test(q)) {
    return 'on_server';
  }
  if (/dormant.*vercel|vercel.*dormant|sleeping.*vercel|vercel.*sleeping/.test(q)) {
    return 'dormant_vercel';
  }
  if (/duplicat.*(repo|github)|(repo|github).*duplicat/.test(q)) {
    return 'duplicate_repos';
  }
  if (/renewal|expir|renew\b/.test(q)) {
    return 'renewals_upcoming';
  }
  if (/incident/.test(q) || /(outage|down|issue).*(need|attention|active|open|unresolved)/.test(q)) {
    return 'incidents_attention';
  }
  if (
    /(before|until|while).*(db|database).*(connect|live|online|set up)/.test(q) ||
    /(before|until|while).*(connect|live|online).*(db|database)/.test(q) ||
    /what can i (do|work on|safely)/.test(q) ||
    /what.*work on.*before/.test(q)
  ) {
    return 'before_db_work';
  }
  return 'generic';
}

function friendlyBlocker(raw: string): string {
  const map: Record<string, string> = {
    env: 'environment credentials',
    db: 'the database connection',
    ssh: 'Hetzner SSH access',
    human: 'a human decision',
    github_token: 'a GitHub token',
    vercel_token: 'a Vercel token',
    cloudflare_token: 'a Cloudflare token',
    hetzner_token: 'a Hetzner token',
  };
  if (map[raw]) return map[raw];
  return raw.replace(/_/g, ' ');
}

function linkFor(item: IndexItem): string {
  return item.url ? `[${item.title}](${item.url})` : item.title;
}

function answerBlockingActivation(items: IndexItem[]): string | null {
  const steps = items.filter((i) => i.type === 'activation_step');
  if (steps.length === 0) return null;
  // Items already include the open ones; we surface those that have blockedBy.
  const open = steps.filter((s) => (s.blockedBy ?? []).length > 0);
  const blockers = new Set<string>();
  for (const s of open) for (const b of s.blockedBy ?? []) blockers.add(b);
  const friendly = Array.from(new Set(Array.from(blockers).map(friendlyBlocker)));

  const lines: string[] = [];
  if (friendly.length === 0) {
    lines.push("Activation still has steps to work through, though the dashboard doesn't list specific blockers right now.");
  } else if (friendly.length <= 3) {
    lines.push(`Activation is mainly waiting on ${friendly.join(', ')}. Once those are in place, the live database can be connected.`);
  } else {
    lines.push(`Activation is mainly blocked by the database connection and the provider credentials. The key blockers are: ${friendly.slice(0, 6).join(', ')}.`);
  }
  lines.push('');
  if (open.length > 0) {
    lines.push('**Steps still open**');
    for (const s of open.slice(0, 8)) lines.push(`- ${linkFor(s)}`);
    lines.push('');
  }
  lines.push('You can review the full checklist on [Activation](/admin/ops/activation).');
  return lines.join('\n');
}

function answerBelongsTo(items: IndexItem[]): string | null {
  if (items.length === 0) return null;
  const lines: string[] = [];
  lines.push("Here's what the dashboard knows about that:");
  lines.push('');
  let shown = 0;
  for (const t of TYPE_ORDER) {
    const group = items.filter((i) => i.type === t);
    if (group.length === 0) continue;
    lines.push(`**${TYPE_LABEL[t]}**`);
    for (const i of group.slice(0, 6)) {
      lines.push(`- ${linkFor(i)}`);
      shown++;
      if (shown >= 18) break;
    }
    lines.push('');
    if (shown >= 18) break;
  }
  lines.push('Open the full record from any link above.');
  return lines.join('\n');
}

function answerOnServer(items: IndexItem[], question: string): string | null {
  const assets = items.filter((i) => i.type === 'asset' || i.type === 'hetzner_server');
  if (assets.length === 0) return null;
  const serverGuess = /ma130-(apps|data|tori)/.exec(question.toLowerCase())?.[0] ?? 'the requested server';
  const lines: string[] = [];
  lines.push(`Here's what the dashboard shows running on ${serverGuess}:`);
  lines.push('');
  for (const a of assets.slice(0, 10)) lines.push(`- ${linkFor(a)}`);
  lines.push('');
  lines.push('See [Infrastructure](/admin/ops/infrastructure) for the full server view.');
  return lines.join('\n');
}

function answerDormantVercel(items: IndexItem[]): string | null {
  const projects = items.filter((i) => i.type === 'vercel_project');
  if (projects.length === 0) return null;
  const dormant = projects.filter((p) => /dormant|sleep|inactive/.test((p.status ?? '').toLowerCase()));
  const list = dormant.length > 0 ? dormant : projects;
  const lines: string[] = [];
  if (dormant.length > 0) {
    lines.push(`These Vercel projects are marked dormant in the dashboard:`);
  } else {
    lines.push(`Here are Vercel projects worth a look — none are explicitly tagged dormant yet:`);
  }
  lines.push('');
  for (const p of list.slice(0, 10)) lines.push(`- ${linkFor(p)}${p.status ? ` — _${p.status}_` : ''}`);
  lines.push('');
  lines.push('Open [Vercel](/admin/ops/vercel) to filter by state and plan cleanup.');
  return lines.join('\n');
}

function answerDuplicateRepos(items: IndexItem[]): string | null {
  const repos = items.filter((i) => i.type === 'github_repo');
  if (repos.length === 0) return null;
  const lines: string[] = [];
  lines.push("Here are the repo clusters where the dashboard sees duplicates worth resolving:");
  lines.push('');
  for (const r of repos.slice(0, 10)) {
    const extras: string[] = [];
    if (r.confidence) extras.push(r.confidence.replace(/_/g, ' '));
    if (r.status) extras.push(r.status);
    const tail = extras.length ? ` — ${extras.join(', ')}` : '';
    lines.push(`- ${linkFor(r)}${tail}`);
  }
  lines.push('');
  lines.push('Pick the canonical repo on [GitHub](/admin/ops/github); the others can be archived later.');
  return lines.join('\n');
}

function answerRenewals(items: IndexItem[]): string | null {
  const renewals = items.filter((i) => i.type === 'renewal');
  if (renewals.length === 0) return null;
  const lines: string[] = [];
  lines.push("Here are the upcoming renewals the dashboard knows about:");
  lines.push('');
  for (const r of renewals.slice(0, 10)) {
    lines.push(`- ${linkFor(r)}${r.status ? ` — ${r.status}` : ''}`);
  }
  lines.push('');
  lines.push('Full calendar on [Renewals](/admin/ops/renewals).');
  return lines.join('\n');
}

function answerIncidents(items: IndexItem[]): string | null {
  const incidents = items.filter((i) => i.type === 'incident');
  if (incidents.length === 0) return null;
  const open = incidents.filter((i) => !/resolved|closed|done/i.test(i.status ?? ''));
  const list = open.length > 0 ? open : incidents;
  const lines: string[] = [];
  lines.push(open.length > 0 ? "These incidents still need attention:" : "Here are incidents the dashboard is tracking:");
  lines.push('');
  for (const i of list.slice(0, 10)) {
    lines.push(`- ${linkFor(i)}${i.status ? ` — ${i.status}` : ''}`);
  }
  lines.push('');
  lines.push('Open [Incidents](/admin/ops/incidents) for the full timeline.');
  return lines.join('\n');
}

function answerBeforeDb(items: IndexItem[]): string {
  const decisions = items.filter((i) => i.type === 'review_decision');
  const audits = items.filter((i) => i.type === 'audit_finding');
  const runbooks = items.filter((i) => i.type === 'runbook');
  const steps = items.filter((i) => i.type === 'activation_step');

  const lines: string[] = [];
  lines.push(
    'Plenty is still actionable before the database is connected. The dashboard is read-only today, but you can triage decisions, work through the activation checklist, and review audit findings — all of that survives once the live DB comes online.',
  );
  lines.push('');
  if (decisions.length > 0) {
    lines.push('**Open decisions to settle**');
    for (const d of decisions.slice(0, 5)) lines.push(`- ${linkFor(d)}`);
    lines.push('');
  }
  if (steps.length > 0) {
    lines.push('**Activation steps you can prep**');
    for (const s of steps.slice(0, 5)) lines.push(`- ${linkFor(s)}`);
    lines.push('');
  }
  if (audits.length > 0) {
    lines.push('**Audit findings worth a look**');
    for (const a of audits.slice(0, 5)) lines.push(`- ${linkFor(a)}`);
    lines.push('');
  }
  if (runbooks.length > 0) {
    lines.push('**Runbooks for the next steps**');
    for (const r of runbooks.slice(0, 4)) lines.push(`- ${linkFor(r)}`);
    lines.push('');
  }
  lines.push('Start on [Review](/admin/ops/review) and [Activation](/admin/ops/activation).');
  return lines.join('\n');
}

function answerGeneric(items: IndexItem[]): string {
  if (items.length === 0) {
    return "I couldn't find anything in the dashboard that matches that. Try one of the suggested prompts, or rephrase your question — I can search clients, assets, repos, Vercel projects, Hetzner servers, renewals, incidents, audit findings, and activation steps.";
  }
  const lines: string[] = [];
  lines.push("Here's what I found in the dashboard data:");
  lines.push('');
  let shown = 0;
  for (const t of TYPE_ORDER) {
    const group = items.filter((i) => i.type === t);
    if (group.length === 0) continue;
    lines.push(`**${TYPE_LABEL[t]}**`);
    for (const i of group.slice(0, 5)) {
      lines.push(`- ${linkFor(i)}`);
      shown++;
      if (shown >= 18) break;
    }
    lines.push('');
    if (shown >= 18) break;
  }
  return lines.join('\n');
}

export function buildFallbackAnswer(
  question: string,
  results: SearchResult[],
  warnings: AssistantWarning[],
): string {
  const items = results.map((r) => r.item);
  const intent = detectIntent(question);

  let body: string | null = null;
  switch (intent) {
    case 'blocking_activation':
      body = answerBlockingActivation(items);
      break;
    case 'belongs_to':
      body = answerBelongsTo(items);
      break;
    case 'on_server':
      body = answerOnServer(items, question);
      break;
    case 'dormant_vercel':
      body = answerDormantVercel(items);
      break;
    case 'duplicate_repos':
      body = answerDuplicateRepos(items);
      break;
    case 'renewals_upcoming':
      body = answerRenewals(items);
      break;
    case 'incidents_attention':
      body = answerIncidents(items);
      break;
    case 'before_db_work':
      body = answerBeforeDb(items);
      break;
    case 'generic':
      body = null;
      break;
  }
  if (!body) body = answerGeneric(items);

  // Footer: gentle preview-data note (no env-var jargon).
  const footer: string[] = [];
  if (warnings.includes('snapshot_mode')) {
    footer.push('_This is preview data — the live database connection is being prepared._');
  }
  const out = footer.length > 0 ? `${body}\n\n${footer.join('\n')}` : body;
  return out.trim();
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
