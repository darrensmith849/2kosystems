import Link from "next/link";
import ClientLogoCarousel from "@/components/ClientLogoCarousel";
import VisitSiteLabel from "@/components/VisitSiteLabel";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import StepProcess from "@/components/StepProcess";
import CTASection from "@/components/CTASection";
import RevealOnScroll from "@/components/RevealOnScroll";
import PremiumSystemsHero from "@/components/home/PremiumSystemsHero";
import AmbientMotion from "@/components/home/AmbientMotion";
import OperationsLattice from "@/components/home/OperationsLattice";
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
        <OperationsLattice />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <SectionHeader
            title="Built for real operations, not tech theatre."
            description="You don't need more software. You need the right system for how your business actually runs."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <RevealOnScroll delay={0} className="h-full">
              <Card
                icon={<ProcessIcon size={22} />}
                title="Process-first thinking"
                description="We start with the bottleneck, not the trend."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={90} className="h-full">
              <Card
                icon={<CustomIcon size={22} />}
                title="Custom-built for your operation"
                description="Shaped around your workflows, approvals, and reporting reality."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={180} className="h-full">
              <Card
                icon={<AIIcon size={22} />}
                title="AI where it adds real value"
                description="Drafting, routing, summarising, and decision support — not for show."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={270} className="h-full">
              <Card
                icon={<AdminIcon size={22} />}
                title="Less admin, faster decisions"
                description="Reduced follow-up. Better movement. Clearer visibility."
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHAT WE BUILD */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            title="What we build"
            description="Custom systems that replace fragmented workflows with one clear operational layer."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <RevealOnScroll delay={0} className="h-full">
              <Card
                icon={<WorkflowIcon size={22} />}
                title="Workflow Automation"
                description="Digitise operational flows from request to approval to completion."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={80} className="h-full">
              <Card
                icon={<PortalIcon size={22} />}
                title="Client & Staff Portals"
                description="Role-based portals for onboarding, requests, status visibility, and document access."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={160} className="h-full">
              <Card
                icon={<ApprovalIcon size={22} />}
                title="Approvals & Governance"
                description="Approval chains, audit trails, escalation logic, and compliance visibility."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={240} className="h-full">
              <Card
                icon={<DashboardIcon size={22} />}
                title="Dashboards & Reporting"
                description="Live operational dashboards and automated reporting that remove status chasing."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={320} className="h-full">
              <Card
                icon={<KnowledgeIcon size={22} />}
                title="SOP & Knowledge Copilots"
                description="Procedures, standards, and answers accessible at the point of work."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={400} className="h-full">
              <Card
                icon={<AIIcon size={22} />}
                title="AI-Assisted Operations"
                description="Classification, summaries, draft generation, triage, and search where it improves speed."
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* SECTION 4.5 — VISUAL ACCENT (light callout) */}
      <section className="relative overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20 lg:px-10">
          <div
            className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 md:p-12"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 60% at 100% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%)",
              }}
            />
            <div className="relative max-w-2xl">
              <p
                className="text-[12px] font-medium uppercase text-[var(--accent)]"
                style={{ letterSpacing: "var(--tracking-eyebrow)" }}
              >
                Live operational visibility
              </p>
              <p
                className="mt-3 font-semibold text-[var(--color-fg)]"
                style={{
                  fontSize: "var(--text-display-md)",
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: 1.1,
                }}
              >
                One operational layer. Less chasing, faster decisions, clearer
                reporting.
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--color-fg-muted)]">
                Dashboards, approvals, and workflows that show what is actually
                happening — not what people remember to update.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW CLIENTS START */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <SectionHeader
            title="A low-risk path into custom systems"
            description="Start narrow, prove value, scale from there."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <RevealOnScroll delay={0} className="h-full">
              <Card
                number="01"
                icon={<AuditIcon size={22} />}
                title="Systems Opportunity Audit"
                description="Paid diagnostic to identify the best workflow to digitise first and define the ROI case."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={90} className="h-full">
              <Card
                number="02"
                icon={<PilotIcon size={22} />}
                title="Proof-of-Value Pilot"
                description="A tightly scoped system that solves one painful process quickly and visibly."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={180} className="h-full">
              <Card
                number="03"
                icon={<BuildIcon size={22} />}
                title="Core System Build"
                description="Custom platform built around your workflows, approvals, reporting, and user roles."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={270} className="h-full">
              <Card
                number="04"
                icon={<RetainerIcon size={22} />}
                title="Managed Intelligence Retainer"
                description="Ongoing optimisation, AI enhancements, reporting improvements, and system evolution."
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* SECTION 6 — WHO IT'S FOR */}
      <section className="relative overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        <AmbientMotion variant="mesh" />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="Best suited to analogue-heavy and operations-led businesses"
          />

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)] sm:grid-cols-2">
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
                <RevealOnScroll key={item} delay={i * 60} className="h-full">
                  <div className="flex h-full items-center gap-3 bg-[var(--color-surface)] p-5 transition-colors hover:bg-[var(--color-bg-tinted)]">
                    <span className="text-[var(--accent)]">
                      <Icon size={18} />
                    </span>
                    <span className="text-[14px] text-[var(--color-fg)]">{item}</span>
                  </div>
                </RevealOnScroll>
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

      {/* SECTION 6.8 — VISUAL ACCENT (light) */}
      <section className="relative overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20 lg:px-10">
          <div
            className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-2)] p-8 text-right md:p-12"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 60% at 0% 100%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%)",
              }}
            />
            <div className="relative ml-auto max-w-md">
              <p
                className="text-[12px] font-medium uppercase text-[var(--accent)]"
                style={{ letterSpacing: "var(--tracking-eyebrow)" }}
              >
                Custom-built, not assembled
              </p>
              <p
                className="mt-2 font-semibold text-[var(--color-fg)]"
                style={{
                  fontSize: "var(--text-headline)",
                  letterSpacing: "var(--tracking-tight)",
                  lineHeight: 1.2,
                }}
              >
                Production-ready code shaped by your operational reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — HOW WE WORK */}
      <section className="relative overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-2)]">
        {/* Subtle accent wash behind the process steps */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--accent) 5%, transparent), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <SectionHeader title="How we work" />

          <RevealOnScroll>
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
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 8 — GROUP CONNECTION */}
      <section className="relative overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <AmbientMotion variant="pulse" />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            title="The systems arm of the 2KO group"
            description="Part of the wider 2KO ecosystem. Our systems work is grounded in real operational improvement, not just software delivery."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <RevealOnScroll delay={0} className="h-full">
              <a
                href="https://www.2ko.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 transition-colors hover:border-[var(--accent-border)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h3 className="mb-1 text-[17px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                  2KO Africa
                </h3>
                <p className="text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                  Training and improvement delivery across Southern Africa.
                </p>
                <VisitSiteLabel label="Visit site" />
              </a>
            </RevealOnScroll>
            <RevealOnScroll delay={120} className="h-full">
              <a
                href="https://sixsigmasouthafrica.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 transition-colors hover:border-[var(--accent-border)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h3 className="mb-1 text-[17px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
                  Six Sigma South Africa
                </h3>
                <p className="text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                  Accreditation and consulting credibility for operational excellence.
                </p>
                <VisitSiteLabel label="Visit site" />
              </a>
            </RevealOnScroll>
            <RevealOnScroll delay={240} className="h-full">
              <Link
                href="/about"
                className="group flex h-full flex-col rounded-2xl border border-[var(--accent-border)] bg-[var(--color-surface)] p-7"
                style={{ boxShadow: "var(--shadow-glow-accent)" }}
              >
                <h3 className="mb-1 text-[17px] font-semibold tracking-[var(--tracking-tight)] text-[var(--accent)]">
                  2KO Systems
                </h3>
                <p className="text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                  Custom systems and intelligent automation for established businesses.
                </p>
                <VisitSiteLabel label="Explore 2KO Systems" internal />
              </Link>
            </RevealOnScroll>
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
