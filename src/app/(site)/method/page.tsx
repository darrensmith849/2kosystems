import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import { Panel, Readout, QueueRows, Pill, EventFeed, Sparkline } from "@/components/cinema/instruments";
import { RATES, TERMS, TIMEBOX } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "How We Work — DMAIC, Fixed Price at Every Phase",
  description:
    "Define, Measure, Analyse, Improve, Control. Five phases, each a fixed price against a written scope. Stop after any of them.",
  alternates: { canonical: "/method" },
};

const phases = [
  {
    letter: "D",
    phase: "Define",
    engagement: "Half-Day Process Review",
    price: RATES.review,
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
    phase: "Measure",
    engagement: "Systems Opportunity Audit",
    price: RATES.audit,
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
    phase: "Analyse & Improve",
    engagement: "Proof-of-Value Pilot",
    price: `from ${RATES.pilotFrom}`,
    time: TIMEBOX.pilot,
    body: "One workflow, built properly, against success criteria agreed in writing before anyone starts. Working software you can use from week two, weekly demos, and nothing thrown away — the pilot is the first phase of the build, not a prototype.",
    outputs: [
      "Success criteria agreed before work starts",
      "Weekly demos against real data",
      "Source and documentation from day one",
      "Rolls forward into the Core Build",
    ],
  },
  {
    letter: "C",
    phase: "Control",
    engagement: "Core System Build",
    price: `${RATES.buildFrom} – ${RATES.buildTo}`,
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
    phase: "Sustain",
    engagement: "Managed Retainer",
    price: `from ${RATES.retainerCare}/mo`,
    time: `${TERMS.retainerMinMonths}-month minimum`,
    body: "Hosting, monitoring, automated backups, security patching and an SLA, with development time included on the upper tiers. Optional, and never a condition of anything we build — the system is designed to be operated without us.",
    outputs: [
      "Three tiers, published",
      `Annual prepay takes ${TERMS.annualPrepayDiscount} off`,
      `Escalation fixed at ${TERMS.escalation}`,
      "Cancel to month-to-month after the minimum",
    ],
  },
];

export default function MethodPage() {
  return (
    <>
      <section className="k-shell pt-32 pb-12 lg:pt-40">
        <Rise>
          <p className="k-mono k-mono--ember">Method</p>
        </Rise>
        <Rise step={1}>
          <h1 className="k-state mt-6 max-w-[17ch]">
            Five phases. Stop after any of them.
          </h1>
        </Rise>
        <Rise step={2}>
          <p className="k-lead k-measure mt-6">
            You do not have to learn our process, because it is the one your team
            already works in. Define, Measure, Analyse, Improve, Control — with the
            Control phase written in code instead of onto a form that somebody has
            to remember to fill in.
          </p>
        </Rise>

        <Rise step={3} className="mt-12">
          <div className="flex flex-wrap gap-2.5">
            <Pill tone="good">Fixed price per phase</Pill>
            <Pill tone="good">Scope written before work starts</Pill>
            <Pill>Never billed hourly</Pill>
            <Pill tone="warn">Changes quoted in advance</Pill>
          </div>
        </Rise>
      </section>

      {/* ═══ TWO WAYS IN ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
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
              The five phases are how a full engagement runs. Most people do not
              need all of them, and some do not need the first one at all.
            </p>
          </Rise>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Rise>
              <div className="k-card h-full">
                <p className="k-mono k-mono--ember">If you already know what is broken</p>
                <h3 className="k-sub mt-4">Straight to a fixed price. No site visit.</h3>
                <p className="k-sm mt-3">
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
              </div>
            </Rise>

            <Rise step={1}>
              <div className="k-card h-full">
                <p className="k-mono k-mono--ember">If something is wrong and you cannot name it</p>
                <h3 className="k-sub mt-4">Start on site. That is what the review is for.</h3>
                <p className="k-sm mt-3">
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
              </div>
            </Rise>
          </div>
        </div>
      </section>

      {/* ═══ PHASES ═══ */}
      {phases.map((phase, i) => (
        <section key={phase.letter} className={i % 2 === 0 ? "k-band" : "k-band k-band--2"}>
          <div className="k-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
            <div>
              <Rise>
                <div className="flex items-baseline gap-5">
                  <span
                    className="k-num text-[40px] leading-none"
                    style={{ color: "var(--ember)" }}
                  >
                    {phase.letter}
                  </span>
                  <div>
                    <p className="k-mono">{phase.phase}</p>
                    <h2 className="k-sub mt-1.5">{phase.engagement}</h2>
                  </div>
                </div>
              </Rise>
              <Rise step={1}>
                <p className="k-lead k-measure mt-6">{phase.body}</p>
              </Rise>
            </div>

            <Rise step={2}>
              <Panel label={`Phase ${i + 1} of 5`} meta={phase.time}>
                <Readout value={phase.price} />
                <p className="k-mono mt-2">ex VAT · fixed</p>
                <ul className="k-hairline mt-4 flex flex-col gap-2 pt-3">
                  {phase.outputs.map((output) => (
                    <li key={output} className="flex gap-3 text-[12.5px] leading-[1.5]">
                      <span style={{ color: "var(--signal)" }}>—</span>
                      <span style={{ color: "var(--warm-70)" }}>{output}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
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
              Working software in week two. Not a slide deck in month six.
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

      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Start</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[18ch]">
                Phase one costs {RATES.review} and half a day.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                And it comes off whatever you commission next, so proceeding makes
                it free and stopping still leaves you with the memo.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Book a process review
            </Link>
            <Link href="/pricing" className="k-btn k-btn--ghost">
              Full price list
            </Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
