import ClientLogoCarousel from "@/components/ClientLogoCarousel";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import StepProcess from "@/components/StepProcess";
import CTASection from "@/components/CTASection";
import PremiumSystemsHero from "@/components/home/PremiumSystemsHero";
import AmbientMotion from "@/components/home/AmbientMotion";
import FlowPipeline from "@/components/home/FlowPipeline";
import BeforeAfter from "@/components/home/BeforeAfter";
import SystemEngine from "@/components/home/SystemEngine";
import {
  WorkflowIcon,
  PortalIcon,
  ApprovalIcon,
  DashboardIcon,
  KnowledgeIcon,
  AIIcon,
  AuditIcon,
  PilotIcon,
  BuildIcon,
  RetainerIcon,
  MiningIcon,
  AgricultureIcon,
  LogisticsIcon,
  IndustrialIcon,
  ComplianceIcon,
  MultiBranchIcon,
  TrainingIcon,
  SpreadsheetIcon,
  ProcessIcon,
  CustomIcon,
  AdminIcon,
  ScopeIcon,
  PrototypeIcon,
  OptimiseIcon,
} from "@/components/Icons";

const industryIcons = [
  MiningIcon,
  AgricultureIcon,
  LogisticsIcon,
  IndustrialIcon,
  ComplianceIcon,
  MultiBranchIcon,
  TrainingIcon,
  SpreadsheetIcon,
];

export default function Home() {
  return (
    <>
      {/* SECTION 1 — HERO */}
      <PremiumSystemsHero />

      {/* SECTION 2 — TRUST / LOGOS */}
      <ClientLogoCarousel />

      {/* SECTION 3 — POSITIONING */}
      <section className="relative overflow-hidden border-t border-border/60 bg-background">
        <AmbientMotion variant="drift" />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="Built for real operations, not tech theatre."
            description="You don't need more software. You need the right system for how your business actually runs."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              icon={<ProcessIcon size={22} />}
              title="Process-first thinking"
              description="We start with the bottleneck, not the trend."
            />
            <Card
              icon={<CustomIcon size={22} />}
              title="Custom-built for your operation"
              description="Shaped around your workflows, approvals, and reporting reality."
            />
            <Card
              icon={<AIIcon size={22} />}
              title="AI where it adds real value"
              description="Drafting, routing, summarising, and decision support — not for show."
            />
            <Card
              icon={<AdminIcon size={22} />}
              title="Less admin, faster decisions"
              description="Reduced follow-up. Better movement. Clearer visibility."
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHAT WE BUILD */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="What we build"
            description="Custom systems that replace fragmented workflows with one clear operational layer."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <Card
              icon={<WorkflowIcon size={22} />}
              title="Workflow Automation"
              description="Digitise operational flows from request to approval to completion."
            />
            <Card
              icon={<PortalIcon size={22} />}
              title="Client & Staff Portals"
              description="Role-based portals for onboarding, requests, status visibility, and document access."
            />
            <Card
              icon={<ApprovalIcon size={22} />}
              title="Approvals & Governance"
              description="Approval chains, audit trails, escalation logic, and compliance visibility."
            />
            <Card
              icon={<DashboardIcon size={22} />}
              title="Dashboards & Reporting"
              description="Live operational dashboards and automated reporting that remove status chasing."
            />
            <Card
              icon={<KnowledgeIcon size={22} />}
              title="SOP & Knowledge Copilots"
              description="Procedures, standards, and answers accessible at the point of work."
            />
            <Card
              icon={<AIIcon size={22} />}
              title="AI-Assisted Operations"
              description="Classification, summaries, draft generation, triage, and search where it improves speed."
            />
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW CLIENTS START */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="A low-risk path into custom systems"
            description="Start narrow, prove value, scale from there."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              number="01"
              icon={<AuditIcon size={22} />}
              title="Systems Opportunity Audit"
              description="Paid diagnostic to identify the best workflow to digitise first and define the ROI case."
            />
            <Card
              number="02"
              icon={<PilotIcon size={22} />}
              title="Proof-of-Value Pilot"
              description="A tightly scoped system that solves one painful process quickly and visibly."
            />
            <Card
              number="03"
              icon={<BuildIcon size={22} />}
              title="Core System Build"
              description="Custom platform built around your workflows, approvals, reporting, and user roles."
            />
            <Card
              number="04"
              icon={<RetainerIcon size={22} />}
              title="Managed Intelligence Retainer"
              description="Ongoing optimisation, AI enhancements, reporting improvements, and system evolution."
            />
          </div>
        </div>
      </section>

      {/* SECTION 6 — WHO IT'S FOR */}
      <section className="relative overflow-hidden border-t border-border/60 bg-background">
        <AmbientMotion variant="mesh" />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
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
              "Teams stuck in spreadsheets, paper, and WhatsApp workflows",
            ].map((item, i) => {
              const Icon = industryIcons[i];
              return (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-surface p-5"
                >
                  <span className="text-accent/70">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm text-text">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6.5 — FLOW PIPELINE */}
      <FlowPipeline />

      {/* SECTION 6.6 — BEFORE / AFTER */}
      <BeforeAfter />

      {/* SECTION 6.7 — SYSTEMS ENGINE */}
      <SystemEngine />

      {/* SECTION 7 — HOW WE WORK */}
      <section className="relative overflow-hidden border-t border-border/60 bg-background">
        {/* Subtle AI-generated process visual */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/imagery/generated/process-mesh.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <SectionHeader title="How we work" />

          <StepProcess
            steps={[
              {
                number: "01",
                title: "Audit",
                icon: <AuditIcon size={18} />,
                description:
                  "Identify the bottleneck, map the workflow, define the improvement target.",
              },
              {
                number: "02",
                title: "Scope",
                icon: <ScopeIcon size={18} />,
                description:
                  "Narrow to the highest-value use case with the clearest ROI path.",
              },
              {
                number: "03",
                title: "Prototype",
                icon: <PrototypeIcon size={18} />,
                description:
                  "Shape the flow, interface, and logic so stakeholders see the future state.",
              },
              {
                number: "04",
                title: "Build",
                icon: <BuildIcon size={18} />,
                description:
                  "Deploy production-ready with permissions, workflows, and reporting layers.",
              },
              {
                number: "05",
                title: "Optimise",
                icon: <OptimiseIcon size={18} />,
                description:
                  "Refine and extend over time with support, analytics, and AI enhancements.",
              },
            ]}
          />
        </div>
      </section>

      {/* SECTION 8 — GROUP CONNECTION */}
      <section className="relative overflow-hidden border-t border-border/60 bg-background">
        <AmbientMotion variant="pulse" />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="The systems arm of the 2KO group"
            description="Part of the wider 2KO ecosystem. Our systems work is grounded in real operational improvement, not just software delivery."
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
        description="Start with a Systems Audit — identify the highest-value place to digitise first."
        primaryCTA="Book a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="View Case Studies"
        secondaryHref="/case-studies"
      />
    </>
  );
}
