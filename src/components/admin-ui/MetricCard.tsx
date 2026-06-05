// Glass metric tile primitive — small KPI block used across /admin/ops
// dashboards. Pure presentational; safe to use in server and client trees.
//
// Tone tints a small left accent bar (good/warn/risk). Neutral renders no
// accent. Values use tabular-nums so columns of metric tiles align cleanly.

import type { ReactNode } from 'react';

type Tone = 'neutral' | 'good' | 'warn' | 'risk';

export function MetricCard({
  title,
  value,
  hint,
  icon,
  tone = 'neutral',
}: {
  title: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
}) {
  const accent: Record<Tone, string> = {
    neutral: '',
    good: 'border-l-2 border-l-emerald-400',
    warn: 'border-l-2 border-l-amber-400',
    risk: 'border-l-2 border-l-rose-400',
  };
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 ${accent[tone]}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-zinc-500">{icon}</span>}
        <span className="text-xs font-medium text-zinc-500">{title}</span>
      </div>
      <p className="text-2xl font-semibold text-white tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
