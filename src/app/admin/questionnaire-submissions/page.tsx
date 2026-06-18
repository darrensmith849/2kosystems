import type { Metadata } from 'next';
import Link from 'next/link';
import { isAdminAuthorised } from '@/lib/ops/auth';
import { isDbConfigured } from '@/lib/db/client';
import { listSubmissions } from '@/lib/ops/submissions-service';
import OpsLoginGate from '../ops/OpsLoginGate';

export const metadata: Metadata = {
  title: 'Questionnaire submissions',
  robots: { index: false, follow: false },
};

function money(amount: string | null, currency: string | null): string {
  if (!amount) return '—';
  const n = Number(amount);
  const cur = currency || '';
  if (Number.isNaN(n)) return `${cur} ${amount}`;
  return `${cur} ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function SubmissionsPage() {
  if (!(await isAdminAuthorised())) {
    return <OpsLoginGate />;
  }

  const connected = isDbConfigured();
  const rows = connected ? await listSubmissions() : [];

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 text-zinc-100">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Questionnaire submissions</h1>
          <p className="mt-1 text-sm text-zinc-400">Every job that has come in — on file for the team.</p>
        </div>
        <Link
          href="/admin/questionnaire-link"
          className="rounded-full border border-white/[0.1] px-3 py-1.5 text-xs text-zinc-300 hover:border-emerald-400/40 transition-colors"
        >
          + New link
        </Link>
      </div>

      {!connected ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-6">
          <p className="text-sm font-medium text-amber-200">No database connected yet</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            The questionnaire and emails work without a database. To store and track every submission here, connect a
            Postgres database: set <span className="font-mono text-zinc-100">DATABASE_URL</span> (and{' '}
            <span className="font-mono text-zinc-100">DATABASE_URL_DIRECT</span>) in the project, then run{' '}
            <span className="font-mono text-zinc-100">npm run db:migrate</span>. New submissions will appear here
            automatically from that point on.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-zinc-300">No submissions yet</p>
          <p className="mt-2 text-xs text-zinc-500">Once a client completes a questionnaire, it will show up here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400">{r.createdAt.toLocaleString('en-ZA')}</td>
                  <td className="px-4 py-3 text-zinc-100">{r.businessName}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    <div>{r.contactName}</div>
                    <div className="text-xs text-zinc-500">{r.contactEmail}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                    {money(r.priceAmount, r.currency)}
                    <div className="text-xs text-zinc-500">{r.paymentMethod === 'eft' ? 'Bank transfer' : 'Cash'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={r.emailSent ? 'text-emerald-400' : 'text-zinc-500'}>{r.emailSent ? 'Sent' : '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/questionnaire-submissions/${r.id}`} className="text-emerald-400 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {connected && rows.length > 0 && <p className="mt-3 text-xs text-zinc-500">{rows.length} submission{rows.length === 1 ? '' : 's'}</p>}
    </div>
  );
}
