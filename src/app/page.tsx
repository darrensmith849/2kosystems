import Link from "next/link";
import LogoStrip from "@/components/LogoStrip";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import StepProcess from "@/components/StepProcess";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <>
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        {/* Background gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(22,163,74,0.08) 0%, transparent 70%)",
          }}
        />
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-28 md:pb-28 md:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              Custom Systems &amp; Intelligent Automation
            </span>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl md:text-5xl lg:text-6xl">
              Custom operational systems for businesses that have outgrown spreadsheets, paper, and patchwork tools.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              2KO Systems helps established businesses modernise critical workflows through custom web systems, approvals engines, reporting dashboards, portals, and embedded AI tools. We focus on practical operational leverage — less admin, better visibility, faster decisions, and systems that scale with your business.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/get-started"
                className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent2"
              >
                Book a Systems Audit
              </Link>
              <Link
                href="/solutions"
                className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-text transition-colors hover:border-accent/40 hover:bg-white/5"
              >
                Explore Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — TRUST / LOGOS */}
      <LogoStrip />

      {/* SECTION 3 — POSITIONING */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="Built for real operations, not tech theatre."
            description="Most businesses do not need &quot;more software&quot;. They need the right operational system for the way their business actually runs."
          />
          <p className="mx-auto mb-14 max-w-2xl text-center text-base leading-relaxed text-muted">
            2KO Systems builds practical web-based systems that remove friction from approvals, reporting, handovers, requests, compliance, onboarding, field operations, and day-to-day coordination. We work especially well in environments where process matters, admin is heavy, and operational visibility is too dependent on people chasing updates.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              title="Process-first thinking"
              description="We start with the operational bottleneck, not the technology trend."
            />
            <Card
              title="Custom-built for your operation"
              description="Every system is shaped around your workflows, approvals, and reporting reality."
            />
            <Card
              title="AI where it adds real value"
              description="Embedded AI for drafting, routing, summarising, searching, and decision support — not for show."
            />
            <Card
              title="Designed to reduce admin and delay"
              description="Less manual follow-up. Faster movement. Better visibility for leaders."
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHAT WE BUILD */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="What we build"
            description="We design and deploy custom systems that replace fragmented workflows with one clear operational layer."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <Card
              title="Workflow Automation"
              description="Digitise repetitive operational flows so work moves cleanly from request to approval to completion."
            />
            <Card
              title="Client & Staff Portals"
              description="Secure role-based portals for onboarding, requests, communication, status visibility, and document access."
            />
            <Card
              title="Approvals & Governance"
              description="Structured approval chains, audit trails, escalation logic, and compliance visibility built into the workflow."
            />
            <Card
              title="Dashboards & Reporting"
              description="Live operational dashboards and automated reporting packs that remove manual status chasing."
            />
            <Card
              title="SOP & Knowledge Copilots"
              description="Make procedures, standards, and key answers accessible at the point of work."
            />
            <Card
              title="AI-Assisted Operations"
              description="Use AI for classification, summaries, draft generation, issue triage, search, and workflow support where it meaningfully improves speed and consistency."
            />
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW CLIENTS START */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="A low-risk path into custom systems"
            description="We do not force clients into giant software projects on day one. We start narrow, prove value quickly, and scale from there."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              number="01"
              title="Systems Opportunity Audit"
              description="Short paid diagnostic to identify the best workflow to digitise first, map the current pain, and define the ROI case."
            />
            <Card
              number="02"
              title="Proof-of-Value Pilot"
              description="A tightly scoped first system that solves one painful process quickly and visibly."
            />
            <Card
              number="03"
              title="Core System Build"
              description="A larger custom platform built around your operational workflows, approvals, reporting, and user roles."
            />
            <Card
              number="04"
              title="Managed Intelligence Retainer"
              description="Ongoing optimisation, support, AI enhancements, reporting improvements, and system evolution."
            />
          </div>
        </div>
      </section>

      {/* SECTION 6 — WHO IT'S FOR */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="Best suited to analogue-heavy and operations-led businesses"
          />

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border/80 sm:grid-cols-2">
            {[
              "Mining and mining-adjacent operations",
              "Agriculture and agri-support businesses",
              "Logistics and fleet-based businesses",
              "Industrial and technical service providers",
              "Compliance-heavy organisations",
              "Multi-branch operational businesses",
              "Training, accreditation, and assessment environments",
              "Teams stuck in spreadsheets, paper, email chains, and WhatsApp workflows",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 bg-surface p-5"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="text-sm text-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — HOW WE WORK */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader title="How we work" />

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

      {/* SECTION 8 — GROUP CONNECTION */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="The systems arm of the 2KO group"
            description="2KO Systems is part of the wider 2KO ecosystem, alongside 2KO Africa and Six Sigma South Africa. That means our systems work is grounded in real operational improvement, not just software delivery."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-7">
              <h3 className="mb-1 text-base font-semibold text-text">
                2KO Africa
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Training and improvement delivery across Southern Africa.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-7">
              <h3 className="mb-1 text-base font-semibold text-text">
                Six Sigma South Africa
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Accreditation and consulting credibility for operational excellence.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-surface p-7">
              <h3 className="mb-1 text-base font-semibold text-accent">
                2KO Systems
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Custom systems and intelligent automation for established businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <CTASection
        title="Ready to modernise one critical workflow?"
        description="Start with a Systems Audit and identify the highest-value place to digitise first."
        primaryCTA="Book a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="View Case Studies"
        secondaryHref="/case-studies"
      />
    </>
  );
}
