import { SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../NotConnectedBanner';
import { listQuestionnaires } from '@/lib/ops/questionnaires-service';
import { isDbConfigured } from '@/lib/db/client';
import QuestionnairesClient from './QuestionnairesClient';

export const metadata = { title: 'Questionnaires' };

export default async function QuestionnairesPage() {
  const rows = isDbConfigured() ? await listQuestionnaires() : [];
  return (
    <>
      <SectionHeader
        title="Client questionnaires"
        subtitle="Generate a private onboarding link for a client. They fill it in, sign, and an SLA is emailed automatically."
      />
      <NotConnectedBanner />
      <QuestionnairesClient initial={rows} />
    </>
  );
}
