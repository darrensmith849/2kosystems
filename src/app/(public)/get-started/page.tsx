import type { Metadata } from "next";
import Link from "next/link";
import SystemsAuditForm from "@/components/SystemsAuditForm";

export const metadata: Metadata = {
  title: "Request a Systems Audit",
  description:
    "Request a Systems Audit from 2KO Systems. Map your highest-pain workflow, identify the first system to build, and get a clear roadmap for operational improvement.",
  openGraph: {
    title: "Request a Systems Audit | 2KO Systems",
    description:
      "Map your highest-pain workflow and identify the first system to build. Premium custom systems for operations-led businesses across South Africa.",
  },
};

export default function GetStartedPage() {
  return (
    <>
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, #0c7a39 0%, var(--color-hero-block) 45%, var(--color-hero-block-2) 100%)",
        }}
      >
        {/* Stippled dot pattern matches the home hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 0%, rgba(255,255,255,0.10), transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-24 lg:px-10">
          <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1fr_1.1fr]">
            {/* Left – context */}
            <div className="reveal-up">
              <span className="eyebrow-rule on-dark">Get Started</span>
              <h1
                className="mt-5 font-semibold text-white"
                style={{
                  fontSize: "clamp(36px, 4.4vw, 60px)",
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: 1.05,
                }}
              >
                Request a Systems Audit.
              </h1>
              <p
                className="mt-5 max-w-lg text-white/85"
                style={{
                  fontSize: "clamp(15px, 1.15vw, 17px)",
                  letterSpacing: "var(--tracking-tight)",
                  lineHeight: 1.5,
                }}
              >
                A short, focused diagnostic that maps your highest-pain workflow,
                identifies the first system to build, and defines the ROI case
                for a custom solution.
              </p>

              <div className="mt-10">
                <h2
                  className="mb-4 text-[11px] font-semibold uppercase text-white/75"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  What happens after you submit
                </h2>
                <ul className="flex flex-col gap-4 list-none pl-0">
                  {[
                    "We review the workflow pain you've shared and the right person picks it up.",
                    "We identify the highest-value first system and propose a low-risk path.",
                    "We schedule a focused discovery call within one business day.",
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-4">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/35 bg-white/10 text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-relaxed text-white/85">
                        {step}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10">
                <h2
                  className="mb-3 text-[11px] font-semibold uppercase text-white/75"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  What you receive
                </h2>
                <ul className="flex flex-col gap-2.5 list-none pl-0">
                  {[
                    "Current-state workflow mapping for your highest-pain process",
                    "Identification of bottlenecks, delays, and admin overhead",
                    "Clear recommendation for the first system to build",
                    "Roadmap for phased implementation",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                      <span className="text-sm leading-relaxed text-white/85">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10">
                <h2
                  className="mb-3 text-[11px] font-semibold uppercase text-white/75"
                  style={{ letterSpacing: "var(--tracking-eyebrow)" }}
                >
                  Best suited to
                </h2>
                <p className="text-sm leading-relaxed text-white/85">
                  Operations managers, COOs, MDs and business owners in mining,
                  agriculture, logistics, industrial services, compliance-heavy
                  organisations, and multi-branch operators.
                </p>
              </div>
            </div>

            {/* Right – form */}
            <div
              className="reveal-up rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8"
              style={{ boxShadow: "var(--shadow-popover)" }}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-[20px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                  Tell us about your operation
                </h2>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-[var(--accent)]">
                  <span className="contact-live-dot relative inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  1 business day
                </span>
              </div>
              <SystemsAuditForm />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)] sm:grid-cols-3">
            {[
              { stat: "5,000+", label: "Businesses served across the 2KO group" },
              { stat: "Cross-sector", label: "Mining, agriculture, logistics, services" },
              { stat: "Process-led", label: "Grounded in operational improvement" },
            ].map((item) => (
              <div key={item.label} className="bg-[var(--color-surface)] p-6 text-center">
                <div className="text-[24px] font-semibold tracking-[var(--tracking-display)] text-[var(--accent)] tabular-nums">
                  {item.stat}
                </div>
                <div className="mt-1 text-[12px] text-[var(--color-fg-muted)]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-xs text-muted2">
            Prefer to chat first? Use the &quot;Chat with us&quot; bubble bottom-right —{" "}
            <Link href="/contact" className="text-accent transition-colors hover:text-accent2">
              or reach the team directly
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
