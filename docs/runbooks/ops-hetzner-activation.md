# /admin/ops — Hetzner activation runbook

> See also: [`ops-db-setup.md`](./ops-db-setup.md) (one-time setup reference)
> and [`ops-local-dev.md`](./ops-local-dev.md) (laptop workflow).

This is the **operator playbook for the day Hetzner Postgres comes online**.
Today the dashboard is wired to skeleton/snapshot mode. The moment
`DATABASE_URL` flips from unset to set on Vercel and the migrations land,
the dashboard becomes a real database-backed Ops console. This runbook walks
that flip end-to-end.

## When to run

Run this **next week, on the Hetzner DB connect day**. Do not run any of the
steps below until:

- the operator SSH key for `ma130-data` is restored,
- the `ma130-data` Postgres is reachable from the operator workstation, and
- you have allocated a maintenance window of roughly two hours.

Until that day arrives the dashboard stays in graceful no-DB mode —
`/admin/ops` renders skeleton pages, mutation routes return 503, and sync
runs are skipped with status `skipped`. None of that blocks the rest of the
site.

## Prerequisites

- `~/.ssh/ma130_migration` SSH key restored on the operator Mac (or whichever
  workstation drives the activation).
- Hetzner Postgres 16 on `ma130-data` reachable from the workstation (Option A
  bastion via Caddy is the canonical path — see `ops-db-setup.md`).
- The eight production env vars listed in **Step 2** planned out and the
  strong password for `ops_app` stored in 1Password (never in the repo, never
  in shell history).
- A Vercel CLI session linked to the `2kosystems.com` project (`vercel link`)
  if you intend to set env vars from the CLI rather than the dashboard.
- Vercel admin cookie obtained by signing in to `/admin/ops` once after
  deploy, so the `curl` requests in Steps 4–7 can pass auth.

## Step 1 — create the ops database

Copy the exact `psql` block from
[`ops-db-setup.md` § "One-time create"](./ops-db-setup.md#one-time-create-run-on-ma130-data-via-ssh):

```bash
ssh -i ~/.ssh/ma130_migration root@167.233.50.49 bash <<'EOF'
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
-- 1. App role
CREATE USER ops_app WITH PASSWORD '<set-a-strong-password>';

-- 2. Database owned by app role
CREATE DATABASE ops OWNER ops_app;

-- 3. Limit role to its own DB
REVOKE ALL ON DATABASE ops FROM PUBLIC;
GRANT CONNECT ON DATABASE ops TO ops_app;
SQL
EOF
```

Then grant standard schema defaults:

```bash
ssh -i ~/.ssh/ma130_migration root@167.233.50.49 \
  "sudo -u postgres psql ops -c \"GRANT ALL ON SCHEMA public TO ops_app;\""
```

Do not paste the actual password into this runbook, into chat, or into any
log. The placeholder above is intentional.

## Step 2 — set Vercel env vars

Set the eight runtime vars on the `2kosystems.com` Vercel project. Pick **one**
of the two paths below; do not mix the same var across both UI and CLI in the
same session.

| Name | Notes |
|---|---|
| `DATABASE_URL` | Pooled URL, e.g. `postgres://ops_app:<password>@<host>:5432/ops?sslmode=require` |
| `DATABASE_URL_DIRECT` | Same as above (used by migrations only) |
| `GITHUB_TOKEN` | Read-only, `repo` + `read:user` |
| `VERCEL_API_TOKEN` | Read-only; auto-discovers both teams |
| `CLOUDFLARE_API_TOKEN` | Read-only (Account / Zone / DNS / Pages / Analytics Read) |
| `CLOUDFLARE_ACCOUNT_ID` | The 2KO account ID |
| `HETZNER_API_TOKEN` | Read-only |
| `CRON_SECRET` | Random 32+ character string |

Optional (turn on later — they unlock the Ready section in the
`ActivationReadiness` panel):

| Name | Notes |
|---|---|
| `BETTERSTACK_WEBHOOK_SECRET` | Verifies BetterStack incoming webhooks |
| `BREVO_OPS_DIGEST_TO` | Recipient for renewal-reminder digests |

### Path A — Vercel CLI

```bash
vercel env add DATABASE_URL production
vercel env add DATABASE_URL_DIRECT production
vercel env add GITHUB_TOKEN production
vercel env add VERCEL_API_TOKEN production
vercel env add CLOUDFLARE_API_TOKEN production
vercel env add CLOUDFLARE_ACCOUNT_ID production
vercel env add HETZNER_API_TOKEN production
vercel env add CRON_SECRET production
```

Each command prompts for the value interactively. Do not pipe values in from
files committed to disk.

### Path B — Vercel UI

Project → Settings → Environment Variables → Add. Tick **Production** for
each. Trigger a redeploy after the last var is saved so the running runtime
picks them up.

## Step 3 — apply migrations

From a workstation that can reach the DB (uses `DATABASE_URL_DIRECT`):

```bash
export DATABASE_URL_DIRECT='postgres://ops_app:<password>@<host>:5432/ops?sslmode=require'
npx drizzle-kit migrate
```

This applies every file under `drizzle/migrations/` in order. Verify:

```bash
psql "$DATABASE_URL_DIRECT" -c '\dt' | head -40
```

Expect at least the 18 tables described in `ops-db-setup.md`.

## Step 4 — run snapshot import preview

Sign in to `https://2kosystems.com/admin/ops` in a browser and copy the
session cookie (it is the cookie set by the existing
`AGENT_ADMIN_UI_PASSWORD` gate). Then:

```bash
curl -sS \
  -H "Cookie: <paste session cookie>" \
  https://2kosystems.com/api/admin/ops/import/snapshot/preview \
  | jq
```

The response describes every row the import would touch, grouped by category,
with readiness flags (`ready`, `needs_review`, `blocked`). Nothing is written
yet.

## Step 5 — run snapshot import dry-run

```bash
curl -sS \
  -X POST \
  -H "Cookie: <paste session cookie>" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}' \
  https://2kosystems.com/api/admin/ops/import/snapshot/run \
  | jq
```

The route walks every snapshot constant and **simulates** the inserts. The
response lists how many rows per table would be created, plus any conflicts
(IDs that already exist). The DB state is unchanged.

## Step 6 — review dry-run output

Look for:

- `wouldCreate` counts that match `SNAPSHOT_COUNTS` in
  `src/lib/ops/ops-snapshot-data.ts`. Today that is 6 divisions, 15 clients,
  27 assets, 38 repos, 23 Vercel projects, 3 Hetzner servers, 8 Cloudflare
  zones, 10 findings, 5 tickets, 5 renewals, 5 incidents.
- `conflicts` should be empty on a freshly migrated DB. Any conflict means
  someone seeded a row in this DB before — investigate before continuing.
- `readiness` per category — anything marked `blocked` (Cloudflare zones,
  Domains) is expected; those wait for provider tokens.

If anything looks off, stop and reconcile before running Step 7.

## Step 7 — run snapshot import for real

```bash
curl -sS \
  -X POST \
  -H "Cookie: <paste session cookie>" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}' \
  https://2kosystems.com/api/admin/ops/import/snapshot/run \
  | jq
```

This **commits** the inserts inside a transaction. If anything fails the
whole import rolls back — no partial state. Verify by visiting
`/admin/ops/clients` and `/admin/ops/assets` in the UI; the snapshot rows
should now appear as real DB rows.

## Step 8 — first sync runs

Run the four provider syncs **in this order**. Each one calls the same
service function its `/api/cron/*` route uses, so behaviour is identical to
the scheduled run.

1. **GitHub** — `/admin/ops/github` → "Run sync now". Needs `GITHUB_TOKEN`.
2. **Vercel** — `/admin/ops/vercel` → "Run sync now". Needs
   `VERCEL_API_TOKEN`.
3. **Cloudflare** — `/admin/ops/infra` → Cloudflare card → "Run sync now".
   Needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.
4. **Hetzner** — `/admin/ops/infra` → Hetzner card → "Run sync now". Needs
   `HETZNER_API_TOKEN`.

After each run, watch the `sync_runs` row appear in `/admin/ops` and confirm
`status = completed`. A `skipped` row means the token is missing.

## Step 9 — turn on cron triggers

Confirm `vercel.json` has the `crons` array deployed. From the repo root:

```bash
node -e "const v = JSON.parse(require('fs').readFileSync('vercel.json','utf8')); console.log(JSON.stringify(v.crons, null, 2));"
```

Expect four entries — `github-sync`, `vercel-sync`, `cloudflare-sync`,
`hetzner-sync`. In the Vercel project's **Cron Jobs** tab the same four
entries should show up as **Active** after the next production deploy.

Smoke-test the cron path manually:

```bash
curl -sS -H "X-Cron-Secret: $CRON_SECRET" \
  https://2kosystems.com/api/cron/_test
```

A `200 OK` with body `{ ok: true }` confirms the secret + route plumbing.

## Step 10 — operator smoke test

Through the UI, create one of each core record to confirm writes are landing:

1. `/admin/ops/clients/new` → create a throwaway client called "Activation
   smoke test".
2. `/admin/ops/assets/new` → create an asset linked to that client.
3. `/admin/ops/tickets/new` → create a low-priority ticket against the asset.

Verify each appears in its respective list. Archive the three test records
once verified — they exist only to prove the write path works end-to-end.

## Rollback

App-side rollback (revert the bundle, keep the DB):

```bash
vercel rollback <previous-deployment-url>
```

Schema-side emergency drop (last resort, expect downtime):

```bash
ssh -i ~/.ssh/ma130_migration root@167.233.50.49 \
  "sudo -u postgres psql ops" <<'SQL'
DROP TABLE IF EXISTS sync_runs, audit_findings, audit_log,
  integration_status, domains, vercel_projects, vercel_teams,
  github_repos, asset_links, assets, contacts, clients, operators,
  divisions, dns_records, cloudflare_pages_projects, cloudflare_zones,
  hetzner_servers CASCADE;

DELETE FROM drizzle.__drizzle_migrations;
SQL
```

After dropping, the dashboard falls back to graceful no-DB mode automatically
(`isDbConfigured()` short-circuits every route). Document the rollback
rationale in `infra-handover/HISTORY.md` so the next operator understands why.

## Verification checklist

Use this list to confirm the activation completed. Mirrors the **Ready**,
**Needs credential**, and **Waiting for Hetzner** sections in the
`ActivationReadiness` panel at the top of `/admin/ops`.

Ready:

- [x] Snapshot data committed
- [x] Snapshot export available at `/api/admin/ops/export/snapshot.{json,md}`
- [x] Snapshot import engine present at
  `/api/admin/ops/import/snapshot/{preview,run}`
- [x] Review & decisions surface live at `/admin/ops/review`
- [x] Browser-local review workflow operational (localStorage)
- [x] `vercel.json` has the crons array

Needs credential — flips from open circle to check the moment each env var
is set in Step 2:

- [ ] `DATABASE_URL`
- [ ] `DATABASE_URL_DIRECT`
- [ ] `GITHUB_TOKEN`
- [ ] `VERCEL_API_TOKEN`
- [ ] `CLOUDFLARE_API_TOKEN`
- [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] `HETZNER_API_TOKEN`
- [ ] `CRON_SECRET`
- [ ] `BETTERSTACK_WEBHOOK_SECRET` (optional)
- [ ] `BREVO_OPS_DIGEST_TO` (optional)

Waiting for Hetzner — all of these become check marks after Steps 1, 3, 5,
7, 8:

- [ ] SSH key restored on operator Mac
- [ ] `ops` Postgres database created on `ma130-data`
- [ ] `ops_app` role with scoped grants
- [ ] DB exposure path chosen (PgBouncer / Cloudflare Tunnel / public +
  firewall)
- [ ] `drizzle-kit migrate` applied 0000 + 0001 + 0002
- [ ] Snapshot import dry-run executed
- [ ] Snapshot import committed
- [ ] Real sync runs executed for all four providers

## Lessons learned

> Operator: fill this in **after** activation. Use it to record what changed,
> what surprised you, and what the next operator should know before they run
> the same playbook against a future environment. Keep it factual; link to
> commits or PRs where useful.

- _(blank — fill in on the activation day)_
