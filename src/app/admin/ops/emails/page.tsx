import { AdminCard, Badge, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import {
  EMAIL_CATEGORY_LABEL,
  EMAIL_CATEGORY_ORDER,
  SNAPSHOT_EMAIL_REFS,
  getEmailLinkingStatus,
} from '@/lib/ops/email-services-data';

import EmailsClient from './EmailsClient';

// /admin/ops/emails — Email Intelligence preview + local-only references.
//
// This page stays a preview for any database-backed email linking: no
// inbox is read, no email is sent, and no email body is stored. The
// browser-local references workspace (EmailsClient) lets operators file
// metadata-only references in this browser until the database is
// connected. Those references never leave the operator's device.

export const dynamic = 'force-dynamic';

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
            Current state: <span className="text-[#f5f5f5]">{status}</span> · A browser-local
            references workspace is available below.
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

      {/* Local-only references workspace (browser-only CRUD) */}
      <EmailsClient snapshotRefs={SNAPSHOT_EMAIL_REFS} />

      {/* Safety */}
      <AdminCard title="What this page never does">
        <ul className="space-y-2 text-xs text-[#a1a1aa] leading-relaxed">
          <li>· Never reads your inbox.</li>
          <li>· Never sends any email.</li>
          <li>· Never archives, deletes, or labels any email.</li>
          <li>· Never stores the email body.</li>
          <li>· Never shows secrets or message contents.</li>
          <li>· Never connects to Gmail or Outlook without an explicit, separately approved phase.</li>
        </ul>
      </AdminCard>
    </div>
  );
}
