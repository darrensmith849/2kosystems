# /admin/ops — Assistant

> See also: [`ops-search.md`](./ops-search.md) (how the underlying retrieval
> works) and [`ops-db-setup.md`](./ops-db-setup.md) (env wiring).

## What the assistant is

The Ops Assistant is a grounded internal analyst for `/admin/ops`. It answers
operator questions strictly from the dashboard's own knowledge index —
snapshot constants, readiness state, runbook metadata, and (once the DB is
live) the rows in `ops`. It does not browse the web, does not call provider
APIs, and does not execute anything. Its job is to read what the dashboard
already knows and explain it tightly, with citations.

## What it can answer

- "Which Vercel projects are dormant?"
- "What's blocking activation?"
- "Show me clients in the JOZIN division."
- "Which renewals are due in the next 30 days?"
- "What runbook covers the Hetzner cutover?"
- "Which audit findings are still open?"
- "What's on `ma130-data`?"
- "Which Cloudflare zones are pending?"
- "What review decisions are blocked by `human`?"
- "Which env vars are still missing?"

## What it CANNOT do

- Cannot write to provider APIs (Cloudflare, Vercel, GitHub, Hetzner).
- Cannot write to the DB or trigger sync runs.
- Cannot expose secrets, tokens, passwords, or DB credentials — the
  dashboard only ever reads presence flags (e.g. `Boolean(process.env.X)`).
- Cannot change DNS, billing, or any provider setting.
- Cannot execute destructive actions of any kind. It can only describe what
  an operator would do and point at the runbook.
- Cannot answer from anything outside the supplied sources. If the answer is
  not in the index, it says "I don't know from the dashboard data."

## How retrieval works

Every query flows through the same pipeline:

1. **Build the index** — `buildIndex()` in
   `src/lib/ops/ops-knowledge-index.ts` returns every snapshot row, readiness
   row, activation step, and (when `isDbConfigured()`) every live DB row. DB
   rows deduplicate snapshot rows by `(type, lowercase title)`.
2. **Search** — `search()` in `src/lib/ops/ops-search.ts` tokenizes the
   question, applies structural filters, scores remaining items, and returns
   the top results.
3. **Answer** — if `ANTHROPIC_API_KEY` is set, the top results are passed to
   Claude as a SOURCES block with the system prompt below. If not, the
   assistant falls back to a deterministic grouped list of the same sources.

## Snapshot vs Live

Every source carries `source: 'snapshot' | 'db' | 'docs' | 'readiness'`. The
assistant labels each finding accordingly:

- `snapshot` → "as of the snapshot" / `_(snapshot)_` tag.
- `db` → "live" / `_(live)_` tag.
- `docs` → `_(docs)_` tag, used for runbook entries.
- `readiness` → `_(readiness)_` tag, used for activation steps and import
  readiness.

When the dashboard is in graceful no-DB mode, every answer carries a
`snapshot_mode` warning and a footer noting that real DB activates per
`docs/runbooks/ops-hetzner-activation.md`.

## Enabling AI

Set `ANTHROPIC_API_KEY` in the Vercel project for `2kosystems.com` (Project
→ Settings → Environment Variables → Production). Nothing else is needed —
the SDK (`@anthropic-ai/sdk`) is already a project dependency. After the
next deploy, the assistant returns `mode: 'ai'` instead of
`mode: 'search_only'`.

## Categories

The Ask UI presents a horizontal **category filter** above the suggested
questions list (see `CATEGORIES` in
`src/app/admin/ops/ask/AskClient.tsx`). The categories are:

`All`, `Activation`, `Infrastructure`, `Clients`, `Assets`, `Repos`,
`Vercel`, `Hetzner`, `Incidents`, `Renewals`, `Decisions`, `Next steps`.

Each suggested question is tagged with one category (see
`SUGGESTED_QUESTIONS`). Selecting a category narrows the suggested-question
strip to that subset; selecting `All` shows the full set. The category
filter is a UI affordance only — it does **not** alter the request body
sent to `/api/admin/ops/assistant/query`. The assistant always reads from
the full knowledge index; structural narrowing is done via the request's
`filters.types` / `filters.blockedBy`, not the category chip.

## Saved questions

Below the suggested strip the UI shows a **Saved questions** rail backed
by `localStorage` key `2ko_ops_saved_questions_v1` (see
`SAVED_QUESTIONS_KEY` in `src/lib/ops/saved-workspace-local-state.ts`).

Each saved question is:

```ts
type SavedQuestion = {
  id: string;        // deterministic via makeIdFromName(name)
  name: string;      // operator-supplied label
  question: string;  // the prompt to re-run
  category?: string; // optional, mirrors the category chips
  createdAt: string; // ISO timestamp
};
```

Saved questions are browser-local — they never reach the network and never
sync between devices until the DB is connected. Clicking a saved row
populates the question textbox; the operator submits manually so the
request is auditable in the visible chat log.

## Safety panel

The Ask page renders a small **Safety panel** at the bottom of the
session — a non-interactive amber panel that reiterates the boundaries the
assistant enforces:

- never browses the web,
- never calls a provider API,
- never executes anything,
- never exposes secrets, tokens, passwords, or DB credentials,
- never invents infrastructure state,
- always labels snapshot vs live findings,
- always answers from the supplied SOURCES or says "I don't know".

The panel is informational. It exists so that an operator sharing their
screen with a third party can point at the boundaries without leaving
the page.

## Fallback mode

When `ANTHROPIC_API_KEY` is unset, `isAiKeyConfigured()` returns `false` and
the route emits `mode: 'search_only'` with an `ai_key_missing` warning. The
fallback path:

- runs the same search,
- groups results by type using the canonical order
  (`division → client → asset → … → runbook`),
- formats each as a link with a source tag and any extras (`status=`,
  `confidence=`, `blocked by`),
- emits "I don't know from the dashboard data." when results are empty,
- never makes an outbound API call.

Operators still get a useful, cited answer; the only difference is the
prose around it.

## Safety rules

The Claude call is constrained by the system prompt verbatim:

```
You are the 2KO Systems Ops Dashboard internal analyst.

Hard rules:
- Answer ONLY from the supplied SOURCES below. If the answer is not there, say "I don't know from the dashboard data."
- Never expose any secret, token, password, private key, or DB credential. If a user asks for one, refuse and explain that the dashboard only reads presence flags.
- Never invent infrastructure state. Never claim live data when sources show source=snapshot.
- Never suggest you have completed a destructive action — you cannot execute anything. You can only describe what an operator would do.
- Always label whether a finding is in Snapshot Mode (no DB yet) versus Live (DB connected) when it matters to the answer.
- Always cite the dashboard route when one is available so the user can click through. Use the url field on the source.
- When suggesting a next step, prefer the safest option and reference the runbook by file path (e.g. docs/runbooks/ops-db-setup.md).
- Bullet lists are preferred for multi-item answers. Keep responses tight; the user is operational, not casual.
- Never claim a number is current if the source is snapshot — say "as of the snapshot".
```

## How to test

Sign in to `https://2kosystems.com/admin/ops` once so your browser holds the
session cookie. Then:

```bash
# Snapshot-mode, no AI key — exercises the fallback path.
curl -sS \
  -X POST \
  -H "Cookie: <paste session cookie>" \
  -H "Content-Type: application/json" \
  -d '{"question": "Which Vercel projects are dormant?"}' \
  https://2kosystems.com/api/admin/ops/assistant/query \
  | jq
```

```bash
# Filter to a single source type.
curl -sS \
  -X POST \
  -H "Cookie: <paste session cookie>" \
  -H "Content-Type: application/json" \
  -d '{"question": "ma130", "filters": {"types": ["hetzner_server"]}}' \
  https://2kosystems.com/api/admin/ops/assistant/query \
  | jq
```

```bash
# Ask about activation blockers.
curl -sS \
  -X POST \
  -H "Cookie: <paste session cookie>" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is blocking activation?", "filters": {"blockedBy": ["env"]}}' \
  https://2kosystems.com/api/admin/ops/assistant/query \
  | jq
```

Expected shape:

```json
{
  "mode": "search_only",
  "answer": "...",
  "warnings": ["ai_key_missing", "snapshot_mode"],
  "sources": [{ "id": "...", "type": "...", "title": "...", "url": "...", "source": "snapshot" }],
  "followUps": ["..."]
}
```

## Example questions and expected behaviour

| # | Question | Expected mode | Source types it should cite | Notes |
|---|---|---|---|---|
| 1 | "Which Vercel projects are dormant?" | `ai` or `search_only` | `vercel_project` | Filters on `state` term in tags. |
| 2 | "What's blocking the Hetzner cutover?" | either | `activation_step`, `runbook` | Links to `ops-hetzner-activation.md`. |
| 3 | "Show me clients in JOZIN." | either | `client` | Uses `divisionCode` filter. |
| 4 | "Which renewals are due soon?" | either | `renewal` | Snapshot-mode answer must say "as of the snapshot". |
| 5 | "What is the DATABASE_URL?" | either | none | Must refuse and explain presence-only check. |
| 6 | "What's on ma130-apps?" | either | `hetzner_server`, `asset` | Matches by name token. |
| 7 | "Which audit findings are open?" | either | `audit_finding` | Filters on `status=open`. |
| 8 | "Which review decisions need a human?" | either | `review_decision` | Filters on `blockedBy=human`. |
| 9 | "Which Cloudflare zones are pending?" | either | `cloudflare_zone` | Status from snapshot. |
| 10 | "Run the GitHub sync." | either | none | Must refuse — cannot execute; points at `/admin/ops/github`. |

## Email, services, and contacts intents

The assistant now recognises a small family of email and commercial intents
beyond the original ones documented above:

- **email_linking_status** — answers questions like "is email linking active
  yet?" with the safe canned response: email linking is prepared but not
  active; manual references will activate once the database is connected;
  Gmail / Outlook ingestion is not enabled.
- **email_category_track** — surfaces the planned email categories (billing,
  domain / hosting renewals, supplier notices, client support, change
  requests, client approvals, incident comms, quotes / proposals, internal
  handover) and links back to `/admin/ops/emails`.
- **services_overview** / **services_needing_review** — list the supplier
  services catalogue with status badges; flag services needing a review or
  missing a billing owner.
- **billing_owner** — points the operator at the Services page where the
  billing-owner field lives.
- **contacts_needed** — explains the placeholder Contacts foundation and the
  roles tracked.

All of these short-circuit before search runs and never return real
email-body content. Source cards include the planned email reference, the
service, or the placeholder contact only — never any private content.

## Operational intents (no AI required)

The Assistant adds six operational intents that run entirely in fallback
mode — they read the activation step list, the snapshot decisions, and the
audit findings, and produce a short prose answer followed by a tight bullet
list and a route link. None of them require `ANTHROPIC_API_KEY`. All of
them work in preview mode (snapshot data) and live mode equally.

- **what_next** — answers "what should I do next" / "what's next" / "what
  now". Reads the activation step list, finds the lowest-numbered step
  that is not yet done and not waiting on a credential the operator
  hasn't provisioned, and returns a single "Do this next" lede followed
  by 1-3 candidate actions with a runbook link each.
- **work_today** — answers "what can I safely work on today" / "what can I
  do today". Returns the steps that need only human attention right now
  (decisions, owner mappings, repo cluster picks) plus any open snapshot
  decisions — never recommends a step that is gated on SSH, database, or
  a missing token.
- **whats_blocked** — answers "what is blocked" / "what are the blockers".
  Groups every open activation step by its blocker token (`env`, `db`,
  `ssh`, `human`, or a provider token), with a count and one example step
  per group. Adds any high-severity audit findings as additional blockers.
- **which_pages** — answers "which pages should I check" / "where should
  I look". Returns the most useful dashboard routes for the current
  state: Review and Activation when snapshot mode is active, Health and
  the relevant provider page when the database is connected but a token
  is missing, always Overview and Runbooks.
- **dashboard_status_summary** — answers "summarise the dashboard status"
  / "overall status" / "how is it going". Produces a short paragraph:
  preview-or-live mode, activation progress (X of 27 steps done), token
  coverage, open decisions and findings.
- **missing_before_golive** — answers "what is missing before go-live" /
  "pre-launch checklist" / "are we ready to launch". Filters the
  activation steps to the required (non-Optional) items still not done
  and lists each with its where-to-do-it and runbook link. Treats
  Anthropic and BetterStack as Optional and excludes them.

All six short-circuit before search runs, never expose secret values, and
never claim a step is done when the underlying env var is absent.

## Email and commercial intents (extended set)

The assistant adds five more email / commercial intents to the set
documented above. Each pattern is anchored tightly enough not to overlap
the existing `email_linking_status` / `email_category_track` matchers.
All five run in fallback mode (no `ANTHROPIC_API_KEY` required) and short
circuit before search runs.

- **link_billing_emails** — matches phrasings like "can we link billing
  emails", "link invoices to clients", "billing email link". Answers
  affirmatively that billing and invoice emails will link to clients and
  assets once the database is connected, and explains that local-only
  references on `/admin/ops/emails` capture the same workflow today.
- **gmail_connect_status** — matches "can gmail be connected", "is gmail
  integration active", "connect Gmail". Answers that Gmail integration is
  inactive and that it is a later, separately approved phase — read-only
  OAuth, never archive / delete / label / send. Points the operator at the
  local-reference workspace as today's path.
- **outlook_connect_status** — same shape as the Gmail intent but for
  Microsoft 365 / Outlook. Microsoft Graph `Mail.Read` scope only, and
  also only as a later, separately approved phase.
- **before_email_live** — matches "what needs to happen before email
  linking is live", "email linking checklist". Returns the canonical
  checklist: database connected; manual references tested locally;
  categories agreed; team trained; `BREVO_OPS_DIGEST_TO` set; explicit
  Gmail / Outlook decision documented as a later phase.
- **services_check** — matches "what should I check in services" / "which
  commercial items need review". Lists services with `status=needs_review`
  or `blocked`, plus a soft count of services flagged as missing a
  billing owner, and links the operator to `/admin/ops/services`.

Each builder follows the same shape as the operational intents: a real
prose lead, a tight bulleted summary, and a route link. None of them ever
returns email body content, OAuth tokens, or anything outside the
`SOURCES` block.
