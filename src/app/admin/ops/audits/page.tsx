import { listFindings } from '@/lib/ops/findings-service';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { SNAPSHOT_FINDINGS } from '@/lib/ops/ops-snapshot-data';
import AuditsClient from './AuditsClient';

export default async function AuditsPage() {
  const snapshot = isSnapshotMode();
  const findings = snapshot ? SNAPSHOT_FINDINGS : await listFindings();
  return (
    <>
      <SectionHeader
        title="Audits"
        subtitle="Known issues and reviews to triage."
      />
      {snapshot ? (
        <SnapshotBanner area="Audit findings" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="Audit findings"
            whatYouWillSee={[
              'Known operational issues seeded from infra-handover discovery',
              'Manual audit runs with severity classification',
              'Triage workflow: acknowledge, resolve, or wontfix',
            ]}
          />
        </>
      )}
      <AuditsClient findings={findings} isSnapshot={snapshot} />
    </>
  );
}
