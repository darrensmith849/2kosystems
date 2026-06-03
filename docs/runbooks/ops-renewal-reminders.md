# Renewal reminders — daily ops digest

## What this runs at 07:00 SAST daily

A Vercel Cron triggers `GET /api/cron/renewals-remind` at `0 7 * * *` (UTC on
Vercel; we treat 07:00 UTC ≈ 09:00 SAST — adjust the cron expression if you
need exact local time). The handler:

1. Verifies the `X-Cron-Secret` header against `CRON_SECRET`.
2. Returns `503 { ok: false, reason: 'db_not_connected' }` when `DATABASE_URL`
   is unset — the route is reachable in production today but no-ops until the
   database is wired up.
3. Calls `runRenewalReminders({ dryRun: false })` from
   `src/lib/ops/renewals-reminders.ts`, which:
   - Reads all active renewals once via `listRenewals()`.
   - Buckets each into a window (`overdue`, `due`, `within_7`, `within_14`,
     `within_30`, `within_60`) using the pure
     `computeRenewalWindow` helper.
   - Filters to renewals whose stored `reminderState` is behind the bucket
     they now fall into (so a renewal that already got the 30-day nudge
     does not get re-emailed when it crosses into the 14-day bucket — it
     only triggers again when entering the 14-day bucket).
   - When `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` and a recipient are all set,
     sends a single HTML digest to the ops mailbox via Brevo.
   - On a successful send, advances `reminderState` per renewal via
     `markReminded(...)` (never mutates the row directly).
   - Always writes an audit log entry with the per-window counts.

The cron is read-only with respect to clients — it never emails customers.

## Configuration env vars

| Variable | Required | Purpose |
| --- | --- | --- |
| `CRON_SECRET` | yes (for the cron to fire) | Header check on the route. |
| `DATABASE_URL` | yes (for any real work) | Without it the route 503s and the function exits cleanly. |
| `BREVO_API_KEY` | optional | Existing key — re-used. Without it, the cron still runs and audits, but no email is sent. |
| `BREVO_SENDER_EMAIL` | optional | Existing key — used as the "From" address. |
| `BREVO_SENDER_NAME` | optional | Defaults to `2KO Systems`. |
| `BREVO_OPS_DIGEST_TO` | **new — optional** | Recipient for the digest. If empty, falls back to `BREVO_SENDER_EMAIL`. If both are empty, the digest send is skipped (cron still runs). |

Set new values via the Vercel project settings UI. Do not commit secrets.

## Testing locally

With the local Postgres stack running (see `docs/runbooks/ops-local-dev.md`)
and `CRON_SECRET` set in `.env.local`:

```bash
curl -i -H "X-Cron-Secret: $CRON_SECRET" \
  http://localhost:3000/api/cron/renewals-remind
```

Expected shapes:

- No DB: HTTP 503, body `{ "ok": false, "reason": "db_not_connected", ... }`.
- DB up, nothing due: HTTP 200, body with `status: "ok"`, `emailsSent: 0`,
  and zeroed `perWindow` counts.
- DB up + renewals due + Brevo configured: HTTP 200, `emailsSent: 1`,
  reminders advanced in the database.

To preview the digest without sending email, call the underlying helper from
a server context with `{ dryRun: true }` — the route itself always runs
non-dry, by design.

## Disabling temporarily

Remove (or comment out) the `/api/cron/renewals-remind` entry from
`vercel.json` and redeploy. The route stays reachable but Vercel will stop
the scheduled trigger.

To suppress only the email side without touching the cron, blank out
`BREVO_OPS_DIGEST_TO` **and** `BREVO_SENDER_EMAIL`. The cron will still run,
bucket, and audit, but skip the send.

## Why this is read-only

The current scope is the internal ops digest only. Client-facing reminders
are not implemented yet. The handler never advances `reminderState` on a
dry run or a failed send, so the audit trail and the database stay in sync
with what actually went out.
