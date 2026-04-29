"use client";

import React from "react";

/**
 * About-page hero with animated overlay dashboards.
 *
 * Layers:
 *   1. Base AI-generated image (slow ken-burns drift)
 *   2. Soft horizontal scan-line sweep
 *   3. Floating live "OPS · LIVE" mini-widget bottom-right with an
 *      animated bar chart, a drawing sparkline, and a pulsing data tick
 *   4. Floating "AVG · UPTIME" mini-widget top-right with a rising bar
 *      chart counting up
 *   5. Brand-emerald drifting orbs to tie it to the rest of the site
 *   6. Foreground gradient veil so text below stays readable
 *
 * All animations are CSS-driven and respect prefers-reduced-motion.
 */
export default function AboutHeroMotion() {
  return (
    <div className="relative h-72 overflow-hidden rounded-3xl border border-border md:h-[26rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/imagery/about/hero.png"
        alt=""
        aria-hidden="true"
        className="aboutHero-img h-full w-full object-cover saturate-[0.85]"
      />

      {/* Soft sweep scan line */}
      <div
        className="aboutHero-sweep pointer-events-none absolute inset-x-0 h-24"
        aria-hidden="true"
      />

      {/* Drifting accent orbs */}
      <div
        className="aboutHero-orb aboutHero-orb-a pointer-events-none absolute h-40 w-40 rounded-full"
        aria-hidden="true"
      />
      <div
        className="aboutHero-orb aboutHero-orb-b pointer-events-none absolute h-32 w-32 rounded-full"
        aria-hidden="true"
      />

      {/* Live mini-widget — bottom right */}
      <div
        className="pointer-events-none absolute bottom-4 right-4 hidden w-[240px] rounded-xl border border-white/10 bg-[#050913]/85 p-3 backdrop-blur-md sm:block md:bottom-6 md:right-6"
        aria-hidden="true"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
            Ops · live
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-accent">
            <span className="aboutHero-livedot h-1.5 w-1.5 rounded-full bg-accent" />
            Streaming
          </span>
        </div>

        {/* Bar chart row */}
        <div className="mb-2.5 flex h-12 items-end gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className={`aboutHero-bar aboutHero-bar-${i} block flex-1 rounded-sm`}
            />
          ))}
        </div>

        {/* Sparkline */}
        <svg
          viewBox="0 0 200 40"
          className="block h-9 w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="aboutHeroSparkFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(15,123,58,0.45)" />
              <stop offset="100%" stopColor="rgba(15,123,58,0)" />
            </linearGradient>
          </defs>

          {/* baseline grid */}
          <line
            x1="0"
            x2="200"
            y1="20"
            y2="20"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />

          {/* fill underlay */}
          <path
            d="M0 30 L20 22 L40 26 L60 18 L80 22 L100 12 L120 18 L140 8 L160 14 L180 6 L200 10 L200 40 L0 40 Z"
            fill="url(#aboutHeroSparkFill)"
            opacity="0.85"
          />

          {/* drawing line */}
          <path
            className="aboutHero-spark"
            d="M0 30 L20 22 L40 26 L60 18 L80 22 L100 12 L120 18 L140 8 L160 14 L180 6 L200 10"
            fill="none"
            stroke="#0f7b3a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* head dot */}
          <circle
            className="aboutHero-spark-head"
            cx="200"
            cy="10"
            r="3"
            fill="#0f7b3a"
          />
        </svg>

        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/50">
          <span>Throughput</span>
          <span className="text-white/85">+184%</span>
        </div>
      </div>

      {/* Uptime mini-widget — top right (desktop only) */}
      <div
        className="pointer-events-none absolute right-6 top-6 hidden w-[170px] rounded-xl border border-white/10 bg-[#050913]/80 p-3 backdrop-blur-md md:block"
        aria-hidden="true"
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
            Uptime
          </span>
          <span className="aboutHero-livedot h-1.5 w-1.5 rounded-full bg-accent" />
        </div>
        <div className="mb-1 text-xl font-semibold text-white">
          <span className="aboutHero-count">99.97</span>
          <span className="text-sm text-white/55">%</span>
        </div>
        <div className="flex h-6 items-end gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <span
              key={i}
              className={`aboutHero-mini aboutHero-mini-${i} block flex-1 rounded-[1px] bg-white/35`}
            />
          ))}
        </div>
      </div>

      {/* Foreground gradient — keeps page text below readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/85 via-background/25 to-transparent" />
    </div>
  );
}
