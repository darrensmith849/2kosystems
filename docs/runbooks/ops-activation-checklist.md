# /admin/ops — Activation checklist

> See also: [`ops-hetzner-activation.md`](./ops-hetzner-activation.md) (the
> detailed day-of playbook), [`ops-db-setup.md`](./ops-db-setup.md) (one-time
> setup reference), [`ops-command-centre.md`](./ops-command-centre.md),
> [`ops-renewal-reminders.md`](./ops-renewal-reminders.md), and
> [`ops-search.md`](./ops-search.md).

`/admin/ops/activation` is the in-app, high-altitude checklist that mirrors
the full Hetzner activation playbook. Each step shows a status badge
derived from env-var presence or `isDbConfigured()`. Nothing on this page
mutates infrastructure — it is a visual operator log.

## When to run

Run the page **at the start of each activation attempt** to confirm what
is already green. Run the detailed runbook
([`ops-hetzner-activation.md`](./ops-hetzner-activation.md)) to actually
execute the steps. The page and the runbook stay in lockstep: every step
on this page has a `runbookSection` label pointing at the runbook heading
that explains how to do it.

Open this page when:

- the SSH key for `ma130-data` has been restored,
- the operator is ready to set `DATABASE_URL` on Vercel,
- you want a single screen showing what is left.

If `isDbConfigured()` is already `true`, most steps render `Done` and the
page becomes an audit trail.

## The 16-step sequence

| # | Step | Notes |
|---|---|---|
| 1 | Restore SSH key | `~/.ssh/ma130_migration` on the operator Mac. Manual. |
| 2 | Create `ops` database on `ma130-data` | `psql` over SSH. Manual. |
| 3 | Create `ops_app` role | Strong password to 1Password, never to disk. Manual. |
| 4 | Run migrations 0000–0002 | `drizzle-kit migrate` against `DATABASE_URL_DIRECT`. |
| 5 | Set `DATABASE_URL` in Vercel | Pooled URL, Production scope. |
| 6 | Set `DATABASE_URL_DIRECT` in Vercel | Direct URL used by migrations only. |
| 7 | Redeploy Vercel | Picks up the new env vars. Manual. |
| 8 | Verify DB connected | `isDbConfigured()` returns true, `pingDb()` 200s. |
| 9 | Snapshot import preview | `GET /api/admin/ops/import/snapshot/preview`. Read-only. |
| 10 | Snapshot import dry-run | `POST` with `dryRun: true`. No writes. |
| 11 | Snapshot import committed | `POST` with `dryRun: false`. Transactional. |
| 12 | Foundational seeds | Divisions, operators, baseline `integration_status`. |
| 13 | Add provider tokens | `GITHUB_TOKEN`, `VERCEL_API_TOKEN`, `CLOUDFLARE_API_TOKEN`, `HETZNER_API_TOKEN`. |
| 14 | First syncs | GitHub → Vercel → Cloudflare → Hetzner, in order. |
| 15 | Enable Vercel Cron | `vercel.json` crons array + `CRON_SECRET`. |
| 16 | Enable BetterStack + renewal reminders | Optional. `BETTERSTACK_WEBHOOK_SECRET` + `BREVO_OPS_DIGEST_TO`. |

## Status badges

Each step renders one of four badges. Mapping in
`src/app/admin/ops/activation/page.tsx`:

| Badge | Tone | Meaning | Derivation |
|---|---|---|---|
| `Done` | green | Step is complete. | `Boolean(process.env.X)` for env-driven steps, `isDbConfigured()` for the DB-connected step, scaffolds-present for the cron step. |
| `Pending` | amber | Step has a clear signal that flips to `Done`, but the signal is missing. | Same checks as above, negated. |
| `Blocked` | rose | Step cannot proceed until something outside this page is true. | Reserved for blockers the page knows about (currently not auto-assigned — used in the runbook). |
| `Manual` | blue | Step has no env or runtime signal; the operator confirms when done. | Steps 1, 2, 3, 7, 9, 10, 11, 12, 14. |

Env reads are presence-only. Values are never displayed, logged, or
forwarded — the page only sees `Boolean(process.env.X)`.

## Runbook cross-links

The page surfaces five runbook paths under "Runbook links" at the bottom:

- `docs/runbooks/ops-hetzner-activation.md` — the full day-of playbook.
- `docs/runbooks/ops-db-setup.md` — the one-time setup reference.
- `docs/runbooks/ops-renewal-reminders.md` — the daily 07:00 SAST digest.
- `docs/runbooks/ops-assistant.md` — grounded assistant reference.
- `docs/runbooks/ops-search.md` — knowledge index reference.

Treat the runbook as the source of truth; treat this page as the live
mirror.

## Safety stops

The page enforces three invariants:

- **No destructive UI.** There is no "advance step" button, no "reset
  activation" button, no "run import" button on this page. Mutations live
  on the provider pages (Step 14) and the import API (Steps 9–11),
  reached via the runbook.
- **No secret echo.** Every env tile is `Boolean(process.env.X)`. The
  page never displays a token, URL, or partial value.
- **No state writes.** `ActivationPage` is a server component with no
  side-effects. Reloading the page is safe at any point during the
  activation.

If `DATABASE_URL` is unset the page still renders the full sequence — it
becomes a forward-looking checklist instead of an audit trail.

## Email linkage activation (foundation phase)

After the main activation sequence completes, the following email-linkage
steps activate the manual reference UI:

1. Enable the manual email-reference form on `/admin/ops/emails`. The form
   stays disabled until `DATABASE_URL` is set, so this step is mainly a
   verification that the form lights up after the DB cuts over.
2. File one placeholder reference per category as a smoke test (billing,
   domain renewal, hosting renewal, supplier notice, client support, change
   request, client approval, incident comms, quote / proposal, internal
   handover).
3. Set `BREVO_OPS_DIGEST_TO` so the daily renewal digest has a recipient.
4. Verify on the Health page that the email-linkage card reads:
   - Email linking → manual ready
   - Gmail integration → inactive
   - Outlook integration → inactive
   - Inbox ingestion guard → off (correct)
   - `BREVO_OPS_DIGEST_TO` → configured
5. Confirm no inbox ingestion is enabled. Gmail / Outlook integration are a
   separately approved later phase — see `docs/runbooks/ops-email-linkage.md`.
