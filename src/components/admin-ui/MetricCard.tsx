// Glass metric tile primitive — small KPI block used across /admin/ops
// dashboards. Pure presentational; safe to use in server and client trees.
//
// Tone tints a small left accent bar (good/warn/risk). Neutral renders no
// accent. Values use tabular-nums so columns of metric tiles align cleanly.
// When sparklineSeed is set, a small inline sparkline renders below the hint
// to suggest a trend even before live metrics are wired.

import type { ReactNode } from 'react';
import { Sparkline, type SparklineTone } from './Sparkline';

type Tone = 'neutral' | 'good' | 'warn' | 'risk';

export function MetricCard({
  title,
  value,
  hint,
  icon,
  tone = 'neutral',
  sparklineSeed,
  sparklineTone,
}: {
  title: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  sparklineSeed?: string;
  sparklineTone?: SparklineTone;
}) {
  const accent: Record<Tone, string> = {
    neutral: '',
    good: 'border-l-2 border-l-emerald-500 dark:border-l-emerald-400',
    warn: 'border-l-2 border-l-amber-500 dark:border-l-amber-400',
    risk: 'border-l-2 border-l-rose-500 dark:border-l-rose-400',
  };
  const effectiveSparkTone: SparklineTone =
    sparklineTone ??
    (tone === 'good' ? 'good' : tone === 'warn' ? 'warn' : tone === 'risk' ? 'risk' : 'neutral');
  return (
    <div
      className={`rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4 transition-colors ${accent[tone]}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-zinc-700 dark:text-zinc-500">{icon}</span>}
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-500">{title}</span>
      </div>
      <p className="text-2xl font-semibold text-zinc-900 dark:text-white tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-500">{hint}</p>}
      {sparklineSeed && (
        <div className="mt-2 -mx-1">
          <Sparkline seed={sparklineSeed} tone={effectiveSparkTone} className="h-5 w-full" />
        </div>
      )}
    </div>
  );
}
