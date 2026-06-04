# Commercial services and billing owners

> See also: [`ops-email-linkage.md`](./ops-email-linkage.md) (planned
> billing email references), [`ops-activation-hardening.md`](./ops-activation-hardening.md)
> (Commercial preflight section), and
> [`ops-local-email-references.md`](./ops-local-email-references.md)
> (browser-only email workspace).

The Services page (`/admin/ops/services`) tracks every supplier service
and subscription the 2KO Systems dashboard depends on. It is the single
source of truth for **who pays the bill, how often, and what happens if
the service goes away**.

This runbook explains the ownership model, the status lifecycle, and the
short list of checks that make up the commercial preflight on
`/admin/ops/activation`.

---

## 1. Why a Services page exists

The dashboard touches a handful of paid services:

- **Hetzner Cloud** — the three ma130 servers and the load balancer.
- **Cloudflare** — DNS, edge, and the production zones.
- **Vercel** — two teams hosting `2kosystems.com` and a small set of
  client projects.
- **GitHub** — repos, organisation seats, and any paid Actions usage.
- **Brevo** — transactional email (renewal digests, future notification
  channels).
- **BetterStack** — uptime monitoring and incident webhooks.
- **xneelo** — legacy domain registrations.
- **Domain registrars** (Cloudflare, GoDaddy, xneelo).
- **Anthropic** — optional, AI mode for the Ask assistant.
- **Google Workspace / Microsoft 365** — operator inboxes (future email
  integration target).

Each of these has a billing relationship that needs an owner. The Services
page captures it in one row per service so the question "who pays for
this?" has a single answer.

---

## 2. The ownership model

Every service row carries:

- `title` — the service name.
- `category` — `infrastructure`, `email`, `monitoring`, `registrar`,
  `optional-ai`, or `workspace`.
- `status` — `active`, `planned`, `needs_review`, or `blocked`.
- `cadence` — billing cadence (`monthly`, `annual`, `usage`).
- `billing_owner` — the team or person who pays the invoice.
- `tags` — free-text tags including `billing_owner_missing` or
  `billing_owner_needs_review` when the owner isn't trusted yet.
- `note` — short operator note. Never includes secret values.

`billing_owner` is the single most important field. Until every active
service has a trusted owner, the dashboard is not ready to be treated as
authoritative for commercial ops.

---

## 3. Status lifecycle

A service moves through these states:

| Status | Meaning |
|---|---|
| `planned` | The service is on the roadmap but not yet purchased. Billing owner can be a placeholder. |
| `needs_review` | An operator should walk this row before go-live. Billing owner, cadence, or category may be wrong. |
| `active` | The service is paid for and used. Billing owner is trusted. |
| `blocked` | A real problem (e.g. an expired card, a deprecated plan, a missing seat). Must be cleared before the next billing cycle. |

The Services page surfaces status as a coloured badge — `active` green,
`planned` blue, `needs_review` amber, `blocked` rose.

---

## 4. Snapshot vs live

Today the catalogue is `source: 'snapshot'` — every row comes from
`SNAPSHOT_SERVICES` in `src/lib/ops/email-services-data.ts`. The values
are illustrative; they are not pulled from a billing portal.

Once the database is connected, services move to `source: 'db'` and are
edited through the Services page. Snapshot rows for the same service
title are filtered out so the live row wins. The history of who changed
the billing owner (and when) lives in the standard audit log table.

---

## 5. Local contact drafts

Alongside Services, the Contacts page captures placeholder role rows
(client owner, billing contact, technical contact, supplier support,
internal owner, approval contact). Operators can also capture
**local-only contact drafts** in the browser before the database is
connected — same pattern as the local email references.

Drafts live in `localStorage` under `2ko_ops_local_contact_drafts_v1`,
never reach the network, and export to JSON for migration. The Contacts
page renders them next to the placeholder roles with an explicit
"draft" badge so there is no confusion about source.

---

## 6. Commercial preflight checklist

Run this walk before treating the dashboard as authoritative for any
commercial decision. The same checklist appears on `/admin/ops/activation`
between the pre-flight summary and the 27-step sequence.

1. **Walk every row on `/admin/ops/services`**. For each row:
   - Confirm the status badge is accurate.
   - Confirm `billing_owner` either has a name or is tagged
     `needs_review` explicitly.
   - Confirm `cadence` matches the actual billing period.
   - Confirm the note doesn't carry stale or sensitive information.
2. **Resolve every `blocked` row**. A blocked row means a real billing
   problem — clear it (or document why it stays blocked) before go-live.
3. **Resolve every `needs_review` row that you can today**. The rest stay
   tagged until the responsible operator has time to walk them.
4. **Walk `/admin/ops/contacts`** and confirm the placeholder role list
   matches the team that will be entered as live rows. Adjust the role
   set, not the names.
5. **Confirm billing emails are captured locally** on `/admin/ops/emails`
   — at least one per active billing relationship. This is the bridge
   between the Services row and the email trail.
6. **Export the Services list as JSON** as a backup before any large
   change. The export route emits the snapshot version today; once live,
   it emits the DB version.

---

## 7. Export

Two exports are available from the Services page:

- **JSON** — full row dump including status, cadence, tags, and note.
- **Markdown** — readable table grouped by category. Useful for sharing
  with a finance reviewer.

Neither export contains secret values. Both are generated client-side.

---

## 8. Privacy and POPIA

- Billing owner is personal data — name and (optionally) email address.
- Operator notes should not include card numbers, account numbers, or
  any other secret.
- Audit logs of who changed the billing owner (and when) are required
  once the live database is in place.

---

## 9. What this page never does

- Never calls a billing provider API.
- Never reads or stores credit card or bank account information.
- Never sends an email or any other notification.
- Never exposes a secret value via UI or API.
- Never decides who the billing owner is — that's an operator action.

The Services page is the same shape as the rest of the dashboard:
read-only by default, presence-only checks, no destructive actions.
