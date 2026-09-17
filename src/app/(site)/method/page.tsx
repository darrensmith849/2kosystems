import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import PageHero from "@/components/cinema/PageHero";
import PhaseReel from "@/components/cinema/PhaseReel";
import PhaseArtefact from "@/components/cinema/PhaseArtefact";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import Photo from "@/components/cinema/Photo";
import TrackedLink from "@/components/cinema/TrackedLink";
import { Panel, Readout, QueueRows, Pill, EventFeed, Sparkline } from "@/components/cinema/instruments";
import { RATES, TERMS, TIMEBOX } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "How Process Improvement Becomes Operational Control",
  description:
    "Diagnose, measure, improve, train, automate, systemise and sustain. One improvement lifecycle with fixed decision gates.",
  alternates: { canonical: "/method" },
});

const phases = [
  {
    letter: "D",
    artefact: "memo" as const,
    phase: "Diagnose",
    engagement: "Half-Day Process Review",
    price: RATES.review,
    terms: "ex VAT · fixed",
    time: TIMEBOX.review,
    body: "Half a day on site with the people who actually do the work. We walk the process end to end, note the current control method, and write three or four pages naming what is broken and whether it is worth building anything at all.",
    outputs: [
      "The process named and bounded in writing",
      "Current control method recorded",
      "A go / no-go recommendation",
      "Fee credited against whatever you commission next",
    ],
  },
  {
    letter: "M",
    artefact: "findings" as const,
    phase: "Measure",
    engagement: "Process & Automation Opportunity Audit",
    price: RATES.audit,
    terms: "ex VAT · fixed",
    time: TIMEBOX.audit,
    body: "A day of fieldwork across at least two levels of the operation — someone who does the work and someone who owns the outcome. Then eight to fourteen pages: three findings, each costed with the arithmetic shown, marked Observed or Reported, never blurred.",
    outputs: [
      "Three findings, each with an annual rand cost",
      "Every number shows its working",
      "One named pilot at a fixed price",
      `Credited in full against a pilot within ${TERMS.auditCreditDays} days`,
    ],
  },
  {
    letter: "A/I",
    artefact: "pilot" as const,
    phase: "Improve & Train",
    engagement: "Applied Improvement Programme",
    price: "Programme scope",
    terms: "defined before delivery",
    time: "bounded cohort / cycle",
    body: "The future-state process is designed around the measured constraint. Where capability is part of the answer, training and coaching connect directly to a live improvement project—not a classroom exercise detached from the operation.",
    outputs: [
      "Future-state process and benefit target agreed",
      "Applied Six Sigma pathway where capability is required",
      "Live project coaching and sponsor reviews",
      "Control plan ready for automation or adoption",
    ],
  },
  {
    letter: "C",
    artefact: "phases" as const,
    phase: "Automate & Systemise",
    engagement: "Workflow Pilot / System Build",
    price: `from ${RATES.pilotFrom}`,
    terms: "ex VAT · fixed by phase",
    time: TIMEBOX.buildPhase,
    body: "The control plan becomes the system. Delivered in phases, each quoted as a fixed price only once the previous one has shipped — so you are never asked to commit to a number for work that nobody can scope yet.",
    outputs: [
      "Fixed price per phase, quoted in sequence",
      "Mainstream technology, no proprietary platform",
      "Handover documentation and training",
      "You own the code throughout",
    ],
  },
  {
    letter: "S",
    artefact: "service" as const,
    phase: "Measure & Sustain",
    engagement: "Integrated Improvement Partnership",
    price: "Annual agreement",
    terms: "scope and capacity defined",
    time: "12-month cadence",
    body: "The workstream stays on a recurring measurement and improvement rhythm. Senior process support, applied training, automation capacity and Sigmafy access can be combined around the operating result and adjusted as the constraint moves.",
    outputs: [
      "Scorecard, benefits register and operating reviews",
      "Training credits tied to the capability plan",
      "Bounded automation and systems capacity",
      "Sigmafy allowance and evidence protocol",
    ],
  },
];

export default function MethodPage() {
  return (
    <>
      <PageHero
        eyebrow="METHOD"
        title="One improvement loop. Clear decisions at every stage."
        titleClass="max-w-[18ch]"
        lead="We diagnose and measure before choosing an intervention. Process redesign, training, automation and operational systems then work together only where the evidence requires them. Every delivery phase has a written scope and a stop decision."
        ctas={[
          { href: "/process-review", label: "Start with a review", offer: "process review" },
          { href: "/audit", label: "Quantify the opportunity", ghost: true, offer: "opportunity audit" },
        ]}
      >
        <div className="mt-12 flex flex-wrap gap-2.5">
          <Pill tone="good">Fixed price per phase</Pill>
          <Pill tone="good">Scope written before work starts</Pill>
          <Pill>Never billed hourly</Pill>
          <Pill tone="warn">Changes quoted in advance</Pill>
        </div>
        <PhaseReel />
      </PageHero>

      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/method/lifecycle-v1.webp" priority sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/15 to-black/55" aria-hidden="true" />
        <div className="k-shell pb-20 pt-40">
          <Rise><p className="k-mono k-mono--ember">The client improvement lifecycle</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">The intervention changes. The measurement loop does not.</h2></Rise>
          <Rise step={2}><p className="k-lead mt-8 max-w-[50ch]">Automate where the rules repeat. Train where judgement matters. Measure both.</p></Rise>
          <ol className="mt-14 grid overflow-hidden rounded-2xl border border-white/10 bg-black/72 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-7">
            {["Diagnose", "Measure", "Improve", "Train", "Automate", "Systemise", "Sustain"].map((stage, index) => (
              <li key={stage} className="relative min-h-[126px] border-b border-r border-white/10 p-5 lg:border-b-0">
                <span className="absolute left-0 top-0 h-[2px] bg-gradient-to-r from-[var(--ember)] to-transparent" style={{ width: `${38 + index * 8}%` }} />
                <span className="k-mono k-mono--ember">0{index + 1}</span>
                <h3 className="k-sub mt-8">{stage}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ TWO WAYS IN ═══ */}
      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 top-1/2 -translate-y-1/2 text-[clamp(120px,24vw,360px)] font-semibold leading-none tracking-[-.09em] text-white/[.018]" aria-hidden="true">CHOOSE</div>
        <div className="k-shell relative">
          <Rise>
            <p className="k-mono k-mono--ember">Two ways in</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[26ch]">
              You do not have to start at the beginning.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-5">
              The lifecycle explains how improvement holds. The five delivery
              phases below explain what you can commission, price and stop.
            </p>
          </Rise>

          <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Rise>
              <article className="border-t border-[var(--signal)] pt-8">
                <p className="k-mono k-mono--ember">If you already know what is broken</p>
                <p className="mt-6 text-[clamp(52px,8vw,104px)] font-medium leading-none tracking-[-.065em] text-white/10">KNOWN</p>
                <h3 className="k-title mt-5">Straight to a fixed price. No site visit.</h3>
                <p className="k-sm mt-5 max-w-[52ch]">
                  A spreadsheet that has outgrown itself, job cards coming back
                  late, a contractor register nobody trusts — the problem is
                  already visible in the artifact. Send it to us on a call and we
                  scope it from that.
                </p>
                <ul className="k-hairline mt-4 flex flex-col gap-2 pt-3">
                  {[
                    "A thirty-minute call, free",
                    "A copy of the spreadsheet or a screenshot of the form",
                    "Fixed price and a start date",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px]">
                      <span style={{ color: "var(--signal)" }}>—</span>
                      <span style={{ color: "var(--warm-70)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/systems" className="k-link mt-5 inline-flex">
                  See the fixed-price systems →
                </Link>
              </article>
            </Rise>

            <Rise step={1}>
              <article className="border-t border-[var(--ember)] pt-8">
                <p className="k-mono k-mono--ember">If something is wrong and you cannot name it</p>
                <p className="mt-6 text-[clamp(52px,8vw,104px)] font-medium leading-none tracking-[-.065em] text-white/10">UNCLEAR</p>
                <h3 className="k-title mt-5">Start on site. That is what the review is for.</h3>
                <p className="k-sm mt-5 max-w-[52ch]">
                  When the problem lives in how work actually moves — a control
                  that may or may not still be happening, a handover that fails
                  quietly — no questionnaire will find it. Somebody has to watch
                  the work.
                </p>
                <ul className="k-hairline mt-4 flex flex-col gap-2 pt-3">
                  {[
                    "Half a day with the people who do the work",
                    "What we watched, separated from what we were told",
                    "A memo naming it, and a go or no-go",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px]">
                      <span style={{ color: "var(--ember)" }}>—</span>
                      <span style={{ color: "var(--warm-70)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/quote" className="k-link mt-5 inline-flex">
                  Not sure which? Build a scope →
                </Link>
              </article>
            </Rise>
          </div>
        </div>
      </section>

      <section className="mt-method-plate">
        <Rise variant="settle" className="mt-method-media"><Photo src="/imagery/method/process-map-v1.webp" sizes="100vw" position="center" /></Rise>
        <div className="k-shell mt-method-copy">
          <Rise><p className="k-mono k-mono--ember">FROM OBSERVATION TO CONTROL</p></Rise>
          <Rise step={1}><h2>Make the route visible. Move the constraint. Test the new path.</h2></Rise>
          <Rise step={2}><p className="mt-method-lead">Each phase changes the operating record. That visible change is what earns the decision to continue.</p></Rise>
        </div>
      </section>

      {/* ═══ PHASES ═══ */}
      {phases.map((phase, i) => (
        <section
          key={phase.letter}
          id={`phase-${phase.phase.toLowerCase().replace(/[^a-z]+/g, "-")}`}
          className={`k-band k-phase-section${i % 2 === 0 ? "" : " k-band--2"}`}
        >
          <div className="k-shell k-phase-grid">
            <div>
              <Rise>
                <p className="k-mono k-mono--ember">
                  Phase {i + 1} of 5 · {phase.phase}
                </p>
                <p className="k-phase-letter">{phase.letter}</p>
                <h2 className="k-phase-eng">{phase.engagement}</h2>
              </Rise>
              <Rise step={1}>
                <p className="k-lead k-measure mt-6">{phase.body}</p>
              </Rise>
              <Rise step={2}>
                <p className="k-phase-price">
                  <b>{phase.price}</b>
                  <span>{phase.terms}</span>
                  <span style={{ marginLeft: "auto" }}>{phase.time}</span>
                </p>
                <ul className="mt-5 flex flex-col gap-2">
                  {phase.outputs.map((output) => (
                    <li key={output} className="flex gap-3 text-[12.5px] leading-[1.5]">
                      <span style={{ color: "var(--signal)" }}>—</span>
                      <span style={{ color: "var(--warm-70)" }}>{output}</span>
                    </li>
                  ))}
                </ul>
              </Rise>
            </div>

            {/* Not what happens in the phase — the reel above shows that. This is
                the thing that lands in your inbox at the end of it. */}
            <Rise step={2}>
              <PhaseArtefact kind={phase.artefact} />
              <p className="k-mono mt-4">Illustrative delivery artefact · example records and values · not a client result</p>
            </Rise>
          </div>
        </section>
      ))}

      {/* ═══ DELIVERY ═══ */}
      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">Delivery</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[22ch]">
              A visible artefact in every cycle. Not a transformation deck at the end.
            </h2>
          </Rise>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <Rise>
              <Panel label="Sprint cadence" meta="Weekly">
                <Readout value="1 wk" unit="between demos" />
                <div className="mt-4">
                  <Sparkline points={[10, 22, 36, 48, 58, 70, 79, 88, 94, 100]} />
                </div>
                <p className="k-mono mt-3">Cumulative scope shipped</p>
              </Panel>
            </Rise>
            <Rise step={1}>
              <Panel label="Change control" meta="Day rate">
                <Readout value={RATES.dayRate} unit="per day" tone="warn" />
                <div className="k-hairline mt-4 pt-4">
                  <QueueRows
                    rows={[
                      { label: "Quoted before work starts", value: "Always", tone: "good" },
                      { label: "Applied retrospectively", value: "Never", tone: "good" },
                      { label: "Approved in writing", value: "Required" },
                    ]}
                  />
                </div>
              </Panel>
            </Rise>
            <Rise step={2}>
              <Panel label="Handover log" meta="At go-live">
                <EventFeed
                  lines={[
                    { time: "W4 D1", text: "Source repository transferred", tone: "good" },
                    { time: "W4 D2", text: "Runbook and architecture notes issued", tone: "good" },
                    { time: "W4 D3", text: "Team training completed", tone: "good" },
                    { time: "W4 D4", text: "Backups verified by restore test", tone: "good" },
                    { time: "W4 D5", text: "SLA starts · 30-day support opens" },
                  ]}
                />
              </Panel>
            </Rise>
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[90svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/method/start-review-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-transparent to-black/35" aria-hidden="true" />
        <div className="k-shell grid gap-12 pb-20 pt-44 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">Start</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Phase one costs {RATES.review} and half a day.</h2></Rise>
            <Rise step={2}><p className="k-lead mt-8 max-w-[52ch]">It comes off whatever you commission next, so proceeding makes it free and stopping still leaves you with the memo.</p></Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <TrackedLink href="/contact?interest=process-review" eventOffer="process review" className="k-btn k-btn--solid">Book a process review</TrackedLink>
            <Link href="/pricing" className="k-btn k-btn--ghost">Full price list</Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
