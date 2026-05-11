"use client";

import Link from "next/link";
import TypewriterText from "@/components/TypewriterText";
import RevealOnScroll from "@/components/RevealOnScroll";

/**
 * Autotax-style hero composition:
 *  1. White, centered hero — eyebrow, display H1, muted subhead, two
 *     pill CTAs (black primary, outlined secondary), small caption.
 *  2. A two-column mockup section below: an "operating system" card on
 *     the left (the same content we had before, just on a light surface)
 *     and an iPhone-style notification card on the right, with a small
 *     "Last sync · just now" chip floating above.
 *
 * Content from the previous hero is preserved verbatim — only the
 * visual chrome changes.
 */
export default function PremiumSystemsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Quiet green radial wash so the hero has a focal point */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, var(--tint-accent-medium), transparent 65%)",
        }}
      />
      {/* Faint horizon line gradient anchoring the bottom of the hero space */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[420px] h-[300px]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, var(--tint-accent-soft), transparent 70%)",
        }}
      />

      {/* ---------- Centred hero ---------- */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-10 text-center sm:pt-24 lg:px-10 lg:pt-28">
        <p
          className="reveal-up text-[12px] font-medium uppercase text-[var(--color-fg-muted)]"
          style={{ letterSpacing: "var(--tracking-eyebrow)" }}
        >
          Custom Operational Systems · South Africa
        </p>

        <h1
          className="reveal-up reveal-stagger-1 mx-auto mt-6 max-w-4xl font-semibold text-[var(--color-fg)]"
          style={{
            fontSize: "var(--text-display-xl)",
            letterSpacing: "var(--tracking-display)",
            lineHeight: 1.02,
          }}
        >
          Custom systems for businesses that have outgrown outdated software.
        </h1>

        <p
          className="reveal-up reveal-stagger-2 mx-auto mt-6 max-w-2xl text-[var(--color-fg-muted)]"
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

        <div className="reveal-up reveal-stagger-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-canvas-dark)] px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-white transition-all duration-200 hover:bg-[var(--color-canvas-dark-2)] active:scale-[0.98]"
          >
            Book a Systems Audit
          </Link>

          <Link
            href="/solutions"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-[var(--color-fg)] transition-all duration-200 hover:bg-[var(--color-bg-2)] active:scale-[0.98]"
          >
            See how it works
          </Link>
        </div>

        <p className="reveal-up reveal-stagger-4 mt-6 text-[13px] text-[var(--color-fg-meta)]">
          No off-the-shelf SaaS. No long onboarding. No vendor lock-in.
        </p>
      </div>

      {/* ---------- Mockup composition ---------- */}
      <RevealOnScroll className="relative z-10 mx-auto max-w-6xl px-6 pb-24 lg:px-10 lg:pb-28">
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-12">
          {/* ---- Operating-system card (light) ---- */}
          <div
            className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7"
            style={{ boxShadow: "var(--shadow-popover)" }}
          >
            {/* Faint accent wash in the top-left, autotax-style focal point */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 60% at 0% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%)",
              }}
            />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p
                    className="text-[11px] font-medium uppercase text-[var(--color-fg-meta)]"
                    style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                  >
                    How it works in practice
                  </p>
                  <h3 className="mt-1 text-[19px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                    One clear operating system
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--color-fg-muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent contact-live-dot" />
                  Real-time
                </span>
              </div>

              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[var(--color-fg)]">
                    Requests &amp; approvals
                  </span>
                  <span className="text-[11px] text-[var(--color-fg-meta)]">
                    In one place
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-fg-meta)]" />
                      <span className="text-[13px] text-[var(--color-fg)]/85">
                        <TypewriterText text="Request logged" speed={22} startDelay={300} />
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--color-fg-meta)]">Captured</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-fg)]/40" />
                      <span className="text-[13px] text-[var(--color-fg)]/85">
                        <TypewriterText text="Under review" speed={22} startDelay={900} />
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--color-fg-meta)]">Tracked</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      <span className="text-[13px] text-[var(--color-fg)]/85">
                        <TypewriterText text="Approved & visible" speed={22} startDelay={1500} />
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--color-fg-meta)]">Actioned</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] p-3">
                  <p
                    className="text-[10px] font-medium uppercase text-[var(--color-fg-meta)]"
                    style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                  >
                    Faster decisions
                  </p>
                  <p className="mt-1 text-[15px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                    Less chasing
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--color-fg-muted)]">
                    Clear ownership and status
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] p-3">
                  <p
                    className="text-[10px] font-medium uppercase text-[var(--color-fg-meta)]"
                    style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                  >
                    Live reporting
                  </p>
                  <p className="mt-1 text-[15px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                    Better visibility
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--color-fg-muted)]">
                    One source of truth
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-2)] p-3">
                <p
                  className="text-[10px] font-medium uppercase text-[var(--color-fg-meta)]"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  Embedded AI support
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[var(--color-fg-muted)]">
                  Search, summaries, drafting, and routing built directly into
                  the workflow where they add real value.
                </p>
              </div>
            </div>
          </div>

          {/* ---- Right-hand "iPhone notification" mockup (kept dark so it pops on the white site, autotax-style) ---- */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Floating "Last sync" chip, autotax-style */}
            <div className="absolute -top-3 right-2 z-10 hidden items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 shadow-[var(--shadow-card)] sm:flex">
              <span className="h-2 w-2 rounded-full bg-accent contact-live-dot" />
              <div className="text-left">
                <p className="text-[11px] font-medium text-[var(--color-fg)]">
                  Last sync
                </p>
                <p className="text-[11px] text-[var(--color-fg-meta)]">just now</p>
              </div>
            </div>

            <div
              className="relative w-full max-w-[320px] rounded-[44px] border border-black/10 p-2"
              style={{
                background: "var(--color-canvas-dark)",
                boxShadow:
                  "0 30px 60px -20px rgba(15, 18, 28, 0.35), 0 12px 24px -12px rgba(15, 18, 28, 0.25)",
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
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[12px] font-semibold text-white">
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
                    <span className="text-accent-highlight tabular-nums">+14</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-white/65">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                    <svg
                      viewBox="0 0 12 12"
                      className="h-2.5 w-2.5"
                      aria-hidden="true"
                    >
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
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
