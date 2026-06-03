// Shared admin-UI primitives, promoted from /admin/agent/components/ui.tsx so
// /admin/ops can reuse them without importing into a sibling route group.
// Visual contract MUST stay identical to the existing /admin/agent primitives.

'use client';

export function AdminCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex gap-3 py-1.5 border-b border-[#1c1c1e] last:border-0">
      <span className="w-40 shrink-0 text-xs text-[#71717a]">{label}</span>
      <span className="text-xs text-[#f5f5f5] flex-1 break-words">{value}</span>
    </div>
  );
}

export function Badge({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'green' | 'amber' | 'rose' | 'blue' }) {
  const palette: Record<typeof tone, string> = {
    neutral: 'text-[#a1a1aa] border-[#27272a]',
    green: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/5',
    amber: 'text-amber-300 border-amber-400/30 bg-amber-400/5',
    rose: 'text-rose-300 border-rose-400/30 bg-rose-400/5',
    blue: 'text-sky-300 border-sky-400/30 bg-sky-400/5',
  };
  return (
    <span className={`inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${palette[tone]}`}>
      {text}
    </span>
  );
}

export function StatusPill({
  status,
}: {
  status: 'connected' | 'not_connected' | 'unknown' | 'ok' | 'partial' | 'failed' | 'skipped' | 'running';
}) {
  switch (status) {
    case 'connected':
    case 'ok':
      return <Badge text={status} tone="green" />;
    case 'partial':
    case 'running':
      return <Badge text={status} tone="amber" />;
    case 'not_connected':
    case 'failed':
      return <Badge text={status.replace('_', ' ')} tone="rose" />;
    case 'skipped':
      return <Badge text={status} tone="blue" />;
    default:
      return <Badge text={status} />;
  }
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#27272a] bg-[#0a0a0b] p-10 text-center">
      <p className="text-sm text-[#a1a1aa]">{title}</p>
      {hint && <p className="mt-2 text-xs text-[#52525b] max-w-md mx-auto">{hint}</p>}
      {action && <div className="mt-4 inline-flex">{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="text-base font-semibold text-[#f5f5f5]">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-[#71717a]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function DataTable<T extends { id: string | number }>({
  rows,
  columns,
  empty,
}: {
  rows: T[];
  columns: Array<{ key: string; header: string; render: (row: T) => React.ReactNode; className?: string }>;
  empty?: React.ReactNode;
}) {
  if (rows.length === 0) {
    return <>{empty ?? <EmptyState title="No rows yet" />}</>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#27272a] bg-[#111113]">
      <table className="min-w-full text-left text-xs">
        <thead className="border-b border-[#1c1c1e]">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-[#71717a] ${c.className ?? ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-[#1c1c1e] last:border-0 hover:bg-[#0a0a0b]/60 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-top text-[#e4e4e7] ${c.className ?? ''}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
