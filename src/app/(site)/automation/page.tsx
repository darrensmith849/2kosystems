import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import AutomationControlRoom from "@/components/cinema/AutomationControlRoom";
import ServiceAutomationLibrary from "@/components/cinema/ServiceAutomationLibrary";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import TrackedLink from "@/components/cinema/TrackedLink";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import { ConfidenceBars, Panel, Pill, PipelineFlow, QueueRows, Readout, Sparkline } from "@/components/cinema/instruments";
import { RATES, TIMEBOX } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "Workflow & AI Process Automation South Africa",
  description: `Automate approvals, routing, capture, reconciliation, reporting and assisted knowledge work—designed from the process and proven in a ${TIMEBOX.pilot} pilot from ${RATES.pilotFrom} ex VAT.`,
  alternates: { canonical: "/automation" },
});

const automateWhen = [
  "The work repeats frequently",
  "Stable rules govern most cases",
  "Handoffs, chasing or re-entry create delay",
  "Skipped checks create avoidable risk",
  "Clear events can measure the result",
  "The volume and value justify intervention",
];

const waitWhen = [
  "People describe the process differently",
  "The rule changes for almost every case",
  "Authority or capability is the real constraint",
  "The source data cannot yet be trusted",
  "The decision requires accountable human judgement",
  "The likely value cannot support the operating cost",
];

const rulesWork = [
  ["Route and approve", "Delegation rules, thresholds, reminders and escalation without copied email chains."],
  ["Capture and validate", "Create the record at the point of work and reject impossible or incomplete information."],
  ["Reconcile and report", "Compare sources, surface exceptions and produce the recurring pack automatically."],
  ["Integrate and notify", "Move verified information between systems and alert the person who can act."],
];

const intelligenceWork = [
  ["Extract and classify", "Read documents or messages and place relevant information into the right workflow for verification."],
  ["Triage and summarise", "Prioritise work and assemble the context a person needs before deciding."],
  ["Retrieve and draft", "Bring procedures to the point of work and prepare a response or record for accountable review."],
  ["Converse where conversation is the process", "Handle bounded enquiries, bookings, follow-ups and status interactions with explicit escalation."],
];

const workstreams = [
  { signal: "OPS", name: "Operations", line: "Job allocation, approvals, handovers, exception escalation, field capture and proof of completion." },
  { signal: "FIN", name: "Finance and administration", line: "Invoice capture, matching, reconciliations, approval thresholds, reminders and management packs." },
  { signal: "RISK", name: "SHEQ and compliance", line: "Incident intake, document expiry, corrective-action follow-up, evidence checks and regulator-ready records." },
  { signal: "KNOW", name: "Knowledge and service", line: "Enquiry triage, procedure retrieval, assisted drafting, booking flows and status conversations." },
];

export default function AutomationPage() {
  return (
    <>
      <ServiceJsonLd
        name="Workflow Automation Pilot"
        description="A process-led automation engagement that puts one measurable workflow into production against an agreed baseline and target."
        path="/automation"
        price="145000"
        duration={TIMEBOX.pilot}
      />

      <section className="au-hero">
        <div className="au-hero-grid" aria-hidden="true" />
        <div className="k-shell au-hero-inner">
          <div className="au-visual-head">
            <div><Rise><p className="k-mono k-mono--ember">WORKFLOW AND INTELLIGENT AUTOMATION</p></Rise><Rise step={1}><h1>Automation, in motion.</h1></Rise></div>
            <Rise step={2}><p>One workflow.<br />Every rule, decision and exception visible.</p></Rise>
          </div>
          <Rise step={3}><AutomationControlRoom /></Rise>
        </div>
      </section>

      <section className="au-story">
        <div className="k-shell">
          <div className="au-story-layout">
            <div><Rise><p className="k-mono">THE PROPOSITION</p></Rise><Rise step={1}><h2>Automate the repetition. Keep judgement where it belongs.</h2></Rise></div>
            <div className="au-story-side">
              <Rise step={1}><p>2KO improves the workflow first, then automates the routing, checking, capture and handling that should not depend on somebody remembering. Where information needs interpretation, intelligence assists the work without hiding accountability.</p></Rise>
              <Rise step={2} className="au-story-actions"><TrackedLink href="/contact?interest=automation" eventOffer="automation" className="k-btn k-btn--solid">Assess an automation opportunity</TrackedLink><TrackedLink href="#suitable-work" eventOffer="automation workflows" className="k-btn k-btn--ghost">See suitable workflows</TrackedLink></Rise>
            </div>
          </div>
          <Rise step={2} className="au-story-facts">
            <span><b>From {RATES.pilotFrom}</b><small>fixed-scope pilot</small></span>
            <span><b>{TIMEBOX.pilot}</b><small>to a measured answer</small></span>
            <span><b>Process</b><small>before platform</small></span>
            <span><b>Human</b><small>on consequential decisions</small></span>
          </Rise>
        </div>
      </section>

      <section id="service-workflows" className="sa-section">
        <div className="k-shell sa-section-inner">
          <div className="sa-intro">
            <div><Rise><p className="k-mono k-mono--ember">SERVICE AUTOMATION LIBRARY</p></Rise><Rise step={1}><h2>The same discipline. A very different operating world.</h2></Rise></div>
            <Rise step={2}><div><p>Automation is just as valuable when the work is a client case, claim, conversation or close process. Select a workflow to see the system path, the human decision boundary and the evidence left behind.</p><a href="#service-automation-studio" className="k-text-link">Explore the four patterns <span>↓</span></a></div></Rise>
          </div>
          <div id="service-automation-studio"><Rise step={3}><ServiceAutomationLibrary /></Rise></div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[94svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20"><Photo src="/imagery/automation/operations-v1.webp" sizes="100vw" scrim="bottom" position="center" /></Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/72 via-black/12 to-black/48" aria-hidden="true" />
        <div className="k-shell pb-20 pt-40">
          <Rise><p className="k-mono k-mono--ember">Automation as an operating capability</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">Build an automation function. Not a pile of scripts.</h2></Rise>
          <ol className="mt-14 grid overflow-hidden rounded-2xl border border-white/10 bg-black/72 backdrop-blur-xl md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Find", "Maintain a qualified backlog of measurable automation opportunities."],
              ["Fix", "Remove ambiguity and waste before translating the workflow into rules."],
              ["Prove", "Ship one bounded automation against a baseline, target and human boundary."],
              ["Operate", "Monitor exceptions, evidence and benefit—then select the next constraint."],
            ].map(([name, body], index) => (
              <li key={name} className="relative min-h-[210px] border-b border-r border-white/10 p-6 md:[&:nth-child(3)]:border-b-0 md:[&:nth-child(4)]:border-b-0 lg:border-b-0">
                <span className="absolute left-0 top-0 h-[2px] bg-gradient-to-r from-[var(--signal)] via-[var(--ember)] to-transparent" style={{ width: `${44 + index * 14}%` }} />
                <span className="k-mono k-mono--ember">0{index + 1}</span><h3 className="k-sub mt-12">{name}</h3><p className="k-sm mt-4">{body}</p>
              </li>
            ))}
          </ol>
          <Rise step={2}><p className="k-lead mt-8 max-w-[54ch]">The technology changes. The discipline does not: every automation needs an owner, an exception route, an evidence record and a measure of whether it is still worth operating.</p></Rise>
        </div>
      </section>

      <section id="suitable-work" className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 text-[clamp(90px,21vw,320px)] font-semibold leading-none tracking-[-.09em] text-white/[.018]" aria-hidden="true">DECIDE</div>
        <div className="k-shell relative">
          <Rise><p className="k-mono k-mono--ember">Should this be automated?</p></Rise>
          <Rise step={1}><h2 className="k-title mt-6 max-w-[21ch]">Repetition is a signal. Clarity and value are the gate.</h2></Rise>
          <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Rise>
              <article className="border-t border-[var(--signal)] pt-8"><p className="text-[clamp(68px,10vw,138px)] font-medium leading-none tracking-[-.07em] text-white/[.055]">YES</p><h3 className="k-title mt-5">A strong candidate</h3><ul className="mt-7 flex flex-col gap-3">{automateWhen.map((item) => <li key={item} className="flex gap-3 text-[13px] text-[var(--warm-70)]"><span className="text-[var(--signal)]">✓</span>{item}</li>)}</ul></article>
            </Rise>
            <Rise step={1}>
              <article className="border-t border-[var(--ember)] pt-8"><p className="text-[clamp(68px,10vw,138px)] font-medium leading-none tracking-[-.07em] text-white/[.055]">WAIT</p><h3 className="k-title mt-5">Improve or clarify first</h3><ul className="mt-7 flex flex-col gap-3">{waitWhen.map((item) => <li key={item} className="flex gap-3 text-[13px] text-[var(--warm-70)]"><span className="text-[var(--ember)]">—</span>{item}</li>)}</ul></article>
            </Rise>
          </div>
          <Rise className="mt-12"><p className="k-sm max-w-[68ch] rounded-xl border border-[var(--hair-2)] bg-black/25 p-5">If the process is unclear, a {RATES.review} Process Review names the constraint first. If the investment needs quantified evidence, the {RATES.audit} Opportunity Audit prices the problem before a pilot is commissioned.</p></Rise>
        </div>
      </section>

      <section className="k-band">
        <div className="k-shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
          <div>
            <Rise><p className="k-mono k-mono--ember">01 — Rules-based automation</p></Rise><Rise step={1}><h2 className="k-title mt-6 max-w-[19ch]">When the rule is stable, the system should carry it.</h2></Rise><Rise step={2}><p className="k-lead mt-6 max-w-[52ch]">Deterministic automation handles the predictable path quickly and consistently. Exceptions leave that path visibly and arrive with their history attached.</p></Rise>
            <div className="mt-10 border-t border-[var(--hair-2)]">{rulesWork.map(([name, body], index) => <Rise key={name}><article className="grid gap-4 border-b border-[var(--hair-2)] py-6 sm:grid-cols-[38px_minmax(0,.7fr)_minmax(0,1fr)] sm:items-baseline"><span className="k-mono k-mono--ember">0{index + 1}</span><h3 className="k-sub">{name}</h3><p className="k-sm">{body}</p></article></Rise>)}</div>
          </div>
          <Rise step={1}><Panel label="Approval queue" meta="Illustrative"><Readout value="4h 12m" unit="avg. to decision" delta="−38%" tone="good" /><div className="mt-5"><Sparkline points={[52, 47, 44, 46, 38, 34, 31, 27, 24, 22, 19, 17]} /></div><div className="k-hairline mt-5 pt-4"><QueueRows rows={[{ label: "Awaiting sign-off", value: "3" }, { label: "Escalated past threshold", value: "1", tone: "warn" }, { label: "Cleared today", value: "27", tone: "good" }, { label: "Breached SLA", value: "0", tone: "good" }]} /></div></Panel><p className="k-mono mt-4">Illustrative interface and values · not a client result</p></Rise>
        </div>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell grid gap-14 lg:grid-cols-[460px_minmax(0,1fr)] lg:items-center">
          <Rise className="lg:order-1"><Panel label="Assisted triage" meta="Illustrative"><ConfidenceBars items={[{ label: "Routed automatically", value: 94 }, { label: "Category confidence", value: 97 }, { label: "Sent to a person", value: 6 }, { label: "Overturned by a person", value: 2 }]} /><div className="k-hairline mt-5 pt-4"><p className="k-mono">Every consequential action still requires a named human decision.</p></div></Panel><p className="k-mono mt-4">Illustrative interface and values · not a client result</p></Rise>
          <div className="lg:order-2">
            <Rise><p className="k-mono k-mono--ember">02 — Intelligence-assisted work</p></Rise><Rise step={1}><h2 className="k-title mt-6 max-w-[20ch]">Interpretation can be assisted without hiding accountability.</h2></Rise><Rise step={2}><p className="k-lead mt-6 max-w-[52ch]">AI is useful when information varies but the next step is still bounded. Confidence, source material and escalation remain visible to the person accountable for the outcome.</p></Rise>
            <div className="mt-10 border-t border-[var(--hair-2)]">{intelligenceWork.map(([name, body], index) => <Rise key={name}><article className="grid gap-4 border-b border-[var(--hair-2)] py-6 sm:grid-cols-[38px_minmax(0,.7fr)_minmax(0,1fr)] sm:items-baseline"><span className="k-mono k-mono--ember">0{index + 1}</span><h3 className="k-sub">{name}</h3><p className="k-sm">{body}</p></article></Rise>)}</div>
          </div>
        </div>
      </section>

      <section className="k-band relative overflow-hidden">
        <div className="k-shell">
          <Rise><p className="k-mono k-mono--ember">Suitable workstreams</p></Rise><Rise step={1}><h2 className="k-title mt-6 max-w-[22ch]">Automation follows the work—not the department chart.</h2></Rise>
          <div className="mt-12 border-t border-[var(--hair-2)]">{workstreams.map((work, index) => <Rise key={work.name}><article className="group grid gap-5 border-b border-[var(--hair-2)] py-8 md:grid-cols-[54px_minmax(150px,.45fr)_minmax(0,.7fr)_minmax(0,1.2fr)] md:items-baseline"><span className="k-mono k-mono--ember">0{index + 1}</span><span className="text-[clamp(42px,6vw,82px)] font-semibold leading-none tracking-[-.06em] text-white/[.07] transition-colors group-hover:text-[var(--ember)]/20">{work.signal}</span><h3 className="k-sub">{work.name}</h3><p className="k-sm">{work.line}</p></article></Rise>)}</div>
        </div>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise><p className="k-mono k-mono--ember">Data, integration and control</p></Rise><Rise step={1}><h2 className="k-title mt-6 max-w-[22ch]">A dependable automation has more than a trigger and an action.</h2></Rise><Rise step={2}><p className="k-lead k-measure mt-5">It validates the source, applies the rule, exposes the exception, preserves human authority and writes the evidence back to the operational record.</p></Rise>
          <Rise className="mt-12"><div className="rounded-2xl border border-[var(--hair-2)] bg-black/25 p-5 sm:p-8"><PipelineFlow stages={[{ name: "Source", meta: "trusted event" }, { name: "Validate", meta: "quality gate" }, { name: "Orchestrate", meta: "rules + context" }, { name: "Decide", meta: "system or person" }, { name: "Record", meta: "outcome + evidence" }]} /><div className="k-hairline mt-7 flex flex-wrap gap-2.5 pt-5"><Pill tone="good">Named owner</Pill><Pill tone="good">Exception route</Pill><Pill>Retry logic</Pill><Pill>Audit trail</Pill><Pill tone="warn">Human escalation</Pill></div></div></Rise>
        </div>
      </section>

      <section className="relative isolate flex min-h-[90svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20"><Photo src="/imagery/automation/human-boundary-v1.webp" sizes="100vw" scrim="bottom" position="center" /></Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/82 via-black/28 to-black/58" aria-hidden="true" />
        <div className="k-shell grid gap-12 pb-20 pt-40 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-end">
          <div><Rise><p className="k-mono k-mono--ember">The human decision boundary</p></Rise><Rise step={1}><h2 className="k-state mt-8 max-w-[14ch]">Consequential decisions keep a named person.</h2></Rise><Rise step={2}><p className="k-lead mt-7 max-w-[50ch]">Automation may recommend, assemble, route and record. Safety, employment, medical, legal, credit and other consequential decisions retain the required human authority and audit trail.</p></Rise></div>
          <Rise step={2}><Panel label="Decision control" meta="Non-negotiable"><QueueRows rows={[{ label: "Recommendation", value: "Automated", tone: "good" }, { label: "Source evidence", value: "Attached", tone: "good" }, { label: "Authority", value: "Named person", tone: "warn" }, { label: "Decision", value: "Recorded", tone: "good" }, { label: "Override reason", value: "Required", tone: "good" }]} /></Panel></Rise>
        </div>
      </section>

      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 text-[clamp(90px,20vw,300px)] font-semibold leading-none tracking-[-.08em] text-white/[.018]" aria-hidden="true">PORTFOLIO</div>
        <div className="k-shell relative">
          <Rise><p className="k-mono k-mono--ember">A dedicated automation capability</p></Rise><Rise step={1}><h2 className="k-title mt-6 max-w-[22ch]">Start with one automation. Build the portfolio from evidence.</h2></Rise><Rise step={2}><p className="k-lead k-measure mt-5">A business-wide automation function needs opportunity governance, delivery capacity and operational ownership—not simply access to automation software.</p></Rise>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {[
              { number: "01", title: "Scan", price: RATES.audit, label: "Opportunity Audit", line: "Qualify and cost the first three opportunities. Select one intervention rather than chase every idea.", href: "/audit", cta: "Quantify the opportunity" },
              { number: "02", title: "Ship", price: `from ${RATES.pilotFrom}`, label: "Automation Pilot", line: "Put one bounded workflow into production against a baseline, target and agreed exception boundary.", href: "/contact?interest=automation", cta: "Prove one workflow", featured: true },
              { number: "03", title: "Operate", price: `from ${RATES.partnershipProgramme}/mo`, label: "Integrated improvement rhythm", line: "Use an annual partnership to govern automation alongside process consulting, capability and measured benefits.", href: "/managed-improvement", cta: "See ongoing improvement" },
            ].map((item, index) => (
              <Rise key={item.title} step={(index % 3) as 0 | 1 | 2}><article className={`relative flex h-full flex-col rounded-2xl border p-6 sm:p-8 ${item.featured ? "border-[var(--ember)] bg-[linear-gradient(155deg,rgba(232,142,74,.12),rgba(0,0,0,.3)_45%)]" : "border-[var(--hair-2)] bg-black/25"}`}>{item.featured && <span className="absolute right-0 top-0 rounded-bl-xl bg-[var(--ember)] px-4 py-2 font-[var(--mono)] text-[10px] uppercase tracking-[.16em] text-[var(--black)]">Start here</span>}<span className="k-mono k-mono--ember">{item.number} · {item.title}</span><h3 className="k-sub mt-8">{item.label}</h3><p className="k-num mt-5 text-[28px]">{item.price}</p><p className="k-mono mt-1">ex VAT</p><p className="k-sm mt-7">{item.line}</p><TrackedLink href={item.href} eventOffer={item.label.toLowerCase()} className={`k-btn mt-8 w-full justify-center ${item.featured ? "k-btn--solid" : "k-btn--ghost"}`}>{item.cta}</TrackedLink></article></Rise>
            ))}
          </div>
        </div>
      </section>

      <section id="pilot" className="relative isolate flex min-h-[88svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20"><Photo src="/imagery/automation/pilot-close-v1.webp" sizes="100vw" scrim="bottom" position="center" /></Rise>
        <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" />
        <div className="k-shell grid gap-10 pb-20 pt-40 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div><Rise><p className="k-mono k-mono--ember">One bounded workflow · {TIMEBOX.pilot}</p></Rise><Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Prove the automation before scaling the commitment.</h2></Rise><Rise step={2}><p className="k-lead mt-6 max-w-[50ch]">From {RATES.pilotFrom} ex VAT. The pilot rolls forward if the result justifies a larger system. If it does not, you stop with working software and a measured answer.</p></Rise></div>
          <Rise step={3} className="flex flex-col gap-3"><TrackedLink href="/contact?interest=automation" eventOffer="automation pilot close" className="k-btn k-btn--solid">Assess an automation opportunity</TrackedLink><Link href="/pricing#custom" className="k-btn k-btn--ghost">See the commercial structure</Link></Rise>
        </div>
      </section>
    </>
  );
}
