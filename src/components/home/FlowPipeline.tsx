"use client";

import React from "react";

/**
 * Animated horizontal pipeline:
 *   Strategy → Workflow → Automation → Dashboard → Growth
 *
 * Five glass cards laid out horizontally on desktop, stacked on mobile,
 * connected by an emerald flow line. A "pulse" travels along the line,
 * and each card stage lights up in sequence as the pulse passes.
 *
 * No JS animation loop — all motion is CSS keyframes. Respects
 * prefers-reduced-motion via a single rule in globals.css.
 */

const STAGES = [
  {
    label: "Strategy",
    note: "Define the highest-value workflow to digitise first.",
  },
  {
    label: "Workflow",
    note: "Map the current operational reality end-to-end.",
  },
  {
    label: "Automation",
    note: "Route, approve, escalate, and notify without admin.",
  },
  {
    label: "Dashboard",
    note: "Live operational visibility, not weekly status decks.",
  },
  {
    label: "Growth",
    note: "Scale the system to new branches, regions, and teams.",
  },
];

export default function FlowPipeline() {
  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 380px at 50% 50%, rgba(15,123,58,0.18) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            How systems take shape
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
            Systems that move businesses forward.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">
            Every engagement runs the same five-stage rhythm — narrow at the start, scaled by the end.
          </p>
        </div>

        {/* Pipeline */}
        <div className="relative mt-16">
          {/* Horizontal flow line — desktop only */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 lg:block" aria-hidden="true">
            <div className="relative h-full w-full overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(15,123,58,0.45) 12%, rgba(15,123,58,0.55) 50%, rgba(15,123,58,0.45) 88%, transparent 100%)",
                }}
              />
              <span className="flow-pipeline-pulse absolute top-1/2 -translate-y-1/2" aria-hidden="true" />
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {STAGES.map((stage, i) => (
              <div
                key={stage.label}
                className="flow-stage relative flex flex-col items-center text-center"
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                <div className="flow-stage-node relative z-10 grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-surface backdrop-blur-md">
                  <span className="text-xs font-semibold tracking-widest text-text/90">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                  <h3 className="text-base font-semibold text-text">
                    {stage.label}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
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
