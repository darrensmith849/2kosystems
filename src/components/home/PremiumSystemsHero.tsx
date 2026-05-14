"use client";

import Link from "next/link";
import TypewriterText from "@/components/TypewriterText";
import RevealOnScroll from "@/components/RevealOnScroll";

/**
 * Six Sigma South Africa-style hero block.
 *
 *  - Saturated deep-green background (the brand colour Six Sigma SA
 *    uses to anchor the top of every page)
 *  - Left column: green-on-white "rule" eyebrow → big white display
 *    headline → light body copy → green pill CTA + outlined-on-green
 *    secondary
 *  - Right column: the operating-system mockup card + the floating
 *    iPhone notification, kept light so the composition pops against
 *    the green canvas (mirrors the Six Sigma trainer photo placement)
 *
 * Content from previous hero is preserved verbatim — only the visual
 * envelope changes.
 */
export default function PremiumSystemsHero() {
  return (
    <section
      className="relative isolate overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(180deg, var(--color-hero-block) 0%, var(--color-hero-block-2) 100%)",
      }}
    >
      {/* Subtle radial highlight at top — gives the green canvas depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 0%, rgba(255,255,255,0.10), transparent 70%)",
        }}
      />
      {/* Subtle dotted pattern to hint at the Six Sigma stippled hero backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pt-24 pb-24 sm:pt-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:pt-32 lg:pb-28">
        {/* ---------- Left column: copy ---------- */}
        <div className="max-w-2xl">
          <span className="reveal-up eyebrow-rule on-dark">
            Custom Operational Systems · South Africa
          </span>

          <h1
            className="reveal-up reveal-stagger-1 mt-6 font-semibold text-white"
            style={{
              fontSize: "var(--text-display-xl)",
              letterSpacing: "var(--tracking-display)",
              lineHeight: 1.02,
            }}
          >
            Custom systems for businesses that have outgrown outdated software.
          </h1>

          <p
            className="reveal-up reveal-stagger-2 mt-6 max-w-xl text-white/85"
            style={{
              fontSize: "var(--text-headline)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.5,
            }}
          >
            We build operational systems, approvals flows, client portals, and
            reporting dashboards that cut admin, improve visibility, and help
            teams move faster.
          </p>

          <div className="reveal-up reveal-stagger-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-[14px] font-semibold tracking-[-0.005em] text-white shadow-[0_8px_24px_-12px_rgba(10,53,23,0.6)] transition-all duration-200 hover:bg-white hover:text-[var(--accent-deep)] active:scale-[0.98]"
            >
              Book a Systems Audit
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-white backdrop-blur transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
            >
              See how it works
            </Link>
          </div>

          <p className="reveal-up reveal-stagger-4 mt-6 text-[13px] text-white/65">
            No off-the-shelf SaaS. No long onboarding. No vendor lock-in.
          </p>
        </div>

        {/* ---------- Right column: mockup composition ---------- */}
        <RevealOnScroll className="relative flex justify-center lg:justify-end">
          {/* Floating "Last sync" chip */}
          <div className="hero-float-b absolute -top-3 left-0 z-20 hidden items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 shadow-[var(--shadow-card)] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] contact-live-dot" />
            <div className="text-left">
              <p className="text-[11px] font-medium text-[var(--color-fg)]">
                Last sync
              </p>
              <p className="text-[11px] text-[var(--color-fg-meta)]">just now</p>
            </div>
          </div>

          {/* Phone notification mockup, kept dark so it pops on the green canvas */}
          <div
            className="hero-panel-float relative w-full max-w-[320px] rounded-[44px] border border-black/10 p-2"
            style={{
              background: "var(--color-canvas-dark)",
              boxShadow:
                "0 30px 60px -20px rgba(8, 36, 18, 0.55), 0 12px 24px -12px rgba(8, 36, 18, 0.35)",
            }}
          >
            {/* Dynamic-island */}
            <div className="mx-auto mt-1 mb-2 h-5 w-24 rounded-full bg-black" />

            <div className="rounded-[34px] bg-[var(--color-canvas-dark-2)] p-4 text-white">
              <div className="mb-3 flex items-center justify-between text-[11px] text-white/70">
                <span>9:41</span>
                <span className="tracking-[0.2em]">•••</span>
              </div>

              <div className="mb-3 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-[12px] font-semibold text-white">
                  2K
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] text-white/60">
                    <span>2KO Systems</span>
                    <span>now</span>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-5 text-white">
                    A new approval is waiting. Mining workflow #248 — ready for sign-off.
                  </p>
                </div>
              </div>

              <p
                className="text-[10px] font-medium uppercase text-white/55"
                style={{ letterSpacing: "var(--tracking-eyebrow)" }}
              >
                Operations · Today
              </p>
              <p className="mt-1 text-[14px] text-white/85">Workflow #248</p>

              <p className="mt-4 text-[28px] font-semibold leading-none tracking-[-0.02em] text-white tabular-nums">
                4h 12m
              </p>
              <p className="mt-1 text-[11px] text-white/55">Avg. time to approval</p>

              <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-white/65">Requests today</span>
                  <span className="text-white tabular-nums">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/65">In review</span>
                  <span className="text-white tabular-nums">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/65">Approved · today</span>
                  <span className="text-[var(--accent)] tabular-nums">+14</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-white/65">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)]">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden="true">
                    <path
                      d="M2.5 6.5L5 9l4.5-5"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                12 checks passed · 0 warnings
              </div>

              <button
                type="button"
                className="mt-3 w-full rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold tracking-[-0.005em] text-[var(--color-canvas-dark)]"
              >
                Approve &amp; submit
              </button>

              <p className="mt-2 text-center text-[11px] text-white/55">
                Need to amend before you submit?
              </p>
            </div>
          </div>

          {/* Light "operating system" callout sitting behind the phone, to the left/back */}
          <div
            className="hero-float-a absolute -bottom-8 -left-2 hidden w-[300px] rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-popover)] lg:block xl:-left-12"
            style={{ boxShadow: "var(--shadow-popover)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase text-[var(--color-fg-meta)]"
                style={{ letterSpacing: "var(--tracking-eyebrow)" }}
              >
                How it works
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--color-fg-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] contact-live-dot" />
                Real-time
              </span>
            </div>
            <p className="text-[14px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
              One clear operating system
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] px-2.5 py-1.5 text-[12px]">
                <span className="flex items-center gap-2 text-[var(--color-fg)]/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-fg-meta)]" />
                  <TypewriterText text="Request logged" speed={22} startDelay={300} />
                </span>
                <span className="text-[var(--color-fg-meta)]">Captured</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] px-2.5 py-1.5 text-[12px]">
                <span className="flex items-center gap-2 text-[var(--color-fg)]/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-fg)]/40" />
                  <TypewriterText text="Under review" speed={22} startDelay={900} />
                </span>
                <span className="text-[var(--color-fg-meta)]">Tracked</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] px-2.5 py-1.5 text-[12px]">
                <span className="flex items-center gap-2 text-[var(--color-fg)]/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <TypewriterText
                    text="Approved & visible"
                    speed={22}
                    startDelay={1500}
                  />
                </span>
                <span className="text-[var(--color-fg-meta)]">Actioned</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
