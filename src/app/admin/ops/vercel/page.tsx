import { listStoredVercelProjects } from '@/lib/ops/vercel-service';
import { vercelConnectivity } from '@/lib/integrations/vercel';
import { SectionHeader } from '@/components/admin-ui';
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
      <VercelProjectsClient projects={projects} integrationStatus={conn} />
    </>
  );
}
