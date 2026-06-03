import { listFindings } from '@/lib/ops/findings-service';
import { SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../NotConnectedBanner';
import AuditsClient from './AuditsClient';

export default async function AuditsPage() {
  const findings = await listFindings();
  return (
    <>
      <SectionHeader
        title="Audits"
        subtitle="Known operational issues, seeded from the infra-handover discovery. Resolve, acknowledge, or wontfix as you triage."
      />
      <NotConnectedBanner />
      <AuditsClient findings={findings} />
    </>
  );
}
