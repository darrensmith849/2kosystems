// Shared admin-UI primitives, promoted from /admin/agent/components/ui.tsx so
// /admin/ops can reuse them without importing into a sibling route group.
// Visual contract MUST stay identical to the existing /admin/agent primitives.

'use client';

export { MetricCard } from './MetricCard';
export { StatusDot } from './StatusDot';
export { GlassCard } from './GlassCard';
export { Sparkline, type SparklineTone } from './Sparkline';
export { Tile, type TileStatus, type TileProps } from './Tile';
export { ThemeProvider, ThemeToggle, useTheme, type Theme, type ThemePref } from './theme';

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
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02] p-5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex gap-3 py-1.5 border-b border-zinc-100 dark:border-white/[0.04] last:border-0">
      <span className="w-40 shrink-0 text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-900 dark:text-zinc-100 flex-1 break-words">{value}</span>
    </div>
  );
}

export function Badge({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'green' | 'amber' | 'rose' | 'blue' }) {
  const palette: Record<typeof tone, string> = {
    neutral: 'text-zinc-700 border-zinc-200 bg-zinc-100 dark:text-zinc-300 dark:border-white/[0.08] dark:bg-white/[0.03]',
    green: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]',
    amber: 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-300 dark:border-amber-400/20 dark:bg-amber-400/[0.06]',
    rose: 'text-rose-700 border-rose-200 bg-rose-50 dark:text-rose-300 dark:border-rose-400/20 dark:bg-rose-400/[0.06]',
    blue: 'text-sky-700 border-sky-200 bg-sky-50 dark:text-sky-300 dark:border-sky-400/20 dark:bg-sky-400/[0.06]',
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${palette[tone]}`}>
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
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white dark:border-white/[0.06] dark:bg-white/[0.02] p-10 text-center transition-colors">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{title}</p>
      {hint && <p className="mt-2 text-xs text-zinc-500 max-w-md mx-auto">{hint}</p>}
      {action && <div className="mt-4 inline-flex">{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
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
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02] transition-colors">
      <table className="min-w-full text-left text-xs">
        <thead className="border-b border-zinc-200 dark:border-white/[0.06]">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 text-xs font-medium text-zinc-500 ${c.className ?? ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-zinc-100 dark:border-white/[0.04] last:border-0 hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-top text-zinc-900 dark:text-zinc-100 ${c.className ?? ''}`}>
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
