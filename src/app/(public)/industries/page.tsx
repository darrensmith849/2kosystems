import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Custom operational systems for mining, agriculture, logistics, industrial services, compliance-heavy organisations, multi-branch operators and training bodies. Concrete examples per sector.",
  openGraph: {
    title: "Industries | 2KO Systems",
    description:
      "Sector-specific systems for operations-led businesses. Mining maintenance, agri stock, fleet handovers, technical job cards, compliance audit trails, and more.",
  },
};

type Industry = {
  title: string;
  image: string;
  description: string;
  challenges: string[];
  examples: string[];
  relatedSolutions: { label: string; href: string }[];
};

const industries: Industry[] = [
  {
    title: "Mining & Mining-Adjacent",
    image: "/imagery/industries/mining.jpg",
    description:
      "Multi-site, contractor-heavy, audit-sensitive. Operations move on shift handovers, safety approvals, maintenance jobs, and compliance records — all of which deserve a system, not a spreadsheet.",
    challenges: [
      "Paper-based safety and maintenance workflows",
      "Contractor compliance tracked in disconnected files",
      "Shift handovers handled by phone and WhatsApp",
      "Limited cross-site visibility for head office",
    ],
    examples: [
      "Site-level maintenance request and approval flows",
      "Contractor compliance and document expiry tracking",
      "Incident logging with structured root-cause capture",
      "Shift handover with read-receipt and outstanding-action register",
      "Compliance and audit-prep dashboard across sites",
    ],
    relatedSolutions: [
      { label: "Approvals & Governance", href: "/solutions#approvals-governance" },
      { label: "Workflow Automation", href: "/solutions#workflow-automation" },
      { label: "Dashboards & Reporting", href: "/solutions#dashboards-reporting" },
    ],
  },
  {
    title: "Agriculture & Agri-Support",
    image: "/imagery/industries/agriculture.jpg",
    description:
      "Distributed farm operations, co-ops and agri-support businesses with sharp seasonal peaks. Field-to-office communication and stock coordination break down quickly without the right system.",
    challenges: [
      "Fragmented stock and input management",
      "Seasonal workflow complexity",
      "Field-to-office communication gaps",
      "Manual reporting and record-keeping",
    ],
    examples: [
      "Seasonal stock request and allocation workflows",
      "Pack-house and admin coordination tools",
      "Mobile field data capture and pack-out reporting",
      "Supplier and customer reporting portals",
      "Operations dashboards for co-op management",
    ],
    relatedSolutions: [
      { label: "Workflow Automation", href: "/solutions#workflow-automation" },
      { label: "Client & Staff Portals", href: "/solutions#client-staff-portals" },
      { label: "Dashboards & Reporting", href: "/solutions#dashboards-reporting" },
    ],
  },
  {
    title: "Logistics & Fleet-Based",
    image: "/imagery/industries/logistics.jpg",
    description:
      "Depot-level operations with daily reporting cycles, proof-of-delivery requirements and exceptions that need to surface fast. Manual handovers add delay and error.",
    challenges: [
      "Manual dispatch and routing coordination",
      "Paper-based proof of delivery and handovers",
      "Limited real-time fleet visibility",
      "Disconnected reporting across depots",
    ],
    examples: [
      "Driver check-in and handover flows on mobile",
      "Digital proof-of-delivery with photo and signature",
      "Dispatch coordination with exception flags",
      "Daily and weekly reporting auto-generated from depot data",
      "Head-office dashboard across every depot",
    ],
    relatedSolutions: [
      { label: "Workflow Automation", href: "/solutions#workflow-automation" },
      { label: "Dashboards & Reporting", href: "/solutions#dashboards-reporting" },
      { label: "AI-Assisted Operations", href: "/solutions#ai-assisted-operations" },
    ],
  },
  {
    title: "Industrial & Technical Services",
    image: "/imagery/industries/industrial.jpg",
    description:
      "Field teams running concurrent jobs across electrical, mechanical and civil disciplines, with client visibility, sign-offs and invoicing all blocked by paper job cards and email.",
    challenges: [
      "Email and WhatsApp-based job management",
      "Manual quoting and approval processes",
      "No client visibility on job status",
      "Inconsistent reporting across teams",
    ],
    examples: [
      "Digital job cards with mobile capture and proof-of-completion",
      "Field-team scheduling and equipment checklists",
      "Client portal for live project status and sign-offs",
      "Approval flow for scope changes and cost variations",
      "Operations hub linking jobs to invoicing data",
    ],
    relatedSolutions: [
      { label: "Workflow Automation", href: "/solutions#workflow-automation" },
      { label: "Client & Staff Portals", href: "/solutions#client-staff-portals" },
      { label: "Approvals & Governance", href: "/solutions#approvals-governance" },
    ],
  },
  {
    title: "Compliance-Heavy Organisations",
    image: "/imagery/industries/compliance.jpg",
    description:
      "Where the audit story is part of the operating story. The right system writes the audit trail automatically — instead of a sprint to assemble evidence twice a year.",
    challenges: [
      "Spreadsheet-based compliance tracking",
      "No audit trail for approvals and decisions",
      "Manual preparation for regulatory audits",
      "Risk exposure from process gaps",
    ],
    examples: [
      "Approval chains with reason-for-decision captured by default",
      "Document and policy version control with attestations",
      "Continuous audit-readiness dashboards",
      "Regulator reporting auto-assembled from operational data",
      "Exception logging with closure ownership",
    ],
    relatedSolutions: [
      { label: "Approvals & Governance", href: "/solutions#approvals-governance" },
      { label: "SOP & Knowledge Copilots", href: "/solutions#sop-knowledge-copilots" },
      { label: "Dashboards & Reporting", href: "/solutions#dashboards-reporting" },
    ],
  },
  {
    title: "Multi-Branch Operations",
    image: "/imagery/industries/multi-branch.jpg",
    description:
      "Branches that drift over time toward their own way of doing things. The work is to standardise without slowing the local team down.",
    challenges: [
      "Inconsistent processes across branches",
      "No centralised operational visibility",
      "Manual consolidation of branch reports",
      "Difficulty scaling admin as branches grow",
    ],
    examples: [
      "Standardised branch workflows with local autonomy",
      "Central head-office dashboard across every branch",
      "Branch-vs-branch performance comparison views",
      "Auto-consolidated daily and weekly reporting",
      "Onboarding flows for new branches that match the standard",
    ],
    relatedSolutions: [
      { label: "Dashboards & Reporting", href: "/solutions#dashboards-reporting" },
      { label: "Workflow Automation", href: "/solutions#workflow-automation" },
      { label: "Client & Staff Portals", href: "/solutions#client-staff-portals" },
    ],
  },
  {
    title: "Training & Compliance Bodies",
    image: "/imagery/industries/compliance.jpg",
    description:
      "Learner records, attendance, certification, assessment and audit prep — typically managed across legacy tools and email. A purpose-built system replaces three or four of those at once.",
    challenges: [
      "Learner data scattered across legacy systems",
      "Manual moderator allocation and tracking",
      "Certificate generation handled by hand",
      "Audit prep starts weeks ahead of every cycle",
    ],
    examples: [
      "Learner registration and progress tracking",
      "Assessment submission with moderator routing",
      "Certificate generation on completion",
      "Attendance and qualifications register",
      "Regulator reporting on demand",
    ],
    relatedSolutions: [
      { label: "Client & Staff Portals", href: "/solutions#client-staff-portals" },
      { label: "Workflow Automation", href: "/solutions#workflow-automation" },
      { label: "SOP & Knowledge Copilots", href: "/solutions#sop-knowledge-copilots" },
    ],
  },
];

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Built for sectors where process matters and admin is heavy."
        description="We work especially well with analogue-heavy, operations-led businesses that need practical systems — not more generic software. Below: the specific operational pain we see most often, and the systems we build for each sector."
        primaryCTA="Request a Systems Audit"
        primaryHref="/get-started"
        videoSrc="/videos/plexus-network.mp4"
        videoPoster="/videos/plexus-network-poster.jpg"
        videoTreatment="plexus"
      />

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {industries.map((industry) => (
              <div
                key={industry.title}
                className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent/30"
              >
                <div className="relative h-44 w-full overflow-hidden md:h-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={industry.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover saturate-[0.85] transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                </div>
                <div className="p-7">
                  <h3 className="mb-3 text-xl font-semibold text-text">
                    {industry.title}
                  </h3>
                  <p className="mb-5 text-sm leading-relaxed text-muted">
                    {industry.description}
                  </p>

                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted2">
                    Common challenges
                  </h4>
                  <ul className="mb-6 flex flex-col gap-2">
                    {industry.challenges.map((challenge) => (
                      <li key={challenge} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300/70" />
                        <span className="text-sm text-muted">{challenge}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted2">
                    Systems we build for this sector
                  </h4>
                  <ul className="mb-6 flex flex-col gap-2">
                    {industry.examples.map((example) => (
                      <li key={example} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span className="text-sm text-text">{example}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    {industry.relatedSolutions.map((rs) => (
                      <Link
                        key={rs.href}
                        href={rs.href}
                        className="inline-block rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-accent/40 hover:bg-white/[0.06] hover:text-text"
                      >
                        {rs.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Operating in one of these sectors?"
        description="Book a Systems Audit to identify the highest-impact workflow to digitise first."
        primaryCTA="Book a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="Explore Solutions"
        secondaryHref="/solutions"
      />
    </>
  );
}
