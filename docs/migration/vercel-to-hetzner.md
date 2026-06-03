# Migrating `/admin/ops` from Vercel to Hetzner

> Status: this is the **forward-looking plan**. The dashboard is on Vercel today
> and stays there until we explicitly decide to migrate. This document exists
> so the migration is a checklist, not a rewrite.

## Why portable now?

Phase 1 deliberately deploys to Vercel for speed, but every Vercel-specific
hook is isolated behind one of two boundaries:

1. **`src/lib/runtime/`** — every Vercel-specific env var reference
   (`VERCEL_ENV`, `VERCEL_REGION`, `VERCEL_URL`) is hidden behind functions
   exported from `@/lib/runtime`. Application code never reads
   `process.env.VERCEL_*` directly.
2. **`/api/cron/*`** routes — every scheduled job is a plain HTTP endpoint
   gated by an `X-Cron-Secret: $CRON_SECRET` header. Vercel Cron calls them
   today; a systemd timer with `curl` calls them tomorrow.

Grep-test the discipline at any time. **Only RUNTIME-injected** Vercel vars
should be caught — `VERCEL=1`, `VERCEL_ENV`, `VERCEL_REGION`, `VERCEL_URL`.
**User-set API token names** like `VERCEL_API_TOKEN` are fine to reference
anywhere because the token is for calling Vercel's API and that operation is
platform-independent (you still call the same API from a Hetzner host).

```bash
# Should return only matches inside src/lib/runtime/:
git grep -nE 'process\.env\.(VERCEL_ENV|VERCEL_REGION|VERCEL_URL|VERCEL)\b' src/

# These ARE allowed anywhere — they are user-set token names, not runtime probes:
#   process.env.VERCEL_API_TOKEN
#   process.env.GITHUB_TOKEN
#   process.env.NODE_ENV (standard Node)
```

## What the migration day looks like

Assumptions:

- App moves to `ma130-apps` (or a new dedicated Hetzner box).
- DB stays where it already is (`ma130-data` Postgres).
- DNS for `2kosystems.com` already proxies through Cloudflare.

Step-by-step:

1. **Provision the host**.
   - Install Node 20+, Docker, Caddy, systemd.
   - Open ports 80/443 only (UFW). SSH on 22 (already standard).
2. **Build the image**.
   - `next build` produces `.next/standalone/` (already supported by Next.js 16).
   - `Dockerfile` (to be written in this folder during the migration) bundles
     standalone output + a non-root user.
3. **Set environment**.
   - Copy `.env.example` → `/etc/2kosystems-ops-prod.env`, `chmod 600`.
   - Set `OPS_RUNTIME=hetzner`, `OPS_PUBLIC_URL=https://2kosystems.com`,
     `OPS_REGION=fsn1`.
   - **Remove** any `VERCEL_*` vars — none are read directly by application code.
4. **Wire systemd**.
   - `/etc/systemd/system/2kosystems-ops.service` with `EnvironmentFile=/etc/2kosystems-ops-prod.env`.
   - Service runs `node .next/standalone/server.js` on port 3040.
5. **Wire Caddy**.
   - `/etc/caddy/sites/2kosystems.com.caddyfile` reverse-proxies to `127.0.0.1:3040`.
   - Auto-HTTPS via Let's Encrypt.
6. **Replace Vercel Cron with systemd timers**.
   - One timer per cron route, each calling `curl -fsS -H "X-Cron-Secret: $CRON_SECRET" https://2kosystems.com/api/cron/<name>`.
   - The route handlers do not change.
7. **Replace Vercel Blob with Hetzner Object Storage**.
   - Phase 2 only — MVP has no blob storage. When attachments arrive, swap the
     `src/lib/runtime/blob.ts` adapter to point at S3-compatible Hetzner
     Object Storage. No call sites change.
8. **Cut DNS**.
   - Cloudflare DNS A record for `2kosystems.com` from Vercel's edge IPs to
     `167.233.55.201` (or whichever Hetzner IP). TTL 60s for the cut.
   - Verify with `curl -sI https://2kosystems.com`.
9. **Decommission Vercel project**.
   - Only after a week of green metrics on Hetzner. Use the existing
     decom-Vercel runbook in `infra-handover/RUNBOOKS.md`.

## Things that intentionally do NOT change

- Database connection string format and code.
- Route handlers under `/api/admin/ops/*`.
- All UI under `/admin/ops/*`.
- Drizzle schema and migrations.
- Integration clients (Cloudflare, Hetzner, Vercel, GitHub).
- Auth / operator-picker / audit log.

## Things that DO change (config only)

- Cron mechanism (Vercel Cron → systemd timers + curl).
- Env-var source (Vercel UI → `/etc/2kosystems-ops-prod.env`).
- Deploy mechanism (`git push` → GitHub Actions → `docker compose pull && up -d`).
- Logs / observability (Vercel Logs → `journalctl` + optional Sentry).
- Backups (rely on Hetzner `ma130-data` backups already in place).

## Things to write at migration time (not now)

- `Dockerfile` for `next build --standalone` output.
- `docker-compose.yml`.
- `Caddyfile` block for `2kosystems.com`.
- GitHub Actions workflow (`.github/workflows/deploy-hetzner.yml`).
- systemd unit + timer files.

Keeping these in the future-work pile (not blocking MVP) is deliberate — they
are small and well-understood; building them prematurely would be the kind of
config drift the consolidation effort is trying to undo.
