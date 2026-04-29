import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import TypewriterText from "@/components/TypewriterText";
import RevealOnScroll from "@/components/RevealOnScroll";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Custom workflow automation, client and staff portals, approvals and governance systems, live dashboards, knowledge copilots, and AI-assisted operations for established South African businesses.",
  openGraph: {
    title: "Solutions | 2KO Systems",
    description:
      "Custom operational systems for businesses that have outgrown spreadsheets, paper forms and disconnected tools.",
  },
};

type Solution = {
  id: string;
  title: string;
  pain: string;
  whatWeBuild: string;
  exampleFlow: string;
  typicalUsers: string;
  outcome: string;
};

const solutions: Solution[] = [
  {
    id: "workflow-automation",
    title: "Workflow Automation",
    pain:
      "Operational tasks bouncing between email, WhatsApp, paper forms and spreadsheets — with no clear ownership and no audit trail when something goes wrong.",
    whatWeBuild:
      "Custom request-to-completion workflows with structured routing, role-based assignment, escalation rules, and full status visibility. Each step is captured once, owned by one person, and visible to the rest of the operation.",
    exampleFlow:
      "Maintenance request → supervisor approval → procurement check → scheduled job → completion proof → dashboard update.",
    typicalUsers:
      "Operations managers, supervisors, branch admins, contractors, finance, COOs.",
    outcome:
      "Faster cycles, clearer ownership, fewer dropped requests, and a complete audit trail by default.",
  },
  {
    id: "client-staff-portals",
    title: "Client & Staff Portals",
    pain:
      "Clients chasing status by email; staff retyping information into multiple systems; sensitive documents shared across personal accounts and group chats.",
    whatWeBuild:
      "Secure, role-based portals where clients, staff, contractors and partners self-serve: submit requests, see status, exchange documents and review history. Each role only sees what it should.",
    exampleFlow:
      "Client logs in → submits a request → sees real-time status and history → uploads required documents → receives notifications on key changes.",
    typicalUsers:
      "Client-facing teams, account managers, field crews, contractors, learners, suppliers.",
    outcome:
      "Less status-chasing, fewer email threads, and a single source of truth for every interaction.",
  },
  {
    id: "approvals-governance",
    title: "Approvals & Governance",
    pain:
      "Approvals stalled in inboxes; no audit trail when an auditor or regulator asks for one; thresholds applied inconsistently across branches and managers.",
    whatWeBuild:
      "Multi-level approval chains with delegation, escalation and configurable business rules. Every decision is captured by user, timestamp, value and reason.",
    exampleFlow:
      "Spend request → policy check → manager approval → executive sign-off above threshold → action triggered → audit record stored.",
    typicalUsers:
      "Finance, procurement, HR, legal, risk, compliance, executive sponsors.",
    outcome:
      "Faster, traceable approvals — with the audit story written automatically as a side-effect of doing the work.",
  },
  {
    id: "dashboards-reporting",
    title: "Dashboards & Reporting",
    pain:
      "Weekly status decks built by hand; numbers debated in meetings instead of decisions; head office finding out about issues days after they happen.",
    whatWeBuild:
      "Live operational dashboards for leadership and team-level views, with automated daily/weekly reporting packs and drill-down to the underlying request, job or transaction.",
    exampleFlow:
      "Operational events flow in → KPIs roll up live → exception thresholds trigger alerts → daily and weekly reports go out automatically → leadership drills down where it matters.",
    typicalUsers:
      "MDs, COOs, branch managers, finance, regional ops leads.",
    outcome:
      "Decisions made on the latest numbers, not last week's. Reporting becomes a by-product of the workflow rather than a job.",
  },
  {
    id: "sop-knowledge-copilots",
    title: "SOP & Knowledge Copilots",
    pain:
      "Procedures and policies trapped in PDFs, drives and someone's head. New staff retrained from scratch; experienced staff answering the same questions on repeat.",
    whatWeBuild:
      "Searchable SOP and policy systems, with optional AI-powered answers grounded in your own documents. Versioned, attributable, and instrumented so you can see which procedures get used.",
    exampleFlow:
      "Field operator asks a question → copilot answers from approved SOPs with source links → unanswered questions surface as gaps → policy team updates the source → answers stay current.",
    typicalUsers:
      "Field operators, supervisors, customer service, training and compliance leads.",
    outcome:
      "The right answer at the point of work, with auditability and a feedback loop into your knowledge base.",
  },
  {
    id: "ai-assisted-operations",
    title: "AI-Assisted Operations",
    pain:
      "Drowning in unstructured input — emails, claims, requests, documents — where every item still needs a human to read, classify, and route correctly.",
    whatWeBuild:
      "Targeted AI assistance embedded inside operational workflows: classification, summarisation, draft generation, triage and search — only where it measurably improves speed or consistency. Always with a human in the loop on consequential actions.",
    exampleFlow:
      "Inbound request lands → AI classifies and routes → drafts the standard response → human reviews and approves → action executed → outcome stored for future learning.",
    typicalUsers:
      "Customer service, claims, support, compliance, ops triage teams.",
    outcome:
      "Routine load taken off the team without giving up oversight on the calls that matter.",
  },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Systems that replace fragmented workflows with operational clarity."
        description="We build custom web-based systems for the workflows, approvals, reporting and coordination your business depends on. Six core service areas — every engagement is custom-shaped to the operation."
        primaryCTA="Request a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="See Case Studies"
        secondaryHref="/case-studies"
      />

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-20">
            {solutions.map((solution, index) => (
              <RevealOnScroll key={solution.id}>
                <article
                  id={solution.id}
                  className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2"
                >
                  <div>
                    <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
                      {String(index + 1).padStart(2, "0")} · {solution.title}
                    </span>
                    <h2 className="mb-4 text-2xl font-semibold tracking-tight text-text md:text-3xl">
                      <TypewriterText text={solution.title} speed={26} startDelay={120} />
                    </h2>

                    <div className="mt-6 flex flex-col gap-5">
                      <div>
                        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted2">
                          Pain it solves
                        </h3>
                        <p className="text-sm leading-relaxed text-muted">
                          <TypewriterText text={solution.pain} speed={9} startDelay={500} />
                        </p>
                      </div>
                      <div>
                        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted2">
                          What we build
                        </h3>
                        <p className="text-sm leading-relaxed text-muted">
                          <TypewriterText
                            text={solution.whatWeBuild}
                            speed={9}
                            startDelay={1200}
                          />
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card-tilt card-sweep rounded-2xl border border-border bg-surface p-6 md:p-8">
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                      Example workflow
                    </h3>
                    <div className="min-h-[6.5rem] rounded-lg border border-white/10 bg-white/[0.03] p-4 font-mono text-[13px] leading-relaxed text-text">
                      <TypewriterText text={solution.exampleFlow} speed={16} startDelay={300} />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted2">
                          Typical users
                        </h4>
                        <p className="text-sm leading-relaxed text-muted">
                          <TypewriterText
                            text={solution.typicalUsers}
                            speed={10}
                            startDelay={1600}
                          />
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted2">
                          Outcome
                        </h4>
                        <p className="text-sm leading-relaxed text-muted">
                          <TypewriterText
                            text={solution.outcome}
                            speed={10}
                            startDelay={2200}
                          />
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        href="/get-started"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent2"
                      >
                        Discuss a system like this →
                      </Link>
                    </div>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to modernise one critical workflow?"
        description="Start with a Systems Audit and identify the highest-value place to digitise first."
        primaryCTA="Request a Systems Audit"
        primaryHref="/get-started"
        secondaryCTA="View Case Studies"
        secondaryHref="/case-studies"
      />
    </>
  );
}
