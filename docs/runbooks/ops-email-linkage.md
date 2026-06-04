# Ops Email Linkage

Plan for tying billing, supplier, support, approval, and incident emails into
the Ops Dashboard.

This runbook is the source of truth for **what email linkage is, what it is
not, and the order in which it activates**. The dashboard ships in a safe
preview state today — no inbox is read, no email is sent, no email body is
stored. Each step below is gated by an explicit operator decision.

---

## 1. Why email linkage exists

Today, evidence for every operational fact lives in inboxes:

- Hetzner / Cloudflare / Vercel invoices.
- Domain renewal notices from xneelo / GoDaddy / Cloudflare.
- Client support threads.
- Change-request approvals.
- Incident follow-up conversations.
- Quotes and proposals.

Without a single reference layer, the dashboard cannot answer "where did this
approval come from?" or "show me the renewal email for sigmafy.co". Email
linkage is the missing piece that points each dashboard record back at the
email that triggered or confirmed it.

We do not need to ingest the email body. A link, subject, and sender are
enough to make the connection.

---

## 2. Manual email references first (default approach)

The first version is fully manual:

- An operator opens the relevant record (client / asset / ticket / renewal /
  incident).
- They paste the email URL (Gmail / Outlook / xneelo), the subject, and the
  sender into the manual email-reference form.
- A short operator note can be added.
- The reference is filed by category (billing, domain renewal, hosting
  renewal, supplier notice, client support, change request, client approval,
  incident comms, quote / proposal, internal handover).

No inbox access. No OAuth. No background sync. Just a typed reference with a
clickable link to the original.

This first version activates **after the database is connected** — the
form is disabled in preview mode and Snapshot rows are clearly tagged as
placeholders.

---

## 3. Gmail / Google Workspace integration — later, optional

If the team later decides that manual filing is too slow, a Gmail integration
is a separately approved phase. Constraints:

- Read-only OAuth (`gmail.readonly`) only.
- Never archive, delete, label, or send.
- Pulls headers and a link only — never the full body without explicit
  per-message approval.
- Tags messages it has indexed; nothing is moved.

This must be a deliberate decision documented in a follow-up runbook. It is
not part of the foundation phase.

---

## 4. Outlook / Microsoft 365 integration — later, optional

Same constraints as Gmail. Microsoft Graph `Mail.Read` scope. Read-only
header pulls. Never write, archive, delete, label, or send.

This is also a separately approved phase.

---

## 5. BCC-forwarding option

For inboxes the team does not want to grant OAuth to, an alternative is to
BCC `ops-inbox@2ko.co.za`. A small Brevo inbound webhook parses the headers
and creates a manual reference. The body is discarded unless explicitly
approved per category.

This is also a later phase. The current dashboard does not run a Brevo
inbound webhook.

---

## 6. Privacy and POPIA considerations

- Email content (subject, sender name, sender address) is personal data.
- Body content is never stored in the foundation phase.
- Operator notes are stored alongside the reference and should not include
  customer-supplied PII unless strictly necessary.
- The Contacts table stores names and roles by default; email addresses and
  phone numbers go in only after the database is connected.
- Audit logs of who created or modified each reference are required when the
  live database is in place.

---

## 7. Never ingest a full inbox without approval

This is the strongest constraint. The dashboard:

- Does not connect to any inbox today.
- Does not pull headers in bulk.
- Does not run a background sync.
- Does not have any "import all emails" action.

Any future inbox ingestion is a separate, named decision with its own
runbook.

---

## 8. Never expose secrets

OAuth tokens, app passwords, or BCC-forwarding webhooks are stored as
environment variables only. Their values are never:

- Echoed to the UI.
- Logged.
- Returned by any API route.
- Included in any export.

Presence-only checks are surfaced on the Health page.

---

## 9. Never store sensitive body content unless explicitly approved

Future Gmail / Outlook integrations pull headers and a link by default. Body
content is stored only after an explicit per-category approval and a
documented retention policy.

---

## 10. How email references link to records

When live, an email reference may be attached to one or more of:

- `client_id` — a client the email is about.
- `asset_id` — an asset the email is about (e.g. a Vercel project billing
  notice attaches to that project's asset record).
- `ticket_id` — a support thread that became a ticket.
- `renewal_id` — a domain / hosting renewal confirmation.
- `incident_id` — an incident follow-up thread.

Cross-linking is one-to-many: a renewal email can both reference a domain and
a ticket. Each reference also carries a `category` and a `provider`
(gmail / outlook / manual / unknown).

---

## 11. How Ask / Search use email references

- The knowledge index includes every email reference as a searchable item.
- The Ask assistant has dedicated intents for questions like:
  - "Where are billing emails tracked?"
  - "Is email linking active yet?"
  - "What support emails are linked to Impart?"
- In preview mode, the assistant answers transparently: "Email linking is
  prepared but not active yet. Manual linking will activate after the
  database is connected. Gmail and Outlook ingestion has not been enabled."
- Source cards never include the email body — only the subject, sender, and
  category.

---

## 12. Activation checklist

Run this in order:

1. **Database connection in place** — `DATABASE_URL` and
   `DATABASE_URL_DIRECT` set, migrations applied. Without the DB, the manual
   reference form stays disabled.
2. **Enable the manual reference form** on `/admin/ops/emails`.
3. **Train operators** — one paragraph, screenshots, examples per category.
   File one email per category as a smoke test.
4. **Set `BREVO_OPS_DIGEST_TO`** so the renewal digest has a recipient. This
   does not connect any inbox — Brevo only sends digest emails out.
5. **Verify Health card**: Email linking → manual ready · Gmail / Outlook →
   inactive · Inbox ingestion guard → off (correct).
6. **Decide on Gmail / Outlook integration** as a separate decision. Default
   answer: no. Manual references handle 95% of the value at 5% of the risk.
7. **Document privacy decisions** before any integration phase is approved.

---

## What the dashboard never does (recap)

- Never connects to Gmail.
- Never connects to Outlook.
- Never reads any inbox.
- Never imports, sends, archives, deletes, or labels emails.
- Never stores email body content in the foundation phase.
- Never exposes any secret value via UI or API.
- Never assumes consent — every integration phase is a separately approved
  decision.

## Step 27 — foundation verification

After the snapshot import is committed (step 11 of the Activation page) and
all four provider syncs have run at least once, walk the email + commercial
foundation in this order to confirm the baseline:

1. **`/admin/ops/emails`** — confirm every snapshot email reference is
   present, the categories match what the operator expects to see, and no
   reference is dangling (the linked-client / linked-asset / linked-renewal
   / linked-incident text fields point at something that actually exists).
2. **`/admin/ops/services`** — confirm every supplier service has a
   billing owner (or is explicitly tagged "Needs review"), the status is
   accurate, and any "blocked" entries have a real reason.
3. **`/admin/ops/contacts`** — confirm the placeholder roles list reflects
   the team that will actually be entered as live rows. Adjust the role
   set before any real names go in.

This is step 27 on `/admin/ops/activation`. It is the last gate before the
dashboard is treated as the source of truth for commercial ops.

See [`ops-activation-hardening.md`](./ops-activation-hardening.md) for the
short read on how the Activation page tracks this step.

## Local-only references (browser)

Until the database is connected, `/admin/ops/emails` includes a
**local-only references** workspace. Every entry lives in the operator's
browser under the localStorage key `2ko_ops_local_email_refs_v1` and is
never sent to the server.

What it captures:

- Subject, sender, category, optional Gmail / Outlook / xneelo URL.
- Operator note.
- Optional linked client / asset / renewal / incident text fields (free-text
  in preview mode, dropdowns once the database is connected).
- `createdAt` ISO timestamp and a `status` field (`draft`, `ready`,
  `archived`).

What it does **not** do:

- Never opens an inbox.
- Never sends, archives, deletes, or labels any email.
- Never stores email body content.
- Never reaches the network — JSON and Markdown export run client-side.

Migration path: when the database is connected, the local entries can be
exported as JSON, reviewed, and imported into the live email-reference
table. See [`ops-local-email-references.md`](./ops-local-email-references.md)
for the full lifecycle and the migration checklist.
