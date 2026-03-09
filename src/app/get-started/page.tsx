import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Book a Systems Audit with 2KO Systems. Identify the highest-value workflow to digitise and get a clear roadmap for operational improvement.",
};

export default function GetStartedPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(22,163,74,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-32 md:pb-24 md:pt-40">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            {/* Left – messaging */}
            <div>
              <span className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                Get Started
              </span>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl md:text-5xl">
                Book a Systems Audit
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
                A short, paid diagnostic to identify the best workflow to digitise first, map the current operational pain, and define the ROI case for a custom system.
              </p>

              <div className="mt-10">
                <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted2">
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

              <div className="mt-10">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted2">
                  Best suited to
                </h2>
                <p className="text-sm leading-relaxed text-muted">
                  Operations managers, COOs, MDs, and business owners in mining, agriculture, logistics, industrial services, compliance-heavy organisations, and multi-branch operators.
                </p>
              </div>
            </div>

            {/* Right – contact form */}
            <div className="rounded-2xl border border-border bg-surface p-8">
              <h2 className="mb-6 text-xl font-semibold text-text">
                Request a Systems Audit
              </h2>
              <form
                action="https://formspree.io/f/placeholder"
                method="POST"
                className="flex flex-col gap-5"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted2"
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder-muted2 outline-none transition-colors focus:border-accent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted2"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder-muted2 outline-none transition-colors focus:border-accent"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted2"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder-muted2 outline-none transition-colors focus:border-accent"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted2"
                  >
                    Role / Title
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder-muted2 outline-none transition-colors focus:border-accent"
                    placeholder="e.g. Operations Manager"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted2"
                  >
                    Tell us about the workflow or process you want to improve
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder-muted2 outline-none transition-colors focus:border-accent"
                    placeholder="Describe the operational pain point you would like us to look at..."
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent2"
                >
                  Submit Enquiry
                </button>
              </form>
              <p className="mt-4 text-xs text-muted2">
                We will respond within one business day. You can also email us directly at{" "}
                <a
                  href="mailto:info@2ko.co.za"
                  className="text-accent transition-colors hover:text-accent2"
                >
                  info@2ko.co.za
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
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
