"use client";

import React, { useState } from "react";

/**
 * Before/after panel: "From manual chaos to intelligent operations."
 *
 * Two stacked panels (chaos on the left, calm on the right) are rendered
 * side-by-side on desktop. A small toggle lets the visitor switch which
 * one is highlighted. On mobile both stack vertically and the toggle is
 * hidden — the visitor sees both states without interaction.
 */

const CHAOS = [
  "Spreadsheets, paper forms, WhatsApp threads",
  "Approvals chased by email and phone calls",
  "Manual consolidation from each branch",
  "Status meetings to find out what's happening",
  "Audit prep that takes weeks, not hours",
];

const CALM = [
  "One operational system, role-based access",
  "Approval chains with audit trail and escalation",
  "Live dashboards across every branch in real time",
  "Automated notifications that replace status chasing",
  "Compliance reporting in a click, not a sprint",
];

export default function BeforeAfter() {
  const [side, setSide] = useState<"before" | "after">("before");

  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-[0.10]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,80,80,0.10) 0%, transparent 50%, rgba(15,123,58,0.18) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            The transformation
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
            From manual chaos to intelligent operations.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">
            The same operation, the same team, but with the system pulling its weight.
          </p>

          {/* Toggle (desktop) */}
          <div className="mt-8 hidden items-center justify-center gap-1 lg:inline-flex" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={side === "before"}
              onClick={() => setSide("before")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                side === "before"
                  ? "bg-white/[0.08] text-text"
                  : "text-muted2 hover:text-muted"
              }`}
            >
              Before
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={side === "after"}
              onClick={() => setSide("after")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                side === "after"
                  ? "bg-accent/15 text-accent"
                  : "text-muted2 hover:text-muted"
              }`}
            >
              After
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CHAOS panel */}
          <div
            className={`relative overflow-hidden rounded-3xl border bg-surface p-8 transition-all duration-700 lg:p-10 ${
              side === "before"
                ? "border-white/15 opacity-100"
                : "border-border opacity-50 lg:scale-[0.98]"
            }`}
          >
            <span className="mb-5 inline-block rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Before
            </span>
            <h3 className="text-xl font-semibold text-text md:text-2xl">
              Manual operations
            </h3>
            <p className="mt-2 text-sm text-muted">
              Work gets done — slowly, painfully, and at the cost of every weekend.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {CHAOS.map((line, i) => (
                <li
                  key={line}
                  className="ba-chaos-line flex items-start gap-3 text-sm text-muted"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300/80" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            {/* Decorative scribble */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 -right-6 h-40 w-40 opacity-20"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                d="M5 50 Q15 30 30 45 T55 50 T80 40 T95 60 M10 70 Q25 55 40 65 T70 60 T95 75"
                className="text-rose-200/60"
              />
            </svg>
          </div>

          {/* CALM panel */}
          <div
            className={`relative overflow-hidden rounded-3xl border bg-surface p-8 transition-all duration-700 lg:p-10 ${
              side === "after"
                ? "border-accent/40 opacity-100 shadow-[0_30px_60px_-30px_rgba(15,123,58,0.5)]"
                : "border-border opacity-60 lg:scale-[0.98]"
            }`}
          >
            <span className="mb-5 inline-block rounded-full bg-accent/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
              After
            </span>
            <h3 className="text-xl font-semibold text-text md:text-2xl">
              Intelligent operations
            </h3>
            <p className="mt-2 text-sm text-muted">
              The system carries the operational load so your team can focus on the work that matters.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {CALM.map((line, i) => (
                <li
                  key={line}
                  className="ba-calm-line flex items-start gap-3 text-sm text-text"
                  style={{ animationDelay: `${i * 0.12 + 0.4}s` }}
                >
                  <span className="ba-calm-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            {/* Decorative connection lattice */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 -right-6 h-40 w-40 opacity-30"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <g className="text-accent/60">
                <line x1="20" y1="20" x2="80" y2="20" />
                <line x1="20" y1="50" x2="80" y2="50" />
                <line x1="20" y1="80" x2="80" y2="80" />
                <line x1="20" y1="20" x2="50" y2="50" />
                <line x1="50" y1="50" x2="80" y2="80" />
                <line x1="80" y1="20" x2="50" y2="50" />
                <line x1="50" y1="50" x2="20" y2="80" />
                <circle cx="20" cy="20" r="2.5" fill="currentColor" />
                <circle cx="80" cy="20" r="2.5" fill="currentColor" />
                <circle cx="50" cy="50" r="2.5" fill="currentColor" />
                <circle cx="20" cy="80" r="2.5" fill="currentColor" />
                <circle cx="80" cy="80" r="2.5" fill="currentColor" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
