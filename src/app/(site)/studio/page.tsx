import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import ClientStrip from "@/components/cinema/ClientStrip";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import TrackedLink from "@/components/cinema/TrackedLink";

export const metadata: Metadata = completePageMetadata({
  title: "About 2KO — Operational Improvement Across Africa",
  description: "Meet 2KO: one operational improvement group connecting process consulting, Six Sigma training, automation, systems and statistical measurement.",
  alternates: { canonical: "/studio" },
});

const capabilities = [
  ["01", "Improve", "2KO", "Find the constraint, redesign the work and manage the improvement against a visible benefit.", "/process-review"],
  ["02", "Train", "Six Sigma South Africa", "Build accredited problem-solving capability and apply it to live operating priorities.", "/training"],
  ["03", "Automate", "2KO Systems", "Turn the new standard into reliable workflow, controls, evidence and reporting.", "/systems"],
  ["04", "Measure", "Sigmafy", "Give teams the statistical tools and operating record needed to prove that the gain holds.", "/sigmafy"],
];

const principles = [
  ["01", "Process before intervention", "We understand how work actually moves before prescribing consulting, training or technology."],
  ["02", "Capability and control", "People need the judgement to improve the work; systems need the controls to hold the new standard."],
  ["03", "Evidence over assertion", "Every claim needs a baseline, a comparison period, a source and an honest statement of attribution."],
  ["04", "Human authority preserved", "Automation handles repetition. Consequential decisions remain visible and accountable to people."],
  ["05", "Start narrow, prove, scale", "We begin with a bounded process and an agreed definition of success, then expand what works."],
  ["06", "Ownership and portability", "Your operational data, documentation and custom systems remain yours—without artificial lock-in."],
];

export default function StudioPage() {
  return (
    <>
      <section className="ab-hero">
        <div className="ab-hero-media" aria-hidden="true"><Photo src="/imagery/about/hero-v1.webp" priority sizes="100vw" position="center" /></div>
        <div className="ab-hero-shade" aria-hidden="true" />
        <div className="k-shell ab-hero-inner">
          <div className="ab-hero-copy">
            <Rise><p className="k-mono k-mono--ember">ABOUT 2KO · EST. 1998</p></Rise>
            <Rise step={1}><h1>We work where <span>improvement meets the operation.</span></h1></Rise>
            <Rise step={2}><p className="ab-hero-lead">One group connecting process consulting, accredited Six Sigma training, operational systems and statistical measurement—so the handoffs between disciplines do not become another source of friction.</p></Rise>
            <Rise step={3} className="ab-hero-actions"><TrackedLink href="/contact" eventOffer="about 2KO" className="k-btn k-btn--solid">Bring us the result</TrackedLink><Link href="/method" className="k-btn k-btn--ghost">See the method</Link></Rise>
          </div>
          <Rise step={3} className="ab-hero-proof"><span><b>1998</b><small>operating heritage</small></span><span><b>12,000+</b><small>professionals trained</small></span><span><b>4</b><small>connected capabilities</small></span><span><b>Africa</b><small>delivery reach</small></span></Rise>
        </div>
      </section>

      <ClientStrip />

      <section className="relative isolate flex min-h-[86svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20"><Photo src="/imagery/about/story-v1.webp" sizes="100vw" scrim="bottom" position="center" /></Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/25 to-black/55" aria-hidden="true" />
        <div className="k-shell grid gap-14 pb-20 pt-40 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.7fr)] lg:items-end">
          <div><Rise><p className="k-mono k-mono--ember">01 — The 2KO story</p></Rise><Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">From the training room to the operating system.</h2></Rise></div>
          <Rise step={2}><div className="border-l border-[var(--ember)] pl-7"><p className="k-lead">Training builds a language for improvement. Consulting applies it to the work. Automation makes the new method repeatable. Measurement tells us whether it lasted.</p><p className="k-sm mt-6">2KO brings those disciplines together so the handoff between learning and operating performance does not become another source of friction.</p></div></Rise>
        </div>
      </section>

      <section className="k-band k-band--2 overflow-hidden"><div className="k-shell">
        <Rise><p className="k-mono k-mono--ember">02 — The group</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[20ch]">Different specialists. One operating outcome.</h2></Rise>
        <div className="mt-14 border-b border-[var(--hair)]">{capabilities.map(([number, title, brand, body, href]) => <Rise key={number}><Link href={href} className="group grid gap-4 border-t border-[var(--hair)] py-8 md:grid-cols-[70px_minmax(0,.65fr)_minmax(0,1fr)_auto] md:items-baseline"><span className="k-mono k-mono--ember">{number}</span><div><p className="k-mono">{brand}</p><h3 className="k-title mt-2 transition-colors group-hover:text-[var(--ember)]">{title}</h3></div><p className="k-sm max-w-[58ch]">{body}</p><span className="k-link">Explore ↗</span></Link></Rise>)}</div>
      </div></section>

      <section className="k-band"><div className="k-shell grid gap-16 lg:grid-cols-[minmax(260px,.6fr)_minmax(0,1.4fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start"><Rise><p className="k-mono k-mono--ember">03 — How we behave</p></Rise><Rise step={1}><h2 className="k-title mt-8 max-w-[14ch]">The principles survive the intervention.</h2></Rise><Rise step={2}><p className="k-sm mt-7">The form of the work can change. The standard does not.</p></Rise></div>
        <div className="grid sm:grid-cols-2">{principles.map(([number, title, body]) => <Rise key={number}><article className="border-t border-[var(--hair)] py-8 sm:odd:pr-8 sm:even:border-l sm:even:pl-8"><span className="k-mono k-mono--ember">{number}</span><h3 className="k-sub mt-5">{title}</h3><p className="k-sm mt-4">{body}</p></article></Rise>)}</div>
      </div></section>

      <section className="k-band k-band--2"><div className="k-shell grid gap-12 lg:grid-cols-2 lg:items-end">
        <div><Rise><p className="k-mono k-mono--ember">04 — Credibility and reach</p></Rise><Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Local operating context. International improvement discipline.</h2></Rise></div>
        <Rise step={2}><div className="grid grid-cols-2 border-l border-[var(--hair)]"><div className="p-6"><strong className="k-num text-[42px]">12,000+</strong><p className="k-sm mt-2">professionals trained</p></div><div className="border-l border-[var(--hair)] p-6"><strong className="k-num text-[42px]">5</strong><p className="k-sm mt-2">South African delivery cities</p></div><div className="border-t border-[var(--hair)] p-6"><strong className="k-sub">Accredited</strong><p className="k-sm mt-2">Six Sigma pathways</p></div><div className="border-l border-t border-[var(--hair)] p-6"><strong className="k-sub">Africa</strong><p className="k-sm mt-2">regional delivery reach</p></div></div></Rise>
      </div></section>

      <section className="k-band"><div className="k-shell text-center"><Rise><p className="k-mono k-mono--ember">Start with the operating result</p></Rise><Rise step={1}><h2 className="k-state mx-auto mt-8 max-w-[17ch]">The answer may be training, technology or neither. We find out first.</h2></Rise><Rise step={2}><p className="k-lead mx-auto mt-8 max-w-[54ch]">Bring us one process and the result it needs to produce. We will help identify the smallest defensible next step.</p></Rise><Rise step={3} className="mt-10 flex flex-wrap justify-center gap-3"><TrackedLink href="/contact" eventOffer="about 2KO" className="k-btn k-btn--solid">Bring us the process</TrackedLink><Link href="/process-review" className="k-btn k-btn--ghost">Start with a review</Link></Rise></div></section>
    </>
  );
}
