"use client";

import React from "react";

/**
 * Animated horizontal pipeline:
 *   Strategy → Workflow → Automation → Dashboard → Growth
 *
 * Each stage is a glass card with its own tiny live micro-graphic that
 * visualises that stage. Cards reveal in sequence on first paint, the
 * connecting flow line carries a travelling pulse, and each stage's
 * numbered node lights up as the pulse passes.
 *
 * No JS animation loop — all motion is CSS keyframes. Respects
 * prefers-reduced-motion via globals.css kill switches.
 */

type StageMicro = "target" | "queue" | "gear" | "chart" | "trend";

const STAGES: { label: string; note: string; micro: StageMicro }[] = [
  {
    label: "Strategy",
    note: "Define the highest-value workflow to digitise first.",
    micro: "target",
  },
  {
    label: "Workflow",
    note: "Map the current operational reality end-to-end.",
    micro: "queue",
  },
  {
    label: "Automation",
    note: "Route, approve, escalate, and notify without admin.",
    micro: "gear",
  },
  {
    label: "Dashboard",
    note: "Live operational visibility, not weekly status decks.",
    micro: "chart",
  },
  {
    label: "Growth",
    note: "Scale the system to new branches, regions, and teams.",
    micro: "trend",
  },
];

function MicroGraphic({ kind }: { kind: StageMicro }) {
  if (kind === "target") {
    return (
      <svg viewBox="0 0 60 30" className="h-8 w-full" aria-hidden="true">
        <g fill="none" stroke="rgba(15,123,58,0.55)" strokeWidth="1">
          <circle cx="30" cy="15" r="12" className="micro-target-ring" />
          <circle cx="30" cy="15" r="7" className="micro-target-ring-inner" />
        </g>
        <circle cx="30" cy="15" r="2" fill="var(--accent)" className="micro-target-dot" />
      </svg>
    );
  }
  if (kind === "queue") {
    return (
      <svg viewBox="0 0 60 30" className="h-8 w-full" aria-hidden="true">
        <g>
          <rect x="6"  y="6"  width="32" height="4" rx="1.2" fill="rgba(184,196,200,0.18)" />
          <rect x="6"  y="13" width="32" height="4" rx="1.2" fill="rgba(184,196,200,0.18)" />
          <rect x="6"  y="20" width="32" height="4" rx="1.2" fill="rgba(184,196,200,0.18)" />
          <rect x="6"  y="6"  width="14" height="4" rx="1.2" fill="var(--accent)" className="micro-queue-bar micro-queue-bar-1" />
          <rect x="6"  y="13" width="22" height="4" rx="1.2" fill="var(--accent)" className="micro-queue-bar micro-queue-bar-2" />
          <rect x="6"  y="20" width="10" height="4" rx="1.2" fill="var(--accent)" className="micro-queue-bar micro-queue-bar-3" />
        </g>
      </svg>
    );
  }
  if (kind === "gear") {
    return (
      <svg viewBox="0 0 60 30" className="h-8 w-full" aria-hidden="true">
        <g
          className="micro-gear-spin"
          style={{ transformOrigin: "30px 15px", transformBox: "fill-box" }}
        >
          {/* 8-tooth gear */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <rect
                key={i}
                x="29"
                y="2"
                width="2"
                height="3.5"
                rx="0.5"
                fill="rgba(15,123,58,0.65)"
                transform={`rotate(${angle} 30 15)`}
              />
            );
          })}
          <circle cx="30" cy="15" r="6" fill="none" stroke="rgba(184,196,200,0.5)" strokeWidth="1" />
          <circle cx="30" cy="15" r="2" fill="var(--accent)" />
        </g>
      </svg>
    );
  }
  if (kind === "chart") {
    return (
      <svg viewBox="0 0 60 30" className="h-8 w-full" aria-hidden="true">
        <g>
          <rect x="10" y="10" width="6" height="14" rx="1" fill="var(--accent)" className="micro-chart-bar micro-chart-bar-1" />
          <rect x="20" y="6"  width="6" height="18" rx="1" fill="var(--accent)" className="micro-chart-bar micro-chart-bar-2" />
          <rect x="30" y="14" width="6" height="10" rx="1" fill="var(--accent)" className="micro-chart-bar micro-chart-bar-3" />
          <rect x="40" y="3"  width="6" height="21" rx="1" fill="var(--accent)" className="micro-chart-bar micro-chart-bar-4" />
        </g>
      </svg>
    );
  }
  // trend
  return (
    <svg viewBox="0 0 60 30" className="h-8 w-full" aria-hidden="true">
      <path
        d="M4 24 L18 18 L30 21 L42 9 L56 4"
        fill="none"
        stroke="rgba(15,123,58,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="micro-trend-line"
      />
      {/* Travelling dot following the same path direction */}
      <circle r="2" fill="var(--accent)" className="micro-trend-dot">
        <animateMotion
          dur="3.6s"
          repeatCount="indefinite"
          path="M4 24 L18 18 L30 21 L42 9 L56 4"
        />
      </circle>
      <path
        d="M4 24 L18 18 L30 21 L42 9 L56 4"
        fill="none"
        stroke="rgba(184,196,200,0.18)"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function FlowPipeline() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 380px at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="mb-3 text-[12px] font-medium uppercase text-[var(--accent)]"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            How systems take shape
          </p>
          <h2
            className="font-semibold text-[var(--color-fg)]"
            style={{
              fontSize: "var(--text-display-md)",
              letterSpacing: "var(--tracking-display)",
              lineHeight: 1.1,
            }}
          >
            Systems that move businesses forward.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-[var(--color-fg-muted)]"
            style={{
              fontSize: "var(--text-headline)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.5,
            }}
          >
            Every engagement runs the same five-stage rhythm — narrow at the
            start, scaled by the end.
          </p>
        </div>

        {/* Pipeline */}
        <div className="relative mt-16">
          {/* Horizontal flow line — desktop only */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-[34px] hidden h-px lg:block"
            aria-hidden="true"
          >
            <div className="relative h-full w-full overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(15,123,58,0.30) 12%, rgba(15,123,58,0.45) 50%, rgba(15,123,58,0.30) 88%, transparent 100%)",
                }}
              />
              <span
                className="flow-pipeline-pulse absolute top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {STAGES.map((stage, i) => (
              <div
                key={stage.label}
                className="flow-stage relative flex flex-col items-center text-center"
                style={
                  {
                    animationDelay: `${i * 0.12}s`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="flow-stage-node relative z-10 grid h-16 w-16 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <span
                    className="text-[12px] font-semibold text-[var(--color-fg)]/90 tabular-nums"
                    style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div
                  className="mt-5 w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="mb-4">
                    <MicroGraphic kind={stage.micro} />
                  </div>
                  <h3 className="text-[16px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                    {stage.label}
                  </h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-fg-muted)]">
                    {stage.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
