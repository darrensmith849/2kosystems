import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "See how 2KO Systems has helped mining, agriculture, logistics, and services businesses modernise operations with custom systems.",
};

const caseStudies = [
  {
    sector: "Mining",
    title: "Maintenance approvals and operational visibility for a multi-site mining operation",
    challenge:
      "A mining group was managing maintenance requests, approvals, and job tracking across multiple sites using a combination of email, spreadsheets, and WhatsApp. Approvals were delayed, visibility was poor, and compliance audit preparation was time-consuming.",
    solution:
      "2KO Systems built a custom maintenance request and approval system with structured approval chains, real-time status dashboards, and automated escalation for overdue items. Each site had role-based access, and management had a consolidated view across all operations.",
    outcomes: [
      "Approval turnaround reduced from days to hours",
      "Full audit trail for every maintenance decision",
      "Real-time dashboard for cross-site visibility",
      "Compliance preparation time reduced significantly",
    ],
  },
  {
    sector: "Agriculture",
    title: "Stock request and seasonal workflow system for an agri-support business",
    challenge:
      "An agricultural services company was managing seasonal stock requests, allocations, and delivery coordination through a patchwork of paper forms, phone calls, and shared spreadsheets. Errors were frequent, and the admin burden during peak season was unsustainable.",
    solution:
      "2KO Systems designed a digital request-and-allocation workflow with role-based submission, automated stock matching, approval chains, and delivery scheduling. A simple portal gave field teams the ability to submit and track requests from any device.",
    outcomes: [
      "End-to-end digital workflow for stock requests",
      "Significantly reduced errors in allocation",
      "Field teams able to submit and track via mobile",
      "Admin hours during peak season cut substantially",
    ],
  },
  {
    sector: "Logistics",
    title: "Reporting and handover control for a fleet-based logistics provider",
    challenge:
      "A logistics company with multiple depots was relying on manual processes for load handovers, driver check-ins, and end-of-day reporting. Head office had limited visibility and spent hours each week consolidating reports manually.",
    solution:
      "2KO Systems built a digital handover and reporting platform with depot-level data capture, automated report generation, and a centralised dashboard for head office. Driver check-in workflows were digitised with mobile-friendly interfaces.",
    outcomes: [
      "Automated daily and weekly report generation",
      "Real-time depot performance visibility",
      "Digital handover process with full audit trail",
      "Manual reporting hours reduced by over 80%",
    ],
  },
  {
    sector: "Training & Compliance",
    title: "Accreditation and assessment portal for a national training provider",
    challenge:
      "A training and accreditation body was managing learner registrations, assessment submissions, moderation workflows, and certificate issuance using a combination of legacy systems, email, and shared drives. The process was slow, error-prone, and difficult to audit.",
    solution:
      "2KO Systems created a purpose-built portal for learner management, assessment submission and moderation, automated certificate generation, and compliance reporting. Role-based access ensured assessors, moderators, and administrators each had the right view.",
    outcomes: [
      "Learner-to-certificate workflow fully digitised",
      "Moderation cycle time reduced significantly",
      "Automated compliance reporting for regulators",
      "Single source of truth for all assessment data",
    ],
  },
  {
    sector: "Industrial Services",
    title: "Operations hub for a multi-discipline technical services business",
    challenge:
      "A technical services company managing electrical, mechanical, and civil projects was running operations through email chains, disconnected spreadsheets, and manual job cards. Project visibility was poor, and invoicing was delayed because job completion data was hard to consolidate.",
    solution:
      "2KO Systems built an operational hub with digital job cards, project tracking, resource allocation, client portals for status updates, and automated reporting. An approvals layer ensured scope changes and cost variations were properly governed.",
    outcomes: [
      "All projects visible in a single operational view",
      "Digital job cards replaced paper-based processes",
      "Client portal for real-time project status",
      "Invoicing cycle time reduced through automated data flow",
    ],
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        title="Real operational problems. Practical system solutions."
        description="Illustrative examples of the kind of work we do — drawn from real operational pain across mining, agriculture, logistics, training, and services."
        primaryCTA="Book a Systems Audit"
        primaryHref="/get-started"
      />

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-10">
            {caseStudies.map((study) => (
              <div
                key={study.title}
                className="rounded-2xl border border-border bg-surface p-7 md:p-10"
              >
                <span className="mb-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
                  {study.sector}
                </span>
                <h2 className="mb-6 text-xl font-semibold tracking-tight text-text md:text-2xl">
                  {study.title}
                </h2>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted2">
                      Challenge
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {study.challenge}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted2">
                      Solution
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {study.solution}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted2">
                      Outcomes
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {study.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex items-start gap-2.5"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span className="text-sm text-muted">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="See yourself in one of these stories?"
        description="Start with a Systems Audit and we will map the highest-value opportunity in your operation."
        primaryCTA="Book a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="Explore Solutions"
        secondaryHref="/solutions"
      />
    </>
  );
}
