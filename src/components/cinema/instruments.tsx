import type { ReactNode } from "react";

/**
 * Instrument library.
 *
 * Every readout on the site is built from these. They are abstracted panels,
 * not screenshots, and every figure is illustrative — nothing here is any
 * client's data. Server components throughout: all motion is CSS, so none of
 * this costs the browser any JavaScript.
 */

/* ─────────── Shell ─────────── */

export function Panel({
  label,
  meta,
  children,
  className = "",
  float,
}: {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  float?: "on" | "slow";
}) {
  const drift =
    float === "on" ? " k-card--float" : float === "slow" ? " k-card--float-slow" : "";
  return (
    <div className={`k-card${drift} ${className}`.trim()}>
      <div className="flex h-[18px] items-center justify-between gap-4">
        <span className="k-mono">{label}</span>
        {meta ? <span className="k-mono">{meta}</span> : <span className="k-dot" />}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Readout({
  value,
  unit,
  delta,
  tone = "neutral",
}: {
  value: string;
  unit?: string;
  delta?: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const colour =
    tone === "good" ? "var(--signal)" : tone === "warn" ? "var(--ember)" : "var(--warm)";
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="k-num text-[26px] leading-none" style={{ color: colour }}>
        {value}
      </span>
      {unit && <span className="k-mono">{unit}</span>}
      {delta && (
        <span className="k-mono" style={{ color: "var(--signal)" }}>
          {delta}
        </span>
      )}
    </div>
  );
}

/* ─────────── Charts ─────────── */

export function Sparkline({
  points,
  tone = "signal",
  height = 44,
}: {
  points: number[];
  tone?: "signal" | "ember";
  height?: number;
}) {
  const w = 200;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const stroke = tone === "ember" ? "var(--ember)" : "var(--signal)";

  const coords = points.map((p, i) => [
    (i / (points.length - 1)) * w,
    height - ((p - min) / span) * (height - 6) - 3,
  ]);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${height} L0,${height} Z`;
  const id = `spark-${tone}-${points.length}-${Math.round(points[0])}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.30" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="2.6"
        fill={stroke}
      />
    </svg>
  );
}

export function BarSeries({
  values,
  highlightFrom,
  height = 40,
}: {
  values: number[];
  /** Index from which bars switch to the accent colour. */
  highlightFrom?: number;
  height?: number;
}) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {values.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-[1px]"
          style={{
            height: `${(v / max) * 100}%`,
            background:
              highlightFrom !== undefined && i >= highlightFrom
                ? "var(--signal)"
                : "rgba(244,241,234,0.24)",
          }}
        />
      ))}
    </div>
  );
}

export function Gauge({
  value,
  max = 100,
  label,
  suffix = "%",
}: {
  value: number;
  max?: number;
  label: string;
  suffix?: string;
}) {
  const r = 46;
  const circumference = Math.PI * r; // semicircle
  const fraction = Math.min(value / max, 1);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 68" className="w-full max-w-[168px]" aria-hidden="true">
        <path
          d={`M 14 60 A ${r} ${r} 0 0 1 106 60`}
          fill="none"
          stroke="rgba(244,241,234,0.14)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d={`M 14 60 A ${r} ${r} 0 0 1 106 60`}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
        <text
          x="60"
          y="54"
          textAnchor="middle"
          fill="var(--warm)"
          style={{ font: "600 24px var(--font)", letterSpacing: "-0.03em" }}
        >
          {value}
          {suffix}
        </text>
      </svg>
      <span className="k-mono mt-2">{label}</span>
    </div>
  );
}

export function StatusGrid({
  count = 30,
  incidents = [],
}: {
  count?: number;
  /** Indices to mark as degraded. */
  incidents?: number[];
}) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="h-5 flex-1 rounded-[1px]"
          style={{
            background: incidents.includes(i)
              ? "var(--ember)"
              : "rgba(78,201,124,0.50)",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────── Lists and feeds ─────────── */

export function QueueRows({
  rows,
}: {
  rows: { label: string; value: string; tone?: "good" | "warn" | "neutral" }[];
}) {
  return (
    <dl className="flex flex-col">
      {rows.map((row) => (
        <div key={row.label} className="flex h-[24px] items-center justify-between gap-4">
          <dt className="text-[12px] text-[var(--warm-70)]">{row.label}</dt>
          <dd
            className="k-num text-[13px]"
            style={{
              color:
                row.tone === "good"
                  ? "var(--signal)"
                  : row.tone === "warn"
                    ? "var(--ember)"
                    : "var(--warm)",
            }}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function EventFeed({ lines }: { lines: { time: string; text: string; tone?: "good" | "warn" }[] }) {
  return (
    <ul className="flex flex-col gap-1.5 font-[var(--mono)]">
      {lines.map((line, i) => (
        <li
          key={i}
          className="k-feed-line flex gap-2.5 text-[11.5px] leading-[1.5]"
          style={{ animationDelay: `${i * 160}ms` }}
        >
          <span style={{ color: "var(--warm-45)" }} className="tabular-nums">
            {line.time}
          </span>
          <span
            style={{
              color:
                line.tone === "good"
                  ? "var(--signal)"
                  : line.tone === "warn"
                    ? "var(--ember)"
                    : "var(--warm-70)",
            }}
          >
            {line.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "neutral" }) {
  const colour =
    tone === "good" ? "var(--signal)" : tone === "warn" ? "var(--ember)" : "var(--warm-70)";
  return (
    <span
      className="k-mono inline-flex h-[22px] items-center gap-1.5 rounded-md px-2"
      style={{ border: `1px solid ${colour}`, color: colour }}
    >
      {children}
    </span>
  );
}

/* ─────────── Flow ─────────── */

export function PipelineFlow({
  stages,
}: {
  stages: { name: string; meta?: string }[];
}) {
  return (
    <div className="k-pipeline flex flex-col gap-0 lg:flex-row lg:items-stretch">
      {stages.map((stage, i) => (
        <div key={stage.name} className="flex flex-1 items-center gap-0">
          <div className="k-node flex-1">
            <span className="k-mono">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-2 text-[14px] font-semibold tracking-[-0.015em]">{stage.name}</p>
            {stage.meta && <p className="k-mono mt-1.5">{stage.meta}</p>}
          </div>
          {i < stages.length - 1 && (
            <div className="k-connector" aria-hidden="true">
              <span className="k-token" style={{ animationDelay: `${i * 900}ms` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function RoleMatrix({
  roles,
  capabilities,
  grants,
}: {
  roles: string[];
  capabilities: string[];
  /** grants[capabilityIndex][roleIndex] */
  grants: boolean[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left">
        <thead>
          <tr>
            <th className="k-mono pb-2 font-normal">Capability</th>
            {roles.map((role) => (
              <th key={role} className="k-mono pb-2 pl-4 text-right font-normal">
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {capabilities.map((capability, ci) => (
            <tr key={capability} style={{ borderTop: "1px solid var(--hair)" }}>
              <td className="h-[28px] text-[12.5px] text-[var(--warm-70)]">{capability}</td>
              {roles.map((role, ri) => (
                <td key={role} className="h-[28px] pl-4 text-right">
                  {grants[ci]?.[ri] ? (
                    <span style={{ color: "var(--signal)" }}>●</span>
                  ) : (
                    <span style={{ color: "var(--warm-25)" }}>○</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConfidenceBars({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] text-[var(--warm-70)]">{item.label}</span>
            <span className="k-mono tabular-nums">{item.value}%</span>
          </div>
          <div className="mt-1 h-[3px] w-full rounded-full" style={{ background: "rgba(244,241,234,0.12)" }}>
            <div
              className="h-[3px] rounded-full"
              style={{
                width: `${item.value}%`,
                background: item.value > 90 ? "var(--signal)" : "var(--ember)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
