"use client";

import React from "react";

/**
 * WorkflowBlueprint — flagship animated diagram for the How We Work page.
 *
 * A premium five-stage operational blueprint:
 *   Audit → Scope → Prototype → Build → Optimise
 *
 * Each stage is a glass node with a sub-status hint. Stages are connected
 * by an animated dashed flow line; three glowing accent tokens travel
 * along the path on staggered delays. A subtle blueprint grid drifts
 * underneath, and a faint horizontal scan line passes top-to-bottom.
 *
 * Pure SVG + CSS. No JS animation loop, no external libs.
 */

const STAGES = [
  {
    label: "Audit",
    note: "Map the bottleneck",
    cx: 100,
    cy: 200,
  },
  {
    label: "Scope",
    note: "Define the wedge",
    cx: 320,
    cy: 130,
  },
  {
    label: "Prototype",
    note: "Show the future state",
    cx: 540,
    cy: 220,
  },
  {
    label: "Build",
    note: "Production-ready",
    cx: 760,
    cy: 130,
  },
  {
    label: "Optimise",
    note: "Refine and extend",
    cx: 980,
    cy: 200,
  },
];

// Path connecting all 5 nodes — gentle curves between them.
const FLOW_PATH =
  "M 100 200 Q 200 150 320 130 Q 420 110 540 220 Q 660 320 760 130 Q 870 60 980 200";

export default function WorkflowBlueprint() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{ boxShadow: "var(--shadow-popover)" }}
    >
      {/* Drifting blueprint grid */}
      <div className="blueprint-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Soft accent radial */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(640px 320px at 50% 50%, rgba(15,123,58,0.16) 0%, transparent 70%)",
        }}
      />

      {/* Slow horizontal scan */}
      <div
        className="blueprint-scan pointer-events-none absolute left-0 right-0 h-24"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(15,123,58,0.10) 50%, transparent 100%)",
        }}
      />

      <div className="relative px-6 py-10 md:px-10 md:py-12">
        <div className="mb-8 max-w-2xl">
          <p
            className="text-[12px] font-medium uppercase text-[var(--accent)]"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            Engagement blueprint
          </p>
          <h3
            className="mt-2 font-semibold text-[var(--color-fg)]"
            style={{
              fontSize: "var(--text-display-md)",
              letterSpacing: "var(--tracking-display)",
              lineHeight: 1.1,
            }}
          >
            Audit → Scope → Prototype → Build → Optimise
          </h3>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[var(--color-fg-muted)] md:text-[16px]">
            Each engagement runs the same five-stage rhythm. Narrow at the
            start, validated quickly, scaled deliberately.
          </p>
        </div>

        {/* SVG diagram */}
        <div className="relative aspect-[1080/360] w-full">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1080 360"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="bp-node-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="bp-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"  stopColor="var(--accent)" stopOpacity="0" />
                <stop offset="20%" stopColor="var(--accent)" stopOpacity="0.55" />
                <stop offset="80%" stopColor="var(--accent)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Underlying flow path (faded) */}
            <path
              d={FLOW_PATH}
              stroke="rgba(15,123,58,0.18)"
              strokeWidth="1.4"
              fill="none"
            />

            {/* Animated dashed flow on top */}
            <path
              d={FLOW_PATH}
              stroke="url(#bp-flow)"
              strokeWidth="1.4"
              fill="none"
              className="blueprint-edge"
            />

            {/* Travelling accent tokens along the same path */}
            <circle
              r="5"
              fill="var(--accent)"
              className="blueprint-token"
              style={{ offsetPath: `path("${FLOW_PATH}")` }}
            />
            <circle
              r="4"
              fill="var(--accent)"
              opacity="0.7"
              className="blueprint-token blueprint-token-2"
              style={{ offsetPath: `path("${FLOW_PATH}")` }}
            />
            <circle
              r="3.5"
              fill="var(--accent)"
              opacity="0.55"
              className="blueprint-token blueprint-token-3"
              style={{ offsetPath: `path("${FLOW_PATH}")` }}
            />

            {/* Stage nodes (visual halos) */}
            {STAGES.map((s) => (
              <g key={`halo-${s.label}`} transform={`translate(${s.cx} ${s.cy})`}>
                <circle r="36" fill="url(#bp-node-halo)" />
              </g>
            ))}
          </svg>

          {/* HTML node cards positioned over the SVG */}
          {STAGES.map((s, i) => (
            <div
              key={s.label}
              className="blueprint-node absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{
                left: `${(s.cx / 1080) * 100}%`,
                top: `${(s.cy / 360) * 100}%`,
              }}
            >
              <div
                className="grid h-12 w-12 place-items-center rounded-full border border-[var(--accent-border)] bg-[var(--color-surface)]"
                style={{ boxShadow: "var(--shadow-glow-accent)" }}
              >
                <span
                  className="text-[11px] font-semibold text-[var(--color-fg)] tabular-nums"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-3 hidden text-center md:block">
                <p className="text-[14px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                  {s.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--color-fg-meta)]">{s.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile-only stacked labels (the SVG diagram is too wide to read on phones) */}
        <ul className="mt-6 grid grid-cols-2 gap-2 text-xs md:hidden">
          {STAGES.map((s, i) => (
            <li
              key={`m-${s.label}`}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3 py-2"
            >
              <span className="mr-2 font-mono text-[10px] text-[var(--accent)] tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[var(--color-fg)]">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
