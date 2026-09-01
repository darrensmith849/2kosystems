import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import {
  Panel,
  Readout,
  Sparkline,
  Gauge,
  StatusGrid,
  QueueRows,
  EventFeed,
  Pill,
  PipelineFlow,
  RoleMatrix,
  ConfidenceBars,
} from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";
import { CATALOGUE } from "@/lib/products";
import Crossover from "@/components/cinema/Crossover";
import PageHero from "@/components/cinema/PageHero";
import ClientStrip from "@/components/cinema/ClientStrip";

export const metadata: Metadata = {
  title: "Operational Systems We Build — Fixed-Price and Custom",
  description:
    "Approvals, capture, escalation, reporting and portals for South African operations — plus fixed-price systems from R79,500.",
  alternates: { canonical: "/systems" },
};

export default function SystemsPage() {
  return (
    <>
      {/* ═══ OPENING ═══ */}
      <PageHero
        eyebrow="SYSTEMS"
        title="Six layers. One operation."
        titleClass="max-w-[15ch]"
        lead="Nothing here is a product you buy off a shelf. Each layer is shaped to the way your operation already runs — the same six concerns show up everywhere, but never in the same arrangement twice."
        ctas={[
          { href: "/contact", label: "Book a process review" },
          { href: "/pricing", label: "See the price list", ghost: true },
        ]}
        facts={[
          { value: RATES.review, label: "half a day on site" },
          { value: RATES.getOffExcel, label: "fixed-price systems from" },
          { value: RATES.buildTo, label: "phased builds to" },
          { value: "Fixed", label: "priced per phase" },
        ]}
      >
        <div className="mt-10">
          <PipelineFlow
            stages={[
              { name: "Request", meta: "captured at source" },
              { name: "Route", meta: "owner assigned" },
              { name: "Approve", meta: "threshold checked" },
              { name: "Execute", meta: "work scheduled" },
              { name: "Record", meta: "audit written" },
            ]}
          />
        </div>
      </PageHero>

      <ClientStrip />

      {/* ═══ READY TO BUILD ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">Ready to build</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[26ch]">
              Some problems are common enough to have a fixed price.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-5">
              These are the ones we are asked for most often, so the scope is
              already drawn and the price is already published. Everything else is
              shaped from scratch.
            </p>
          </Rise>

          <div className="mt-12">
            {CATALOGUE.map((item, i) => (
              <Rise key={item.href}>
                <Link
                  href={item.href}
                  className="k-row grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_120px_auto] md:items-baseline"
                  style={i === 0 ? { borderTop: "1px solid var(--hair-2)" } : undefined}
                >
                  <span className="k-sub">{item.name}</span>
                  <span className="k-sm">{item.summary}</span>
                  <span className="k-mono">{item.timebox}</span>
                  <span className="k-num text-[20px] md:text-right">{item.price}</span>
                </Link>
              </Rise>
            ))}
          </div>

          <Rise className="mt-10">
            <p className="k-sm k-measure">
              If your version is bigger than the box, we say so at scoping rather
              than sell you the wrong thing — and point you at a pilot instead.
            </p>
          </Rise>
        </div>
      </section>

      {/* ═══ 01 APPROVALS ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">01 — Approvals</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[18ch]">
                Decisions stop living in inboxes.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                A request arrives with a value, a category and an owner. The chain
                is derived from your own delegation rules, not from who happens to
                be copied in. If it sits too long it escalates on its own.
              </p>
            </Rise>
            <Rise step={3}>
              <ul className="mt-6 flex flex-wrap gap-2">
                <Pill tone="good">Thresholds</Pill>
                <Pill tone="good">Delegation</Pill>
                <Pill tone="warn">Escalation</Pill>
                <Pill>Full audit trail</Pill>
              </ul>
            </Rise>
          </div>

          <Rise step={1}>
            <Panel label="Approval queue" meta="Live" float="slow">
              <Readout value="4h 12m" unit="avg. to decision" delta="−38%" tone="good" />
              <div className="mt-5">
                <Sparkline points={[52, 47, 44, 46, 38, 34, 31, 27, 24, 22, 19, 17]} />
              </div>
              <div className="k-hairline mt-5 pt-4">
                <QueueRows
                  rows={[
                    { label: "Awaiting sign-off", value: "3" },
                    { label: "Escalated past threshold", value: "1", tone: "warn" },
                    { label: "Cleared today", value: "27", tone: "good" },
                    { label: "Breached SLA", value: "0", tone: "good" },
                  ]}
                />
              </div>
            </Panel>
          </Rise>
        </div>
      </section>

      {/* ═══ 02 CAPTURE ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[460px_minmax(0,1fr)] lg:items-center">
          <Rise className="lg:order-2">
            <Panel label="Capture integrity" meta="30d" float="on">
              <Readout value="99.4%" unit="first-time-right" tone="good" />
              <div className="mt-4">
                <Sparkline
                  points={[62, 68, 71, 74, 79, 83, 86, 88, 91, 93, 96, 99]}
                  height={38}
                />
              </div>
              <div className="k-hairline mt-5 pt-4">
                <EventFeed
                  lines={[
                    { time: "07:12", text: "Job card 4471 · captured on site", tone: "good" },
                    { time: "07:12", text: "Photo attached · GPS verified", tone: "good" },
                    { time: "07:14", text: "Meter reading outside range · rejected", tone: "warn" },
                    { time: "07:14", text: "Operator re-entered · accepted", tone: "good" },
                  ]}
                />
              </div>
            </Panel>
          </Rise>

          <div className="lg:order-1">
            <Rise>
              <p className="k-mono k-mono--ember">02 — Capture</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[18ch]">
                The record is made where the work happens.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                On a phone, in a yard, underground, offline if it has to be.
                Validated on entry, so an impossible reading never reaches the
                report in the first place. Nothing is transcribed later from
                memory to satisfy a file.
              </p>
            </Rise>
          </div>
        </div>
      </section>

      {/* ═══ 03 ESCALATION ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">03 — Escalation</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[18ch]">
                Nothing waits for someone to notice.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                Thresholds fire the day a number moves, to the person who can
                actually act, with the history already attached. The alternative
                is a monthly report that finds the drift four weeks after it
                started.
              </p>
            </Rise>
          </div>

          <Rise step={1}>
            <div className="flex flex-col gap-5">
              <Panel label="Threshold" meta="Cycle time">
                <div className="flex items-center gap-6">
                  <Gauge value={68} label="of tolerance used" />
                  <div className="flex-1">
                    <QueueRows
                      rows={[
                        { label: "Target", value: "6h" },
                        { label: "Current", value: "4h 12m", tone: "good" },
                        { label: "Trigger at", value: "8h", tone: "warn" },
                      ]}
                    />
                  </div>
                </div>
              </Panel>
              <Panel label="Uptime" meta="90d" float="on">
                <Readout value="99.98%" tone="good" />
                <div className="mt-4">
                  <StatusGrid count={30} incidents={[19]} />
                </div>
                <p className="k-mono mt-3">1 planned window · 0 unplanned</p>
              </Panel>
            </div>
          </Rise>
        </div>
      </section>

      {/* ═══ 04 REPORTING ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">04 — Reporting</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[20ch]">The pack builds itself.</h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-5">
              Live operational views with drill-down to the underlying job, and a
              scheduled pack that lands in an inbox already correct. Month-end
              stops being three days of copy-paste and starts being a review.
            </p>
          </Rise>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Throughput", value: "1,284", unit: "requests · 24h", points: [42, 48, 44, 55, 61, 58, 67, 72, 69, 78, 84, 91] },
              { label: "Cost per job", value: "R412", unit: "−R88 vs Q1", points: [88, 84, 80, 76, 74, 70, 66, 62, 58, 54, 50, 48] },
              { label: "Rework", value: "1.2%", unit: "of completed", points: [64, 58, 52, 47, 41, 36, 30, 26, 22, 18, 14, 12] },
              { label: "On-time", value: "96.4%", unit: "against SLA", points: [58, 62, 66, 70, 73, 78, 82, 85, 88, 92, 94, 96] },
            ].map((metric, i) => (
              <Rise key={metric.label} step={(i % 3) as 0 | 1 | 2}>
                <Panel label={metric.label}>
                  <Readout value={metric.value} tone={i === 2 ? "good" : "neutral"} />
                  <p className="k-mono mt-2">{metric.unit}</p>
                  <div className="mt-4">
                    <Sparkline points={metric.points} tone={i === 1 || i === 2 ? "ember" : "signal"} height={38} />
                  </div>
                </Panel>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 05 PORTALS ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_500px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">05 — Portals</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[18ch]">The handover disappears.</h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                Clients, contractors and crews working in the same record instead
                of emailing about it. Each role sees exactly what it should, which
                is a permission model rather than a promise.
              </p>
            </Rise>
          </div>

          <Rise step={1}>
            <Panel label="Access model" meta="4 roles">
              <RoleMatrix
                roles={["Ops", "Client", "Contr.", "Exec"]}
                capabilities={[
                  "Raise a request",
                  "See own history",
                  "See all sites",
                  "Approve above R50k",
                  "Export financials",
                  "Change thresholds",
                ]}
                grants={[
                  [true, true, true, false],
                  [true, true, true, true],
                  [true, false, false, true],
                  [false, false, false, true],
                  [false, false, false, true],
                  [false, false, false, true],
                ]}
              />
            </Panel>
          </Rise>
        </div>
      </section>

      {/* ═══ 06 INTELLIGENCE ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[460px_minmax(0,1fr)] lg:items-center">
          <Rise className="lg:order-2">
            <Panel label="Triage" meta="Last 1,000" float="slow">
              <ConfidenceBars
                items={[
                  { label: "Routed automatically", value: 94 },
                  { label: "Category confidence", value: 97 },
                  { label: "Sent to a person", value: 6 },
                  { label: "Overturned by a person", value: 2 },
                ]}
              />
              <div className="k-hairline mt-5 pt-4">
                <p className="k-mono">
                  Every consequential action still requires a human decision.
                </p>
              </div>
            </Panel>
          </Rise>

          <div className="lg:order-1">
            <Rise>
              <p className="k-mono k-mono--ember">06 — Intelligence</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[18ch]">
                Judgement stays with your people.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                Classification, triage, summarising and drafting inside the
                workflow, where it measurably reduces handling time. Not a chatbot
                bolted to the homepage, and never the thing that makes the call.
              </p>
            </Rise>
          </div>
        </div>
      </section>

      {/* The websites work and this work are one ladder. Someone who lands here
          from an ad for "custom software" is often after the rung below. */}
      <Crossover />

      {/* ═══ CLOSE ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Next</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[18ch]">
                Which layer is costing you the most?
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                Half a day on site, {RATES.review}, and a memo naming it. The fee
                comes off whatever you commission next.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Book a process review
            </Link>
            <Link href="/pricing" className="k-btn k-btn--ghost">
              See the price list
            </Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
