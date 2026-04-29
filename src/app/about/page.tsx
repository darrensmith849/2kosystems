import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "About",
  description:
    "2KO Systems is the technology and custom systems division of the 2KO group. Process-led, operations-first, AI where useful — building practical systems for established South African businesses.",
  openGraph: {
    title: "About | 2KO Systems",
    description:
      "Process-led, operations-first, AI where useful. The systems arm of the 2KO group.",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About 2KO Systems"
        title="The systems and automation arm of the 2KO group."
        description="2KO Systems builds custom operational systems for established businesses. We are part of the wider 2KO ecosystem — grounded in operational improvement, not just software delivery."
      />

      {/* Operations imagery */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 pt-20">
          <div className="relative h-72 overflow-hidden rounded-3xl border border-border md:h-96">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagery/about/hero.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover saturate-[0.8]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/85 via-background/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-text md:text-3xl">
              Why we exist
            </h2>
            <div className="flex flex-col gap-5 text-base leading-relaxed text-muted">
              <p>
                Too many businesses are running critical operations on spreadsheets, paper forms, email chains, and WhatsApp groups. The work gets done, but it is slow, error-prone, hard to audit, and impossible to scale.
              </p>
              <p>
                2KO Systems exists to close that gap. We build the custom web-based systems that digitise approvals, workflows, reporting, and coordination — so that operational improvements stick and businesses can scale without adding proportional admin overhead.
              </p>
              <p>
                We are not a generic software house. We focus specifically on operational systems for established, process-heavy businesses. Our work is shaped by the operational improvement expertise of the wider 2KO group, which means we understand the underlying processes — not just the technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip — compact pill row of guarantees */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[
              "Process-led",
              "Operations-first",
              "AI where it's useful",
              "Custom systems, not SaaS",
              "Long-term support",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-text"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why we are not a generic software house */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-text md:text-3xl">
              Why we are not a generic software house
            </h2>
            <div className="flex flex-col gap-5 text-base leading-relaxed text-muted">
              <p>
                Generic software houses ship features. We ship operational
                improvement that happens to come in the form of software. The
                difference shows up in scoping, in delivery, and in what the
                business actually feels six months later.
              </p>
              <p>
                We start with the bottleneck, not the brief. Our first job on
                every engagement is to understand the workflow, the people in
                it, and the outcome the business needs — long before we propose
                a single screen.
              </p>
              <p>
                The wider 2KO group brings deep operational improvement,
                training and accreditation credibility across Southern Africa.
                That foundation shapes how we design systems — they have to
                work for the operator on shift, the supervisor reviewing the
                day, and the executive reading the dashboard at midnight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Group */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="Part of the 2KO group"
            description="2KO Systems sits within a group that has deep experience in operational improvement, training, and accreditation across Southern Africa."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-7">
              <h3 className="mb-1 text-base font-semibold text-text">
                2KO Africa
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                Training and improvement delivery across Southern Africa.
              </p>
              <p className="text-sm leading-relaxed text-muted">
                Lean, Six Sigma, project management, and leadership training for corporates and government. The operational improvement foundation that informs our systems work.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-7">
              <h3 className="mb-1 text-base font-semibold text-text">
                Six Sigma South Africa
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                Accreditation and consulting credibility for operational excellence.
              </p>
              <p className="text-sm leading-relaxed text-muted">
                International accreditation body and consulting practice. Provides the process methodology and quality framework that underpins our approach to systems design.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-surface p-7">
              <h3 className="mb-1 text-base font-semibold text-accent">
                2KO Systems
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                Custom systems and intelligent automation.
              </p>
              <p className="text-sm leading-relaxed text-muted">
                The technology arm that turns operational improvement insights into production-ready digital systems. We build the platforms that make improvements permanent and scalable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader title="How we think about our work" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <Card
              title="Process before technology"
              description="We solve operational problems first. Technology is the delivery mechanism, not the starting point."
            />
            <Card
              title="Practical over impressive"
              description="We build systems that people use daily. Practicality and adoption matter more than feature counts."
            />
            <Card
              title="Start narrow, scale smart"
              description="We prove value on one workflow before expanding. This reduces risk and builds genuine confidence."
            />
            <Card
              title="Transparent partnership"
              description="We work openly. Clients see progress, understand decisions, and own the output."
            />
            <Card
              title="Outcome-focused"
              description="Every system we build is measured by the operational outcome it delivers — not the technology it uses."
            />
            <Card
              title="Built for the long term"
              description="We design systems to evolve. Our retainer model ensures systems improve as operations grow."
            />
          </div>
        </div>
      </section>

      <CTASection
        title="Want to see what this looks like in your operation?"
        description="Start with a Systems Audit and we will map the highest-value place to begin."
        primaryCTA="Request a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="View Case Studies"
        secondaryHref="/case-studies"
      />
    </>
  );
}
