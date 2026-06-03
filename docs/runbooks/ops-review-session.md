# /admin/ops — Review sessions

> See also: [`ops-command-centre.md`](./ops-command-centre.md),
> [`ops-hetzner-activation.md`](./ops-hetzner-activation.md), and
> [`ops-assistant.md`](./ops-assistant.md). The decision-to-ticket bridge
> wired into the same page activates only once `DATABASE_URL` is set.

## What a review session is

A review session is the **local browser context** an operator uses to walk
through `SNAPSHOT_DECISIONS` on `/admin/ops/review`. Every piece of state
lives in `window.localStorage` — nothing reaches the network until the DB
is connected. A session is:

- one **reviewer name** (free text, max 120 chars),
- one **start time** (ISO timestamp, stamped on first interaction),
- one **notes blob** (free text, max 500 chars),
- and the per-decision review entries (status + note + updated-at)
  written separately by `DecisionsClient`.

Two localStorage keys are involved:

- `2ko_ops_review_session_v1` — session metadata (reviewer / start / notes).
  Owned by `ReviewSessionClient`.
- `2ko_ops_review_state_v1` — per-decision entries keyed by
  `SnapshotDecision.id`. Owned by `DecisionsClient`. `ReviewSessionClient`
  reads it for stats and exports, but never writes it.

This split keeps the session "shell" reset-safe — operators can clear the
reviewer name without nuking their per-decision picks.

## How to start

1. Navigate to `/admin/ops/review`. The page server-renders the
   `SNAPSHOT_DECISIONS` list, then hands the client widgets a hydration
   pass.
2. Type your name into the **Reviewer name** field at the top of the
   "Local review session" card. The value persists to
   `2ko_ops_review_session_v1` on blur.
3. The `Started at` timestamp stamps itself on the first persisted
   interaction (reviewer name, notes, or any decision pick downstream).
4. Pick decisions in the main list — `DecisionsClient` writes each pick
   to `2ko_ops_review_state_v1` as you go.

There is no "Start session" button. The session is implicit: once you
type anything, you have one. Resetting clears the session shell but
leaves your per-decision picks untouched.

## How to mark decisions

`DecisionsClient` is the sole writer of `2ko_ops_review_state_v1`. Each
entry has shape:

```ts
type LocalReviewEntry = {
  status: 'none' | 'accepted' | 'discussion' | 'blocked' | 'rejected' | 'resolved_externally';
  note: string;
  updatedAt: string;
};
```

Pick a status from the row inline; status labels and tones live in
`src/lib/ops/review-local-state.ts`. The session client polls / focus-
refreshes the same key so the stats tile reflects new picks within
seconds — even when the operator edits picks in another tab (the
`storage` event handler picks those up too).

The session stats tile counts:

- `decisions reviewed` — entries with status other than `none`,
- per-status tallies for `accepted`, `discussion`, `blocked`, `rejected`,
  `resolved_externally`, and `unresolved` (`none`).

## Exports

`ReviewSessionClient` builds an export payload by merging the session
shell with the live decision-state snapshot. Two download buttons:

**JSON** (`2ko-review-session-<YYYY-MM-DD>.json`):

```json
{
  "reviewerName": "<your name>",
  "startedAt": "<iso>",
  "exportedAt": "<iso>",
  "localNotes": "<session notes>",
  "decisions": [
    { "id": "<decision id>", "status": "<status>", "note": "<note>", "updatedAt": "<iso>" }
  ]
}
```

**Markdown** (`2ko-review-session-<YYYY-MM-DD>.md`) — same payload
rendered as a heading block plus a `| id | status | updated | note |`
table. Pipe characters in notes are escaped; newlines are flattened.

Downloads are produced client-side via `Blob` + `URL.createObjectURL`.
Nothing is uploaded. The export is the canonical hand-off format for
operators who want to share a session before the DB is connected.

## Migration to DB

Once `DATABASE_URL` is set and the snapshot import has run:

- `/admin/ops/review` still renders the same widgets. The session shell
  and per-decision entries still live in localStorage — they are the
  authoring surface.
- The **decision-to-ticket bridge** (`DecisionBridgeCard` powered by
  `src/lib/ops/decision-to-ticket.ts`) becomes active. Each local
  `accepted` decision can be projected into a ticket via the import
  preview, then committed via the import run.
- The activation flow remains read-only on the snapshot side; the DB-side
  inserts go through the same transactional path as the rest of the
  snapshot import (see Steps 9–11 in
  [`ops-hetzner-activation.md`](./ops-hetzner-activation.md)).

Until then, the JSON / Markdown exports above are the migration path:
they describe the same `(decision id → status → note)` triples the bridge
will eventually upload.
