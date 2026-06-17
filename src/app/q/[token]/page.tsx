import { isQuestionnaireUnlocked } from '@/lib/questionnaire-auth';
import { verifyQuestionnaireLink } from '@/lib/questionnaire-link';
import { DEFAULT_PAYMENT_TERMS } from '@/lib/sla/template';
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

  // Gate first — never reveal anything until the password is entered.
  const unlocked = await isQuestionnaireUnlocked();
  if (!unlocked) {
    return <QuestionnaireGate />;
  }

  // The price/terms live (signed) inside the link itself — no database.
  const link = verifyQuestionnaireLink(token);
  if (!link) {
    return (
      <Notice
        title="This link isn't valid or has expired"
        body="The onboarding link couldn't be verified, or it has expired. Please get in touch and we'll send you a fresh one."
      />
    );
  }

  return (
    <QuestionnaireForm
      token={token}
      clientName={link.clientName}
      priceAmount={link.priceAmount}
      currency={link.currency}
      paymentTerms={DEFAULT_PAYMENT_TERMS}
    />
  );
}
