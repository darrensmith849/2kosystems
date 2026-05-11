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
    <section className="relative overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="mb-3 text-[12px] font-medium uppercase text-[var(--accent)]"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            The transformation
          </p>
          <h2
            className="font-semibold text-[var(--color-fg)]"
            style={{
              fontSize: "var(--text-display-md)",
              letterSpacing: "var(--tracking-display)",
              lineHeight: 1.1,
            }}
          >
            From manual chaos to intelligent operations.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-[var(--color-fg-muted)]"
            style={{
              fontSize: "var(--text-headline)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.5,
            }}
          >
            The same operation, the same team, but with the system pulling its
            weight.
          </p>

          {/* Toggle (desktop) */}
          <div
            className="mt-8 hidden items-center justify-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-2)] p-1 lg:inline-flex"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={side === "before"}
              onClick={() => setSide("before")}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                side === "before"
                  ? "bg-[var(--color-surface)] text-[var(--color-fg)] shadow-[var(--shadow-card)]"
                  : "text-[var(--color-fg-meta)] hover:text-[var(--color-fg)]"
              }`}
            >
              Before
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={side === "after"}
              onClick={() => setSide("after")}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                side === "after"
                  ? "bg-[var(--color-surface)] text-[var(--accent)] shadow-[var(--shadow-card)]"
                  : "text-[var(--color-fg-meta)] hover:text-[var(--color-fg)]"
              }`}
            >
              After
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CHAOS panel */}
          <div
            className={`card-sweep relative overflow-hidden rounded-3xl border bg-[var(--color-surface)] p-8 transition-all duration-500 lg:p-10 ${
              side === "before"
                ? "border-[var(--color-border)]"
                : "border-[var(--color-border-subtle)]"
            }`}
            style={{
              boxShadow:
                side === "before"
                  ? "var(--shadow-popover)"
                  : "var(--shadow-card)",
            }}
          >
            <span
              className="mb-5 inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3 py-1 text-[10px] font-semibold uppercase text-[var(--color-fg-muted)]"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              Before
            </span>
            <h3 className="text-[22px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)] md:text-[24px]">
              Manual operations
            </h3>
            <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
              Work gets done — slowly, painfully, and at the cost of every
              weekend.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {CHAOS.map((line, i) => (
                <li
                  key={line}
                  className="ba-chaos-line flex items-start gap-3 text-[14px] text-[var(--color-fg-muted)]"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-fg-meta)]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CALM panel */}
          <div
            className={`card-sweep relative overflow-hidden rounded-3xl border bg-[var(--color-surface)] p-8 transition-all duration-500 lg:p-10 ${
              side === "after"
                ? "border-[var(--accent-border)]"
                : "border-[var(--color-border-subtle)]"
            }`}
            style={{
              boxShadow:
                side === "after"
                  ? "var(--shadow-glow-accent)"
                  : "var(--shadow-card)",
            }}
          >
            <span
              className="mb-5 inline-block rounded-full border border-[var(--accent-border)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-3 py-1 text-[10px] font-semibold uppercase text-[var(--accent)]"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              After
            </span>
            <h3 className="text-[22px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)] md:text-[24px]">
              Intelligent operations
            </h3>
            <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
              The system carries the operational load so your team can focus on
              the work that matters.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {CALM.map((line, i) => (
                <li
                  key={line}
                  className="ba-calm-line flex items-start gap-3 text-[14px] text-[var(--color-fg)]"
                  style={{ animationDelay: `${i * 0.12 + 0.4}s` }}
                >
                  <span className="ba-calm-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
