# Local-only email references

> See also: [`ops-email-linkage.md`](./ops-email-linkage.md) (the wider
> email linking plan), [`ops-commercial-services.md`](./ops-commercial-services.md)
> (services and billing-owner model), and
> [`ops-activation-hardening.md`](./ops-activation-hardening.md)
> (Commercial preflight section).

The Emails page (`/admin/ops/emails`) includes a **local-only email
reference workspace** that runs entirely in the operator's browser. It
exists so the email-linking workflow is testable today, before the
database is connected and before any Gmail / Outlook integration decision
is made.

This runbook documents the lifecycle, the storage, the export paths, and
the migration plan when the database is connected.

---

## 1. Why local-only references exist

The full email-linking foundation (manual references stored in the
database, cross-linked to clients / assets / renewals / incidents) needs
the production database to be connected. Until then, operators can still
capture email references — they just live in the browser.

The local workspace gives the team:

- A way to practise the workflow before go-live.
- A way to capture today's billing / renewal / approval emails so they
  aren't lost while the database is being prepared.
- A clean export path so the local references migrate into the live
  table on day one.

---

## 2. Storage

Every local reference lives in `localStorage` under the key
`2ko_ops_local_email_refs_v1`. The shape mirrors the planned database row
plus two extra fields:

```ts
type LocalEmailRef = {
  id: string;          // deterministic via makeIdFromName(subject + sender)
  subject: string;
  sender: string;
  category:
    | 'billing'
    | 'domain_renewal'
    | 'hosting_renewal'
    | 'supplier_notice'
    | 'client_support'
    | 'change_request'
    | 'client_approval'
    | 'incident_comms'
    | 'quote_proposal'
    | 'internal_handover'
    | 'other';
  url?: string;        // Gmail / Outlook / xneelo link
  note?: string;       // operator note — never email body content
  linkedClient?: string;
  linkedAsset?: string;
  linkedRenewal?: string;
  linkedIncident?: string;
  status: 'draft' | 'ready' | 'archived';
  createdAt: string;   // ISO timestamp
};
```

What `localStorage` means in practice:

- **Per-browser, per-device.** A reference saved on one operator's laptop
  is not visible to anyone else.
- **No network round-trip.** No analytics, no telemetry, no DB write.
- **Survives reload, not OS reinstall.** Standard browser storage
  behaviour applies.
- **Cleared by the operator.** A "Clear all local references" button
  exists for one-click reset.

The local module is SSR-safe: it no-ops when `window` is undefined and
swallows JSON / quota errors silently. It follows the exact same pattern
as `saved-workspace-local-state.ts`.

---

## 3. The CRUD lifecycle

The Emails page renders four sections:

1. **Snapshot references** — the planned email categories with
   illustrative rows from `SNAPSHOT_EMAIL_REFS`. Read-only, source-tagged.
2. **Local references** — the operator's draft / ready / archived rows.
   Editable. New rows can be created from a form. Existing rows can be
   edited or deleted.
3. **Export** — JSON and Markdown buttons that emit the current local
   list as a download. No server round-trip.
4. **What this never does** — a small panel reiterating the safety
   stance.

The status field flips through `draft → ready → archived`:

- `draft` — captured but not yet trusted.
- `ready` — operator confirms the reference is accurate and importable.
- `archived` — historical; kept for audit, ignored during migration.

---

## 4. Export

Two exports are available, both client-side:

- **JSON** — full row dump including all optional fields. The schema
  matches what the planned import endpoint will accept.
- **Markdown** — readable rendering grouped by category. Useful for
  pasting into a handover document.

Neither export contains an email body, a secret value, or anything that
isn't already in the visible UI. Both run from the same in-memory list —
they never re-read from storage during the download.

---

## 5. Migration to the live database

When the database is connected (steps 1–8 on `/admin/ops/activation`),
the migration path is:

1. **Export JSON** from each operator's browser.
2. **Review offline** — open the JSON file and confirm subjects, senders,
   categories, and linked-record IDs.
3. **Import through the standard snapshot import path** — the importer
   accepts the JSON shape directly and writes one row per reference into
   the live `email_refs` table.
4. **Confirm the row count** on `/admin/ops/review` → Import preview.
5. **Clear local references** once the import is confirmed. Use the
   "Clear all local references" button; the operator's browser no longer
   carries the historical drafts.

The migration runbook itself is the same as the Activation rehearsal:
preview → rehearsal (dry-run) → save for real. The only difference is the
source of the rows.

---

## 6. Safety stance

The local workspace inherits the same constraints as the wider email
linkage plan:

- Never opens an inbox.
- Never sends, archives, deletes, or labels any email.
- Never stores email body content.
- Never reaches the network — JSON and Markdown export run client-side.
- Never exposes a secret value (no OAuth tokens, no app passwords).
- Never assumes consent for Gmail / Outlook integration — that decision
  is documented as a later, separately approved phase in
  [`ops-email-linkage.md`](./ops-email-linkage.md).

---

## 7. Health page surface

The Health page lists the local workspace as a presence row:

| Row | Value |
|---|---|
| Email references — local-only | `ready (browser only)` |
| Shared email references | `waiting for database` until `DATABASE_URL` is set |

Both rows are presence-only. No counts are shown — the values would leak
between operators if they were aggregated server-side.

---

## 8. Quick reference: keyboard and behaviour

- New reference form: `subject` → `sender` → `category` → `url` →
  `note` → `linkedClient / linkedAsset / linkedRenewal / linkedIncident`
  → `status` → Save.
- Save is disabled until `subject` and `sender` are non-empty.
- The category dropdown matches the planned `email_refs.category` enum
  exactly — the same labels appear in the snapshot and in the assistant's
  `email_category_track` intent.
- Status flips with a single click; no confirmation is required.
- Delete is two-click (one click to enter "confirm" state; one to commit)
  to avoid accidental loss.

---

## 9. What this page never does (recap)

- Never connects to Gmail or Outlook.
- Never reads any inbox.
- Never imports headers in bulk.
- Never stores email body content.
- Never writes to the database (the workspace is browser-only).
- Never exposes a secret value via UI or API.

Every safety constraint from
[`ops-email-linkage.md`](./ops-email-linkage.md) applies here, and the
local-only mode adds the additional constraint that nothing leaves the
browser until the operator explicitly exports.
