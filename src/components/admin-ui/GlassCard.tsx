// GlassCard — richer composition of AdminCard's glass surface. Use when a
// card needs an action slot on the right (typically a "View →" Link) and/or
// a footer row beneath the body. Visual contract matches AdminCard so the
// two can sit side-by-side without breaking the cascade.

import type { ReactNode } from 'react';

export function GlassCard({
  title,
  action,
  children,
  footer,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-zinc-100">{title}</p>
        {action}
      </div>
      {children}
      {footer && (
        <div className="mt-4 border-t border-white/[0.04] pt-3">{footer}</div>
      )}
    </div>
  );
}
