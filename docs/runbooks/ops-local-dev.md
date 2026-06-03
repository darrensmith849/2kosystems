# /admin/ops — Local dev workflow

This runbook describes how to run the `/admin/ops` dashboard end-to-end on a
laptop without touching the production Hetzner database. It uses a disposable
Postgres 16 container defined in `docker-compose.ops.yml` at the repo root.

> Production lives on `ma130-data` (Hetzner). See
> [`ops-db-setup.md`](./ops-db-setup.md) for the canonical production setup.
> The credentials in `docker-compose.ops.yml` are **dev-only** and must never
> be reused on a production host.

## Prerequisites

- Docker Desktop (or any Docker Engine 24+ with Compose v2).
- Node.js 20+ and npm.
- This repo cloned and `npm install` already run.
- A copy of `.env.example` placed at `.env.local` (see "Point the app at it"
  below for the two DB URLs to fill in).

## Start the local Postgres

From the repo root:

```bash
docker compose -f docker-compose.ops.yml up -d
```

This starts a single container, `2ko-ops-dev-postgres`:

- Listens on **`localhost:5433`** — port `5433` is deliberate so the
  container does not collide with a system Postgres on the default `5432`.
- Persists data to `./.local-data/postgres` (ignored by git).
- Dev credentials are intentionally plaintext in `docker-compose.ops.yml`
  for ease of setup. **Never reuse this password in production.**

Confirm it is ready:

```bash
docker compose -f docker-compose.ops.yml ps
docker exec 2ko-ops-dev-postgres pg_isready -U ops_dev -d ops_dev
```

## Point the app at it

Add (or uncomment) these lines in `.env.local`:

```bash
DATABASE_URL=postgres://ops_dev:ops_dev_local_only_do_not_use_in_prod@localhost:5433/ops_dev
DATABASE_URL_DIRECT=postgres://ops_dev:ops_dev_local_only_do_not_use_in_prod@localhost:5433/ops_dev
```

Both URLs point at the same database in local dev. In production they may
diverge (pooler vs direct). Drizzle migrations use `DATABASE_URL_DIRECT`.

## Apply migrations

```bash
npm run db:migrate
# or, equivalently:
npx drizzle-kit migrate
```

This applies every file in `drizzle/migrations/` against the local DB.

## Run the app

```bash
npm run dev
```

Then open <http://localhost:3000/admin/ops> and sign in with the
`AGENT_ADMIN_UI_PASSWORD` from your `.env.local`.

## Seed baseline data

Once signed in:

1. **Settings → "Seed divisions + Vercel teams"** — populates the
   organisation taxonomy and Vercel team rows.
2. **Audits → "Seed known issues"** — populates the audit findings
   backlog.

Provider syncs (GitHub / Vercel / Cloudflare / Hetzner) only work if you
have the matching read-only tokens in `.env.local`. They are optional for
local UI work.

## Reset the local DB

When you want to wipe everything and start over:

```bash
docker compose -f docker-compose.ops.yml down
rm -rf ./.local-data/postgres
docker compose -f docker-compose.ops.yml up -d
npm run db:migrate
```

## Stop the local DB

```bash
docker compose -f docker-compose.ops.yml down
```

The volume under `./.local-data/postgres` is preserved across `down`/`up`
cycles — only the explicit `rm -rf` step above destroys data.

## Troubleshooting

- **Port 5433 already in use:** another container or service is bound to
  that port. `docker ps` to find it, or change the host-side port in
  `docker-compose.ops.yml` (e.g. `5434:5432`) and update your
  `DATABASE_URL` to match.
- **`getDb() returned null`:** the app could not parse `DATABASE_URL`.
  Double-check `.env.local` and restart `npm run dev`.
- **Migrations fail with `relation already exists`:** the local volume
  has leftover state from a prior schema. Run the full reset above.
