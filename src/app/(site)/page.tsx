import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import AfricaMap from "@/components/cinema/AfricaMap";
import ClientStrip from "@/components/cinema/ClientStrip";
import DeploymentClimb from "@/components/cinema/DeploymentClimb";
import PageHero from "@/components/cinema/PageHero";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import ServiceFlowCard from "@/components/cinema/ServiceFlowCard";
import TrackedLink from "@/components/cinema/TrackedLink";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "Lean and Six Sigma Deployment at Scale",
  description:
    "2KO runs large-scale Lean and Six Sigma programmes inside organisations across Africa: White Belt for everyone, Green and Black Belts who lead real projects, all on Sigmafy so every project and saving is measured.",
  alternates: { canonical: "/" },
});

const symptoms = [
  ["Training ends at the certificate", "People pass the course and go back to work exactly as before."],
  ["Projects stall after class", "Nobody looks at the work between sessions, so most projects never finish."],
  ["A few experts carry everything", "Improvement depends on a handful of people who are always busy."],
  ["Nobody can see the programme", "HR counts attendance. Nobody counts projects or savings."],
  ["Savings are claimed, not measured", "There is no baseline, so no result can be proved."],
  ["Every wave starts from scratch", "There is no ladder from one belt to the next, so capability never builds."],
];

const belts = [
  ["Everyone", "White Belt", "Every person learns the basics in a hands-on simulation and starts spotting waste in their own work.", "/training"],
  ["Teams", "Yellow Belt", "Team members run a guided mini-project and join the bigger projects as they start.", "/training"],
  ["Project leads", "Green Belt", "Leads run real DMAIC projects on Sigmafy. The right tool appears at each step, the coach checks the work as it is written, and our trainers sign it off.", "/training"],
  ["Experts", "Black Belt", "Your own experts lead the hardest problems and coach the next wave, with our trainers behind them.", "/training"],
];

const lifecycle = ["Diagnose", "Plan the waves", "Train", "Run projects", "Coach", "Certify", "Sustain"];

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
  { name: "Pilot cohort", price: "Quoted", time: "3 months", line: "One Green Belt cohort of about 20, running real projects on Sigmafy, so you see results before you scale.", href: "/contact" },
  { name: "White Belt for everyone", price: "Per person", time: "per year", line: "Every employee on Sigmafy: the simulation, certificates and your own progress dashboards.", href: "/training" },
  { name: "Deployment waves", price: "Per cohort", time: "rolling", line: "Yellow, Green and Black Belt cohorts in waves, each one running projects that are measured.", href: "/training" },
  { name: "Improvement partnership", price: `from ${RATES.partnershipProgramme}`, time: "per month", line: "Coaching, governance and savings tracking across the whole programme, under one relationship.", href: "/pricing" },
];

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="LEAN AND SIX SIGMA · DEPLOYED AT SCALE"
        title={
          <>
            We build your organisation’s improvement capability.
            <span className="block text-[var(--warm-70)]">Trained people. Real projects. Measured savings.</span>
          </>
        }
        titleClass="max-w-[22ch]"
        lead="2KO runs large-scale Lean and Six Sigma programmes inside organisations across Africa, from White Belt for everyone to Black Belts who lead the work. Every person climbs on Sigmafy, our platform, so every project and every saving is visible to the people paying for it."
        ctas={[
          { href: "/contact", label: "Plan a deployment", offer: "deployment enquiry" },
          { href: "/training", label: "See the belts", ghost: true, offer: "training" },
        ]}
        facts={[
          { value: "$5bn+", label: "combined savings influenced", emphasis: true },
          { value: "Since 1998", label: "improvement heritage" },
          { value: "8,000+", label: "organisations served" },
          { value: "White to Black", label: "every belt on one platform" },
        ]}
      >
        <div className="relative mt-16">
          <div className="k-horizon top-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -inset-x-20 -inset-y-24 -z-10 blur-3xl"
            aria-hidden="true"
            style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(63,185,80,0.18), transparent 62%)" }}
          />
          <DeploymentClimb />
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
              <h2 className="k-state mt-8 max-w-[16ch]">Most training programmes stop at the certificate.</h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead mt-8 max-w-[46ch]">
                Large organisations have trained thousands of people in Lean and Six Sigma. Far fewer can show the projects, the savings or the next generation of experts it produced.
              </p>
            </Rise>
          </div>

          <Rise step={2}>
            <div
              className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl"
              style={{ background: "rgba(10,11,12,.76)" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <span className="k-mono">Programme warning signs</span>
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
            <Rise><p className="k-mono k-mono--ember">02 — How a deployment works</p></Rise>
            <Rise step={1}><h2 className="k-title mt-8 max-w-[17ch]">Everyone starts. The best climb.</h2></Rise>
            <Rise step={2}>
              <p className="k-lead mt-7 max-w-[42ch]">A deployment is a ladder, not a course. Everyone gets the basics, and people climb as their projects prove it. Each belt opens more of Sigmafy: new tools, new challenges, bigger projects. Our trainers sign off every step.</p>
            </Rise>
            <Rise step={3}><Link href="/training" className="k-link mt-8">See the belts</Link></Rise>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 left-[27px] top-8 w-px bg-gradient-to-b from-[var(--ember)] via-[var(--hair-2)] to-transparent" aria-hidden="true" />
            {belts.map(([title, brand, body, href], index) => (
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
          <Rise><p className="k-mono k-mono--ember">At the point of work</p></Rise>
          <Rise step={1}>
            <h2 className="k-state mt-8 max-w-[16ch]">Improvement should become the job, not a course people attended.</h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead mt-8 max-w-[48ch]">Projects run on the work people already do. The coach checks every answer, managers see every project, and the savings are measured against a baseline, not claimed in a presentation.</p>
          </Rise>
        </div>
      </section>

      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(78px,17vw,250px)] font-semibold leading-none tracking-[-.08em] text-white/[.018]" aria-hidden="true">CONTINUOUS</div>
        <div className="k-shell relative">
          <Rise><p className="k-mono">03 — How a programme holds</p></Rise>
          <Rise step={1}><h2 className="k-title mt-8 max-w-[22ch]">One programme. Every belt. Measured all the way.</h2></Rise>
          <Rise step={2}><p className="k-lead k-measure mt-7">Train where judgement matters, run real projects, and measure every result. Where a fix needs software, we build that too.</p></Rise>

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
          <Rise><p className="k-mono k-mono--ember">04 — The platform</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[19ch]">Sigmafy is where every belt learns, works and is measured.</h2></Rise>
          <Rise step={2}><p className="k-lead k-measure mt-8">Our own platform, built for programmes of thousands. It does the scaling, so our trainers can spend their time where people need judgement.</p></Rise>

          <div className="mt-16">
            {[
              ["01", "LEARN", "Learn by doing", "A hands-on simulation, short videos, practice and exams, so people learn the method on a problem before they meet their own."],
              ["02", "PROJECT", "Guided projects", "The right tool at the right step, a coach that checks each answer as it is written, and trainer sign-off before the next phase."],
              ["03", "SEE", "One view of the programme", "Who is climbing, which projects are live, what has been signed off and what has been saved against its baseline."],
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
          <Rise className="mt-10"><Link href="/sigmafy" className="k-link">Explore Sigmafy →</Link></Rise>
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

      <section className="k-band">
        <div className="k-shell">
          <Rise><p className="k-mono">08 — Where to start</p></Rise>
          <Rise step={1}><h2 className="k-title mt-8 max-w-[25ch]">Start with one cohort. Scale on the evidence.</h2></Rise>
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

      <section id="managed-improvement" className="k-band k-band--2 overflow-hidden">
        <div className="k-shell grid gap-16 lg:grid-cols-[minmax(320px,.8fr)_minmax(0,1.2fr)] lg:items-center">
          <Rise>
            <div className="relative mx-auto aspect-square w-full max-w-[470px] rounded-full p-[1px]" style={{ background: "conic-gradient(from 210deg, rgba(63,185,80,.15), var(--signal), var(--ember), rgba(255,255,255,.08), rgba(63,185,80,.15))" }}>
              <div className="absolute inset-7 rounded-full border border-[var(--hair-2)] bg-[var(--black)] shadow-[inset_0_0_80px_rgba(63,185,80,.06)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="k-mono k-mono--ember">Measured process</span>
                <strong className="mt-4 text-[clamp(34px,5vw,62px)] font-medium leading-none tracking-[-.05em]">Review.<br />Improve.<br />Repeat.</strong>
              </div>
              <span className="absolute bottom-[16%] left-[4%] rounded-full border border-[var(--hair-2)] bg-[var(--black)] px-4 py-2 k-mono">Baseline</span>
              <span className="absolute right-[5%] top-[18%] rounded-full border border-[var(--hair-2)] bg-[var(--black)] px-4 py-2 k-mono">Backlog</span>
              <span className="absolute bottom-[12%] right-[8%] rounded-full border border-[var(--hair-2)] bg-[var(--black)] px-4 py-2 k-mono">Benefit</span>
            </div>
          </Rise>

          <div>
            <Rise><p className="k-mono k-mono--ember">09 — Partnership</p></Rise>
            <Rise step={1}><h2 className="k-title mt-8 max-w-[20ch]">We stay inside the programme.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-7 max-w-[52ch]">The platform does the scaling. We do what needs people: coaching, marking, sign-off and the accredited certificate at every belt, under one monthly partnership.</p></Rise>
            <div className="mt-10">
              {[
                ["Programme", `from ${RATES.partnershipProgramme} / month`, "Coaching and sign-off for your belt cohorts, with the programme measured on Sigmafy."],
                ["Operational", `from ${RATES.partnershipOperational} / month`, "Several business units, project governance and savings reported to your executives."],
                ["Transformation", `from ${RATES.partnershipTransformation} / month`, "A whole-organisation deployment, including the systems your best projects need."],
              ].map(([title, label, body]) => (
                <Rise key={title}>
                  <article className="grid gap-3 border-t border-[var(--hair)] py-6 sm:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)] sm:items-baseline">
                    <div><p className="k-mono">{label}</p><h3 className="k-sub mt-2">{title}</h3></div>
                    <p className="k-sm">{body}</p>
                  </article>
                </Rise>
              ))}
            </div>
            <Rise className="mt-8"><TrackedLink href="/pricing" eventOffer="retainers" className="k-link">Compare retainers and partnerships →</TrackedLink></Rise>
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/home/regional-close-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="k-shell relative pb-20 pt-44">
          <Rise><p className="k-mono k-mono--ember">Start</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">Tell us how many people you want to grow.</h2></Rise>
          <Rise step={2}><p className="k-lead mt-9 max-w-[52ch]">Ten people or ten thousand, we will plan the waves, the belts and the first projects with you, and show you how the results will be measured.</p></Rise>
          <Rise step={3}>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row">
              <TrackedLink href="/contact" eventOffer="deployment enquiry" className="k-btn k-btn--solid">Plan a deployment</TrackedLink>
              <Link href="/training" className="k-btn k-btn--ghost">See the belts</Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
