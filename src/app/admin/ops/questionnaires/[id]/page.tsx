import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionHeader, AdminCard, Row, Badge, EmptyState } from '@/components/admin-ui';
import { isDbConfigured } from '@/lib/db/client';
import {
  getQuestionnaireById,
  getSubmissionForQuestionnaire,
} from '@/lib/ops/questionnaires-service';
import RevokeButton from './RevokeButton';

export const metadata = { title: 'Questionnaire' };

function formatMoney(amount: string, currency: string): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function QuestionnaireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isDbConfigured()) {
    return (
      <>
        <SectionHeader title="Questionnaire" subtitle="Database not connected." />
        <EmptyState title="Database not connected" hint="Set DATABASE_URL to view questionnaire submissions." />
      </>
    );
  }

  const questionnaire = await getQuestionnaireById(id);
  if (!questionnaire) notFound();
  const submission = await getSubmissionForQuestionnaire(id);

  return (
    <>
      <SectionHeader
        title={questionnaire.clientName}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <Badge text={questionnaire.status} tone={questionnaire.status === 'submitted' ? 'green' : 'blue'} />
            {formatMoney(questionnaire.priceAmount, questionnaire.currency)} · {questionnaire.paymentTerms}
          </span>
        }
        action={
          <Link
            href="/admin/ops/questionnaires"
            className="rounded-full border border-zinc-200 dark:border-white/[0.08] px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:border-emerald-400/40 transition-colors"
          >
            ← All questionnaires
          </Link>
        }
      />

      <div className="space-y-5">
        <AdminCard
          title="Link"
          action={
            questionnaire.status !== 'revoked' && questionnaire.status !== 'submitted' ? (
              <RevokeButton id={questionnaire.id} />
            ) : null
          }
        >
          <Row label="Token" value={<span className="break-all font-mono text-[11px]">/q/{questionnaire.token}</span>} />
          <Row label="Status" value={questionnaire.status} />
          <Row label="Price" value={formatMoney(questionnaire.priceAmount, questionnaire.currency)} />
          <Row label="Payment terms" value={questionnaire.paymentTerms} />
          <Row label="Created" value={questionnaire.createdAt.toLocaleString('en-ZA')} />
          {questionnaire.expiresAt && <Row label="Expires" value={questionnaire.expiresAt.toLocaleString('en-ZA')} />}
        </AdminCard>

        {submission ? (
          <AdminCard
            title="Submission"
            action={
              submission.slaPdf ? (
                <a
                  href={`/api/admin/ops/questionnaires/${questionnaire.id}/sla`}
                  className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-400/15 transition-colors"
                >
                  Download SLA
                </a>
              ) : null
            }
          >
            <Row label="Business name" value={submission.businessName} />
            <Row label="Contact" value={submission.contactName} />
            <Row label="Email" value={submission.contactEmail} />
            <Row label="Phone" value={submission.contactPhone ?? '—'} />
            <Row
              label="Existing website"
              value={submission.hasExistingWebsite ? submission.existingWebsiteUrl || 'Yes' : 'No'}
            />
            <Row label="Business aim" value={submission.businessAim ?? '—'} />
            <Row label="Website goals" value={submission.siteGoals ?? '—'} />
            <Row label="Notes" value={submission.notes ?? '—'} />
            <Row label="Payment method" value={submission.paymentMethod === 'eft' ? 'Bank transfer (EFT)' : 'Cash'} />
            <Row label="Signed by" value={submission.signedName} />
            <Row label="Signed at" value={submission.signedAt.toLocaleString('en-ZA')} />
            <Row label="Signed IP" value={submission.signedIp ?? '—'} />
            <Row label="SLA emailed" value={submission.emailSentAt ? submission.emailSentAt.toLocaleString('en-ZA') : 'Not sent'} />
            {submission.logoBase64 && submission.logoContentType && (
              <Row
                label="Logo"
                value={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`data:${submission.logoContentType};base64,${submission.logoBase64}`}
                    alt={`${submission.businessName} logo`}
                    className="max-h-16 w-auto rounded bg-white p-1"
                  />
                }
              />
            )}
          </AdminCard>
        ) : (
          <EmptyState title="Not submitted yet" hint="The client hasn't completed and sent this questionnaire." />
        )}
      </div>
    </>
  );
}
