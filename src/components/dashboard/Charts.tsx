/**
 * Charts for the internal dashboard, rendered as inline SVG on the server.
 *
 * No charting library on purpose. This page runs on a Worker and the datasets
 * are tens of points, not thousands — a client-side chart library would add
 * more bundle than the entire page and buy nothing. Server SVG also means the
 * numbers are present in the HTML, so the page is readable before any script
 * runs, and there is nothing to hydrate.
 */

export function Sparkline({
  values,
  width = 180,
  height = 40,
  tone = "var(--ember)",
}: {
  values: number[];
  width?: number;
  height?: number;
  tone?: string;
}) {
  if (values.length < 2) {
    return <div className="text-[12px] text-[var(--warm-45)]">not enough data</div>;
  }
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const y = (v: number) => height - (v / max) * (height - 4) - 2;
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="trend">
      <path d={area} fill={tone} opacity="0.12" />
      <path d={line} fill="none" stroke={tone} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Horizontal bars. Used where the label matters as much as the value — top
 * queries, leads per site — which a sparkline cannot show.
 */
export function BarList({
  rows,
  format = (n: number) => n.toLocaleString("en-ZA"),
  tone = "var(--ember)",
  sub,
}: {
  rows: { label: string; value: number }[];
  format?: (n: number) => string;
  tone?: string;
  sub?: (row: { label: string; value: number }, i: number) => string;
}) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-[var(--warm-45)]">Nothing to show yet.</p>;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={`${r.label}-${i}`}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="truncate text-[13px] text-[var(--warm-70)]" title={r.label}>
              {r.label}
            </span>
            <span className="shrink-0 text-[13px] tabular-nums">{format(r.value)}</span>
          </div>
          <div className="mt-1 h-[5px] w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max((r.value / max) * 100, 1.5)}%`, background: tone }}
            />
          </div>
          {sub && <div className="mt-1 text-[11px] text-[var(--warm-45)]">{sub(r, i)}</div>}
        </li>
      ))}
    </ul>
  );
}

/** A headline number with an optional trend and sparkline underneath. */
export function StatCard({
  label,
  value,
  delta,
  spark,
  tone = "var(--ember)",
}: {
  label: string;
  value: string;
  delta?: { label: string; positive: boolean } | null;
  spark?: number[];
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--warm-45)]">{label}</div>
        {delta && (
          <div className={`text-[12px] tabular-nums ${delta.positive ? "text-emerald-400" : "text-amber-400"}`}>
            {delta.label}
          </div>
        )}
      </div>
      <div className="mt-2 text-[30px] font-semibold leading-none tabular-nums">{value}</div>
      {spark && spark.length > 1 && (
        <div className="mt-4">
          <Sparkline values={spark} tone={tone} width={240} height={36} />
        </div>
      )}
    </div>
  );
}

export function Panel({
  title,
  note,
  children,
  wide = false,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.02] p-6 ${wide ? "lg:col-span-2" : ""}`}>
      <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
      {note && <p className="mt-1 text-[12px] text-[var(--warm-45)]">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
