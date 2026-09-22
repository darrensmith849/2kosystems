import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
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
  RoleMatrix,
  ConfidenceBars,
} from "@/components/cinema/instruments";
import { RATES, TERMS } from "@/lib/pricing";
import { CATALOGUE } from "@/lib/products";
import SystemsControlPlane from "@/components/cinema/SystemsControlPlane";
import ServiceOperationsOS from "@/components/cinema/ServiceOperationsOS";
import Photo from "@/components/cinema/Photo";
import TrackedLink from "@/components/cinema/TrackedLink";

export const metadata: Metadata = completePageMetadata({
  title: "Systems & Automation — Process-Led Operational Technology",
  description:
    "Process-led systems for field operations, client onboarding, cases and claims, finance controls, service quality, approvals and reporting.",
  alternates: { canonical: "/systems" },
});

export default function SystemsPage() {
  return (
    <>
      {/* ═══ OPENING ═══ */}
      <section className="sc-hero">
        <div className="sc-hero-grid" aria-hidden="true" />
        <div className="k-shell sc-hero-inner">
          <div className="sc-visual-head">
            <div><Rise><p className="k-mono k-mono--ember">SYSTEMS AND AUTOMATION</p></Rise><Rise step={1}><h1>One operational truth.</h1></Rise></div>
            <Rise step={2}><p>Work, responsibility, evidence and performance—connected in the same operating record.</p></Rise>
          </div>
          <Rise step={3}><SystemsControlPlane /></Rise>
        </div>
      </section>

      <section className="sc-story">
        <div className="k-shell">
          <div className="sc-story-layout">
            <Rise><div><p className="k-mono k-mono--ember">THE PROPOSITION</p><h2>Make the improved process the way the work gets done.</h2></div></Rise>
            <div className="sc-story-side">
              <Rise step={1}><p>We improve the workflow before we automate it, then place routine rules, evidence, ownership and escalation inside the system. The result is not simply software—it is a process that is easier to follow and harder to bypass.</p></Rise>
              <Rise step={2} className="sc-story-actions">
                <TrackedLink href="/contact?interest=systems-automation" eventOffer="systems and automation" className="k-btn k-btn--solid">Bring us the process</TrackedLink>
                <TrackedLink href="/process-review" eventOffer="process review" className="k-btn k-btn--ghost">Start with a Process Review</TrackedLink>
              </Rise>
            </div>
          </div>
          <Rise step={3} className="sc-story-facts">
            <span><b>Process</b><small>before platform</small></span><span><b>Human</b><small>on consequential decisions</small></span><span><b>Fixed</b><small>scope per phase</small></span><span><b>Yours</b><small>source, docs and data</small></span>
          </Rise>
        </div>
      </section>

      {/* ═══ SERVICE OPERATIONS ═══ */}
      <section id="service-systems" className="sv-section">
        <div className="k-shell sv-section-inner">
          <div className="sv-intro">
            <Rise>
              <div>
                <p className="k-mono k-mono--ember">SERVICE SYSTEMS · INFORMATION OPERATIONS</p>
                <h2>When the work is a case, the system should carry the context.</h2>
              </div>
            </Rise>
            <Rise step={1}>
              <div>
                <p>Banks, insurers, contact centres, accounting teams and professional-services firms do not move pallets—but their work still enters, waits, changes hands, attracts risk and needs proof. We build the operating record around that flow.</p>
                <TrackedLink href="/contact?interest=systems-automation" eventOffer="service operations systems" className="k-link">Scope a service system →</TrackedLink>
              </div>
            </Rise>
          </div>

          <Rise step={2}><ServiceOperationsOS /></Rise>

          <div className="sv-patterns">
            {[
              ["01", "Client onboarding", "One record for applications, documents, checks, exceptions, decisions and activation.", "Banking · legal · advisory"],
              ["02", "Cases & claims", "Controlled triage, evidence, specialist decisions, service targets and resolution history.", "Insurance · complaints · support"],
              ["03", "Finance controls", "Reconciliations, explanations, approvals and close evidence without spreadsheet chasing.", "Accounting · shared services · groups"],
              ["04", "Service quality", "Connect interactions, scorecards, causes, coaching actions and confirmation of improvement.", "Contact centres · customer operations"],
            ].map(([number, title, body, sector], index) => (
              <Rise key={title} step={(index % 3) as 0 | 1 | 2}>
                <article>
                  <header><span>{number}</span><small>{sector}</small></header>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <footer><i /> Configured around your process</footer>
                </article>
              </Rise>
            ))}
          </div>

          <Rise className="sv-commercial">
            <div><span>HOW IT STARTS</span><strong>Review → pilot → owned system → managed evolution</strong></div>
            <p>A Process Review establishes the first release and a credible fixed scope. After go-live, you can operate it independently, protect it with Care or keep adapting it through a Managed Systems Partnership.</p>
            <TrackedLink href="/process-review" eventOffer="process review" className="k-btn k-btn--ghost">Review the process</TrackedLink>
          </Rise>
        </div>
      </section>

      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/systems/field-v1.webp" priority sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/64 via-black/10 to-black/48" aria-hidden="true" />
        <div className="k-shell grid gap-12 pb-20 pt-40 lg:grid-cols-[minmax(0,.8fr)_minmax(440px,1.2fr)] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">Process before platform</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Do not automate waste, ambiguity or a broken handoff.</h2></Rise>
          </div>
          <Rise step={2}>
            <ol className="overflow-hidden rounded-2xl border border-white/10 bg-black/72 backdrop-blur-xl">
              {[
                ["Improve", "Remove unnecessary work and clarify ownership."],
                ["Automate", "Move repeatable routing and checking into the workflow."],
                ["Control", "Make evidence, escalation and measurement part of the record."],
              ].map(([title, body], index) => (
                <li key={title} className="grid grid-cols-[48px_minmax(0,.65fr)_minmax(0,1fr)] items-baseline gap-5 border-b border-white/10 px-6 py-7 last:border-b-0">
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <h3 className="k-sub">{title}</h3>
                  <p className="k-sm">{body}</p>
                </li>
              ))}
            </ol>
            <p className="k-mono mt-5">Interfaces and values below are illustrative · mechanisms, not client results</p>
          </Rise>
        </div>
      </section>

      {/* ═══ READY TO BUILD ═══ */}
      <section className="k-band">
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

      <section id="managed-systems" className="ms-section scroll-mt-20">
        <div className="k-shell">
          <div className="ms-head">
            <Rise><div><p className="k-mono k-mono--ember">BUILD TO MANAGED</p><h2>Build it once. Keep adapting it as the operation changes.</h2></div></Rise>
            <Rise step={1}><p>A new system should not freeze the process on launch day. Choose the operating relationship that matches how much responsibility and planned change you want 2KO to carry.</p></Rise>
          </div>
          <Rise step={2}>
            <ol className="ms-flow" aria-label="Managed system lifecycle">
              {[["01", "Build", "A separately scoped product, pilot or phased system."], ["02", "Stabilise", `${TERMS.postLaunchSupportDays} days of launch support are included.`], ["03", "Operate", "Monitoring, support, releases and a named owner."], ["04", "Adapt", "Planned workflow changes follow the operating roadmap."]].map(([number, title, body]) => <li key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p></li>)}
            </ol>
          </Rise>
          <div className="ms-options">
            <Rise><article><div><p className="k-mono k-mono--ember">SYSTEM CARE</p><h3>Keep the live system healthy.</h3><p>Proactive monitoring, priority support, monthly health reviews and one planned day for maintenance or minor improvement each month.</p></div><div className="ms-price"><span>from</span><strong>{RATES.retainerCare}</strong><small>per month · ex VAT</small></div><TrackedLink href="/contact?interest=care" eventOffer="system care" className="k-btn k-btn--ghost">Discuss Care</TrackedLink></article></Rise>
            <Rise step={1}><article className="ms-options__featured"><div><p className="k-mono k-mono--ember">MANAGED SYSTEMS PARTNERSHIP</p><h3>Operate and evolve one system.</h3><p>A named systems lead, monthly roadmap, priority support and three planned development or automation days each month.</p></div><div className="ms-price"><span>from</span><strong>{RATES.managedSystems}</strong><small>per month · ex VAT</small></div><TrackedLink href="/contact?interest=managed-systems" eventOffer="managed systems partnership" className="k-btn k-btn--solid">Discuss managed systems</TrackedLink></article></Rise>
          </div>
          <Rise className="ms-boundary"><span>THE COMMERCIAL BOUNDARY</span><p>The initial build and major new modules, integrations or additional systems are separately scoped. System Care covers one named production system and bounded minor improvements; the Managed Systems Partnership adds the larger operating roadmap and development capacity.</p></Rise>
        </div>
      </section>

      {/* ═══ 01 APPROVALS ═══ */}
      <section id="automation" className="k-band k-band--2">
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
            <Rise className="mt-7"><Link href="/automation" className="k-link">Explore the dedicated automation capability →</Link></Rise>
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
      <section className="k-band">
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
      <section className="k-band k-band--2">
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
      <section className="k-band relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 top-1/2 -translate-y-1/2 text-[clamp(110px,24vw,360px)] font-semibold leading-none tracking-[-.09em] text-white/[.018]" aria-hidden="true">REPORT</div>
        <div className="k-shell relative">
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
      <section className="k-band k-band--2">
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

          <Rise step={1} className="min-w-0">
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
      <section className="k-band">
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

      {/* ═══ CLOSE ═══ */}
      <section className="relative isolate flex min-h-[90svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/systems/process-holds-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-transparent to-black/30" aria-hidden="true" />
        <div className="k-shell grid gap-12 pb-20 pt-44 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">Next</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Which layer is costing you the most?</h2></Rise>
            <Rise step={2}><p className="k-lead mt-8 max-w-[50ch]">Half a day on site, {RATES.review}, and a memo naming it. The fee comes off whatever you commission next.</p></Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <TrackedLink href="/contact?interest=systems-automation" eventOffer="systems and automation" className="k-btn k-btn--solid">Bring us the process</TrackedLink>
            <Link href="/pricing" className="k-btn k-btn--ghost">See the price list</Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
