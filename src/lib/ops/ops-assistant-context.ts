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
