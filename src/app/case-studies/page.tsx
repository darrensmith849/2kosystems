import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import TypewriterText from "@/components/TypewriterText";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Representative operational patterns from 2KO Systems engagements: mining maintenance approvals, agricultural stock workflows, fleet logistics handovers, accreditation portals, and industrial services hubs.",
  openGraph: {
    title: "Case Studies | 2KO Systems",
    description:
      "Representative operational patterns from real engagements — anonymised. Mining, agriculture, logistics, training and industrial services.",
  },
};

type CaseStudy = {
  sector: string;
  image: string;
  title: string;
  situation: string;
  problem: string;
  systemBuilt: string;
  before: string[];
  after: string[];
  outcomes: string[];
  proves: string;
};

const caseStudies: CaseStudy[] = [
  {
    sector: "Mining",
    image: "/imagery/case-studies/mining.jpg",
    title: "Maintenance approvals and operational visibility for a multi-site mining operation",
    situation:
      "Multi-site mining group running maintenance and contractor coordination across several pits and processing facilities, with head office expected to maintain compliance and audit readiness.",
    problem:
      "Maintenance requests, approvals and job tracking moved through email, spreadsheets and WhatsApp. Approvals were delayed, ownership was unclear, and audit-trail preparation pulled supervisors off-site for days at a time.",
    systemBuilt:
      "A custom maintenance request and approval system with structured approval chains, role-based site access, real-time status dashboards and automated escalation for overdue items. Head office got a consolidated cross-site view; supervisors got a single inbox for their site.",
    before: [
      "WhatsApp threads to chase sign-off",
      "Spreadsheet trackers maintained per site",
      "Audit prep took days of consolidation",
      "No single owner for stuck approvals",
    ],
    after: [
      "Structured approval chains with escalation",
      "Live dashboard across every site",
      "Audit trail on every decision, by user and timestamp",
      "Clear ownership and SLA per request",
    ],
    outcomes: [
      "Approval turnaround compressed from days toward hours",
      "Single source of truth for every maintenance decision",
      "Audit preparation reducible from days to hours, depending on workflow maturity",
      "Reduced duplicate admin between site and head office",
    ],
    proves:
      "A bespoke approval-and-visibility layer can replace fragmented chat / spreadsheet workflows in operationally heavy environments without forcing a generic ERP onto site teams.",
  },
  {
    sector: "Agriculture",
    image: "/imagery/case-studies/agriculture.jpg",
    title: "Stock request and seasonal workflow system for an agri-support business",
    situation:
      "An agri-support business serving distributed farms and co-ops with a sharp seasonal peak in stock requests and allocations.",
    problem:
      "Seasonal requests, allocations and delivery coordination were managed through paper forms, phone calls and shared spreadsheets. Mistakes were frequent and admin overhead at peak season was unsustainable.",
    systemBuilt:
      "A digital request-and-allocation workflow with role-based submission, automated stock matching, approval chains and delivery scheduling. A simple mobile-friendly portal for field teams to submit and track from any device.",
    before: [
      "Paper request forms and ad-hoc phone calls",
      "Branch admin retyping requests into spreadsheets",
      "Allocations done by memory and goodwill",
      "Hard to know what's in flight at any moment",
    ],
    after: [
      "Field-team mobile capture",
      "Automated stock matching against availability",
      "Approval chains with escalation",
      "One live view of every request in flight",
    ],
    outcomes: [
      "End-to-end digital workflow for stock requests",
      "Fewer allocation errors at peak",
      "Field teams able to submit and track via mobile",
      "Substantially less admin time per request",
    ],
    proves:
      "Operational systems can absorb seasonal load without growing the admin team — the right capture-once digital flow removes most of the reconciliation work.",
  },
  {
    sector: "Logistics",
    image: "/imagery/case-studies/logistics.jpg",
    title: "Reporting and handover control for a fleet-based logistics provider",
    situation:
      "Fleet-based logistics provider operating from multiple depots, with daily and weekly head-office reporting cycles.",
    problem:
      "Load handovers, driver check-ins and end-of-day reporting were entirely manual. Head office had limited real-time visibility and lost hours each week consolidating depot reports by hand.",
    systemBuilt:
      "A digital handover and reporting platform with depot-level data capture, mobile driver check-in, automated daily and weekly report generation, and a centralised dashboard for head office.",
    before: [
      "Paper handover sheets and signatures",
      "Manual end-of-day depot consolidation",
      "Head office chasing depots for numbers",
      "Reporting visibility lagged by 24–48 hours",
    ],
    after: [
      "Mobile driver check-in and proof of handover",
      "Reports auto-generated and routed",
      "Live depot-by-depot performance view",
      "Same-day operational visibility",
    ],
    outcomes: [
      "Daily and weekly reports automated end-to-end",
      "Real-time depot performance visibility",
      "Digital handover process with full audit trail",
      "Manual reporting hours reducible substantially, depending on depot count",
    ],
    proves:
      "A focused operational system can replace a week of consolidation admin and turn fleet visibility from lagging to live.",
  },
  {
    sector: "Training & Compliance",
    image: "/imagery/case-studies/training.jpg",
    title: "Accreditation and assessment portal for a national training provider",
    situation:
      "A national training and accreditation body managing learner registrations, assessment submissions, moderation and certification at scale.",
    problem:
      "The end-to-end process ran across legacy tools, email and shared drives. Moderation cycles were long, reporting to regulators was painful, and there was no single source of truth.",
    systemBuilt:
      "A purpose-built portal for learner management, assessment submission and moderation, automated certificate generation, and compliance reporting. Role-based access for assessors, moderators and administrators.",
    before: [
      "Email and shared drives for submissions",
      "Manual moderator allocation",
      "Certificates generated by hand",
      "Audit prep started weeks ahead",
    ],
    after: [
      "Single learner-to-certificate digital flow",
      "Automated moderator routing",
      "Certificates generated on completion",
      "Compliance reporting in a click",
    ],
    outcomes: [
      "Learner-to-certificate workflow fully digitised",
      "Moderation cycle time meaningfully reduced",
      "Automated compliance reporting for regulators",
      "Single source of truth for every assessment",
    ],
    proves:
      "Compliance-heavy environments benefit disproportionately from a purpose-built operational system: the audit story is automated as a side-effect of the workflow itself.",
  },
  {
    sector: "Industrial Services",
    image: "/imagery/case-studies/industrial.jpg",
    title: "Operations hub for a multi-discipline technical services business",
    situation:
      "A technical services business running concurrent electrical, mechanical and civil projects across multiple clients and field teams.",
    problem:
      "Operations ran through email chains, disconnected spreadsheets and paper job cards. Project visibility was poor; invoicing lagged because completion data was hard to consolidate.",
    systemBuilt:
      "An operational hub with digital job cards, project tracking, resource allocation, client portals for status updates, and automated reporting. An approvals layer governed scope changes and cost variations.",
    before: [
      "Paper job cards and manual sign-off",
      "Email-based project status updates",
      "Spreadsheets reconciled per client",
      "Invoicing waited on retyped completion data",
    ],
    after: [
      "Digital job cards with mobile capture",
      "Live project board across every discipline",
      "Client portal for real-time status",
      "Invoicing flows from completion data automatically",
    ],
    outcomes: [
      "Every project visible in one operational view",
      "Digital job cards replace paper-based processes",
      "Client portal removes status-chasing email",
      "Invoicing cycle compressed by automating the data flow",
    ],
    proves:
      "Technical services teams gain compounding efficiency once the job-card-to-invoice flow is one connected system rather than five tools stitched together by email.",
  },
];

function Pill({ tone, label }: { tone: "before" | "after"; label: string }) {
  return (
    <span
      className={[
        "inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest",
        tone === "before"
          ? "bg-white/[0.06] text-muted"
          : "bg-accent/15 text-accent",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        title="Real operational patterns. Practical system solutions."
        description="Representative engagements drawn from real operational pain across mining, agriculture, logistics, training and industrial services. Client names and identifying details are anonymised; the operational challenges, the systems built, and the outcome targets are real."
        primaryCTA="Request a Systems Audit"
        primaryHref="/get-started"
      />

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mx-auto mb-14 max-w-3xl text-center text-sm leading-relaxed text-muted">
            Many of our systems engagements are commercially sensitive. Where
            needed, names and identifying details are withheld and outcomes
            are described as targets or representative ranges, not guaranteed
            results. Read each case study as the operational pattern, not a
            specific client claim.
          </p>

          <div className="flex flex-col gap-12">
            {caseStudies.map((study) => (
              <article
                key={study.title}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                {/* Cover */}
                <div className="relative h-44 w-full overflow-hidden md:h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={study.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover saturate-[0.85]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
                </div>

                <div className="p-7 md:p-10">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
                      {study.sector}
                    </span>
                    <span className="inline-block rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted2">
                      Representative example
                    </span>
                  </div>

                  <h2 className="mb-8 text-xl font-semibold tracking-tight text-text md:text-2xl">
                    {study.title}
                  </h2>

                  {/* Situation + Problem + System Built */}
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted2">
                        Situation
                      </h3>
                      <p className="text-sm leading-relaxed text-muted">
                        {study.situation}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted2">
                        Operational problem
                      </h3>
                      <p className="text-sm leading-relaxed text-muted">
                        {study.problem}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted2">
                        System built
                      </h3>
                      <p className="text-sm leading-relaxed text-muted">
                        {study.systemBuilt}
                      </p>
                    </div>
                  </div>

                  {/* Before / After cards */}
                  <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <Pill tone="before" label="Workflow before" />
                      <ul className="mt-4 flex flex-col gap-2.5">
                        {study.before.map((line) => (
                          <li key={line} className="flex items-start gap-2.5 text-sm text-muted">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300/70" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-accent/30 bg-accent/[0.04] p-5">
                      <Pill tone="after" label="Workflow after" />
                      <ul className="mt-4 flex flex-col gap-2.5">
                        {study.after.map((line) => (
                          <li key={line} className="flex items-start gap-2.5 text-sm text-text">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Outcomes + Proves */}
                  <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
                    <div>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted2">
                        Outcome targets
                      </h3>
                      <ul className="flex flex-col gap-2.5">
                        {study.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            <span className="text-sm text-muted">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                        What this proves
                      </h3>
                      <p className="text-sm leading-relaxed text-text">
                        <TypewriterText text={study.proves} speed={14} />
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="See yourself in one of these stories?"
        description="Start with a Systems Audit and we will map the highest-value opportunity in your operation."
        primaryCTA="Request a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="Explore Solutions"
        secondaryHref="/solutions"
      />
    </>
  );
}
