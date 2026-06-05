// Status dot primitive — small colored circle for inline status indicators.
// Mirrors StatusPill's tone vocabulary so a future helper can map between
// connected/ok → ok, partial/running → warn, not_connected/failed → risk,
// skipped → neutral.

type Tone = 'ok' | 'warn' | 'risk' | 'neutral';
type Size = 'sm' | 'md';

export function StatusDot({
  tone = 'ok',
  size = 'sm',
}: {
  tone?: Tone;
  size?: Size;
}) {
  const bg: Record<Tone, string> = {
    ok: 'bg-emerald-400',
    warn: 'bg-amber-400',
    risk: 'bg-rose-400',
    neutral: 'bg-zinc-500',
  };
  const dim: Record<Size, string> = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
  };
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${dim[size]} ${bg[tone]}`}
    />
  );
}
