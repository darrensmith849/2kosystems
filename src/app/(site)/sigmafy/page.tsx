import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import ClientStrip from "@/components/cinema/ClientStrip";
import PageHero from "@/components/cinema/PageHero";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import TrackedLink from "@/components/cinema/TrackedLink";
import SigmafyAnalyticsLab from "@/components/cinema/SigmafyAnalyticsLab";
import { AIEvaluation, BenefitsRegister, ProjectArchitecture } from "@/components/cinema/SigmafyShowcase";

const SIGMAFY = "https://portal.sigmafy.co/";

export const metadata: Metadata = completePageMetadata({
  title: "Sigmafy — Statistical Process Control & Six Sigma Software",
  description: "Sigmafy connects statistical process control, DMAIC project execution, training, AI-assisted evaluation and benefits verification in one platform.",
  alternates: { canonical: "/sigmafy" },
});

const chartTypes = [
  ["I-MR", "Individual measurements", "See process movement when observations arrive one at a time."],
  ["X̄-R", "Subgroup means and ranges", "Separate within-subgroup variation from movement between samples."],
  ["X̄-S", "Larger rational subgroups", "Monitor the process mean and standard deviation together."],
  ["P", "Proportion nonconforming", "Track defect proportion when sample sizes can change."],
  ["U", "Defects per unit", "Monitor multiple defects across changing opportunity volumes."],
];

export default function SigmafyPage() {
  return (
    <>
      <PageHero
        eyebrow="MEASURE · SIGMAFY"
        title={<>See the variation. <span className="text-[var(--warm-70)]">Prove the improvement.</span></>}
        titleClass="max-w-[17ch]"
        lead="Sigmafy brings statistical process control, Six Sigma project execution, training records, AI-assisted evaluation and benefit evidence into one clean operating platform."
        ctas={[
          { href: `${SIGMAFY}contact`, label: "Book a Sigmafy tour", offer: "Sigmafy tour" },
          { href: `${SIGMAFY}product`, label: "Explore the live product", ghost: true, offer: "Sigmafy product" },
        ]}
        facts={[
          { value: "5", label: "SPC chart families" },
          { value: "6", label: "project stages" },
          { value: "AI + human", label: "governed evaluation" },
          { value: "One record", label: "project to benefit" },
        ]}
      >
        <div className="relative mt-16"><div className="k-horizon top-0" aria-hidden="true" /><div className="pointer-events-none absolute -inset-x-20 -inset-y-20 -z-10 blur-3xl" aria-hidden="true" style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(89,193,215,.14), transparent 64%)" }} /><SigmafyAnalyticsLab /></div>
      </PageHero>

      <ClientStrip />

      <section className="k-band k-band--2 overflow-hidden">
        <div className="k-shell grid gap-16 lg:grid-cols-[minmax(280px,.65fr)_minmax(0,1.35fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start"><Rise><p className="k-mono k-mono--ember">01 — Statistical process control</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[17ch]">A chart should lead to a decision, not merely decorate a report.</h2></Rise><Rise step={2}><p className="k-lead mt-7">Sigmafy keeps control limits, rule signals, capability and the operating context in the same analysis.</p></Rise><Rise step={3}><Link href={`${SIGMAFY}features/spc`} className="k-link mt-8">Explore SPC in Sigmafy ↗</Link></Rise></div>
          <div className="border-b border-[var(--hair)]">{chartTypes.map(([code, name, body], index) => <Rise key={code}><article className="group grid gap-4 border-t border-[var(--hair)] py-8 sm:grid-cols-[90px_minmax(0,.75fr)_minmax(0,1fr)] sm:items-baseline"><span className="text-[clamp(28px,4vw,50px)] font-semibold leading-none tracking-[-.06em] text-[#59c1d7]/20 transition-colors group-hover:text-[#59c1d7]/50">{code}</span><div><p className="k-mono">0{index + 1}</p><h3 className="k-sub mt-3">{name}</h3></div><p className="k-sm">{body}</p></article></Rise>)}</div>
        </div>
      </section>

      <section className="sf-analysis-photo">
        <Rise variant="settle" className="sf-analysis-photo__media"><Photo src="/imagery/sigmafy/analysis-v1.webp" sizes="100vw" position="center" /></Rise>
        <div className="sf-analysis-photo__shade" aria-hidden="true" />
        <div className="k-shell sf-analysis-photo__copy">
          <Rise><p className="k-mono k-mono--ember">THE CHART MEETS THE PROCESS</p></Rise>
          <Rise step={1}><h2>Variation becomes useful when the team can act on it.</h2></Rise>
          <Rise step={2}><p className="image-chapter-lead">The statistical signal, the physical process and accountable judgement stay in the same conversation.</p></Rise>
        </div>
      </section>

      <section className="k-band overflow-hidden">
        <div className="k-shell"><div className="grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(340px,.55fr)] lg:items-end"><div><Rise><p className="k-mono k-mono--ember">02 — Projects with structure</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[20ch]">DMAIC is a hierarchy, not a flat task list.</h2></Rise></div><Rise step={2}><p className="k-lead">Projects move through phases, sections, topics, submitted solutions and review gates. The evidence stays attached to the work that produced it.</p></Rise></div><Rise step={3} className="mt-14"><ProjectArchitecture /></Rise></div>
      </section>

      <section className="k-band k-band--2 overflow-hidden">
        <div className="k-shell"><div className="grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(340px,.55fr)] lg:items-end"><div><Rise><p className="k-mono k-mono--ember">03 — Governed AI evaluation</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[20ch]">Faster feedback. Human judgement still in the loop.</h2></Rise></div><Rise step={2}><p className="k-lead">Sigmafy can evaluate a submission against the rubric in seconds. Trainers and project reviewers retain the authority to revise, override or approve.</p></Rise></div><Rise step={3} className="mt-14"><AIEvaluation /></Rise></div>
      </section>

      <section className="py-[clamp(90px,11vw,165px)]" style={{ background: "#f1f1ee" }}>
        <div className="k-shell"><div className="grid gap-10 text-[#121416] lg:grid-cols-[minmax(0,.8fr)_minmax(340px,.55fr)] lg:items-end"><div><Rise><p className="k-mono text-[#28788b]">04 — Benefits on record</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[20ch] text-[#121416]">Connect the project to the benefit it was meant to create.</h2></Rise></div><Rise step={2}><p className="text-[clamp(15px,1.4vw,19px)] leading-[1.65] text-[#676b70]">Separate forecasts from measured and verified outcomes. Preserve the source, sponsor, attribution and sustainment period beside the number.</p></Rise></div><Rise step={3} className="mt-14"><BenefitsRegister /></Rise></div>
      </section>

      <section className="k-band relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(90px,18vw,260px)] font-semibold leading-none tracking-[-.08em] text-white/[.018]" aria-hidden="true">CONTROL</div>
        <div className="k-shell relative grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.72fr)] lg:items-center"><div><Rise><p className="k-mono k-mono--ember">05 — One platform, clear roles</p></Rise><Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">Built for the people running improvement at scale.</h2></Rise><Rise step={2}><p className="k-lead mt-8 max-w-[53ch]">Training providers can manage companies and cohorts. Quality teams can control analysis and projects. Sponsors can see progress and benefit without entering the underlying work.</p></Rise></div><Rise step={2}><div className="rounded-2xl border border-[var(--hair-2)] bg-[var(--panel)] p-8"><p className="k-mono k-mono--ember">Role architecture</p><div className="mt-7">{[["2KO Super Admin","Platform-wide control"],["Training Admin","Courses, classes and evaluation"],["Company Admin","Organisation and cohort management"],["Sponsor","Projects, gates and benefits"],["Delegate","Learn, analyse, submit and certify"]].map(([role,access],index)=><div key={role} className="grid grid-cols-[28px_minmax(0,.8fr)_minmax(0,1fr)] gap-3 border-t border-[var(--hair)] py-4 text-[12px]"><span className="k-mono">0{index+1}</span><strong className="font-medium">{role}</strong><span className="text-[var(--warm-45)]">{access}</span></div>)}</div><TrackedLink href="/contact?interest=sigmafy" eventOffer="Sigmafy company" className="k-btn k-btn--solid mt-7 w-full">Discuss your organisation</TrackedLink></div></Rise></div>
      </section>

      <section className="k-band k-band--2"><div className="k-shell text-center"><Rise><p className="k-mono k-mono--ember">Practical Six Sigma, packaged</p></Rise><Rise step={1}><h2 className="k-state mx-auto mt-8 max-w-[17ch]">Run the project. Train the people. Keep the evidence.</h2></Rise><Rise step={2}><p className="k-lead mx-auto mt-8 max-w-[54ch]">Use Sigmafy as a standalone platform, or make it the measurement layer inside a broader 2KO improvement partnership.</p></Rise><Rise step={3} className="mt-10 flex flex-wrap justify-center gap-3"><TrackedLink href="/contact?interest=sigmafy" eventOffer="Sigmafy tour" className="k-btn k-btn--solid">Book a Sigmafy tour</TrackedLink><Link href="/managed-improvement" className="k-btn k-btn--ghost">Explore improvement partnerships</Link></Rise></div></section>
    </>
  );
}
