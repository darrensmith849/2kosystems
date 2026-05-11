"use client";

import React from "react";

/**
 * "The 2KO Systems Engine" — a wide animated diagram.
 *
 *   inputs (left)         core (centre)          outputs (right)
 *   - leads               custom software        saved time
 *   - data                AI agents              better reporting
 *   - tasks               automations            faster operations
 *   - documents           dashboards             scalable growth
 *   - team actions
 *
 * Inputs pulse rightward into the core, outputs pulse rightward out
 * of the core. The core has a slowly rotating ring and a soft accent
 * glow. Pure CSS / SVG — no JS animation loop.
 */

const INPUTS = ["Leads", "Data", "Tasks", "Documents", "Team actions"];
const CORE = ["Custom software", "AI agents", "Automations", "Dashboards"];
const OUTPUTS = [
  "Saved time",
  "Better reporting",
  "Faster operations",
  "Scalable growth",
];

export default function SystemEngine() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 460px at 50% 50%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="mb-3 text-[12px] font-medium uppercase text-[var(--accent)]"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            The system in motion
          </p>
          <h2
            className="font-semibold text-[var(--color-fg)]"
            style={{
              fontSize: "var(--text-display-md)",
              letterSpacing: "var(--tracking-display)",
              lineHeight: 1.1,
            }}
          >
            The 2KO Systems engine.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-[var(--color-fg-muted)]"
            style={{
              fontSize: "var(--text-headline)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.5,
            }}
          >
            Operational inputs go in. Time, visibility, and growth come out. The
            engine in the middle is custom software, AI, and automation working
            together.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.1fr_1fr]">
          {/* Inputs */}
          <ul className="flex flex-col gap-3 lg:items-end">
            {INPUTS.map((label, i) => (
              <li
                key={label}
                className="se-token se-token-in flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] text-[var(--color-fg)] shadow-[var(--shadow-card)]"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-fg-meta)]" />
                {label}
              </li>
            ))}
          </ul>

          {/* Core */}
          <div className="relative mx-auto flex h-72 w-72 items-center justify-center">
            <span className="se-core-ring absolute inset-0 rounded-full border border-[var(--accent-border)]" />
            <span
              className="se-core-ring absolute inset-3 rounded-full border border-[var(--accent-border)]"
              style={{ animationDuration: "16s", animationDirection: "reverse" }}
            />
            <span className="absolute inset-8 rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] blur-2xl" />

            <div
              className="relative grid h-44 w-44 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-center"
              style={{ boxShadow: "var(--shadow-glow-accent)" }}
            >
              <div>
                <p
                  className="text-[10px] font-semibold uppercase text-[var(--accent)]"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  2KO Engine
                </p>
                <ul className="mt-3 flex flex-col gap-1 text-[12px] text-[var(--color-fg)]/85">
                  {CORE.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <ul className="flex flex-col gap-3">
            {OUTPUTS.map((label, i) => (
              <li
                key={label}
                className="se-token se-token-out flex items-center gap-3 rounded-full border border-[var(--accent-border)] bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] px-4 py-2 text-[13px] text-[var(--color-fg)] shadow-[var(--shadow-card)]"
                style={{ animationDelay: `${i * 0.5 + 0.25}s` }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
