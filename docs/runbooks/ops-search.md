# /admin/ops — Search

> See also: [`ops-assistant.md`](./ops-assistant.md) (consumer of the search
> index) and [`ops-db-setup.md`](./ops-db-setup.md) (when live DB rows start
> appearing alongside snapshot rows).

The Ops Search index is the single source of truth for both the in-app
search box and the assistant. It is built by `buildIndex()` in
`src/lib/ops/ops-knowledge-index.ts` and queried by `search()` in
`src/lib/ops/ops-search.ts`. It never reads disk, never calls a provider
API, and never exposes secret values.

## What's indexed

Every item is an `IndexItem` with `type`, `source`, `title`, `body`, `tags`,
and optional `status`, `confidence`, `blockedBy`, `url`, `relations`. The
snapshot column below is the count produced by snapshot mode today; live
mode adds DB rows on top (and dedupes by `(type, lowercase title)`).

| # | IndexItem type | Source in snapshot mode | Snapshot count | Notes |
|---|---|---|---|---|
| 1 | `division` | `snapshot` | 6 | From `SNAPSHOT_DIVISIONS`. |
| 2 | `client` | `snapshot` | 15 | Tagged with division code. |
| 3 | `asset` | `snapshot` | 27 | Tagged with tech stack + division. |
| 4 | `github_repo` | `snapshot` | 38 | Status reflects archived state. |
| 5 | `vercel_project` | `snapshot` | 23 | Status is the project `state`. |
| 6 | `hetzner_server` | `snapshot` | 3 | Subtitle is `serverType · location`. |
| 7 | `cloudflare_zone` | `snapshot` | 8 | Status comes from the zone state. |
| 8 | `domain` | `snapshot` | (snapshot) | Indexed but blocked on credential. |
| 9 | `ticket` | `snapshot` | 5 | Tagged with kind, priority, status. |
| 10 | `renewal` | `snapshot` | 5 | Status is `reminderState`. |
| 11 | `incident` | `snapshot` | 5 | Tagged with severity + status. |
| 12 | `audit_finding` | `snapshot` | 10 | Tagged with kind + severity. |
| 13 | `review_decision` | `snapshot` | 15 | Carries `blockedBy`; confidence `needs_review`. |
| 14 | `import_readiness` | `readiness` | per category | Built from `getSnapshotImportReadiness()`. |
| 15 | `activation_step` | `readiness` | 30+ | Mirrors the `ActivationReadiness` panel. |
| 16 | `runbook` | `docs` | 5 | Hardcoded SAFE list — never reads `docs/`. |

In live mode, `dbItems()` adds rows for `clients`, `assets`, `tickets`,
`renewals`, `incidents`, `github_repos`, `vercel_projects`,
`hetzner_servers`, `cloudflare_zones`, `domains`, and `audit_findings`.
Snapshot rows for the same `(type, lowercase title)` are filtered out so
the live row wins.

## Search behaviour

`search(filters, opts)`:

1. Tokenizes `filters.q` (lowercase, alphanumeric + `_./-`, drops stop
   words like `the`, `a`, `show`, `me`, `all`).
2. Applies structural filters first (cheap rejection).
3. Scores each surviving item against each token:
   - **Title hits** × 5
   - **Subtitle hits** × 3
   - **Tag hits** × 3
   - **Body hits** × 1
   - **+2 bonus** when every token appears at least once in the body and
     there is more than one token (`all_tokens_in_body`).
4. Drops items with `score <= 0`.
5. Sorts by score descending, then by title ascending for stability.
6. Returns the top `limit` (default 25) plus a duration timing.

Each result carries `reasons` like `title:vercel`, `tag:dormant`,
`body:ma130`, so the UI can render a transparent "why this matched"
breakdown.

When `filters.q` is empty but structural filters are present, every item
that passes the filters is returned with score `1` — useful for "list all
review decisions blocked by `human`" style browse queries.

## Filters

All filters are optional. Combine freely.

| Filter | Type | Behaviour |
|---|---|---|
| `q` | `string` | Free-text query; tokenized as above. |
| `types` | `IndexItem['type'][]` | Restricts to listed types. |
| `sources` | `IndexItem['source'][]` | Restricts to listed sources (`snapshot`, `db`, `docs`, `readiness`). |
| `blockedBy` | `string[]` | Item must have at least one matching entry in its own `blockedBy`. |
| `status` | `string[]` | Item must have a `status` field present in the list. |
| `divisionCode` | `string` | Exact match on `relations.divisionCode`. |
| `clientId` | `string` | Exact match on `relations.clientId`. |

## Examples

| # | Query | Expected match pattern |
|---|---|---|
| 1 | `{ q: "ma130" }` | `hetzner_server` rows + assets hosted on ma130; title and tag hits. |
| 2 | `{ q: "dormant", types: ["vercel_project"] }` | Vercel projects whose `state` tag is `dormant`. |
| 3 | `{ q: "renewal due" }` | `renewal` rows where body contains `due` and the renewal name. |
| 4 | `{ types: ["activation_step"], blockedBy: ["env"] }` | Activation steps still waiting on env vars. |
| 5 | `{ types: ["review_decision"], blockedBy: ["human"] }` | Review decisions needing a human pick. |
| 6 | `{ q: "cloudflare zone pending" }` | Cloudflare zones whose status/state is `pending`. |
| 7 | `{ q: "jozin", divisionCode: "JOZIN" }` | All items related to the JOZIN division (clients, assets). |
| 8 | `{ q: "ops-db-setup" }` | The runbook entry, by tag match on its path. |
| 9 | `{ types: ["audit_finding"], status: ["open"] }` | All open audit findings. |
| 10 | `{ q: "ticket", clientId: "<id>" }` | Tickets scoped to a specific client. |

## Saved searches

`/admin/ops/search` exposes a **Saved searches** rail above the result
table. State lives in `localStorage` under key `2ko_ops_saved_searches_v1`
(`SAVED_SEARCHES_KEY` in `src/lib/ops/saved-workspace-local-state.ts`).
Each entry is:

```ts
type SavedSearch = {
  id: string;        // deterministic via makeIdFromName(name)
  name: string;      // operator-supplied label
  q: string;         // free-text query (same tokenizer)
  types?: string[];  // optional IndexItem['type'] restriction
  sources?: string[];// optional IndexItem['source'] restriction
  blockedBy?: string[]; // optional structural filter
  createdAt: string; // ISO timestamp
};
```

Saving captures the current query plus the active structural filters.
Loading a saved search rehydrates both — the search box and the filter
chips — and re-runs the scorer client-side over the in-memory index. Saved
searches are browser-local; nothing reaches the network and nothing syncs
between devices. The `id` is derived deterministically from `name` so the
same label always overwrites in place.

## Routes table

| Route | Surface | Storage |
|---|---|---|
| `/admin/ops/search` | In-app search box, filter chips, saved-searches rail | `2ko_ops_saved_searches_v1` (localStorage) — saved-workspace state, see `src/lib/ops/saved-workspace-local-state.ts`. |
| `/admin/ops/ask` | Assistant Q&A, category chips, saved-questions rail | `2ko_ops_saved_questions_v1` (localStorage) — same saved-workspace module. |
| `/admin/ops/review` | Decisions list + local review session | `2ko_ops_review_state_v1` (per-decision picks) + `2ko_ops_review_session_v1` (session shell). |

All three localStorage keys live in the same module
(`saved-workspace-local-state.ts`) so the browser-local workspace stays
auditable in one place. None of the keys ever touch the network until
`DATABASE_URL` is set and a per-key migration is wired explicitly.

## Without DB

In graceful no-DB mode the index is built entirely from
`SNAPSHOT_*` constants, `getSnapshotImportReadiness()`, `ACTIVATION_STEPS`,
and the hardcoded `RUNBOOKS` list. Search works exactly the same — the only
difference is every item carries `source: 'snapshot' | 'readiness' | 'docs'`.
The assistant and UI label these accordingly so operators never confuse
snapshot data with live state.

## With DB

When `isDbConfigured()` returns `true`, `dbItems()` reads each indexed
table and emits an `IndexItem` with `source: 'db'`. Each table read is
individually try-wrapped, so a failure on one table never starves the
others. The merge step in `buildIndex()` then:

1. Computes `liveKeys = Set<type::lowercase_title>` for every DB row.
2. Filters the snapshot list to drop any item whose key collides.
3. Concatenates `[...live, ...filteredSnapshot]` and returns it.

The result: DB rows always shadow their snapshot equivalents, snapshot
rows for types not yet in DB pass through, and no row is ever served
twice for the same `(type, title)`.
