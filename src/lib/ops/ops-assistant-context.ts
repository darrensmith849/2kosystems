import 'server-only';

import type { IndexItem } from './ops-knowledge-index';
import { ACTIVATION_STEPS } from './ops-knowledge-index';
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

// --------------------------------------------------------------- Assistant intent
//
// Before the route runs any dashboard search, classify whether the input is a
// real dashboard question vs. small talk. Greetings / thanks / capability
// questions / pure punctuation should return a friendly canned reply with
// NO source cards — otherwise the user sees random SigmaPhi-or-whatever
// records for a friendly "hi". Only `dashboard_search` continues to the
// retrieval pipeline.

export type AssistantIntent =
  | 'greeting'
  | 'thanks'
  | 'capabilities'
  | 'help'
  | 'too_short'
  | 'dashboard_search';

// Anchored patterns — must match the WHOLE trimmed message (allowing trailing
// punctuation) so that "hi there how do I do X?" still routes to search.
const GREETING_PATTERNS: RegExp[] = [
  /^(hi|hello|hey|yo|hiya|howdy|sup)(\s+(there|bot|assistant|2ko|team))?[!?.,\s]*$/,
  /^good\s+(morning|afternoon|evening|day)(\s+(there|bot|assistant|2ko))?[!?.,\s]*$/,
  /^(hi|hello|hey)\s+2ko[!?.,\s]*$/,
];

const THANKS_PATTERNS: RegExp[] = [
  /^(thanks|thank\s+you|thx|ty|cheers|ta|much\s+appreciated|appreciated)(\s+(so\s+much|a\s+lot|very\s+much|mate|friend|2ko))?[!?.,\s]*$/,
  /^(ok\s+)?(thanks|thank\s+you)[!?.,\s]*$/,
];

const CAPABILITIES_PATTERNS: RegExp[] = [
  /^what\s+can\s+you\s+do[?.,\s!]*$/,
  /^what\s+do\s+you\s+do[?.,\s!]*$/,
  /^what\s+(else\s+)?(can|could)\s+you\s+help(\s+(me|with))?[?.,\s!]*$/,
  /^how\s+(can|do)\s+you\s+help(\s+me)?[?.,\s!]*$/,
  /^who\s+are\s+you[?.,\s!]*$/,
  /^what\s+are\s+you[?.,\s!]*$/,
  /^how\s+do\s+you\s+work[?.,\s!]*$/,
  /^what\s+do\s+you\s+know[?.,\s!]*$/,
];

const HELP_PATTERNS: RegExp[] = [
  /^help[?.,\s!]*$/,
  /^(can\s+you\s+)?help(\s+me)?[?.,\s!]*$/,
  /^i\s+need\s+help[?.,\s!]*$/,
];

export function detectAssistantIntent(raw: string): AssistantIntent {
  const trimmed = (raw ?? '').trim();
  if (trimmed.length === 0) return 'too_short';

  const q = trimmed.toLowerCase();

  // Capabilities first — multi-word, specific. Beats greeting if the user
  // wrote "hi what can you do".
  for (const re of CAPABILITIES_PATTERNS) if (re.test(q)) return 'capabilities';
  for (const re of HELP_PATTERNS) if (re.test(q)) return 'help';
  for (const re of THANKS_PATTERNS) if (re.test(q)) return 'thanks';
  for (const re of GREETING_PATTERNS) if (re.test(q)) return 'greeting';

  // Punctuation-only OR < 3 chars and not a known token → too short.
  if (/^[\s\p{P}\p{S}]+$/u.test(trimmed)) return 'too_short';
  if (trimmed.length <= 2) return 'too_short';

  return 'dashboard_search';
}

// Quick-start chips offered alongside small-talk replies so the user has an
// obvious next action. These mirror the prompt-chip list shown on first
// open of the floating widget / Ask page.
export const SMALL_TALK_SUGGESTIONS: readonly string[] = [
  'What is blocking activation?',
  'What belongs to SigmaPhi?',
  'Show me upcoming renewals.',
] as const;

export function buildSmallTalkAnswer(
  intent: Exclude<AssistantIntent, 'dashboard_search'>,
): string {
  switch (intent) {
    case 'greeting':
      return "Hi! I'm your 2KO Ops Assistant. Ask me about clients, assets, repos, Vercel projects, Hetzner servers, renewals, incidents, decisions, or activation blockers.";
    case 'thanks':
      return "Pleasure — I'm here when you need to search the dashboard.";
    case 'capabilities':
      return "I can help you search and understand the Ops Dashboard. You can ask things like: what is blocking activation, what belongs to SigmaPhi, which Vercel projects are dormant, what is on ma130-apps, or which renewals need attention.";
    case 'help':
      return "Ask me what you want to find in the dashboard — for example, what is blocking activation, which Vercel projects are dormant, or show me Impart assets.";
    case 'too_short':
      return "Ask me what you want to find in the dashboard — for example, \"show me Impart assets\" or \"what is blocking activation?\"";
  }
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
  email_ref: 'Email references',
  service: 'Services & subscriptions',
  contact: 'Contacts',
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
  'email_ref',
  'service',
  'contact',
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
  | 'what_next'
  | 'work_today'
  | 'whats_blocked'
  | 'which_pages'
  | 'dashboard_status_summary'
  | 'missing_before_golive'
  | 'blocking_activation'
  | 'belongs_to'
  | 'on_server'
  | 'dormant_vercel'
  | 'duplicate_repos'
  | 'renewals_upcoming'
  | 'incidents_attention'
  | 'before_db_work'
  | 'email_linking_status'
  | 'email_category_track'
  | 'services_overview'
  | 'services_needing_review'
  | 'billing_owner'
  | 'contacts_needed'
  | 'generic';

function detectIntent(question: string): IntentKey {
  const q = question.toLowerCase();

  // Operational intents — these are the highest-precedence matchers so that
  // a phrase like "what's missing before go-live" routes here instead of
  // being captured by the broader "what is blocking activation" matcher
  // further down. Each pattern is anchored or scoped tightly enough to
  // avoid catching adjacent intents.

  if (
    /missing\s+before\s+go.?live/.test(q) ||
    /before\s+(we\s+)?(can\s+)?(go\s+live|launch)/.test(q) ||
    /(launch|go.?live)\s+(checklist|gaps?|requirements?)/.test(q) ||
    /are\s+we\s+ready\s+(to\s+)?(go.?live|launch)/.test(q) ||
    /pre.?launch\s+(checklist|gaps?|status)/.test(q) ||
    /what\s+do\s+we\s+need\s+before\s+(go.?live|launch)/.test(q)
  ) {
    return 'missing_before_golive';
  }
  if (
    /(summari[sz]e|summary)(\s+(the|of|me))?\s+(the\s+)?(dashboard|ops|activation|status|state)/.test(q) ||
    /(give|show)\s+(me\s+)?(a\s+)?(status|summary)/.test(q) ||
    /overall\s+(status|state|health)/.test(q) ||
    /how\s+(are\s+we|is\s+it|is\s+the\s+dashboard)\s+(doing|going|going on)/.test(q) ||
    /state\s+of\s+the\s+(dashboard|ops)/.test(q)
  ) {
    return 'dashboard_status_summary';
  }
  if (
    /^what(\s+is|s|’s)?\s+blocked\b/.test(q) ||
    /^which\s+(items?|steps?|things?)\s+are\s+blocked/.test(q) ||
    /^(what\s+are\s+)?(the\s+)?blockers?\b/.test(q) ||
    /what(\s+is|s|’s)?\s+holding\s+(it|us|the\s+dashboard)\s+up/.test(q)
  ) {
    return 'whats_blocked';
  }
  if (
    /^what\s+should\s+i\s+do\s+next/.test(q) ||
    /^what(\s+is|s|’s)?\s+next/.test(q) ||
    /^what(\s+do\s+i\s+do)?\s+now\b/.test(q) ||
    /^next\s+step(s)?\b/.test(q) ||
    /^what\s+do\s+i\s+do\s+next/.test(q)
  ) {
    return 'what_next';
  }
  if (
    /what\s+can\s+i\s+(safely\s+)?work\s+on\s+today/.test(q) ||
    /what\s+can\s+i\s+do\s+today/.test(q) ||
    /safe\s+to\s+work\s+on\s+(today|now)/.test(q) ||
    /^(any|what)\s+work\s+for\s+today/.test(q)
  ) {
    return 'work_today';
  }
  if (
    /which\s+page(s)?\s+(should|do)\s+i\s+(check|look|visit)/.test(q) ||
    /^where\s+(do|should)\s+i\s+(check|look|go|start)/.test(q) ||
    /where\s+to\s+(look|start|begin)/.test(q) ||
    /which\s+(dashboard\s+)?page(s)?\s+(are\s+)?(most\s+)?(useful|relevant)/.test(q)
  ) {
    return 'which_pages';
  }

  // Email-linking specific intents come first so phrases like "Where are
  // billing emails tracked?" or "Is email linking active?" don't get
  // misrouted to renewals/incidents.
  if (
    /(is\s+)?email\s+(linking|linkage|integration)\s+(active|enabled|set up|on|live|working|ready)/.test(q) ||
    /^has\s+email\s+(linking|integration)\s+been\s+enabled/.test(q) ||
    /will\s+email\s+(linking|integration)\s+(work|happen|be)/.test(q) ||
    /what.*email\s+(setup|integration|linking).*(missing|left|needed)/.test(q)
  ) {
    return 'email_linking_status';
  }
  if (
    /(billing|invoice).*email|email.*(billing|invoice)/.test(q) ||
    /(hetzner|vercel|cloudflare|supplier).*invoice.*(email|appear|tracked|linked)/.test(q) ||
    /where.*(hetzner|vercel|cloudflare).*(invoice|email).*(appear|tracked|linked)/.test(q) ||
    /(support|change\s+request|approval|renewal).*email/.test(q) ||
    /email.*(support|change\s+request|approval|renewal|incident|quote|proposal|supplier|handover)/.test(q) ||
    /where.*(email|emails).*(tracked|linked|appear|go)/.test(q) ||
    /domain\s+renewal\s+email/.test(q)
  ) {
    return 'email_category_track';
  }

  // Services / subscriptions
  if (
    /(supplier|subscription)s?.*(service|catalogue|review|list|all)/.test(q) ||
    /(show|list).*(supplier|service|subscription)/.test(q) ||
    /(what|which)\s+(supplier|service|subscription)s?\s+(do we|are we)/.test(q) ||
    /service\s+catalogue/.test(q)
  ) {
    return 'services_overview';
  }
  if (
    /(which|what)\s+(service|subscription)s?\s+(need|require|are).*(review|attention)/.test(q) ||
    /(which|what)\s+(subscription|service)s?\s+(are|is)\s+planned/.test(q) ||
    /missing\s+billing\s+owner/.test(q)
  ) {
    return 'services_needing_review';
  }
  if (
    /who\s+(owns|pays|is)\s+(the\s+)?(billing|payment|account|invoice)/.test(q) ||
    /billing\s+owner/.test(q)
  ) {
    return 'billing_owner';
  }
  if (
    /(what|which|who)\s+contacts?.*(need|missing|required|before)/.test(q) ||
    /contacts?\s+needed/.test(q)
  ) {
    return 'contacts_needed';
  }

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

function answerEmailLinkingStatus(items: IndexItem[]): string {
  const lines: string[] = [];
  lines.push(
    "Email linking is prepared but not active yet. The dashboard can show planned email reference categories, and manual linking will activate after the database is connected. Gmail and Outlook ingestion has not been enabled — those are a later, explicitly approved phase.",
  );
  lines.push('');
  const emailSteps = items.filter(
    (i) => i.type === 'activation_step' && /email|brevo/i.test(i.title),
  );
  if (emailSteps.length > 0) {
    lines.push('**Email setup steps tracked**');
    for (const s of emailSteps.slice(0, 6)) lines.push(`- ${linkFor(s)}`);
    lines.push('');
  }
  lines.push('See [Emails](/admin/ops/emails) for the preview and [Activation](/admin/ops/activation) for the setup steps.');
  return lines.join('\n');
}

function answerEmailCategoryTrack(items: IndexItem[]): string {
  const emails = items.filter((i) => i.type === 'email_ref');
  const lines: string[] = [];
  lines.push(
    "Email references are planned — no inbox is being read. When the database is connected, the dashboard will track manual email references in these categories:",
  );
  lines.push('');
  if (emails.length > 0) {
    for (const e of emails.slice(0, 8)) {
      lines.push(`- ${linkFor(e)}${e.subtitle ? ` — ${e.subtitle.toLowerCase()}` : ''}`);
    }
    lines.push('');
  }
  lines.push('Open [Emails](/admin/ops/emails) for the full planned-category preview.');
  return lines.join('\n');
}

function answerServicesOverview(items: IndexItem[]): string {
  const services = items.filter((i) => i.type === 'service');
  if (services.length === 0) return "The services catalogue is empty — open [Services](/admin/ops/services) to see the planned list.";
  const lines: string[] = [];
  lines.push("Here are the supplier services and subscriptions the dashboard is tracking:");
  lines.push('');
  for (const s of services.slice(0, 12)) {
    const status = s.status ? ` — ${s.status.replace(/_/g, ' ')}` : '';
    lines.push(`- ${linkFor(s)}${status}`);
  }
  lines.push('');
  lines.push('Open [Services](/admin/ops/services) for billing owner, cadence, and notes per service.');
  return lines.join('\n');
}

function answerServicesNeedingReview(items: IndexItem[]): string {
  const services = items.filter((i) => i.type === 'service');
  const needsReview = services.filter((s) => s.status === 'needs_review' || s.status === 'blocked' || s.status === 'planned');
  const lines: string[] = [];
  if (needsReview.length === 0) {
    lines.push("No services are currently flagged as needing review.");
  } else {
    lines.push("These services need a review or are not yet active:");
    lines.push('');
    for (const s of needsReview.slice(0, 10)) {
      const status = s.status ? ` — ${s.status.replace(/_/g, ' ')}` : '';
      lines.push(`- ${linkFor(s)}${status}`);
    }
    lines.push('');
  }
  lines.push('Open [Services](/admin/ops/services) for the full catalogue.');
  return lines.join('\n');
}

function answerBillingOwner(items: IndexItem[], question: string): string {
  const services = items.filter((i) => i.type === 'service');
  const lines: string[] = [];
  const target = services.find((s) => question.toLowerCase().includes(s.title.toLowerCase().split(/\s+/)[0]));
  if (target) {
    lines.push(`Open [${target.title}](${target.url ?? '/admin/ops/services'}) on the Services page — the billing-owner field is shown alongside cadence and status. Many billing owners are still tagged "Needs review" while the dashboard is in preview mode.`);
  } else {
    lines.push("Billing ownership is tracked on the Services page. Several services are still tagged \"Needs review\" while the dashboard is in preview mode.");
  }
  lines.push('');
  lines.push('Open [Services](/admin/ops/services) to see who owns each billing relationship.');
  return lines.join('\n');
}

function answerContactsNeeded(items: IndexItem[]): string {
  const contacts = items.filter((i) => i.type === 'contact');
  const lines: string[] = [];
  lines.push(
    "Contacts are a planned foundation — the live Contacts table will fill in once the database is connected and operators enter real rows. The placeholder roles the dashboard expects to track are:",
  );
  lines.push('');
  if (contacts.length > 0) {
    for (const c of contacts.slice(0, 8)) lines.push(`- ${linkFor(c)}${c.subtitle ? ` — ${c.subtitle}` : ''}`);
    lines.push('');
  }
  lines.push('Open [Contacts](/admin/ops/contacts) to see the placeholder rows.');
  return lines.join('\n');
}

// ---------------------------------------------------------------- Operational intents
//
// These six intents do not depend on search results — they read the
// activation step list directly. Search results are still passed in so the
// builders can cite related items (open decisions, audit findings) when
// they're present, but the prose itself is built from the static activation
// data so the answers are stable in preview mode.

const OPTIONAL_ACTIVATION_GROUPS = new Set<string>(['Optional later']);

type ActivationLite = {
  id: string;
  label: string;
  group: string;
  done: boolean;
  blockedBy: string[];
  note?: string;
};

function activationListLite(): ActivationLite[] {
  return ACTIVATION_STEPS.map((s) => ({
    id: s.id,
    label: s.label,
    group: s.group,
    done: s.done,
    blockedBy: s.blockedBy,
    note: s.note,
  }));
}

function activationStepLink(s: ActivationLite): string {
  // Activation steps live on /admin/ops/activation. We anchor by step id
  // even though the page currently uses numeric headings — the id keeps the
  // link stable across future renumbering.
  return `[${s.label}](/admin/ops/activation#${s.id})`;
}

function envForBlocker(token: string): string | null {
  switch (token) {
    case 'github_token':
      return 'GITHUB_TOKEN';
    case 'vercel_token':
      return 'VERCEL_API_TOKEN';
    case 'cloudflare_token':
      return 'CLOUDFLARE_API_TOKEN';
    case 'hetzner_token':
      return 'HETZNER_API_TOKEN';
    default:
      return null;
  }
}

function tokenSatisfied(token: string): boolean {
  // 'env' / 'db' / 'ssh' / 'human' are operator-visible state — we can't
  // confirm them from the dashboard. We only resolve provider-token blockers
  // by checking the corresponding env var presence.
  const name = envForBlocker(token);
  if (!name) return false;
  return Boolean(process.env[name]);
}

function isStepReady(s: ActivationLite): boolean {
  // A step is "ready to work on now" when every blocker is either already
  // satisfied (env var present) or is `human` (operator-driven decision).
  if (s.done) return false;
  if (s.blockedBy.length === 0) return true;
  return s.blockedBy.every((b) => b === 'human' || tokenSatisfied(b));
}

function answerWhatNext(items: IndexItem[]): string {
  const steps = activationListLite();
  const pending = steps.filter((s) => !s.done);
  if (pending.length === 0) {
    return [
      "Activation looks complete from where the dashboard sits. There are no pending steps in the activation list.",
      '',
      'Open [Activation](/admin/ops/activation) for the full checklist or [Health](/admin/ops/health) to confirm every integration is reporting green.',
    ].join('\n');
  }

  // Prefer steps the operator can act on now: env-only blockers count as
  // "ready" when the env is present; human-only steps are always actionable.
  const ready = pending.filter(isStepReady);
  const candidates = (ready.length > 0 ? ready : pending).slice(0, 5);

  const lines: string[] = [];
  if (ready.length > 0) {
    lines.push(
      `Do this next: **${candidates[0].label}**. It is the lowest-numbered step on the activation list that isn't waiting on something you haven't provisioned yet.`,
    );
  } else {
    lines.push(
      `The next pending step is **${candidates[0].label}**. It is still gated on ${candidates[0].blockedBy.map(friendlyBlocker).join(', ')}, so make sure that piece is in place first.`,
    );
  }
  lines.push('');
  lines.push('**Other candidates worth a look**');
  for (const s of candidates.slice(1)) {
    const tail = s.blockedBy.length > 0 ? ` — waiting on ${s.blockedBy.map(friendlyBlocker).join(', ')}` : '';
    lines.push(`- ${activationStepLink(s)}${tail}`);
  }
  if (candidates.length <= 1) {
    lines.push('- (no other ready steps right now)');
  }
  lines.push('');

  // If we have related items from search (decisions, runbooks) mention them
  // as a follow-on.
  const decisions = items.filter((i) => i.type === 'review_decision');
  if (decisions.length > 0) {
    lines.push(`While you're there, there ${decisions.length === 1 ? 'is' : 'are'} ${decisions.length} open decision${decisions.length === 1 ? '' : 's'} on [Review](/admin/ops/review) that the team can settle in the browser.`);
    lines.push('');
  }

  lines.push('Open [Activation](/admin/ops/activation) for the full 27-step view.');
  return lines.join('\n');
}

function answerWorkToday(items: IndexItem[]): string {
  const steps = activationListLite();
  const humanFriendly = steps.filter(
    (s) => !s.done && s.blockedBy.length > 0 && s.blockedBy.every((b) => b === 'human'),
  );
  const readyEnv = steps.filter(
    (s) =>
      !s.done &&
      s.blockedBy.length > 0 &&
      s.blockedBy.some((b) => b === 'human') === false &&
      s.blockedBy.every((b) => tokenSatisfied(b) || b === 'env'),
  );

  const lines: string[] = [];
  lines.push(
    "Plenty is safe to work on today without waiting for a credential or for Hetzner. The dashboard tracks two kinds of work that operators can take in the browser: human decisions and items already gated only on env vars you've provisioned.",
  );
  lines.push('');

  if (humanFriendly.length > 0) {
    lines.push('**Decisions and reviews you can settle today**');
    for (const s of humanFriendly.slice(0, 6)) lines.push(`- ${activationStepLink(s)}`);
    lines.push('');
  }
  if (readyEnv.length > 0) {
    lines.push('**Already unblocked — credentials are in place**');
    for (const s of readyEnv.slice(0, 6)) lines.push(`- ${activationStepLink(s)}`);
    lines.push('');
  }
  if (humanFriendly.length === 0 && readyEnv.length === 0) {
    lines.push("Nothing on the activation list is fully unblocked right now — the next steps are all waiting on a credential, the database, or SSH access to ma130.");
    lines.push('');
  }

  const decisions = items.filter((i) => i.type === 'review_decision');
  if (decisions.length > 0) {
    lines.push('**Open snapshot decisions**');
    for (const d of decisions.slice(0, 5)) lines.push(`- ${linkFor(d)}`);
    lines.push('');
  }

  lines.push('Start on [Review](/admin/ops/review) and [Activation](/admin/ops/activation).');
  return lines.join('\n');
}

function answerWhatsBlocked(items: IndexItem[]): string {
  const steps = activationListLite();
  const open = steps.filter((s) => !s.done && s.blockedBy.length > 0);
  const grouped = new Map<string, ActivationLite[]>();
  for (const s of open) {
    for (const b of s.blockedBy) {
      const arr = grouped.get(b) ?? [];
      arr.push(s);
      grouped.set(b, arr);
    }
  }

  const lines: string[] = [];
  if (grouped.size === 0) {
    lines.push("Nothing is currently blocked — every open step on the activation list has its blockers cleared.");
    lines.push('');
    lines.push("Open [Activation](/admin/ops/activation) to see what's pending.");
    return lines.join('\n');
  }

  lines.push(
    `There ${open.length === 1 ? 'is' : 'are'} ${open.length} open step${open.length === 1 ? '' : 's'} on the activation list. Grouped by blocker:`,
  );
  lines.push('');

  // Stable order: env, db, ssh, human, provider tokens.
  const order = ['env', 'db', 'ssh', 'human', 'github_token', 'vercel_token', 'cloudflare_token', 'hetzner_token'];
  const seen = new Set<string>();
  for (const key of order) {
    const list = grouped.get(key);
    if (!list || list.length === 0) continue;
    seen.add(key);
    const friendly = friendlyBlocker(key);
    const sample = list[0];
    lines.push(`- **${friendly}** — ${list.length} step${list.length === 1 ? '' : 's'} (e.g. ${activationStepLink(sample)})`);
  }
  for (const [key, list] of grouped.entries()) {
    if (seen.has(key) || list.length === 0) continue;
    const sample = list[0];
    lines.push(`- **${friendlyBlocker(key)}** — ${list.length} step${list.length === 1 ? '' : 's'} (e.g. ${activationStepLink(sample)})`);
  }
  lines.push('');

  // Surface high-signal audit findings as additional blockers.
  const findings = items.filter((i) => i.type === 'audit_finding');
  const highFindings = findings.filter((f) => /high|critical|error/i.test(f.status ?? '')).slice(0, 3);
  if (highFindings.length > 0) {
    lines.push('**Audit findings worth treating as blockers**');
    for (const f of highFindings) lines.push(`- ${linkFor(f)}`);
    lines.push('');
  }

  lines.push('Open [Activation](/admin/ops/activation) for the full breakdown.');
  return lines.join('\n');
}

function answerWhichPages(_items: IndexItem[], snapshotMode: boolean): string {
  const lines: string[] = [];
  lines.push(
    snapshotMode
      ? "Right now the dashboard is in preview mode (snapshot data), so the most useful pages are the ones that let you prepare the import without making any changes."
      : "The database is connected, so the most useful pages are the ones where you confirm each integration is reporting in.",
  );
  lines.push('');

  if (snapshotMode) {
    lines.push('**Start here**');
    lines.push('- [Review](/admin/ops/review) — preview, rehearsal, and the import readiness card.');
    lines.push('- [Activation](/admin/ops/activation) — the 27-step sequence from preview to live.');
    lines.push('- [Health](/admin/ops/health) — confirm env vars and integration presence.');
    lines.push('');
    lines.push('**Also useful**');
    lines.push('- [Overview](/admin/ops) — the at-a-glance summary.');
    lines.push('- [Runbooks](/admin/ops/runbooks) — written guides for each setup step.');
    lines.push('- [Emails](/admin/ops/emails) and [Services](/admin/ops/services) — confirm the planned-category lists look right before live data arrives.');
  } else {
    lines.push('**Start here**');
    lines.push('- [Health](/admin/ops/health) — confirm each provider token is in place and the database is reporting ok.');
    lines.push('- [Activation](/admin/ops/activation) — work through the remaining sync steps.');
    lines.push('- [Reports](/admin/ops/reports) — current counts and status.');
    lines.push('');
    lines.push('**Also useful**');
    lines.push('- [Overview](/admin/ops) — the at-a-glance summary.');
    lines.push('- [Sync log](/admin/ops/sync-log) — confirm the latest sync runs completed.');
    lines.push('- [Runbooks](/admin/ops/runbooks) — the same guides, now cross-referenced from the Activation page.');
  }
  return lines.join('\n');
}

function answerDashboardStatusSummary(items: IndexItem[], snapshotMode: boolean): string {
  const steps = activationListLite();
  const total = steps.length;
  const done = steps.filter((s) => s.done).length;
  const blockedHuman = steps.filter((s) => !s.done && s.blockedBy.includes('human')).length;
  const blockedDb = steps.filter((s) => !s.done && s.blockedBy.includes('db')).length;
  const blockedSsh = steps.filter((s) => !s.done && s.blockedBy.includes('ssh')).length;

  const providerTokenStatus: Array<[string, boolean]> = [
    ['GitHub', Boolean(process.env.GITHUB_TOKEN)],
    ['Vercel', Boolean(process.env.VERCEL_API_TOKEN)],
    ['Cloudflare', Boolean(process.env.CLOUDFLARE_API_TOKEN) && Boolean(process.env.CLOUDFLARE_ACCOUNT_ID)],
    ['Hetzner', Boolean(process.env.HETZNER_API_TOKEN)],
    ['Cron secret', Boolean(process.env.CRON_SECRET)],
  ];
  const presentNames = providerTokenStatus.filter(([, v]) => v).map(([n]) => n);
  const missingNames = providerTokenStatus.filter(([, v]) => !v).map(([n]) => n);

  const decisions = items.filter((i) => i.type === 'review_decision').length;
  const findings = items.filter((i) => i.type === 'audit_finding').length;

  const lines: string[] = [];
  lines.push(
    snapshotMode
      ? "The dashboard is in preview mode (snapshot data). The live database has not been connected yet, so every page reads from the bundled snapshot."
      : "The database is connected. Pages now read from the live database; preview mode is off.",
  );
  lines.push('');
  lines.push(`**Activation** — ${done} of ${total} steps done, ${blockedHuman} waiting on a human decision, ${blockedDb} on the database, ${blockedSsh} on SSH access.`);
  if (presentNames.length > 0) {
    lines.push(`**Integration keys** — ${presentNames.join(', ')} set up. ${missingNames.length > 0 ? `Still pending: ${missingNames.join(', ')}.` : 'All provider keys present.'}`);
  } else {
    lines.push(`**Integration keys** — none set up yet. Pending: ${missingNames.join(', ')}.`);
  }
  lines.push(`**Open work** — ${decisions} review decision${decisions === 1 ? '' : 's'} and ${findings} audit finding${findings === 1 ? '' : 's'} surfaced in the latest search.`);
  lines.push('');
  lines.push('Open [Reports](/admin/ops/reports) or [Activation](/admin/ops/activation) for the full picture.');
  return lines.join('\n');
}

function answerMissingBeforeGolive(items: IndexItem[]): string {
  const steps = activationListLite();
  const required = steps.filter((s) => !s.done && !OPTIONAL_ACTIVATION_GROUPS.has(s.group));

  const lines: string[] = [];
  if (required.length === 0) {
    lines.push("You're not missing anything required for go-live according to the activation list. Optional integrations (Anthropic, BetterStack) are tracked separately and don't gate launch.");
    lines.push('');
    lines.push('Open [Activation](/admin/ops/activation) for the full checklist.');
    return lines.join('\n');
  }

  lines.push(
    `You still need ${required.length} required step${required.length === 1 ? '' : 's'} done before go-live. Optional items (Anthropic key, BetterStack) are not included — those can be added later without blocking launch.`,
  );
  lines.push('');
  lines.push('**Required steps still open**');
  for (const s of required.slice(0, 12)) {
    const tail = s.blockedBy.length > 0 ? ` — waiting on ${s.blockedBy.map(friendlyBlocker).join(', ')}` : '';
    lines.push(`- ${activationStepLink(s)}${tail}`);
  }
  if (required.length > 12) {
    lines.push(`- (${required.length - 12} more)`);
  }
  lines.push('');

  const findings = items.filter((i) => i.type === 'audit_finding');
  const highFindings = findings.filter((f) => /high|critical|error/i.test(f.status ?? '')).slice(0, 3);
  if (highFindings.length > 0) {
    lines.push('**High-severity findings to clear first**');
    for (const f of highFindings) lines.push(`- ${linkFor(f)}`);
    lines.push('');
  }

  lines.push('Open [Activation](/admin/ops/activation) for the full 27-step view.');
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
  // snapshot_mode warning is the canonical signal for "preview vs live"
  // throughout the assistant — reuse it for operational intents so we don't
  // re-derive the state from the env.
  const snapshotMode = warnings.includes('snapshot_mode');

  let body: string | null = null;
  switch (intent) {
    case 'what_next':
      body = answerWhatNext(items);
      break;
    case 'work_today':
      body = answerWorkToday(items);
      break;
    case 'whats_blocked':
      body = answerWhatsBlocked(items);
      break;
    case 'which_pages':
      body = answerWhichPages(items, snapshotMode);
      break;
    case 'dashboard_status_summary':
      body = answerDashboardStatusSummary(items, snapshotMode);
      break;
    case 'missing_before_golive':
      body = answerMissingBeforeGolive(items);
      break;
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
    case 'email_linking_status':
      body = answerEmailLinkingStatus(items);
      break;
    case 'email_category_track':
      body = answerEmailCategoryTrack(items);
      break;
    case 'services_overview':
      body = answerServicesOverview(items);
      break;
    case 'services_needing_review':
      body = answerServicesNeedingReview(items);
      break;
    case 'billing_owner':
      body = answerBillingOwner(items, question);
      break;
    case 'contacts_needed':
      body = answerContactsNeeded(items);
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
