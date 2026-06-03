// Server component. Static documentation card explaining the topological order
// in which snapshot-import.ts walks the discovery snapshot. Surfaced on the
// /admin/ops/review page so operators can see — at a glance — why review
// decisions and token sync gate the import of downstream tables.

import { AdminCard } from '@/components/admin-ui';

type DependencyRow = {
  step: number;
  label: string;
  note: string;
  noteTone: 'immediate' | 'review' | 'token' | 'live';
};

const ROWS: DependencyRow[] = [
  {
    step: 1,
    label: 'Divisions',
    note: 'no dependencies — imports immediately',
    noteTone: 'immediate',
  },
  {
    step: 2,
    label: 'Clients',
    note: 'depends on divisions — imports immediately',
    noteTone: 'immediate',
  },
  {
    step: 3,
    label: 'Assets',
    note: 'depends on clients — imports immediately',
    noteTone: 'immediate',
  },
  {
    step: 4,
    label: 'Repos / Vercel projects / Hetzner servers / domains',
    note: 'independent — needs token sync later',
    noteTone: 'token',
  },
  {
    step: 5,
    label: 'Tickets',
    note: 'may reference clients/assets — needs human review first',
    noteTone: 'review',
  },
  {
    step: 6,
    label: 'Renewals',
    note: 'may reference clients/assets/domains — needs human review first',
    noteTone: 'review',
  },
  {
    step: 7,
    label: 'Incidents',
    note: 'may reference clients/assets — needs human review first',
    noteTone: 'review',
  },
  {
    step: 8,
    label: 'Audit findings',
    note: 'independent — imports immediately',
    noteTone: 'immediate',
  },
  {
    step: 9,
    label: 'Review decisions to tickets',
    note: 'last — depends on all above — needs live sync to complete',
    noteTone: 'live',
  },
];

const NOTE_TONE_CLASS: Record<DependencyRow['noteTone'], string> = {
  immediate: 'text-emerald-300/90',
  review: 'text-amber-300/90',
  token: 'text-sky-300/90',
  live: 'text-[#a1a1aa]',
};

export default function ImportDependencyOrderCard() {
  return (
    <AdminCard title="Import dependency order">
      <ol className="space-y-2">
        {ROWS.map((row) => (
          <li
            key={row.step}
            className="flex items-start gap-3 rounded-lg border border-[#1c1c1e] bg-[#0a0a0b] px-3 py-2"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#27272a] font-mono text-[10px] text-[#a1a1aa]">
              {row.step}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#f5f5f5]">{row.label}</p>
              <p className={`mt-0.5 text-[11px] leading-relaxed ${NOTE_TONE_CLASS[row.noteTone]}`}>
                {row.note}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 pt-3 border-t border-[#1c1c1e] text-[11px] text-[#71717a] leading-relaxed">
        Phase A <code className="font-mono text-[10px] text-[#a1a1aa]">snapshot-import.ts</code> respects this order. Run preview before committing.
      </p>
    </AdminCard>
  );
}
