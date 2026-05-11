"use client";

import React from "react";

/**
 * About-page hero with a single, meaningful overlay panel.
 *
 * Instead of generic SaaS-deck chrome (Throughput, Uptime), the overlay
 * narrates what 2KO Systems actually delivers: requests moving through
 * Submitted → In review → Approved stages, with the counters ticking and
 * a "cycle time" sparkline showing the real value (time-to-approval
 * dropping after the system replaces spreadsheets / WhatsApp).
 *
 * Pure CSS animation — no JS loop. Respects prefers-reduced-motion.
 */
export default function AboutHeroMotion() {
  return (
    <div
      className="relative h-[22rem] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-2)] md:h-[28rem]"
      style={{ boxShadow: "var(--shadow-popover)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/imagery/about/hero.png"
        alt=""
        aria-hidden="true"
        className="aboutHero-img h-full w-full object-cover opacity-90"
      />

      {/* Subtle scan sweep across the image */}
      <div className="aboutHero-sweep pointer-events-none absolute inset-x-0 h-24" aria-hidden="true" />

      {/* Soft darkening at the bottom so the white panel pops */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

      {/* The narrative panel — full-width across the bottom, light card */}
      <div
        className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 backdrop-blur-md md:inset-x-6 md:bottom-6 md:p-5"
        style={{ boxShadow: "var(--shadow-popover)" }}
        aria-hidden="true"
      >
        {/* Header row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="aboutHero-livedot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span
              className="text-[11px] font-semibold uppercase text-[var(--color-fg-muted)]"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              Approval workflow · live
            </span>
          </div>
          <span className="hidden text-[11px] font-medium text-[var(--color-fg-meta)] sm:block">
            What replaces email + WhatsApp + spreadsheets
          </span>
        </div>

        {/* Three stages with counters */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {/* Stage 1 — Submitted */}
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase text-[var(--color-fg-meta)]"
                style={{ letterSpacing: "var(--tracking-eyebrow)" }}
              >
                Submitted
              </span>
              <span className="aboutHero-stage-dot aboutHero-stage-dot-a h-1.5 w-1.5 rounded-full bg-[var(--color-fg-meta)]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="aboutHero-num-a text-[20px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)] tabular-nums md:text-[24px]">
                47
              </span>
              <span className="text-[10px] text-[var(--color-fg-meta)]">today</span>
            </div>
          </div>

          {/* Stage 2 — In review */}
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase text-[var(--color-fg-meta)]"
                style={{ letterSpacing: "var(--tracking-eyebrow)" }}
              >
                In review
              </span>
              <span className="aboutHero-stage-dot aboutHero-stage-dot-b h-1.5 w-1.5 rounded-full bg-[var(--color-fg)]/40" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="aboutHero-num-b text-[20px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)] tabular-nums md:text-[24px]">
                12
              </span>
              <span className="text-[10px] text-[var(--color-fg-meta)]">open</span>
            </div>
          </div>

          {/* Stage 3 — Approved */}
          <div className="rounded-xl border border-[var(--accent-border)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase text-[var(--accent)]"
                style={{ letterSpacing: "var(--tracking-eyebrow)" }}
              >
                Approved
              </span>
              <span className="aboutHero-stage-dot aboutHero-stage-dot-c h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="aboutHero-num-c text-[20px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)] tabular-nums md:text-[24px]">
                218
              </span>
              <span className="text-[10px] text-[var(--color-fg-meta)]">+ 14 today</span>
            </div>
          </div>
        </div>

        {/* Cycle-time row */}
        <div className="mt-4 flex items-center gap-3">
          <span
            className="text-[10px] font-semibold uppercase text-[var(--color-fg-meta)]"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            Avg cycle time
          </span>

          <svg viewBox="0 0 200 24" className="block h-5 flex-1" preserveAspectRatio="none">
            <defs>
              <linearGradient id="aboutHeroCycleFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(15,123,58,0.45)" />
                <stop offset="100%" stopColor="rgba(15,123,58,0)" />
              </linearGradient>
            </defs>

            {/* Trend down (cycle time falling = good) */}
            <path
              d="M0 4 L25 6 L50 5 L75 9 L100 11 L125 14 L150 16 L175 18 L200 20 L200 24 L0 24 Z"
              fill="url(#aboutHeroCycleFill)"
              opacity="0.85"
            />
            <path
              className="aboutHero-spark"
              d="M0 4 L25 6 L50 5 L75 9 L100 11 L125 14 L150 16 L175 18 L200 20"
              fill="none"
              stroke="#0f7b3a"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="flex flex-col items-end">
            <span className="text-[14px] font-semibold tabular-nums text-[var(--color-fg)]">
              4h 12m
            </span>
            <span className="text-[10px] text-[var(--accent)]">↓ 62% vs. before</span>
          </div>
        </div>
      </div>
    </div>
  );
}
