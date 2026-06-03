# /admin/ops — Database setup

> Status: the dashboard ships with **graceful no-DB mode**. Until `DATABASE_URL`
> is set on Vercel, `/admin/ops` renders skeleton pages, every mutation route
> returns 503, and sync runs are skipped with status `skipped`. None of that
> breaks the app. Set up the DB when you're ready.

## Preferred target: `ops` on `ma130-data`

Per the Phase 1B spec the canonical home for this DB is the existing
`ma130-data` Postgres 16 box. This keeps the entire 2KO data tier in one
place and avoids cross-cloud egress costs.

### One-time create (run on `ma130-data` via SSH)

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

Then grant standard schema defaults so the app can create the tables Drizzle
will install:

```bash
ssh -i ~/.ssh/ma130_migration root@167.233.50.49 \
  "sudo -u postgres psql ops -c \"GRANT ALL ON SCHEMA public TO ops_app;\""
```

### Expose Postgres securely to Vercel

`ma130-data` currently listens on the **private Hetzner network** (`10.0.0.2`).
Vercel functions are not on that network, so one of these:

- **Option A — bastion via `ma130-apps` Caddy** *(recommended)*: terminate TLS on
  Caddy, reverse-proxy TCP 5432 to `10.0.0.2:5432`. Add a `pg_hba.conf` rule
  that only accepts `ops_app` from `127.0.0.1` (because Caddy on `ma130-apps`
  is the connector).

- **Option B — direct public IP**: bind Postgres to `0.0.0.0:5432`, add the
  Hetzner Cloud firewall + `pg_hba.conf` rule for Vercel's egress range.
  Vercel publishes its egress IPs at <https://vercel.com/docs/edge-network/regions>.
  This is operationally noisier (their ranges change occasionally) and not
  recommended.

- **Option C — interim**: spin up a **Neon Postgres** in Vercel for now. Easy,
  zero ops, low marginal cost while you wire up Option A on Hetzner. Mark this
  as TEMPORARY in `infra-handover/INVENTORY.md` — the dashboard's DB belongs
  on `ma130-data` long-term.

### Vercel env vars

In the Vercel project for `2kosystems.com`, set:

| Name | Value |
|---|---|
| `DATABASE_URL` | `postgres://ops_app:<password>@<host>:5432/ops?sslmode=require` |
| `DATABASE_URL_DIRECT` | same as above (used by migrations only) |
| `GITHUB_TOKEN` | personal access token (read-only `repo` + `read:user`) |
| `VERCEL_API_TOKEN` | read-only; auto-discovers both teams |
| `CLOUDFLARE_API_TOKEN` | read-only (Account/Zone/DNS/Pages/Analytics Read) |
| `CLOUDFLARE_ACCOUNT_ID` | the 2KO account ID |
| `HETZNER_API_TOKEN` | read-only |
| `CRON_SECRET` | any random 32+ char string |

Do NOT set `AGENT_ADMIN_UI_PASSWORD` here unless you're changing it — it
already exists from the `/admin/agent` deploy.

### Apply the migration

From a workstation that can reach the DB:

```bash
export DATABASE_URL_DIRECT='postgres://ops_app:<password>@<host>:5432/ops?sslmode=require'
npx drizzle-kit migrate
```

This applies:

- `drizzle/migrations/0000_phase1_initial.sql` — divisions, operators, clients,
  contacts, assets, asset_links, github_repos, vercel_teams, vercel_projects,
  domains, integration_status, audit_log, audit_findings, sync_runs.
- `drizzle/migrations/0001_phase1b_cf_hz_tables.sql` — cloudflare_zones,
  cloudflare_pages_projects, dns_records, hetzner_servers.

Verify:

```bash
psql "$DATABASE_URL_DIRECT" -c '\dt' | head -30
```

Expect 18 tables.

### First sign-on

1. Visit `https://2kosystems.com/admin/ops`.
2. Sign in with the existing `AGENT_ADMIN_UI_PASSWORD`.
3. Operator picker → add yourself as the first operator.
4. Go to **Settings → "Seed divisions + Vercel teams"** → click Run.
5. Go to **Audits → "Seed known issues"** → click Run.
6. Go to **GitHub → Run sync now** (requires `GITHUB_TOKEN`).
7. Go to **Vercel → Run sync now** (requires `VERCEL_API_TOKEN`).
8. Go to **Infrastructure → Run sync now** for both Cloudflare and Hetzner.

### Daily / weekly cron (Phase 2 wiring)

The cron routes already exist and are gated by `X-Cron-Secret: $CRON_SECRET`.
Wire them in Vercel Cron when ready:

```json
{
  "crons": [
    { "path": "/api/cron/github-sync",     "schedule": "0 */6 * * *" },
    { "path": "/api/cron/vercel-sync",     "schedule": "*/30 * * * *" },
    { "path": "/api/cron/cloudflare-sync", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/hetzner-sync",    "schedule": "*/15 * * * *" }
  ]
}
```

(Cron handler files land in Phase 2 — they will call the same service
functions the manual sync buttons call today, so no surprise behaviour.)

### What you NEVER do

- Do not drop `audit_log` or `sync_runs` to "tidy up". They are the
  dashboard's institutional memory.
- Do not run `drizzle-kit push` against production — it skips the migration
  history. Use `drizzle-kit migrate`.
- Do not commit `.env*` files. `.env.example` is the only env file under
  version control.

## Rollback steps

Drizzle migrations are forward-only. To undo a migration: write a NEW
migration that reverses it (CREATE/DROP statements) and apply with
`npx drizzle-kit migrate`. Document the rationale in the new file's header
so future operators know why the table/column went away.

Emergency drop of an entire migration (last resort, expect downtime):

- SSH into `ma130-data`.
- List the tables the migration added and `DROP TABLE IF EXISTS <name>;`
  each one. Order matters — drop dependents before parents.
- Remove the migration's bookkeeping row so Drizzle won't think it has
  already been applied:

  ```sql
  DELETE FROM drizzle.__drizzle_migrations
  WHERE hash = '<hash from drizzle/migrations/meta/_journal.json>';
  ```

For app-side rollback (revert the deployed bundle without touching the DB):

```bash
vercel rollback <previous-deployment-url>
```

## Backup steps

- **Manual one-shot backup via SSH:**

  ```bash
  ssh -i ~/.ssh/ma130_migration root@167.233.50.49 \
    "sudo -u postgres pg_dump --format=plain ops | gzip" \
    > ops-$(date +%Y%m%d).sql.gz
  ```

  Or, run on `ma130-data` directly:

  ```bash
  pg_dump --format=plain ops | gzip > ops-$(date +%Y%m%d).sql.gz
  ```

- **Suggested nightly cron on `ma130-data` targeting Hetzner Storage Box:**

  `/etc/cron.d/ops-backup`:

  ```cron
  # Nightly Ops DB backup -> Hetzner Storage Box, 30-day retention.
  0 3 * * * postgres pg_dump --format=plain ops | gzip > /mnt/storagebox/ops-backups/ops-$(date +\%Y\%m\%d).sql.gz && find /mnt/storagebox/ops-backups -name 'ops-*.sql.gz' -mtime +30 -delete
  ```

- **Optional GPG encryption for off-site copies:**

  ```bash
  pg_dump ops | gzip | gpg --encrypt --recipient ops@2ko.co.za \
    > ops-$(date +%Y%m%d).sql.gz.gpg
  ```

  Keep the recipient's private key off `ma130-data` — the whole point is
  that a host compromise cannot read the backup.

## Restore test steps (quarterly)

Verify the backups are actually restorable. Schedule a calendar reminder
for the first Monday of each quarter.

- Create a scratch DB on a non-prod host:

  ```bash
  createdb ops_restore_test
  ```

- Restore the latest dump:

  ```bash
  gunzip < ops-LATEST.sql.gz | psql ops_restore_test
  ```

- Sanity SELECTs — these should all return non-zero on a healthy backup:

  ```sql
  SELECT COUNT(*) FROM divisions;
  SELECT COUNT(*) FROM audit_log;
  SELECT COUNT(*) FROM audit_findings;
  SELECT MAX(created_at) FROM audit_log;
  ```

- Confirm the counts and `MAX(created_at)` are consistent with recent
  activity in `/admin/ops` (e.g. `MAX(created_at)` should be within the
  last day or two if the dashboard has been in use).

- Record the result in this runbook under "Restore test log" below.

- Drop the scratch DB when done:

  ```bash
  dropdb ops_restore_test
  ```

### Restore test log

| Date | Operator | Dump file | Result |
|---|---|---|---|
| _pending_ | | | |

