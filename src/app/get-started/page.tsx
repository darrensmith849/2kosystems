import type { Metadata } from "next";
import AutoOpenChat from "./auto-open";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Book a Systems Audit with 2KO Systems. Identify the highest-value workflow to digitise and get a clear roadmap for operational improvement.",
};

export default function GetStartedPage() {
  return (
    <>
      <AutoOpenChat />

      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(15,123,58,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-32 md:pt-40">
          <span className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            Get Started
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl md:text-5xl">
            Book a Systems Audit
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            A short, paid diagnostic to identify the best workflow to digitise first, map the current operational pain, and define the ROI case for a custom system. Use the chat that just opened to share a few quick details — a real person picks up from there.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted2">
                What you get
              </h2>
              <ul className="flex flex-col gap-3">
                {[
                  "Current-state workflow mapping for your highest-pain process",
                  "Identification of bottlenecks, delays, and admin overhead",
                  "Clear recommendation for the first system to build",
                  "ROI case and projected operational improvement",
                  "Roadmap for phased implementation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-sm text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted2">
                Best suited to
              </h2>
              <p className="text-sm leading-relaxed text-muted">
                Operations managers, COOs, MDs, and business owners in mining, agriculture, logistics, industrial services, compliance-heavy organisations, and multi-branch operators.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                Prefer email?{" "}
                <a
                  href="mailto:darren@2kosystems.com"
                  className="text-accent transition-colors hover:text-accent2"
                >
                  darren@2kosystems.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border/80 sm:grid-cols-3">
            {[
              { stat: "5,000+", label: "Businesses served across the 2KO group" },
              { stat: "Cross-sector", label: "Mining, agriculture, logistics, services" },
              { stat: "Process-led", label: "Grounded in operational improvement" },
            ].map((item) => (
              <div key={item.label} className="bg-surface p-6 text-center">
                <div className="text-2xl font-semibold text-accent">
                  {item.stat}
                </div>
                <div className="mt-1 text-xs text-muted">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
