# /admin/ops — Command Centre

> See also: [`ops-map.md`](./ops-map.md) (relationship explorer),
> [`ops-activation-checklist.md`](./ops-activation-checklist.md) (16-step
> Hetzner cutover), [`ops-assistant.md`](./ops-assistant.md), and
> [`ops-search.md`](./ops-search.md).

## What the Command Centre is

`/admin/ops` is the front door for the dashboard. It is a single
server-rendered page composed of five stacked sections:

1. **Today's operational picture** — totals + breakdowns.
2. **What needs attention** — top 8 actionable rows.
3. **What is ready** — capabilities the dashboard can already do.
4. **What is blocked** — credentials and human decisions still owing.
5. **Quick actions** — first-click destinations.

Every counter is derived from `buildReportsSummary()` plus `buildIndex()`,
both wrapped in try/catch so a downstream failure renders zeros, never a
crash. When `isDbConfigured()` is false, the `ActivationReadiness` panel
also renders at the bottom.

## Today's operational picture

Each tile reads from `ReportsSummary` (see `src/lib/ops/ops-reports.ts`).

| Tile | Source fields |
|---|---|
| Divisions | `totals.divisions` |
| Clients | `totals.clients` — subline computed from `SNAPSHOT_CLIENTS` tags (`internal` / `external` / `unmapped`). |
| Assets | `totals.assets` — subline = top-3 asset types tallied from `buildIndex()` rows where `type === 'asset'` (the second tag is the asset type). |
| Repos | `totals.repos` — subline = `reposByCategory['2ko_internal'] + reposByCategory['shared_internal']` vs `reposByCategory['external_client']`. |
| Vercel projects | `totals.vercelProjects.total` — subline pulls `byState['live' \| 'dormant' \| 'migrated_to_hetzner']`. |
| Hetzner servers | `totals.hetznerServers` — subline is the static role string `ma130-apps · data · tori`. |
| Open incidents | `totals.openIncidents` — subline buckets `incidentsBySeverity` (`critical` / `major` / `minor` / `info`). Amber tone when above 0. |
| Open review decisions | sum of `decisionsByRisk` — subline buckets `high` / `med` / `low`. Amber tone when any `high` exists. |

## What needs attention

A computed list of at most 8 rows, fed in this order:

1. Urgent incidents (`incident` index rows where `tags[1]` is `critical` or `major` and `status !== 'resolved'`).
2. Blocked activation steps (`ACTIVATION_STEPS` entries with `!done` and `blockedBy` outside `['none']` and `group !== 'Optional later'`).
3. Renewals in `overdue` / `due` / `within_7` (window computed by `computeRenewalWindow(dueDate)`).
4. Top review decisions sorted by `riskRank` (`high → med → low`) from `SNAPSHOT_DECISIONS`.
5. Unmapped Vercel decisions (`cluster === 'unmapped_vercel'`).
6. Duplicate repo clusters (`cluster === 'repo_cluster'`).
7. High/critical audit findings (`audit_finding` index rows with `tags` containing `high` or `critical`).

Each row links to its detail page; badge tone is `rose` for urgent, `amber`
for pending, `blue` for info. The list is sliced to the first 8 rows after
the pipeline runs.

## What is ready

Eight static capability tiles. Each shows `ready` (emerald ring) or
`pending` (zinc ring), driven by:

- `Snapshot data` ready when `totals.assets > 0`.
- `Export pack` / `Import preview` / `Assistant/Search` / `Review
  workflow` / `Cron scaffolds` / `BetterStack scaffold` — always ready
  (these are code-resident, not data-resident).
- `Reports` always ready; subline reads `activationReadiness.ready /
  activationReadiness.total`.

Ready never means "live data". It means "the code path is wired and the
button is safe to click".

## What is blocked

Eleven blocker tiles. Every env-var tile is `Boolean(process.env.X)` only —
the dashboard never reads or displays the value. Status mapping:

- `resolved` (green) — env var present (or `humanCount === 0` for the
  canonical-decisions tile).
- `blocked` (rose) — env var absent on a required slot.
- `optional` (amber) — env var absent on `ANTHROPIC_API_KEY` or
  `BETTERSTACK_WEBHOOK_SECRET` (these unlock features but do not block
  activation).

The `canonical decisions (human)` tile counts entries in
`SNAPSHOT_DECISIONS` whose `blockedBy` is entirely `['none']` or `['ssh']`
— decisions waiting on a person, not a token.

## Quick actions

Eight tiles. Each is a plain link — no destructive verbs.

| Tile | Destination | Purpose |
|---|---|---|
| Ask a question | `/admin/ops/ask` | Grounded internal assistant. |
| Search dashboard | `/admin/ops/search` | Lexical search over every snapshot + DB row. |
| Review decisions | `/admin/ops/review` | Local-browser canonical picks. |
| Export snapshot JSON | `/api/admin/ops/export/snapshot.json` | Machine-readable discovery snapshot. |
| Export snapshot Markdown | `/api/admin/ops/export/snapshot.md` | Same snapshot rendered as docs. |
| Activation checklist | `/admin/ops/settings` | Per-credential readiness + Hetzner steps. |
| Reports | `/admin/ops/reports` | Operational rollups. |
| Health | `/admin/ops/health` | Connectivity, sync runs, BetterStack signals. |

## Without DB

`isDbConfigured()` is false. `buildReportsSummary()` returns `dataSource:
'snapshot'`. Every section above renders against `SNAPSHOT_*` constants.
`SnapshotBanner` shows on top; `ActivationReadiness` renders at the bottom
of the page. No mutation links exist on the Command Centre, so nothing on
this page is gated by 503.

## With DB

`isDbConfigured()` is true. `dbItems()` augments `buildIndex()` with live
rows and dedupes snapshot rows by `(type, lowercase title)`. The same
tiles render — the only differences are: `dataSource: 'db_partial' |
'db_live'`, snapshot banner suppressed, and `ActivationReadiness` no
longer renders at the bottom (the cutover is done).
