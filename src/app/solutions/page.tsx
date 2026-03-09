import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Custom workflow automation, portals, approvals, dashboards, knowledge copilots, and AI-assisted operations for established businesses.",
};

const solutions = [
  {
    id: "workflow-automation",
    title: "Workflow Automation",
    description:
      "Digitise repetitive operational flows so work moves cleanly from request to approval to completion.",
    details: [
      "Replace email-based task handoffs with structured digital workflows",
      "Automatic routing, assignment, and escalation based on business rules",
      "Full audit trails and status visibility at every step",
      "Integration with existing tools and data sources",
    ],
  },
  {
    id: "portals",
    title: "Client & Staff Portals",
    description:
      "Secure role-based portals for onboarding, requests, communication, status visibility, and document access.",
    details: [
      "Custom portals for clients, staff, contractors, or partners",
      "Role-based access control and permission management",
      "Self-service request submission and status tracking",
      "Document management and secure file sharing",
    ],
  },
  {
    id: "approvals",
    title: "Approvals & Governance",
    description:
      "Structured approval chains, audit trails, escalation logic, and compliance visibility built into the workflow.",
    details: [
      "Multi-level approval chains with delegation and escalation",
      "Configurable business rules for routing and thresholds",
      "Complete audit trail for every decision and action",
      "Compliance dashboards and governance reporting",
    ],
  },
  {
    id: "dashboards",
    title: "Dashboards & Reporting",
    description:
      "Live operational dashboards and automated reporting packs that remove manual status chasing.",
    details: [
      "Real-time operational dashboards for leadership visibility",
      "Automated report generation and distribution",
      "KPI tracking across departments and functions",
      "Drill-down from summary metrics to underlying data",
    ],
  },
  {
    id: "knowledge-copilots",
    title: "SOP & Knowledge Copilots",
    description:
      "Make procedures, standards, and key answers accessible at the point of work.",
    details: [
      "AI-powered search across SOPs, policies, and procedures",
      "Contextual answers at the point of work",
      "Version-controlled document management",
      "Usage analytics to identify knowledge gaps",
    ],
  },
  {
    id: "ai-operations",
    title: "AI-Assisted Operations",
    description:
      "Use AI for classification, summaries, draft generation, issue triage, search, and workflow support where it meaningfully improves speed and consistency.",
    details: [
      "Automated classification and routing of incoming requests",
      "AI-generated summaries for reports and communications",
      "Draft generation for standard responses and documentation",
      "Intelligent search across operational data and documents",
    ],
  },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Systems that replace fragmented workflows with operational clarity."
        description="We build custom web-based systems that digitise the workflows, approvals, reporting, and coordination your business depends on."
        primaryCTA="Book a Systems Audit"
        primaryHref="/get-started"
      />

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-16">
            {solutions.map((solution, index) => (
              <div
                key={solution.id}
                id={solution.id}
                className={`grid grid-cols-1 items-start gap-10 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:direction-rtl" : ""
                }`}
              >
                <div>
                  <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight text-text md:text-3xl">
                    {solution.title}
                  </h2>
                  <p className="mb-6 text-base leading-relaxed text-muted">
                    {solution.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-6">
                  <ul className="flex flex-col gap-3">
                    {solution.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span className="text-sm leading-relaxed text-muted">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
