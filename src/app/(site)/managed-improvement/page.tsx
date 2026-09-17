import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import ImprovementCommandCentre from "@/components/cinema/ImprovementCommandCentre";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import TrackedLink from "@/components/cinema/TrackedLink";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import { EventFeed, Panel, QueueRows } from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "Integrated Improvement Partnerships",
  description: `Annual 2KO partnerships combine process improvement, Six Sigma training, automation capacity and Sigmafy evidence. From ${RATES.partnershipProgramme} per month ex VAT.`,
  alternates: { canonical: "/managed-improvement" },
});

const levers = [
  ["Improve", "Senior process consulting", "Find the active constraint, redesign the workflow and maintain an evidence-led backlog."],
  ["Train", "Applied Six Sigma capability", "Use training allowances for agreed cohorts, workshops and coaching connected to live work."],
  ["Automate", "Bounded delivery capacity", "Release workflow automation and operational-system changes against explicit controls."],
  ["Measure", "Sigmafy and benefit evidence", "Keep statistical analysis, project gates and verified benefit in one operating record."],
];

const partnerships = [
  {
    code: "01",
    name: "Improvement Programme",
    fit: "One workstream · one developing team",
    price: RATES.partnershipProgramme,
    annual: "R1.5m annual commitment",
    mobilisation: `${RATES.mobilisationProgramme} mobilisation`,
    facts: ["1 active workstream", "3 delivery days / month", "~R300k training allowance", "Sigmafy workspace + full Statistics toolkit", "Monthly operating review"],
    href: "/contact?interest=improvement-programme",
  },
  {
    code: "02",
    name: "Operational Excellence Partner",
    fit: "Two workstreams · an improvement portfolio",
    price: RATES.partnershipOperational,
    annual: "R2.7m annual commitment",
    mobilisation: `${RATES.mobilisationOperational} mobilisation`,
    facts: ["2 active workstreams", "6 delivery days / month", "~R600k training allowance", "Organisational Sigmafy + full Statistics toolkit", "Named senior improvement lead"],
    href: "/contact?interest=operational-excellence",
    featured: true,
  },
  {
    code: "03",
    name: "Transformation Office",
    fit: "Enterprise improvement capability",
    price: RATES.partnershipTransformation,
    annual: "From R4.74m annual commitment",
    mobilisation: "Mobilisation scoped after diagnosis",
    facts: ["3–5 active workstreams", "10+ delivery days / month", "~R1.2m training allowance", "Enterprise Sigmafy + full Statistics toolkit", "Named programme lead + specialists"],
    href: "/contact?interest=transformation-office",
  },
];

const mobilisation = [
  ["Baseline", "Validate the starting measure, operational boundary and benefit hypothesis."],
  ["Governance", "Name the sponsor, process owners, decision rights and review rhythm."],
  ["Capability", "Map the training population, programme mix and live improvement projects."],
  ["Platform", "Configure Sigmafy, data access, roles, project structure and evidence rules."],
  ["Roadmap", "Commit the first 90 days, delivery capacity and material project boundaries."],
];

const separatelyScoped = [
  "Material new system builds and major integrations",
  "Travel, venues, catering and unusual training materials",
  "External accreditation or examination charges unless written in",
  "Third-party licences, infrastructure and metered AI overages",
  "Line-management responsibility or an unlimited delivery queue",
  "24/7 technical response unless separately contracted",
];

export default function ManagedImprovementPage() {
  return (
    <>
      <ServiceJsonLd
        name="Integrated Improvement Partnership"
        description="An annual operating relationship combining process improvement, Six Sigma training, automation and systems capacity, Sigmafy access, governance and benefits evidence."
        path="/managed-improvement"
        price="125000"
        duration="Twelve-month operating partnership plus mobilisation"
      />

      <section className="mi-hero">
        <div className="mi-hero-grid" aria-hidden="true" />
        <div className="k-shell mi-hero-inner">
          <div className="mi-visual-head">
            <div><Rise><p className="k-mono k-mono--ember">INTEGRATED IMPROVEMENT PARTNERSHIPS</p></Rise><Rise step={1}><h1>One team. Four levers.</h1></Rise></div>
            <Rise step={2}><p>Improve the process.<br />Train the people. Build the system. Prove the result.</p></Rise>
          </div>
          <Rise step={3}><ImprovementCommandCentre /></Rise>
        </div>
      </section>

      <section className="mi-story">
        <div className="k-shell">
          <div className="mi-story-layout">
            <div><Rise><p className="k-mono">THE PROPOSITION</p></Rise><Rise step={1}><h2>Stop buying disconnected interventions.</h2></Rise></div>
            <div className="mi-story-side">
              <Rise step={1}><p>A process rarely fails for one reason. An integrated 2KO partnership can move between consulting, capability, automation and statistical evidence as the constraint moves—without rebuilding the commercial relationship every quarter.</p></Rise>
              <Rise step={2} className="mi-story-actions"><TrackedLink href="/contact?interest=operational-excellence" eventOffer="operational excellence partnership" className="k-btn k-btn--solid">Design the partnership</TrackedLink><TrackedLink href="#partnerships" eventOffer="partnership comparison" className="k-btn k-btn--ghost">Compare all three</TrackedLink></Rise>
            </div>
          </div>
          <Rise step={2} className="mi-story-facts">
            <span><b>From {RATES.partnershipProgramme}</b><small>per month ex VAT</small></span>
            <span><b>12 months</b><small>annual operating term</small></span>
            <span><b>4 levers</b><small>one accountable relationship</small></span>
            <span><b>90 days</b><small>first roadmap at mobilisation</small></span>
          </Rise>
        </div>
      </section>

      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 top-16 text-[clamp(100px,22vw,330px)] font-semibold leading-none tracking-[-.09em] text-white/[.018]" aria-hidden="true">TOGETHER</div>
        <div className="k-shell relative">
          <Rise><p className="k-mono k-mono--ember">01 — The integrated operating model</p></Rise>
          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:items-end">
            <Rise step={1}><h2 className="k-title max-w-[20ch]">Use the intervention the evidence requires.</h2></Rise>
            <Rise step={2}><p className="k-lead max-w-[50ch]">The mix is planned annually and adjusted through the operating rhythm. Every lever remains tied to the same workstream, scorecard and benefits register.</p></Rise>
          </div>
          <div className="mt-14 overflow-hidden rounded-2xl border border-[var(--hair-2)] bg-black/25">
            {levers.map(([title, label, body], index) => (
              <Rise key={title}>
                <article className="group grid gap-5 border-b border-[var(--hair-2)] p-6 last:border-b-0 md:grid-cols-[54px_minmax(0,.62fr)_minmax(0,.82fr)_minmax(0,1.25fr)] md:items-center md:p-8">
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <h3 className="text-[clamp(30px,4vw,52px)] font-medium leading-none tracking-[-.055em] transition-colors group-hover:text-[var(--ember)]">{title}</h3>
                  <p className="k-mono text-[var(--warm-70)]">{label}</p>
                  <p className="k-sm">{body}</p>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section id="partnerships" className="k-band scroll-mt-20">
        <div className="k-shell">
          <Rise><p className="k-mono k-mono--ember">02 — Three partnership levels</p></Rise>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <Rise step={1}><h2 className="k-title max-w-[20ch]">Clear commitment. Clear capacity. Clear boundary.</h2></Rise>
            <Rise step={2}><p className="k-sm">All three are annual agreements. The training and Sigmafy allowances shown are planning values; the signed schedule confirms the exact programme, users, cohorts, projects, AI usage and support treatment.</p></Rise>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
            {partnerships.map((plan, index) => (
              <Rise key={plan.name} step={(index % 3) as 0 | 1 | 2}>
                <article className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 sm:p-8 ${plan.featured ? "border-[var(--ember)] bg-[linear-gradient(155deg,rgba(232,142,74,.14),rgba(0,0,0,.4)_42%)] shadow-[0_28px_90px_rgba(232,142,74,.1)]" : "border-[var(--hair-2)] bg-[var(--panel)]"}`}>
                  {plan.featured && <span className="absolute right-0 top-0 rounded-bl-xl bg-[var(--ember)] px-4 py-2 font-[var(--mono)] text-[10px] uppercase tracking-[.16em] text-[var(--black)]">Preferred</span>}
                  <div className="flex items-center gap-3"><span className="k-mono k-mono--ember">{plan.code}</span><span className="k-mono pr-20">{plan.fit}</span></div>
                  <h3 className="mt-9 min-h-[2em] text-[clamp(27px,3vw,36px)] font-medium leading-[1.02] tracking-[-.045em]">{plan.name}</h3>
                  <p className="k-num mt-8 text-[clamp(36px,4vw,52px)]">{index === 2 ? "from " : ""}{plan.price}</p>
                  <p className="k-mono mt-1">per month · ex VAT</p>
                  <div className="mt-6 grid gap-2 border-y border-[var(--hair-2)] py-5"><p className="k-mono text-[var(--warm-70)]">{plan.annual}</p><p className="k-mono k-mono--ember">+ {plan.mobilisation}</p></div>
                  <ul className="mt-7 flex flex-1 flex-col gap-3">{plan.facts.map((fact) => <li key={fact} className="flex gap-3 text-[13px] leading-[1.5] text-[var(--warm-70)]"><span className={plan.featured ? "text-[var(--ember)]" : "text-[var(--signal)]"}>✓</span><span>{fact}</span></li>)}</ul>
                  <TrackedLink href={plan.href} eventOffer={plan.name.toLowerCase()} className={`k-btn mt-9 w-full justify-center ${plan.featured ? "k-btn--solid" : "k-btn--ghost"}`}>{index === 2 ? "Design the office" : "Discuss this partnership"}</TrackedLink>
                </article>
              </Rise>
            ))}
          </div>
          <Rise className="mt-8 text-center"><Link href="/pricing" className="k-link">See every commercial term →</Link></Rise>
          <Rise className="mi-systems-path">
            <div><p className="k-mono k-mono--ember">SYSTEMS-ONLY PATH</p><h3>Need the system, but not the training or Sigmafy?</h3></div>
            <p>A Managed Systems Partnership operates and evolves one production system without bundling the wider improvement capability.</p>
            <TrackedLink href="/systems#managed-systems" eventOffer="managed systems partnership" className="k-btn k-btn--ghost">See managed systems</TrackedLink>
          </Rise>
        </div>
      </section>

      <section className="relative isolate flex min-h-[94svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20"><Photo src="/imagery/managed-improvement/governance-v1.webp" sizes="100vw" scrim="bottom" position="center" /></Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/72 via-black/14 to-black/54" aria-hidden="true" />
        <div className="k-shell pb-20 pt-40">
          <Rise><p className="k-mono k-mono--ember">03 — One operating rhythm</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">Every review ends with a decision, a responsible owner and a record.</h2></Rise>
          <ol className="mt-14 grid overflow-hidden rounded-2xl border border-white/10 bg-black/72 backdrop-blur-xl md:grid-cols-2 lg:grid-cols-4">
            {[["Measure", "Refresh the scorecard, Sigmafy record, adoption and capability evidence."],["Select", "Name the current constraint and choose the next intervention across all four levers."],["Deliver", "Consult, train or release bounded automation against the agreed roadmap."],["Verify", "Review the result, benefit and control plan before committing the next priority."]].map(([name, body], index) => (
              <li key={name} className="relative min-h-[220px] border-b border-r border-white/10 p-6 md:[&:nth-child(3)]:border-b-0 md:[&:nth-child(4)]:border-b-0 lg:border-b-0"><span className="absolute left-0 top-0 h-[2px] bg-gradient-to-r from-[var(--ember)] to-transparent" style={{ width: `${42 + index * 14}%` }} /><span className="k-mono k-mono--ember">0{index + 1}</span><h3 className="k-sub mt-12">{name}</h3><p className="k-sm mt-4">{body}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell grid gap-16 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)]">
          <div><Rise><p className="k-mono k-mono--ember">04 — Mobilisation</p></Rise><Rise step={1}><h2 className="k-title mt-6 max-w-[17ch]">The relationship starts with an operating design.</h2></Rise><Rise step={2}><p className="k-lead mt-7 max-w-[44ch]">Mobilisation is not free onboarding. It establishes the evidence, commercial boundary and first 90-day commitment required to operate responsibly.</p></Rise></div>
          <ol className="border-t border-[var(--hair-2)]">
            {mobilisation.map(([title, body], index) => <Rise key={title}><li className="grid gap-4 border-b border-[var(--hair-2)] py-7 sm:grid-cols-[44px_minmax(0,.55fr)_minmax(0,1fr)] sm:items-baseline"><span className="k-mono k-mono--ember">0{index + 1}</span><h3 className="k-sub">{title}</h3><p className="k-sm">{body}</p></li></Rise>)}
          </ol>
        </div>
      </section>

      <section className="k-band">
        <div className="k-shell grid gap-16 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
          <div><Rise><p className="k-mono k-mono--ember">05 — The boundary protects delivery</p></Rise><Rise step={1}><h2 className="k-title mt-6 max-w-[21ch]">An accountable partnership is not an unlimited queue.</h2></Rise><Rise step={2}><p className="k-lead mt-7 max-w-[52ch]">Preparation, analysis, meetings, delivery, documentation and verification all consume capacity. The signed schedule makes those allowances explicit and keeps large projects visible.</p></Rise><Rise step={3}><div className="mt-10 rounded-2xl border border-[var(--hair-2)] bg-black/25 p-6 sm:p-8"><p className="k-mono k-mono--ember">SEPARATELY SCOPED</p><ul className="mt-6 grid gap-4 sm:grid-cols-2">{separatelyScoped.map((item) => <li key={item} className="flex gap-3 text-[13px] leading-[1.55] text-[var(--warm-70)]"><span className="text-[var(--ember)]">—</span>{item}</li>)}</ul></div></Rise></div>
          <Rise step={1}><Panel label="Qualification gate" meta="Before proposal"><QueueRows rows={[
            { label: "Executive sponsor", value: "Named", tone: "good" },
            { label: "Workstream baseline", value: "Defensible", tone: "good" },
            { label: "Training population", value: "Mapped", tone: "good" },
            { label: "Sigmafy entitlement", value: "Scheduled", tone: "good" },
            { label: "Material system build", value: "Separated", tone: "warn" },
          ]} /></Panel></Rise>
        </div>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
          <div><Rise><p className="k-mono k-mono--ember">06 — Ownership and exit</p></Rise><Rise step={1}><h2 className="k-title mt-6 max-w-[20ch]">The relationship is recurring. The dependency is not.</h2></Rise><Rise step={2}><p className="k-lead mt-6 max-w-[52ch]">Your commissioned code, documentation and business data remain yours. At exit, the operating record transfers in a form the next owner can use.</p></Rise></div>
          <Rise step={1}><Panel label="Exit pack" meta="At handover"><EventFeed lines={[
            { time: "01", text: "Current scorecards issued", tone: "good" },
            { time: "02", text: "Improvement portfolio transferred", tone: "good" },
            { time: "03", text: "Training and certification record reconciled", tone: "good" },
            { time: "04", text: "Sigmafy data and benefits register exported", tone: "good" },
            { time: "05", text: "Named owner accepts handover", tone: "good" },
          ]} /></Panel></Rise>
        </div>
      </section>

      <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20"><Photo src="/imagery/managed-improvement/partnership-close-v1.webp" sizes="100vw" scrim="bottom" position="center" /></Rise>
        <div className="absolute inset-0 -z-10 bg-black/52" aria-hidden="true" />
        <div className="k-shell grid gap-10 pb-20 pt-40 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div><Rise><p className="k-mono k-mono--ember">Improve · train · automate · measure</p></Rise><Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Put the whole improvement system on one rhythm.</h2></Rise><Rise step={2}><p className="k-lead mt-6 max-w-[48ch]">Integrated Improvement Partnerships start from {RATES.partnershipProgramme} per month ex VAT, plus mobilisation, on a 12-month agreement.</p></Rise></div>
          <Rise step={3}><TrackedLink href="/contact?interest=operational-excellence" eventOffer="improvement partnership close" className="k-btn k-btn--solid">Design the partnership</TrackedLink></Rise>
        </div>
      </section>
    </>
  );
}
