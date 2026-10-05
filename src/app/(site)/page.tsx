import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import AfricaMap from "@/components/cinema/AfricaMap";
import ClientStrip from "@/components/cinema/ClientStrip";
import { UptimeCard } from "@/components/cinema/HeroCards";
import GroupOperatingSystem from "@/components/cinema/GroupOperatingSystem";
import PageHero from "@/components/cinema/PageHero";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import ServiceFlowCard from "@/components/cinema/ServiceFlowCard";
import TrackedLink from "@/components/cinema/TrackedLink";
import { RATES, TIMEBOX } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "Operational Improvement, Training, Automation & Measurement",
  description:
    "2KO improves physical and service operations, builds internal capability, automates repeatable work and measures whether the result holds.",
  alternates: { canonical: "/" },
});

const symptoms = [
  ["Approvals wait in inboxes", "No shared queue, visible owner or automatic escalation."],
  ["Reports are assembled", "The same information is copied from the same sources every month."],
  ["Everyone has a version", "The process lives across spreadsheets, email, paper and WhatsApp."],
  ["Exceptions arrive late", "A threshold is crossed days before the right person sees it."],
  ["Controls depend on memory", "Nothing prevents the work from moving when a check is skipped."],
  ["The gain slips backwards", "The project closes and the old workarounds quietly return."],
];

const interventions = [
  ["Improve", "2KO", "Remove unnecessary steps, clarify ownership and redesign the work around a measurable constraint.", "/process-review"],
  ["Train", "Six Sigma South Africa", "Build accredited capability where judgement, problem-solving and management behaviour determine the result.", "/training"],
  ["Automate", "2KO Systems", "Move predictable routing, checking, capture, reconciliation and reporting out of manual work.", "/automation"],
  ["Measure", "Sigmafy", "Put statistical evidence and a benefits register around the improvement so the result remains visible.", "/sigmafy"],
];

const lifecycle = ["Diagnose", "Measure", "Improve", "Train", "Automate", "Systemise", "Sustain"];

const operatingWorlds = [
  {
    code: "PHYSICAL",
    title: "Physical operations",
    line: "Work moving through sites, equipment, goods and field teams.",
    sectors: ["Mining and minerals", "Agriculture and agri-processing", "Logistics and distribution", "Industrial and manufacturing"],
  },
  {
    code: "INFORMATION",
    title: "Information operations",
    line: "Cases, conversations, documents and decisions moving through service teams.",
    sectors: ["Financial services and insurance", "Contact centres and customer operations", "Accounting and professional services", "Multi-site and regulated services"],
  },
];

const offers = [
  { name: "Half-Day Process Review", price: RATES.review, time: TIMEBOX.review, line: "One process, one site and a concise recommendation.", href: "/process-review" },
  { name: "Process & Automation Audit", price: RATES.audit, time: TIMEBOX.audit, line: "Three costed findings and one recommended intervention.", href: "/audit" },
  { name: "Workflow Automation Pilot", price: `from ${RATES.pilotFrom}`, time: TIMEBOX.pilot, line: "One workflow in production against a baseline and target.", href: "/automation#pilot" },
  { name: "Operational System Build", price: `${RATES.buildFrom}–${RATES.buildTo}`, time: "per phase", line: "The proven workflow extended in separately scoped phases.", href: "/systems" },
];

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="OPERATIONAL IMPROVEMENT · ACROSS AFRICA"
        title={
          <>
            Improve the process.
            <span className="block text-[var(--warm-70)]">Make the result permanent.</span>
          </>
        }
        titleClass="max-w-[18ch]"
        lead="2KO helps organisations remove operational friction, build internal capability, automate repeatable work and keep the result visible. One partner across process, people, systems and measurement."
        ctas={[
          { href: "/contact", label: "Bring us the process", offer: "general enquiry" },
          { href: "/method", label: "See how improvement works", ghost: true, offer: "method" },
        ]}
        facts={[
          { value: "$5bn+", label: "combined savings influenced", emphasis: true },
          { value: "Since 1998", label: "improvement heritage" },
          { value: "8,000+", label: "organisations served" },
          { value: "4", label: "connected capabilities" },
        ]}
      >
        <div className="relative mt-16">
          <div className="k-horizon top-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -inset-x-20 -inset-y-24 -z-10 blur-3xl"
            aria-hidden="true"
            style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(63,185,80,0.18), transparent 62%)" }}
          />
          <GroupOperatingSystem />
        </div>
      </PageHero>

      <ClientStrip />

      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/home/hero-v2.webp" priority sizes="100vw" scrim="left" position="center" />
        </Rise>
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{ background: "linear-gradient(90deg, rgba(8,9,10,.18), rgba(8,9,10,.48) 48%, rgba(8,9,10,.92) 100%)" }}
        />

        <div className="k-shell grid gap-14 py-24 lg:grid-cols-[minmax(0,0.82fr)_minmax(440px,1fr)] lg:items-center">
          <div>
            <Rise><p className="k-mono k-mono--ember">01 — Where it breaks</p></Rise>
            <Rise step={1}>
              <h2 className="k-state mt-8 max-w-[15ch]">The work is moving. Friction is moving with it.</h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead mt-8 max-w-[46ch]">
                Operational problems rarely announce themselves as a software requirement. They appear as waiting, rework, missing information and controls that depend on somebody remembering.
              </p>
            </Rise>
          </div>

          <Rise step={2}>
            <div
              className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl"
              style={{ background: "rgba(10,11,12,.76)" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <span className="k-mono">Process exceptions</span>
                <span className="flex items-center gap-2 k-mono text-[var(--warm-70)]"><span className="k-dot" /> live pattern</span>
              </div>
              <div className="grid sm:grid-cols-2">
                {symptoms.map(([title, body], index) => (
                  <article key={title} className="border-b border-white/10 p-6 sm:[&:nth-child(odd)]:border-r">
                    <div className="flex items-center justify-between">
                      <span className="k-mono k-mono--ember">0{index + 1}</span>
                      <span className="h-px w-10 bg-[var(--hair-2)]" />
                    </div>
                    <h3 className="k-sub mt-5">{title}</h3>
                    <p className="k-sm mt-3">{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </Rise>
        </div>
      </section>

      <section className="k-band overflow-hidden">
        <div className="k-shell grid gap-16 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Rise><p className="k-mono k-mono--ember">02 — One improvement system</p></Rise>
            <Rise step={1}><h2 className="k-title mt-8 max-w-[17ch]">Four capabilities. One accountable outcome.</h2></Rise>
            <Rise step={2}>
              <p className="k-lead mt-7 max-w-[42ch]">We do not decide that you need software before we understand the work. Sometimes the right answer is that nothing should be built.</p>
            </Rise>
            <Rise step={3}><Link href="/process-review" className="k-link mt-8">Start with a Process Review</Link></Rise>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 left-[27px] top-8 w-px bg-gradient-to-b from-[var(--ember)] via-[var(--hair-2)] to-transparent" aria-hidden="true" />
            {interventions.map(([title, brand, body, href], index) => (
              <Rise key={title} step={(index % 3) as 0 | 1 | 2}>
                <Link href={href} className="group relative grid gap-5 border-t border-[var(--hair)] py-9 pl-20 sm:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)] sm:items-baseline">
                  <span
                    className="absolute left-0 top-7 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--hair-2)] bg-[var(--black)] k-num text-[18px]"
                    style={{ color: index > 1 ? "var(--signal)" : "var(--ember)" }}
                  >
                    0{index + 1}
                  </span>
                  <div><p className="k-mono">{brand}</p><h3 className="k-sub mt-2 transition-colors group-hover:text-[var(--ember)]">{title} <span aria-hidden="true">↗</span></h3></div>
                  <p className="k-sm">{body}</p>
                </Link>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/home/improvement-team-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/35 via-transparent to-black/20" aria-hidden="true" />
        <div className="k-shell relative pb-20 pt-40">
          <div className="pointer-events-none absolute right-14 top-20 hidden lg:block">
            <Rise step={1}><UptimeCard /></Rise>
            <p className="k-mono mt-3 text-right">Illustrative control readout</p>
          </div>
          <Rise><p className="k-mono k-mono--ember">At the point of work</p></Rise>
          <Rise step={1}>
            <h2 className="k-state mt-8 max-w-[16ch]">A better process should hold when nobody is watching.</h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead mt-8 max-w-[48ch]">The check happens. The exception routes. The evidence stays attached. The improvement becomes part of the work—not a presentation about it.</p>
          </Rise>
        </div>
      </section>

      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(78px,17vw,250px)] font-semibold leading-none tracking-[-.08em] text-white/[.018]" aria-hidden="true">CONTINUOUS</div>
        <div className="k-shell relative">
          <Rise><p className="k-mono">03 — How improvement holds</p></Rise>
          <Rise step={1}><h2 className="k-title mt-8 max-w-[22ch]">One improvement loop. The intervention changes with the problem.</h2></Rise>
          <Rise step={2}><p className="k-lead k-measure mt-7">Automate where the rules repeat. Train where judgement matters. Measure both.</p></Rise>

          <ol className="mt-16 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-7">
            {lifecycle.map((stage, index) => (
              <Rise key={stage} step={(index % 3) as 0 | 1 | 2}>
                <li className="relative border-t border-[var(--hair-2)] pt-8 lg:pr-5">
                  <span className="absolute -top-[6px] left-0 h-3 w-3 rounded-full border border-[var(--ember)] bg-[var(--black-2)] shadow-[0_0_18px_rgba(217, 169, 90,.4)]" />
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <h3 className="k-sub mt-5">{stage}</h3>
                </li>
              </Rise>
            ))}
          </ol>
          <Rise className="mt-12"><Link href="/method" className="k-link">Read the method</Link></Rise>
        </div>
      </section>

      <section className="k-band overflow-hidden">
        <div className="k-shell">
          <Rise><p className="k-mono k-mono--ember">04 — What we automate</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[19ch]">Routine work disappears. Consequential decisions stay human.</h2></Rise>
          <Rise step={2}><p className="k-lead k-measure mt-8">We use the lightest technology that can hold the process reliably. The interface is not the improvement. The control inside the workflow is.</p></Rise>

          <div className="mt-16">
            {[
              ["01", "ROUTE", "Rules-based automation", "Approvals, reminders, escalation, validation, reconciliation, scheduled reporting, integrations and audit trails."],
              ["02", "ASSIST", "Intelligence-assisted work", "Document extraction, classification, triage, summarisation, knowledge retrieval and assisted drafting."],
              ["03", "HOLD", "Operational systems", "One dependable record for the people, work, evidence, exceptions and decisions currently living across disconnected tools."],
            ].map(([number, signal, title, body]) => (
              <Rise key={number}>
                <article className="group relative grid overflow-hidden border-t border-[var(--hair)] py-8 md:grid-cols-[90px_minmax(0,.7fr)_minmax(0,1fr)] md:items-baseline">
                  <span className="k-mono k-mono--ember">{number}</span>
                  <div>
                    <span className="block text-[clamp(42px,6vw,82px)] font-semibold leading-none tracking-[-.06em] text-white/[.07] transition-colors duration-500 group-hover:text-[var(--ember)]/20">{signal}</span>
                    <h3 className="k-sub mt-3">{title}</h3>
                  </div>
                  <p className="k-sm mt-5 md:mt-0">{body}</p>
                </article>
              </Rise>
            ))}
          </div>
          <Rise className="mt-10"><Link href="/automation" className="k-link">Explore process automation →</Link></Rise>
        </div>
      </section>

      <section id="information-operations" className="relative isolate min-h-[96svh] overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/home/professional-handoff-v1.webp" sizes="100vw" scrim="left" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/88 via-black/46 to-black/55" aria-hidden="true" />
        <div className="k-shell grid min-h-[96svh] gap-14 py-24 lg:grid-cols-[minmax(0,.82fr)_minmax(440px,1fr)] lg:items-center">
          <div>
            <Rise><p className="k-mono k-mono--ember">05 — Information operations</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">When the work is made of cases, conversations and documents, it is still operations.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-8 max-w-[48ch]">Banks, contact centres, accounting firms and service organisations carry their own queues, handoffs, exceptions and controls. The product may be intangible. The delay and rework are not.</p></Rise>
            <Rise step={3} className="mt-10 flex max-w-[720px] flex-wrap gap-2.5">
              {["Client onboarding", "Claims and cases", "Customer escalation", "Month-end close", "Review workflow", "Multi-site requests"].map((item) => <span key={item} className="rounded-full border border-white/15 bg-black/45 px-4 py-2 k-mono text-[var(--warm-70)] backdrop-blur-md">{item}</span>)}
            </Rise>
          </div>

          <Rise step={2} className="lg:justify-self-end lg:w-full lg:max-w-[560px]">
            <ServiceFlowCard />
          </Rise>
        </div>
      </section>

      <section id="operating-worlds" className="relative isolate min-h-[92svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-[-18%] -z-20 w-[100%] opacity-95 sm:right-[-10%] lg:right-[-2%] lg:w-[62%]">
          <AfricaMap />
        </div>
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{ background: "linear-gradient(100deg, rgba(8,9,10,.98) 0%, rgba(8,9,10,.9) 34%, rgba(8,9,10,.42) 62%, rgba(8,9,10,0) 84%)" }}
        />
        <div className="k-shell flex min-h-[92svh] items-center py-24">
          <div>
            <Rise><p className="k-mono k-mono--ember">06 — Operational reach</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">Two operating worlds. One improvement discipline.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-7 max-w-[56ch]">Whether the work moves through a plant or a case queue, we follow the same questions: where does it wait, where does it break, who decides and what evidence remains?</p></Rise>
            <div className="mt-12 grid max-w-[880px] gap-4 md:grid-cols-2">
              {operatingWorlds.map((world, index) => (
                <Rise key={world.code} step={(index + 1) as 1 | 2}>
                  <article className="h-full rounded-2xl border border-white/10 bg-black/65 p-6 backdrop-blur-xl sm:p-7">
                    <p className="k-mono k-mono--ember">{world.code}</p>
                    <h3 className="k-sub mt-5">{world.title}</h3>
                    <p className="k-sm mt-3">{world.line}</p>
                    <ul className="mt-7 divide-y divide-white/10 border-y border-white/10">
                      {world.sectors.map((sector) => <li key={sector} className="py-3 text-[13px] text-[var(--warm-70)]">{sector}</li>)}
                    </ul>
                  </article>
                </Rise>
              ))}
            </div>
            <Rise step={3}><Link href="/sectors" className="k-link mt-10">Explore the broader sector fit</Link></Rise>
          </div>
        </div>
      </section>

      <section id="results" className="k-band k-band--2">
        <div className="k-shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.65fr)] lg:items-center">
          <div>
            <Rise><p className="k-mono">07 — Results on record</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[18ch]">A result needs a baseline, a period and evidence.</h2></Rise>
            <Rise step={2}><p className="k-lead k-measure mt-8">We separate what we observed, what we calculated and what a client reported. Every published result will state how it was measured and what else contributed.</p></Rise>
            <Rise step={3}><Link href="/results" className="k-link mt-9">Open the public evidence record →</Link></Rise>
          </div>
          <Rise step={2}>
            <aside className="h-impact-card">
              <div className="h-impact-card__glow" aria-hidden="true" />
              <p className="k-mono k-mono--ember">Cumulative group impact</p>
              <p className="h-impact-card__value">$5bn+</p>
              <h3>in combined client savings influenced through process improvement.</h3>
              <p className="h-impact-card__copy">This is a cumulative portfolio figure, not a single engagement. We use “influenced” deliberately: 2KO worked with client teams to produce the outcomes rather than claiming sole attribution.</p>
              <div className="h-impact-card__qualifiers" aria-label="Claim context">
                <span>Cumulative</span>
                <span>Shared contribution</span>
                <span>Client-level figures confidential</span>
              </div>
            </aside>
          </Rise>
        </div>
      </section>

      <section id="managed-improvement" className="k-band overflow-hidden">
        <div className="k-shell grid gap-16 lg:grid-cols-[minmax(320px,.8fr)_minmax(0,1.2fr)] lg:items-center">
          <Rise>
            <div className="relative mx-auto aspect-square w-full max-w-[470px] rounded-full p-[1px]" style={{ background: "conic-gradient(from 210deg, rgba(63,185,80,.15), var(--signal), var(--ember), rgba(255,255,255,.08), rgba(63,185,80,.15))" }}>
              <div className="absolute inset-7 rounded-full border border-[var(--hair-2)] bg-[var(--black)] shadow-[inset_0_0_80px_rgba(63,185,80,.06)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="k-mono k-mono--ember">Measured process</span>
                <strong className="mt-4 text-[clamp(34px,5vw,62px)] font-medium leading-none tracking-[-.05em]">Review.<br />Improve.<br />Repeat.</strong>
              </div>
              <span className="absolute left-[7%] top-[48%] rounded-full border border-[var(--hair-2)] bg-[var(--black)] px-4 py-2 k-mono">Baseline</span>
              <span className="absolute right-[5%] top-[18%] rounded-full border border-[var(--hair-2)] bg-[var(--black)] px-4 py-2 k-mono">Backlog</span>
              <span className="absolute bottom-[12%] right-[8%] rounded-full border border-[var(--hair-2)] bg-[var(--black)] px-4 py-2 k-mono">Benefit</span>
            </div>
          </Rise>

          <div>
            <Rise><p className="k-mono k-mono--ember">08 — Improvement partnerships</p></Rise>
            <Rise step={1}><h2 className="k-title mt-8 max-w-[20ch]">One relationship across process, capability, systems and evidence.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-7 max-w-[52ch]">A 2KO partnership combines the capabilities your workstream actually needs. The balance can move as the constraint moves, without restarting the relationship every quarter.</p></Rise>
            <div className="mt-10">
              {[
                ["Improve", "Active workstream", "Senior process consulting, a prioritised improvement backlog and operating reviews."],
                ["Train", "Annual capability plan", "Applied Six Sigma learning connected to live improvement projects and coaching."],
                ["Automate", "Bounded delivery capacity", "Workflow automation and operational systems delivered against explicit controls."],
                ["Measure", "Evidence and Sigmafy", "Statistical tools, benefits tracking and a visible record of what is holding."],
              ].map(([title, label, body]) => (
                <Rise key={title}>
                  <article className="grid gap-3 border-t border-[var(--hair)] py-6 sm:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)] sm:items-baseline">
                    <div><p className="k-mono">{label}</p><h3 className="k-sub mt-2">{title}</h3></div>
                    <p className="k-sm">{body}</p>
                  </article>
                </Rise>
              ))}
            </div>
            <Rise className="mt-8"><TrackedLink href="/managed-improvement" eventOffer="improvement partnership" className="k-link">Explore improvement partnerships →</TrackedLink></Rise>
          </div>
        </div>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise><p className="k-mono">09 — Where to start</p></Rise>
          <Rise step={1}><h2 className="k-title mt-8 max-w-[25ch]">Start with the smallest engagement that can produce a defensible answer.</h2></Rise>
          <div className="mt-14">
            {offers.map((offer, index) => (
              <Rise key={offer.name}>
                <Link href={offer.href} className="k-row group md:grid-cols-[64px_minmax(0,.8fr)_minmax(0,1fr)_120px_auto] md:items-baseline">
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <h3 className="k-sub transition-colors group-hover:text-[var(--ember)]">{offer.name}</h3>
                  <p className="k-sm">{offer.line}</p>
                  <span className="k-mono">{offer.time}</span>
                  <span className="k-num text-[19px] md:text-right">{offer.price}</span>
                </Link>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/home/regional-close-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="k-shell relative pb-20 pt-44">
          <Rise><p className="k-mono k-mono--ember">Start</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">Bring us the result that needs to improve.</h2></Rise>
          <Rise step={2}><p className="k-lead mt-9 max-w-[52ch]">Tell us where performance is slipping or opportunity is being lost. We will tell you whether the constraint is process, capability, technology, measurement—or some combination of all four.</p></Rise>
          <Rise step={3}>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row">
              <TrackedLink href="/contact" eventOffer="general enquiry" className="k-btn k-btn--solid">Bring us the process</TrackedLink>
              <Link href="/process-review" className="k-btn k-btn--ghost">Start with a review</Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
