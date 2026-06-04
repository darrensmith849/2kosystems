import { AdminCard, Badge, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import {
  EMAIL_CATEGORY_LABEL,
  EMAIL_CATEGORY_ORDER,
  SNAPSHOT_EMAIL_REFS,
  getEmailLinkingStatus,
} from '@/lib/ops/email-services-data';

// /admin/ops/emails — Email Intelligence preview.
//
// This page is intentionally a preview: no inbox is read, no email is sent,
// no email body is stored. It explains the planned email-linking system,
// shows safe placeholder rows per category, and previews the future manual
// linking form as a disabled read-only sketch. Live editing only activates
// after the database is connected.

export const dynamic = 'force-dynamic';

const FUTURE_FIELDS: Array<{ label: string; example: string }> = [
  { label: 'Subject', example: 'Hetzner Cloud · invoice — October 2026' },
  { label: 'Sender', example: 'Hetzner Cloud <billing@hetzner.com>' },
  { label: 'Provider', example: 'Gmail · Outlook · Manual' },
  { label: 'Category', example: 'Billing / invoices' },
  { label: 'External link', example: 'https://mail.google.com/…' },
  { label: 'Linked client', example: 'Internal · 2KO Systems' },
  { label: 'Linked asset', example: 'ma130-data (Hetzner server)' },
  { label: 'Linked ticket', example: 'Optional ticket reference' },
  { label: 'Linked renewal', example: 'Optional renewal reference' },
  { label: 'Linked incident', example: 'Optional incident reference' },
  { label: 'Notes', example: 'Short operator note. No email body content.' },
];

export default function EmailsPage() {
  const snapshot = isSnapshotMode();
  const status = getEmailLinkingStatus();

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Emails"
        subtitle="Plan for linking client, supplier, and operational emails into the dashboard."
      />
      {snapshot && <SnapshotBanner area="Email references" />}

      {/* Status card */}
      <AdminCard title="Status">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge text="Email linking — not active yet" tone="amber" />
            <Badge text="Database required" tone="blue" />
            <Badge text="No inbox is being read" tone="green" />
            <Badge text="No emails being sent" tone="green" />
          </div>
          <p className="text-sm text-[#e4e4e7] leading-relaxed">
            Email linking is a read-only preview today. Manual email references will activate
            after the database is connected. Gmail and Outlook integration are left for a later,
            explicitly approved phase — no inbox is being read, no emails are being sent, and no
            email bodies are stored.
          </p>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Current state: <span className="text-[#f5f5f5]">{status}</span> · Manual reference UI
            is shown below as a disabled preview.
          </p>
        </div>
      </AdminCard>

      {/* Category preview */}
      <AdminCard title="Planned categories">
        <p className="mb-4 text-xs text-[#a1a1aa] leading-relaxed">
          When email linking is enabled, every reference is filed under one of these categories.
          The dashboard never reads inboxes — an operator creates the reference manually with the
          subject, sender, and a link back to the original email in Gmail or Outlook.
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EMAIL_CATEGORY_ORDER.map((cat) => (
            <li
              key={cat}
              className="flex items-center gap-2 rounded-xl border border-[#1c1c1e] bg-[#0e0e10] px-3 py-2 text-sm text-[#e4e4e7]"
            >
              <span aria-hidden className="text-[#52525b]">·</span>
              {EMAIL_CATEGORY_LABEL[cat]}
            </li>
          ))}
        </ul>
      </AdminCard>

      {/* Snapshot placeholder rows */}
      <AdminCard title="Preview references">
        <p className="mb-4 text-xs text-[#a1a1aa] leading-relaxed">
          Placeholder rows — these show what each category will look like once real email
          references are entered. No real email bodies are stored. No sender phone numbers or
          personal content is included.
        </p>
        <ul className="space-y-2">
          {SNAPSHOT_EMAIL_REFS.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-[#1c1c1e] bg-[#0e0e10] p-3"
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge text={EMAIL_CATEGORY_LABEL[e.category]} tone="blue" />
                <Badge text="preview" tone="neutral" />
                {e.linkedClient && <Badge text={`client · ${e.linkedClient}`} tone="neutral" />}
                {e.linkedIncident && <Badge text="incident-linked" tone="neutral" />}
              </div>
              <p className="text-sm font-medium text-[#f5f5f5]">{e.subject}</p>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                from {e.fromName}{' '}
                <span className="text-[#52525b]">&lt;{e.fromEmail}&gt;</span>
              </p>
              <p className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">{e.notes}</p>
            </li>
          ))}
        </ul>
      </AdminCard>

      {/* Disabled future form preview */}
      <AdminCard title="Future manual reference form (preview)">
        <p className="mb-4 text-xs text-[#a1a1aa] leading-relaxed">
          Once the database is connected, an operator will use a form like this to file an email
          reference. The form is disabled below — adding a real reference is not possible until
          the database connection is active.
        </p>
        <div className="rounded-xl border border-[#1c1c1e] bg-[#0e0e10] p-4 opacity-70">
          <ul className="space-y-3">
            {FUTURE_FIELDS.map((f) => (
              <li key={f.label} className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr]">
                <span className="text-xs font-medium uppercase tracking-wide text-[#71717a]">
                  {f.label}
                </span>
                <span className="text-xs text-[#a1a1aa]">{f.example}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              disabled
              className="rounded-md bg-[#1c1c1e] px-4 py-2 text-xs text-[#52525b] cursor-not-allowed"
            >
              Save reference
            </button>
            <span className="text-[11px] text-[#71717a]">
              Manual email linking will activate after the database is connected.
            </span>
          </div>
        </div>
      </AdminCard>

      {/* Safety */}
      <AdminCard title="What this page never does">
        <ul className="space-y-2 text-xs text-[#a1a1aa] leading-relaxed">
          <li>· Never reads any inbox.</li>
          <li>· Never sends any email.</li>
          <li>· Never archives, deletes, or labels any email.</li>
          <li>· Never stores email body content.</li>
          <li>· Never exposes secrets or message contents.</li>
          <li>· Never connects to Gmail or Outlook without an explicit, separately approved phase.</li>
        </ul>
      </AdminCard>
    </div>
  );
}
