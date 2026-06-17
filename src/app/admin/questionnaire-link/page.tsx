import type { Metadata } from 'next';
import { isQuestionnaireUnlocked } from '@/lib/questionnaire-auth';
import QuestionnaireGate from '../../q/[token]/QuestionnaireGate';
import LinkGeneratorClient from './LinkGeneratorClient';

export const metadata: Metadata = {
  title: 'Questionnaire link generator',
  robots: { index: false, follow: false },
};

// Gated by the same shared password as the client form (systems123!) so there
// is ONE password to remember. The generator URL itself is the secret that
// keeps it operator-only.
export default async function QuestionnaireLinkPage() {
  if (!(await isQuestionnaireUnlocked())) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <QuestionnaireGate />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <LinkGeneratorClient />
    </div>
  );
}
