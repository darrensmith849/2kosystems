import { SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { isAiKeyConfigured } from '@/lib/ops/ops-assistant-context';
import AskClient from './AskClient';

export const metadata = {
  title: 'Ask — Ops Dashboard',
};

export default function AskPage() {
  const snapshot = isSnapshotMode();
  const hasAiKey = isAiKeyConfigured();
  return (
    <>
      <SectionHeader
        title="Ask"
        subtitle="Ground-truthed search assistant. Answers come from your dashboard data — no hallucinations, no external lookups. Snapshot Mode is clearly labelled."
      />
      {snapshot && <SnapshotBanner area="Ask answers" />}
      <AskClient hasAiKey={hasAiKey} />
    </>
  );
}
