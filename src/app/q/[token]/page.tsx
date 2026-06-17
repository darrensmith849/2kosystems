import { notFound } from 'next/navigation';
import { isQuestionnaireUnlocked } from '@/lib/questionnaire-auth';
import { isDbConfigured } from '@/lib/db/client';
import {
  getQuestionnaireByToken,
  markQuestionnaireOpened,
} from '@/lib/ops/questionnaires-service';
import QuestionnaireGate from './QuestionnaireGate';
import QuestionnaireForm from './QuestionnaireForm';

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-card)]">
      <h1 className="text-lg font-semibold text-[var(--color-fg)]">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">{body}</p>
      <p className="mt-5 text-xs text-[var(--color-fg-meta)]">
        Questions? Email{' '}
        <a href="mailto:darren@2ko.co.za" className="text-[var(--accent)] hover:text-[var(--accent2)]">
          darren@2ko.co.za
        </a>
        .
      </p>
    </div>
  );
}

export default async function QuestionnaireTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Gate first — never reveal whether a token is valid until the password is
  // entered. A locked visitor always just sees the password form.
  const unlocked = await isQuestionnaireUnlocked();
  if (!unlocked) {
    return <QuestionnaireGate />;
  }

  if (!isDbConfigured()) {
    return (
      <Notice
        title="Not available right now"
        body="This onboarding form isn't connected to its database yet. Please try again shortly or contact us."
      />
    );
  }

  const questionnaire = await getQuestionnaireByToken(token);
  if (!questionnaire) notFound();

  if (questionnaire.status === 'revoked') {
    return (
      <Notice
        title="This link is no longer active"
        body="The onboarding link has been revoked. If you think this is a mistake, please get in touch and we'll send you a fresh one."
      />
    );
  }

  const expired =
    questionnaire.status === 'expired' ||
    (questionnaire.expiresAt ? questionnaire.expiresAt.getTime() < Date.now() : false);
  if (expired) {
    return (
      <Notice
        title="This link has expired"
        body="For security, onboarding links expire after a while. Contact us and we'll send you a new one."
      />
    );
  }

  if (questionnaire.status === 'submitted') {
    return (
      <div className="space-y-5">
        <Notice
          title="Thank you — we've got everything"
          body="This questionnaire has already been completed and your Service Level Agreement has been emailed to you. There's nothing more to do."
        />
        <div className="text-center">
          <a
            href={`/api/q/${token}/sla`}
            className="inline-flex items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--tint-accent-medium)]"
          >
            Download your SLA again
          </a>
        </div>
      </div>
    );
  }

  // First open flips the status so the operator can see it was viewed.
  await markQuestionnaireOpened(questionnaire.id, questionnaire.status);

  return (
    <QuestionnaireForm
      token={token}
      clientName={questionnaire.clientName}
      priceAmount={questionnaire.priceAmount}
      currency={questionnaire.currency}
      paymentTerms={questionnaire.paymentTerms}
    />
  );
}
