"use client";

import { useMemo, useState } from "react";

type CaseId = "1047" | "1046" | "1045" | "1044";

type ServiceCase = {
  id: CaseId;
  name: string;
  product: string;
  channel: string;
  owner: string;
  opened: string;
  age: string;
  state: "Review" | "Exception" | "Ready" | "Activated";
  tone: "review" | "exception" | "ready" | "done";
  completeness: number;
  currentStep: number;
  issue: string;
  nextAction: string;
  evidence: Array<{ label: string; state: "verified" | "review" | "missing" }>;
};

const cases: ServiceCase[] = [
  {
    id: "1047",
    name: "Client 1047",
    product: "Business account",
    channel: "Relationship manager",
    owner: "N. Maseko",
    opened: "Today · 08:12",
    age: "1h 48m",
    state: "Review",
    tone: "review",
    completeness: 86,
    currentStep: 3,
    issue: "Beneficial ownership declaration needs a human decision.",
    nextAction: "Review declaration",
    evidence: [
      { label: "Company registration", state: "verified" },
      { label: "Director identity", state: "verified" },
      { label: "Address evidence", state: "verified" },
      { label: "Ownership declaration", state: "review" },
    ],
  },
  {
    id: "1046",
    name: "Client 1046",
    product: "Merchant services",
    channel: "Digital application",
    owner: "System route",
    opened: "Today · 07:46",
    age: "2h 14m",
    state: "Ready",
    tone: "ready",
    completeness: 100,
    currentStep: 4,
    issue: "All evidence is verified and the case is ready for activation.",
    nextAction: "Approve activation",
    evidence: [
      { label: "Company registration", state: "verified" },
      { label: "Director identity", state: "verified" },
      { label: "Bank confirmation", state: "verified" },
      { label: "Risk screening", state: "verified" },
    ],
  },
  {
    id: "1045",
    name: "Client 1045",
    product: "Commercial cover",
    channel: "Broker portal",
    owner: "T. Williams",
    opened: "Yesterday · 15:21",
    age: "18h 39m",
    state: "Exception",
    tone: "exception",
    completeness: 62,
    currentStep: 2,
    issue: "Two policy schedules conflict with the declared insured value.",
    nextAction: "Resolve discrepancy",
    evidence: [
      { label: "Proposal form", state: "verified" },
      { label: "Asset schedule", state: "review" },
      { label: "Prior cover", state: "verified" },
      { label: "Risk inspection", state: "missing" },
    ],
  },
  {
    id: "1044",
    name: "Client 1044",
    product: "Advisory engagement",
    channel: "Client portal",
    owner: "L. Jacobs",
    opened: "Yesterday · 11:05",
    age: "23h 55m",
    state: "Activated",
    tone: "done",
    completeness: 100,
    currentStep: 5,
    issue: "Engagement opened with a complete, timestamped evidence record.",
    nextAction: "View service record",
    evidence: [
      { label: "Engagement letter", state: "verified" },
      { label: "Client identity", state: "verified" },
      { label: "Conflict check", state: "verified" },
      { label: "Billing authority", state: "verified" },
    ],
  },
];

const steps = ["Capture", "Verify", "Review", "Decide", "Activate"];

export default function ServiceOperationsConsole() {
  const [selectedId, setSelectedId] = useState<CaseId>("1047");
  const [resolved, setResolved] = useState<CaseId[]>([]);
  const selected = cases.find((item) => item.id === selectedId) ?? cases[0];
  const isResolved = resolved.includes(selected.id);

  const visibleState = isResolved ? "Ready" : selected.state;
  const visibleTone = isResolved ? "ready" : selected.tone;
  const visibleCompleteness = isResolved ? 100 : selected.completeness;
  const visibleStep = isResolved ? 4 : selected.currentStep;

  const queueCounts = useMemo(
    () => ({
      active: cases.filter((item) => item.tone !== "done").length - resolved.length,
      exceptions: cases.filter((item) => item.tone === "exception" && !resolved.includes(item.id)).length,
    }),
    [resolved],
  );

  return (
    <figure className="so-console" aria-label="Interactive illustrative client onboarding control workspace">
      <header className="so-topbar">
        <span className="so-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>CLIENT OPERATIONS · ONBOARDING CONTROL</span>
        <span className="so-live"><i /> SERVICE LIVE</span>
      </header>

      <div className="so-body">
        <aside className="so-nav">
          <div className="so-brand"><b>2</b><span>Case control<small>One service record</small></span></div>
          <p>OPERATING VIEWS</p>
          <nav aria-label="Illustrative service operations views">
            <button type="button" data-active="true"><i>⌁</i><span>Onboarding</span><b>{queueCounts.active}</b></button>
            <button type="button"><i>◇</i><span>Claims</span><b>12</b></button>
            <button type="button"><i>↗</i><span>Customer cases</span><b>08</b></button>
            <button type="button"><i>≋</i><span>Finance close</span><b>05</b></button>
          </nav>
          <div className="so-nav-proof"><span>EVIDENCE COVERAGE</span><strong>96.4%</strong><i><b /></i><small>Across open service records</small></div>
          <div className="so-user"><b>NM</b><span>N. Maseko<small>Case owner</small></span></div>
        </aside>

        <main className="so-workspace">
          <div className="so-heading">
            <div><small>LIVE SERVICE FLOW</small><h3>Business onboarding</h3></div>
            <div><span>Today · 10:00</span><button type="button">Export record</button></div>
          </div>

          <div className="so-metrics">
            <article><small>Received today</small><strong>64</strong><span>+8 from average</span></article>
            <article><small>Straight-through</small><strong>87%</strong><span data-tone="good">Inside target</span></article>
            <article><small>Median decision</small><strong>2h 18m</strong><span>Target · 4h</span></article>
            <article><small>SLA at risk</small><strong>{queueCounts.exceptions + 2}</strong><span data-tone="warn">Needs attention</span></article>
          </div>

          <section className="so-flow" aria-label={`Current progress for ${selected.name}`}>
            <div className="so-flow-summary"><span>CASE {selected.id}</span><b>{selected.product}</b><small>{selected.channel}</small></div>
            <ol>
              {steps.map((step, index) => {
                const number = index + 1;
                const state = visibleTone === "done" || number < visibleStep ? "done" : number === visibleStep ? "active" : "next";
                return <li key={step} data-state={state}><i>{state === "done" ? "✓" : `0${number}`}</i><span>{step}<small>{state === "done" ? "recorded" : state === "active" ? "in progress" : "controlled"}</small></span></li>;
              })}
            </ol>
          </section>

          <section className="so-queue">
            <header><span>Case</span><span>Service</span><span>Owner</span><span>Evidence</span><span>State</span></header>
            {cases.map((item) => {
              const itemResolved = resolved.includes(item.id);
              return (
                <button key={item.id} type="button" data-active={selected.id === item.id} onClick={() => setSelectedId(item.id)}>
                  <span><i data-tone={itemResolved ? "ready" : item.tone} />{item.id}</span>
                  <span><b>{item.product}</b><small>{item.channel}</small></span>
                  <span>{item.owner}</span>
                  <span><i><b style={{ width: `${itemResolved ? 100 : item.completeness}%` }} /></i><em>{itemResolved ? 100 : item.completeness}%</em></span>
                  <span data-tone={itemResolved ? "ready" : item.tone}>{itemResolved ? "Ready" : item.state}</span>
                </button>
              );
            })}
          </section>
        </main>

        <aside className="so-detail">
          <header><span>SELECTED CASE</span><b data-tone={visibleTone}><i />{visibleState}</b></header>
          <div className="so-case-title"><small>CASE {selected.id}</small><h4>{selected.name}</h4><p>{selected.product} · {selected.channel}</p></div>
          <div className="so-completeness">
            <div><span>Record completeness</span><b>{visibleCompleteness}%</b></div>
            <i><b style={{ width: `${visibleCompleteness}%` }} /></i>
          </div>
          <div className="so-evidence">
            <span>CONTROLLED EVIDENCE</span>
            <ol>
              {selected.evidence.map((item) => {
                const state = isResolved ? "verified" : item.state;
                return <li key={item.label} data-state={state}><i>{state === "verified" ? "✓" : state === "review" ? "!" : "·"}</i><span>{item.label}</span><small>{state}</small></li>;
              })}
            </ol>
          </div>
          <div className="so-control-note" data-tone={visibleTone}><span>NEXT CONTROL</span><p>{isResolved ? "The exception is resolved. The complete record is ready for decision." : selected.issue}</p></div>
          <dl className="so-case-meta"><div><dt>Owner</dt><dd>{selected.owner}</dd></div><div><dt>Opened</dt><dd>{selected.opened}</dd></div><div><dt>Elapsed</dt><dd>{selected.age}</dd></div></dl>
          <button className="so-primary" type="button" disabled={selected.tone === "done" || isResolved} onClick={() => setResolved((current) => current.includes(selected.id) ? current : [...current, selected.id])}>{selected.tone === "done" ? "Service record complete" : isResolved ? "Control complete" : selected.nextAction}<span>{selected.tone === "done" || isResolved ? "✓" : "→"}</span></button>
        </aside>
      </div>

      <figcaption><span>CAPTURE → VERIFY → DECIDE → ACTIVATE → MEASURE</span><span>INTERACTIVE ILLUSTRATION · SYNTHETIC RECORDS · NOT A CLIENT RESULT</span></figcaption>
    </figure>
  );
}
