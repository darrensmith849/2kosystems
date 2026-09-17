import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import PageHero from "@/components/cinema/PageHero";
import PhaseArtefact from "@/components/cinema/PhaseArtefact";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import TrackedLink from "@/components/cinema/TrackedLink";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import { RATES, TIMEBOX } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "Process & Automation Opportunity Audit",
  description:
    "Quantify three operational improvement opportunities, distinguish process and training needs from automation, and receive one evidence-based recommendation.",
  alternates: { canonical: "/audit" },
});

const questions = [
  "Where does the process lose time, quality or control?",
  "What is the cost of the current state?",
  "Which evidence was observed and which was reported?",
  "Is the primary constraint process, capability, technology or a combination?",
  "Which intervention offers the best balance of value and delivery risk?",
  "How will the result be measured?",
];

const deliverables = [
  ["Current state", "The process as the work actually happens"],
  ["Three findings", "Ranked by value and delivery risk"],
  ["Visible arithmetic", "Calculations, assumptions and confidence"],
  ["Evidence labels", "Observed and reported kept separate"],
  ["Constraint class", "Process, capability and technology"],
  ["One next action", "The smallest defensible intervention"],
  ["Measurement plan", "Baseline, target, source and owner"],
  ["Pilot scope", "Only where a build is justified"],
];

export default function AuditPage() {
  return (
    <>
      <ServiceJsonLd
        name="Process and Automation Opportunity Audit"
        description="Three quantified operational improvement opportunities and one evidence-based recommendation."
        path="/audit"
        price="24500"
        duration={TIMEBOX.audit}
      />

      <PageHero
        eyebrow="PROCESS AND AUTOMATION OPPORTUNITY AUDIT"
        title={<>Know what the problem costs <span className="text-[var(--warm-70)]">before deciding what to build.</span></>}
        titleClass="max-w-[20ch]"
        lead="We examine the work as it actually happens, quantify three operational opportunities and distinguish problems that need process change or training from those that should be automated."
        ctas={[
          { href: "/contact?interest=audit", label: "Quantify the opportunity", offer: "opportunity audit" },
          { href: "/process-review", label: "Start with a half-day review", ghost: true, offer: "process review" },
        ]}
        facts={[
          { value: RATES.audit, label: "standard audit" },
          { value: RATES.auditExtended, label: "extended audit" },
          { value: "Three", label: "costed findings" },
          { value: "One", label: "recommended intervention" },
        ]}
      >
        <div className="relative mt-14 max-w-[900px]">
          <div className="k-horizon top-0" aria-hidden="true" />
          <div className="pointer-events-none absolute -inset-16 -z-10 bg-[var(--signal)]/5 blur-3xl" aria-hidden="true" />
          <PhaseArtefact kind="findings" />
          <p className="k-mono mt-4">Illustrative findings · example process, arithmetic and evidence labels</p>
        </div>
      </PageHero>

      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/audit/process-walk-v1.webp" priority sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/25 to-black/55" aria-hidden="true" />
        <div className="k-shell grid gap-12 pb-20 pt-40 lg:grid-cols-[minmax(0,.75fr)_minmax(440px,1.25fr)] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">01 — What the audit answers</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[14ch]">Follow the loss until it becomes a decision.</h2></Rise>
          </div>
          <Rise step={2}>
            <ol className="grid overflow-hidden rounded-2xl border border-white/10 bg-black/72 backdrop-blur-xl sm:grid-cols-2">
              {questions.map((question, index) => (
                <li key={question} className="min-h-[150px] border-b border-white/10 p-6 sm:[&:nth-child(odd)]:border-r">
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <h3 className="k-sub mt-5">{question}</h3>
                </li>
              ))}
            </ol>
          </Rise>
        </div>
      </section>

      <section className="k-band overflow-hidden">
        <div className="k-shell grid gap-14 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Rise><p className="k-mono k-mono--ember">02 — The deliverable</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[14ch]">A decision document, not a sales deck.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-8 max-w-[42ch]">Eight to fourteen pages, with every material number showing its working and every claim showing where it came from.</p></Rise>
          </div>
          <div className="relative">
            <div className="absolute bottom-0 left-[27px] top-8 w-px bg-gradient-to-b from-[var(--signal)] via-[var(--ember)] to-transparent" aria-hidden="true" />
            {deliverables.map(([title, body], index) => (
              <Rise key={title} step={(index % 3) as 0 | 1 | 2}>
                <article className="relative grid gap-4 border-t border-[var(--hair)] py-7 pl-20 sm:grid-cols-[minmax(0,.7fr)_minmax(0,1fr)] sm:items-baseline">
                  <span className="absolute left-0 top-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--hair-2)] bg-[var(--black)] k-num text-[17px]">0{index + 1}</span>
                  <h3 className="k-sub">{title}</h3>
                  <p className="k-sm">{body}</p>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(90px,19vw,280px)] font-semibold leading-none tracking-[-.09em] text-white/[.018]" aria-hidden="true">EVIDENCE</div>
        <div className="k-shell relative grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(390px,.75fr)] lg:items-center">
          <div>
            <Rise><p className="k-mono">03 — Evidence before recommendation</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">Observed is not the same as reported.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-8 max-w-[50ch]">No product name appears before the current state and findings. If the problem cannot be quantified honestly, the audit says so.</p></Rise>
            <Rise step={3}>
              <div className="mt-12 flex flex-wrap gap-3">
                <span className="rounded-full border border-[var(--signal)] px-4 py-2 k-mono text-[var(--signal)]">Observed</span>
                <span className="rounded-full border border-[var(--hair-2)] px-4 py-2 k-mono">Reported</span>
                <span className="rounded-full border border-[var(--ember)] px-4 py-2 k-mono text-[var(--ember)]">Calculated</span>
              </div>
            </Rise>
          </div>
          <Rise step={2}>
            <aside className="relative overflow-hidden rounded-2xl border border-[var(--hair-2)] bg-[var(--panel)] p-8 shadow-2xl">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--ember)]/10 blur-3xl" aria-hidden="true" />
              <p className="k-mono k-mono--ember">Illustrative calculation</p>
              <h3 className="k-sub mt-6">Manual reconciliation</h3>
              <p className="mt-6 text-[13px] text-[var(--warm-70)]">8 people × 3 hours each week × R420 loaded hourly cost</p>
              <p className="k-num mt-8 text-[clamp(44px,6vw,72px)] leading-none">R524,160</p>
              <p className="k-mono mt-3">Annual handling cost</p>
              <div className="mt-8 h-px bg-gradient-to-r from-[var(--ember)] to-transparent" />
              <p className="k-sm mt-5">Before the cost of error, delay or management attention.</p>
              <p className="k-mono mt-6">Example only · not a client result</p>
            </aside>
          </Rise>
        </div>
      </section>

      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/audit/scope-decision-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/15 to-black/45" aria-hidden="true" />
        <div className="k-shell pb-20 pt-40">
          <Rise><p className="k-mono k-mono--ember">04 — Two scopes</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Enough investigation to make the next decision.</h2></Rise>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {[
              ["Standard Audit", "One process, one site and one day of fieldwork across at least two operational levels.", RATES.audit, TIMEBOX.audit],
              ["Extended Audit", "Connected processes, multiple sites or additional evidence gathering.", RATES.auditExtended, TIMEBOX.auditExtended],
            ].map(([name, body, price, time], index) => (
              <Rise key={name} step={index as 0 | 1}>
                <article className="h-full rounded-2xl border border-white/10 bg-black/72 p-7 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between"><p className="k-mono">{time}</p><span className="k-mono k-mono--ember">0{index + 1}</span></div>
                  <h2 className="k-title mt-8">{name}</h2>
                  <p className="k-sm mt-4 max-w-[48ch]">{body}</p>
                  <p className="k-num mt-10 text-[clamp(38px,5vw,62px)] leading-none">{price}</p>
                  <p className="k-mono mt-3">ex VAT · fixed</p>
                </article>
              </Rise>
            ))}
          </div>
          <Rise className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            <TrackedLink href="/contact?interest=audit" eventOffer="opportunity audit" className="k-btn k-btn--solid">Quantify the opportunity</TrackedLink>
            <Link href="/process-review" className="k-link">Not ready? Start with a review</Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
