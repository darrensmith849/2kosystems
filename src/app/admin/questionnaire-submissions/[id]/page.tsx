import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdminAuthorised } from '@/lib/ops/auth';
import { isDbConfigured } from '@/lib/db/client';
import { getSubmission } from '@/lib/ops/submissions-service';
import OpsLoginGate from '../../ops/OpsLoginGate';

export const metadata: Metadata = {
  title: 'Submission',
  robots: { index: false, follow: false },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex gap-4 border-b border-white/[0.04] py-2 last:border-0">
      <span className="w-44 shrink-0 text-xs text-zinc-500">{label}</span>
      <span className="flex-1 break-words text-sm text-zinc-100">{value}</span>
    </div>
  );
}

function money(amount: string | null, currency: string | null): string {
  if (!amount) return '—';
  const n = Number(amount);
  const cur = currency || '';
  if (Number.isNaN(n)) return `${cur} ${amount}`;
  return `${cur} ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthorised())) {
    return <OpsLoginGate />;
  }
  const { id } = await params;
  if (!isDbConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 text-zinc-100">
        <p className="text-sm text-zinc-400">No database connected.</p>
      </div>
    );
  }
  const s = await getSubmission(id);
  if (!s) notFound();

  const fileBase = `/api/admin/questionnaire-submissions/${s.id}/file`;
  const dl = 'rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/15 transition-colors';

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 text-zinc-100">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">{s.businessName}</h1>
        <Link
          href="/admin/questionnaire-submissions"
          className="rounded-full border border-white/[0.1] px-3 py-1.5 text-xs text-zinc-300 hover:border-emerald-400/40 transition-colors"
        >
          ← All submissions
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        {s.slaPdf && <a href={`${fileBase}?type=sla`} className={dl}>Download SLA</a>}
        {s.briefPdf && <a href={`${fileBase}?type=brief`} className={dl}>Download Project Brief</a>}
        {s.logoBase64 && <a href={`${fileBase}?type=logo`} className={dl}>Download logo</a>}
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">Contact</h2>
          <Row label="Business name" value={s.businessName} />
          <Row label="Contact person" value={s.contactName} />
          <Row label="Email" value={<a href={`mailto:${s.contactEmail}`} className="text-emerald-400 hover:underline">{s.contactEmail}</a>} />
          <Row label="Phone" value={s.contactPhone} />
          <Row label="Address" value={s.physicalAddress} />
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">The business</h2>
          <Row label="Mainly offers" value={s.businessType} />
          <Row label="Catalogue size" value={s.catalogueSize} />
          <Row label="Sells / provides" value={s.offering} />
          <Row label="About the business" value={s.businessAim} />
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">Website</h2>
          <Row label="Existing website" value={s.hasExistingWebsite ? s.existingWebsiteUrl || 'Yes' : 'No / not yet'} />
          <Row label="What they want" value={s.siteGoals} />
          <Row label="Notes" value={s.notes} />
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">Commercials</h2>
          <Row label="Project fee" value={money(s.priceAmount, s.currency)} />
          <Row label="Payment terms" value={s.paymentTerms} />
          <Row label="Payment method" value={s.paymentMethod === 'eft' ? 'Bank transfer (EFT)' : 'Cash'} />
          <Row label="Preferred start" value={s.startDate} />
          <Row label="Expected completion" value={s.finishDate} />
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">Signed</h2>
          <Row label="Name" value={s.signedName} />
          <Row label="ID / passport" value={s.signedIdNumber} />
          <Row label="Signed at" value={s.signedAt ? s.signedAt.toLocaleString('en-ZA') : '—'} />
          <Row label="IP" value={s.signedIp} />
          <Row label="SLA emailed" value={s.emailSent ? 'Yes' : 'No'} />
          <Row label="Received" value={s.createdAt.toLocaleString('en-ZA')} />
          {s.logoBase64 && s.logoContentType && (
            <Row
              label="Logo"
              value={
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:${s.logoContentType};base64,${s.logoBase64}`}
                  alt={`${s.businessName} logo`}
                  className="max-h-16 w-auto rounded bg-white p-1"
                />
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
