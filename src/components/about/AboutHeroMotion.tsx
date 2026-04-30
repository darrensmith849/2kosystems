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
    <div className="relative h-[22rem] overflow-hidden rounded-3xl border border-border md:h-[28rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/imagery/about/hero.png"
        alt=""
        aria-hidden="true"
        className="aboutHero-img h-full w-full object-cover saturate-[0.85]"
      />

      {/* Subtle scan sweep across the image */}
      <div className="aboutHero-sweep pointer-events-none absolute inset-x-0 h-24" aria-hidden="true" />

      {/* Soft darkening for legibility — bottom-up */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

      {/* The narrative panel — full-width across the bottom */}
      <div
        className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-[#050913]/80 p-4 backdrop-blur-md md:inset-x-6 md:bottom-6 md:p-5"
        aria-hidden="true"
      >
        {/* Header row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="aboutHero-livedot h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Approval workflow · live
            </span>
          </div>
          <span className="hidden text-[11px] font-medium text-white/50 sm:block">
            What replaces email + WhatsApp + spreadsheets
          </span>
        </div>

        {/* Three stages with counters */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {/* Stage 1 — Submitted */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
                Submitted
              </span>
              <span className="aboutHero-stage-dot aboutHero-stage-dot-a h-1.5 w-1.5 rounded-full bg-white/55" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="aboutHero-num-a text-xl font-semibold text-white md:text-2xl">47</span>
              <span className="text-[10px] text-white/45">today</span>
            </div>
          </div>

          {/* Stage 2 — In review */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
                In review
              </span>
              <span className="aboutHero-stage-dot aboutHero-stage-dot-b h-1.5 w-1.5 rounded-full bg-white/65" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="aboutHero-num-b text-xl font-semibold text-white md:text-2xl">12</span>
              <span className="text-[10px] text-white/45">open</span>
            </div>
          </div>

          {/* Stage 3 — Approved */}
          <div className="rounded-xl border border-accent/30 bg-accent/[0.08] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                Approved
              </span>
              <span className="aboutHero-stage-dot aboutHero-stage-dot-c h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="aboutHero-num-c text-xl font-semibold text-white md:text-2xl">218</span>
              <span className="text-[10px] text-white/45">+ 14 today</span>
            </div>
          </div>
        </div>

        {/* Cycle-time row */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
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
            <span className="text-sm font-semibold text-white">4h 12m</span>
            <span className="text-[10px] text-accent">↓ 62% vs. before</span>
          </div>
        </div>
      </div>
    </div>
  );
}
