import type { Metadata } from 'next';
import { isAdminAuthorised } from '@/lib/ops/auth';
import OpsLoginGate from '../ops/OpsLoginGate';
import LinkGeneratorClient from './LinkGeneratorClient';

export const metadata: Metadata = {
  title: 'Questionnaire link generator',
  robots: { index: false, follow: false },
};

export default async function QuestionnaireLinkPage() {
  if (!(await isAdminAuthorised())) {
    return <OpsLoginGate />;
  }
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <LinkGeneratorClient />
    </div>
  );
}
