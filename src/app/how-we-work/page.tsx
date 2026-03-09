import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import StepProcess from "@/components/StepProcess";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "Our 4-offer engagement model and 5-step delivery process. Start with a Systems Audit, prove value quickly, and scale from there.",
};

export default function HowWeWorkPage() {
  return (
    <>
      <PageHero
        eyebrow="How We Work"
        title="A structured path from operational pain to production system."
        description="We do not force clients into giant software projects on day one. We start narrow, prove value quickly, and scale from there."
        primaryCTA="Book a Systems Audit"
        primaryHref="/get-started"
      />

      {/* Engagement model */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="Four ways to engage"
            description="Each engagement is designed to reduce risk and build confidence before committing to a larger system build."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-accent/30 bg-surface p-7">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
                01
              </span>
              <h3 className="mb-2 text-base font-semibold text-text">
                Systems Opportunity Audit
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                Short paid diagnostic to identify the best workflow to digitise first, map the current pain, and define the ROI case.
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  "Current-state workflow mapping",
                  "Pain point identification",
                  "ROI case definition",
                  "Prioritised recommendation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-xs text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-7">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
                02
              </span>
              <h3 className="mb-2 text-base font-semibold text-text">
                Proof-of-Value Pilot
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                A tightly scoped first system that solves one painful process quickly and visibly. Designed to prove the approach before scaling.
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  "Single workflow focus",
                  "Working system in weeks",
                  "Measurable before/after impact",
                  "Foundation for expansion",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-xs text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-7">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
                03
              </span>
              <h3 className="mb-2 text-base font-semibold text-text">
                Core System Build
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                A larger custom platform built around your operational workflows, approvals, reporting, and user roles.
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  "Multi-workflow platform",
                  "Role-based access and portals",
                  "Dashboards and reporting",
                  "Integrations and data migration",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-xs text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-7">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
                04
              </span>
              <h3 className="mb-2 text-base font-semibold text-text">
                Managed Intelligence Retainer
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                Ongoing optimisation, support, AI enhancements, reporting improvements, and system evolution.
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  "Continuous system improvement",
                  "AI feature enhancements",
                  "Reporting evolution",
                  "Priority support and SLAs",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-xs text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery process */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="Five-step delivery process"
            description="Every engagement follows the same structured approach — from understanding the problem to deploying and optimising the solution."
          />

          <StepProcess
            steps={[
              {
                number: "01",
                title: "Audit",
                description:
                  "We identify the operational bottleneck, map the current workflow, and define the improvement target.",
              },
              {
                number: "02",
                title: "Scope",
                description:
                  "We narrow the first solution to the highest-value use case with the clearest path to ROI.",
              },
              {
                number: "03",
                title: "Prototype",
                description:
                  "We shape the user flow, interface, and logic quickly so stakeholders can see the future state.",
              },
              {
                number: "04",
                title: "Build",
                description:
                  "We deploy the production-ready system with the right permissions, workflows, and reporting layers.",
              },
              {
                number: "05",
                title: "Optimise",
                description:
                  "We refine, extend, and improve the system over time with support, analytics, and AI enhancements.",
              },
            ]}
          />
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="What makes our approach different"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <Card
              title="Start narrow, prove value"
              description="We begin with one workflow, deliver a working system fast, and use that success to build confidence for broader adoption."
            />
            <Card
              title="Process before technology"
              description="We map the operational reality first. The system is shaped by your workflows, not the other way around."
            />
            <Card
              title="Built for your users"
              description="Systems are designed for the people who use them daily — field workers, managers, administrators, and executives."
            />
            <Card
              title="Practical AI, not hype"
              description="We embed AI where it reduces effort and improves consistency. No AI for the sake of AI."
            />
            <Card
              title="Ownership and transparency"
              description="You own the system. We provide full visibility on progress, decisions, and architecture throughout."
            />
            <Card
              title="Long-term partnership"
              description="Systems evolve. We stay engaged to improve, extend, and optimise as your operations grow."
            />
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to start with a Systems Audit?"
        description="Identify the highest-value workflow to digitise and get a clear roadmap for operational improvement."
        primaryCTA="Book a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="View Case Studies"
        secondaryHref="/case-studies"
      />
    </>
  );
}
