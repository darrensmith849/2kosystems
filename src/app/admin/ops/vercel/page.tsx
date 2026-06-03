import { listStoredVercelProjects } from '@/lib/ops/vercel-service';
import { vercelConnectivity } from '@/lib/integrations/vercel';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import NotConnectedBanner from '../NotConnectedBanner';
import VercelProjectsClient from './VercelProjectsClient';

export default async function VercelProjectsPage() {
  const projects = await listStoredVercelProjects();
  const conn = vercelConnectivity();
  return (
    <>
      <SectionHeader
        title="Vercel projects"
        subtitle="Both teams (pumpbots-projects + impart-global) are tracked. Use the state filter to drive ongoing Vercel decom."
      />
      <NotConnectedBanner />
      <WaitingForDb
        area="Vercel projects"
        whatYouWillSee={[
          'Projects across both teams: pumpbots-projects and impart-global',
          'State classification: live / dormant / archived',
          'Linked Git repo and latest deployment per project',
        ]}
      />
      <VercelProjectsClient projects={projects} integrationStatus={conn} />
    </>
  );
}
