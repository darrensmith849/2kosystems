'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Sparkline, type SparklineTone } from './Sparkline';
import { StatusDot } from './StatusDot';

export type TileStatus = 'ok' | 'warn' | 'risk' | 'neutral';

export type TileProps = {
  href: string;
  name: ReactNode;
  subtitle?: ReactNode;
  /** When set, renders an inline 60×18 sparkline derived from this seed. */
  sparklineSeed?: string;
  sparklineTone?: SparklineTone;
  /** Optional small metric number rendered between the sparkline and dot. */
  metric?: ReactNode;
  /** Optional status dot on the right. */
  status?: TileStatus;
  /** Optional leading icon component, rendered text-zinc-400. */
  icon?: ReactNode;
};

// Cloudflare-style account-home tile. Bold name on the left, single-line
// subtitle below, and any combination of sparkline + metric + status dot on
// the right. Click navigates to the detail route.
export function Tile({
  href,
  name,
  subtitle,
  sparklineSeed,
  sparklineTone = 'good',
  metric,
  status,
  icon,
}: TileProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:bg-zinc-50 hover:border-zinc-300 dark:hover:bg-white/[0.04] dark:hover:border-white/[0.10] transition-colors px-4 py-3.5 flex items-center justify-between gap-3"
    >
      <div className="min-w-0 flex-1 flex items-center gap-2.5">
        {icon && <span className="shrink-0 text-zinc-500 dark:text-zinc-400">{icon}</span>}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-black dark:group-hover:text-white">
            {name}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="shrink-0 inline-flex items-center gap-2">
        {sparklineSeed && <Sparkline seed={sparklineSeed} tone={sparklineTone} />}
        {metric !== undefined && metric !== null && (
          <span className="tabular-nums text-xs text-zinc-700 dark:text-zinc-300 min-w-[2ch] text-right">
            {metric}
          </span>
        )}
        {status && <StatusDot tone={status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : status === 'risk' ? 'risk' : 'neutral'} />}
      </div>
    </Link>
  );
}
