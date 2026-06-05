// Small server-component primitive used by the Ops Command Centre to render
// a navigable tile. Wraps AdminCard with an accent border + a Link-titled
// header and a description line. No 'use client' on purpose — this stays a
// server component so it can be rendered inside RSC pages without bumping
// them across the boundary.

import Link from 'next/link';
import { AdminCard } from './index';

type Accent = 'emerald' | 'amber' | 'sky' | 'neutral';

const ACCENT_RING: Record<Accent, string> = {
  emerald: 'ring-1 ring-emerald-400/20',
  amber: 'ring-1 ring-amber-400/20',
  sky: 'ring-1 ring-sky-400/20',
  neutral: 'ring-1 ring-[#27272a]',
};

const ACCENT_TITLE: Record<Accent, string> = {
  emerald: 'text-emerald-300 hover:text-emerald-200',
  amber: 'text-amber-300 hover:text-amber-200',
  sky: 'text-sky-300 hover:text-sky-200',
  neutral: 'text-zinc-900 dark:text-[#f5f5f5] hover:text-white',
};

export default function QuickActionTile({
  href,
  title,
  description,
  accent = 'neutral',
}: {
  href: string;
  title: string;
  description: string;
  accent?: Accent;
}) {
  return (
    <div className={`rounded-2xl ${ACCENT_RING[accent]}`}>
      <AdminCard title="Quick action">
        <Link
          href={href}
          className={`text-sm font-semibold tracking-tight transition-colors ${ACCENT_TITLE[accent]}`}
        >
          {title}
        </Link>
        <p className="mt-2 text-xs text-zinc-700 dark:text-[#a1a1aa] leading-relaxed">{description}</p>
      </AdminCard>
    </div>
  );
}
