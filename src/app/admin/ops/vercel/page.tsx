import { listStoredVercelProjects } from '@/lib/ops/vercel-service';
import { vercelConnectivity } from '@/lib/integrations/vercel';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { SNAPSHOT_VERCEL_PROJECTS } from '@/lib/ops/ops-snapshot-data';
import VercelProjectsClient from './VercelProjectsClient';

export default async function VercelProjectsPage() {
  const snapshot = isSnapshotMode();
  const projects = snapshot ? SNAPSHOT_VERCEL_PROJECTS : await listStoredVercelProjects();
  const conn = vercelConnectivity();
  return (
    <>
      <SectionHeader
        title="Vercel projects"
        subtitle="Both teams (pumpbots-projects + impart-global) are tracked. Use the state filter to drive ongoing Vercel decom."
      />
      {snapshot ? (
        <SnapshotBanner area="The Vercel project list" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="Vercel projects"
            whatYouWillSee={[
              'Projects across both teams: pumpbots-projects and impart-global',
              'State classification: live / dormant / archived',
              'Linked Git repo and latest deployment per project',
            ]}
          />
        </>
      )}
      <VercelProjectsClient projects={projects} integrationStatus={conn} />
    </>
  );
}
