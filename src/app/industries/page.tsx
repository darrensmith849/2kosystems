import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Custom operational systems for mining, agriculture, logistics, industrial services, compliance-heavy organisations, and multi-branch operators.",
};

const industries = [
  {
    title: "Mining & Mining-Adjacent",
    image: "/imagery/industries/mining.jpg",
    description:
      "Digitise maintenance approvals, safety workflows, contractor management, shift handovers, and compliance reporting. Replace spreadsheet-driven tracking with live operational dashboards built for multi-site mining environments.",
    challenges: [
      "Paper-based safety and maintenance workflows",
      "Disconnected contractor and compliance tracking",
      "Manual shift handover processes",
      "Limited operational visibility across sites",
    ],
  },
  {
    title: "Agriculture & Agri-Support",
    image: "/imagery/industries/agriculture.jpg",
    description:
      "Streamline stock requests, seasonal workflows, field reporting, and supply chain coordination. Build systems that work across distributed farm operations, co-ops, and agri-support businesses.",
    challenges: [
      "Fragmented stock and input management",
      "Seasonal workflow complexity",
      "Field-to-office communication gaps",
      "Manual reporting and record-keeping",
    ],
  },
  {
    title: "Logistics & Fleet-Based",
    image: "/imagery/industries/logistics.jpg",
    description:
      "Replace manual dispatch, handover, and reporting processes with structured digital workflows. Improve load tracking, driver coordination, and operational reporting for fleet-based businesses.",
    challenges: [
      "Manual dispatch and routing coordination",
      "Paper-based proof of delivery and handovers",
      "Limited real-time fleet visibility",
      "Disconnected reporting across depots",
    ],
  },
  {
    title: "Industrial & Technical Services",
    image: "/imagery/industries/industrial.jpg",
    description:
      "Digitise job cards, service requests, quoting workflows, and project tracking. Build portals for clients to submit requests and track progress, with live reporting for management.",
    challenges: [
      "Email and WhatsApp-based job management",
      "Manual quoting and approval processes",
      "No client visibility on job status",
      "Inconsistent reporting across teams",
    ],
  },
  {
    title: "Compliance-Heavy Organisations",
    image: "/imagery/industries/compliance.jpg",
    description:
      "Build structured approval chains, audit trails, and governance workflows that make compliance visible and enforceable. Replace manual checklists with systems that track every decision.",
    challenges: [
      "Spreadsheet-based compliance tracking",
      "No audit trail for approvals and decisions",
      "Manual preparation for regulatory audits",
      "Risk exposure from process gaps",
    ],
  },
  {
    title: "Multi-Branch Operations",
    image: "/imagery/industries/multi-branch.jpg",
    description:
      "Create centralised operational systems for businesses running across multiple locations. Standardise processes, enable branch-level reporting, and give head office real-time visibility.",
    challenges: [
      "Inconsistent processes across branches",
      "No centralised operational visibility",
      "Manual consolidation of branch reports",
      "Difficulty scaling admin as branches grow",
    ],
  },
];

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Built for sectors where process matters and admin is heavy."
        description="We work especially well with analogue-heavy, operations-led businesses that need practical systems — not more generic software."
        primaryCTA="Book a Systems Audit"
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
                  <ul className="flex flex-col gap-2">
                    {industry.challenges.map((challenge) => (
                      <li key={challenge} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span className="text-sm text-muted">{challenge}</span>
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
