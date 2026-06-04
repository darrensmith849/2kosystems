import { AdminCard, Badge, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { CONTACT_ROLE_LABEL, SNAPSHOT_CONTACTS } from '@/lib/ops/email-services-data';

// /admin/ops/contacts — placeholder foundation.
//
// Read-only preview. Lists the contact roles the dashboard expects to track
// (client owner, billing contact, technical contact, etc.) without committing
// real personal details. The live table fills in once the database is
// connected and an operator enters real rows.

export const dynamic = 'force-dynamic';

const FUTURE_FIELDS: string[] = [
  'Name',
  'Organisation',
  'Role',
  'Email',
  'Phone',
  'Contact type',
  'Linked client',
  'Linked asset',
  'Notes',
];

export default function ContactsPage() {
  const snapshot = isSnapshotMode();

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Contacts"
        subtitle="People we deal with — client owners, billing contacts, supplier support, internal owners."
      />
      {snapshot && <SnapshotBanner area="Contacts" />}

      {/* Status */}
      <AdminCard title="Status">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge text="Contacts — not active yet" tone="amber" />
            <Badge text="Database required" tone="blue" />
            <Badge text="No private details stored" tone="green" />
          </div>
          <p className="text-sm text-[#e4e4e7] leading-relaxed">
            Contacts is a planned foundation. The dashboard expects to track who owns each
            client, who pays each supplier, who approves change requests, and who to call when
            an asset goes down. Real contact rows arrive once the database is connected — the
            preview below uses generic placeholders only.
          </p>
        </div>
      </AdminCard>

      {/* Role catalogue */}
      <AdminCard title="Roles tracked">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(Object.keys(CONTACT_ROLE_LABEL) as Array<keyof typeof CONTACT_ROLE_LABEL>).map((k) => (
            <li
              key={k}
              className="flex items-center gap-2 rounded-xl border border-[#1c1c1e] bg-[#0e0e10] px-3 py-2 text-sm text-[#e4e4e7]"
            >
              <span aria-hidden className="text-[#52525b]">·</span>
              {CONTACT_ROLE_LABEL[k]}
            </li>
          ))}
        </ul>
      </AdminCard>

      {/* Placeholder rows */}
      <AdminCard title="Preview rows">
        <p className="mb-4 text-xs text-[#a1a1aa] leading-relaxed">
          Placeholder entries — these show what each role looks like. No real personal email
          addresses or phone numbers are stored here.
        </p>
        <ul className="space-y-2">
          {SNAPSHOT_CONTACTS.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-[#1c1c1e] bg-[#0e0e10] p-3"
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-sm font-medium text-[#f5f5f5]">{c.name}</p>
                <Badge text={CONTACT_ROLE_LABEL[c.role]} tone="blue" />
                <Badge text="placeholder" tone="neutral" />
              </div>
              <p className="text-xs text-[#a1a1aa]">{c.organisation}</p>
              <p className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">{c.notes}</p>
            </li>
          ))}
        </ul>
      </AdminCard>

      {/* Future fields */}
      <AdminCard title="Future fields">
        <p className="mb-3 text-xs text-[#a1a1aa] leading-relaxed">
          Live contacts will store the following fields. Editing activates after the database is
          connected.
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FUTURE_FIELDS.map((f) => (
            <li
              key={f}
              className="rounded-md border border-[#1c1c1e] bg-[#0e0e10] px-2 py-1.5 text-xs text-[#a1a1aa]"
            >
              {f}
            </li>
          ))}
        </ul>
      </AdminCard>

      {/* Safety */}
      <AdminCard title="What this page never does">
        <ul className="space-y-2 text-xs text-[#a1a1aa] leading-relaxed">
          <li>· No real personal email addresses or phone numbers are committed to the repo.</li>
          <li>· No contact rows can be edited until the database is connected.</li>
          <li>· No emails are sent to contacts from this page.</li>
          <li>· No external CRM is connected.</li>
        </ul>
      </AdminCard>
    </div>
  );
}
