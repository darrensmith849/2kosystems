# Activation hardening

This runbook is the short, practical companion to `/admin/ops/activation`. It
explains how the 27-step activation page computes status, how to run the
import rehearsal on `/admin/ops/review`, and how to read validation findings.
None of it changes infrastructure — every check is presence-only and read-only.

## Overview

Activation is the work of moving the dashboard from **preview mode (snapshot
data)** to **live mode (database connected)** and then turning on each
provider sync one at a time. The Activation page (`/admin/ops/activation`)
sequences this in 27 steps. Each step has:

- a short title and where to do it,
- a status signal (an environment variable presence flag, a database ping,
  or a manual confirm),
- a runbook anchor to follow,
- a list of blockers (`env`, `db`, `ssh`, `human`, or a provider token).

The Activation page does not change anything on its own. It simply reads
public flags and tells the operator what to do next.

## How status is computed

Each step uses one of three status signals:

- **Boolean env presence** — e.g. `Boolean(process.env.DATABASE_URL)`. The
  page only checks that a value is set; it never reads the value.
- **Database ping** — `pingDb()` returns `{ ok: true }` when the database
  accepts a trivial round-trip. Used by step 8 (verify database connected).
- **Manual confirm** — the operator works through the linked runbook section
  and ticks the step off. The page shows it as "Manual" until then.

This means a step can read "Done" while the underlying token is invalid. The
mitigation is the Health page (`/admin/ops/health`) which performs a real
`pingDb()` and lists every provider token's presence — together the two
pages give a complete read of activation state.

## Import rehearsal

Once the database is connected (steps 1-8 complete), use `/admin/ops/review`
to walk through the snapshot import in three passes:

1. **Preview** — opens the page with no buttons clicked. The Import Preview
   card shows every category, the count of rows that will be inserted, and
   the count that will be skipped because a matching row already exists.
2. **Rehearsal (no changes saved)** — click "Dry run". The importer runs end
   to end but rolls back at the end. The output is recorded as an
   `ImportRunReport` and shown in the activity log. Nothing changes in the
   database.
3. **Save for real** — click "Commit". Same path as the rehearsal, but the
   rows are kept. The importer is safe to re-run: every category checks for
   existing rows on a natural key and skips duplicates.

The new Import Rehearsal card on `/admin/ops/review` adds five additional
subsections to help operators read what will happen before they click
Commit:

- **Import order** — the 7+5 numbered sequence so it's obvious what depends
  on what.
- **Readiness by category** — table of category, snapshot count, will
  insert, will skip, readiness badge, and notes.
- **Duplicate risks** — the repo clusters that need a canonical pick,
  linked to their decision.
- **Missing relationships** — link findings from the snapshot validator,
  grouped by relationship type.
- **Blocked + needs database / provider keys** — chips per blocker token so
  the operator can see at a glance what is waiting.

## Validation findings (informational, not blocking)

The snapshot validator runs against the in-memory snapshot data, never the
live database. It produces three severity levels:

- **error** — a real link is missing or points to a non-existent row. The
  importer will not crash, but the resulting row will be orphaned. Worth
  fixing before commit.
- **warn** — a soft inconsistency (e.g. a decision with no recommended
  option, a Cloudflare zone reference using the wrong id field, a domain
  hostname that doesn't parse). Review at leisure.
- **info** — items flagged in the snapshot itself as `needs_review`. Not a
  bug — just work to do later.

Findings never block the import. They are surfaced so the operator can
decide whether to fix them in the snapshot, fix them after import, or
accept them.

## How operators read the activation page

A safe walk:

1. Read the page top to bottom. The 27 steps are in order; skip none.
2. For each step that is not "Done", open the linked runbook section.
3. After provisioning a token or running a command, refresh the page. If
   the step still shows the previous status, redeploy on Vercel — env
   changes are only picked up at deploy time.
4. Step 8 (verify database connected) is the gate. Until it is green, do
   not run the import.
5. Step 11 (save for real) is the second gate. Once committed, the
   dashboard is "live" and most cards stop saying "preview mode".

## GitHub token + sync

Step 14 adds `GITHUB_TOKEN` to Vercel. Step 15 runs the first GitHub sync
from `/admin/ops/github`. The sync result is written to the audit /
sync-log table; the Health page reads the latest sync row as a soft signal
("last sync ok / failed") but does not change the step's done/pending
status.

## Vercel token + sync

Step 16 adds `VERCEL_API_TOKEN`. Step 17 runs the first Vercel sync from
`/admin/ops/vercel`. Same pattern as GitHub.

## Cloudflare token + account + sync

Step 18 adds both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The
account id is not a secret but the dashboard treats it like one — presence
only, never displayed. Step 19 runs the first Cloudflare sync from
`/admin/ops/infrastructure` (Cloudflare panel).

## Hetzner token + sync

Step 20 adds `HETZNER_API_TOKEN`. Step 21 runs the first Hetzner sync from
`/admin/ops/infrastructure` (Hetzner panel). The token is read-only as far
as the dashboard is concerned — no servers are ever created, resized, or
deleted.

## CRON_SECRET

Step 22 adds `CRON_SECRET` (any long random string). Vercel Cron sends this
header on each invocation; the cron routes reject calls without it. The
secret is never logged.

## BetterStack (optional)

Step 25 adds `BETTERSTACK_WEBHOOK_SECRET`. This is the secret BetterStack
includes when posting incident events to the webhook handler. Without it,
incoming incidents are dropped. With it, they are stored against the
incidents table.

## Safe rollback if a token gets revoked

If a provider revokes a token (e.g. accidental rotation, or a security
event):

1. Remove the env var from Vercel — leave it absent, do not paste a stale
   value back in.
2. Redeploy. The Health card for that provider flips to "not set up".
3. The relevant activation step flips back to "not done yet".
4. The dashboard continues to work; only that provider's sync stops
   running. Snapshot data, manual rows, and other providers are untouched.
5. Provision a fresh token, paste it in, redeploy. The step flips back to
   "Done" and the next sync run picks up where it left off.

No DB writes, no provider writes, no destructive operations are triggered
by token absence.
