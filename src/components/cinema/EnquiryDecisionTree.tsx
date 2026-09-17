"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./EnquiryDecisionTree.module.css";

type Decision = {
  id: `D${number}`;
  owner: string;
  question: string;
  why: string;
  yes: string;
  yesNext: string;
  no: string;
  noNext: string;
  record: string;
};

type Stage = {
  number: string;
  title: string;
  purpose: string;
  decisions: Decision[];
};

const decision = (
  id: Decision["id"], owner: string, question: string, why: string,
  yes: string, yesNext: string, no: string, noNext: string, record: string,
): Decision => ({ id, owner, question, why, yes, yesNext, no, noNext, record });

const stages: Stage[] = [
  {
    number: "01", title: "Control the intake",
    purpose: "Nothing is routed until the enquiry is valid, recorded and recoverable.",
    decisions: [
      decision("D01", "Website", "Has the hidden spam field been completed?", "Real visitors never see this field; automated submissions commonly fill it.", "Return a neutral success response and create no lead.", "END · SILENT SPAM CLOSE", "Treat the submission as potentially genuine.", "D02 · REQUIRED INFORMATION", "No client record is created."),
      decision("D02", "Website", "Are the required fields and contact consent present?", "2KO needs a person, company, reply address, problem description and permission to respond.", "Accept the submission for email validation.", "D03 · EMAIL VALIDITY", "Reject it and identify the missing information on the form.", "RETURN TO FORM", "Validation outcome; do not create a partial lead."),
      decision("D03", "Website", "Is the email address structurally valid and reply-capable?", "A lead with no usable reply route cannot enter the response commitment.", "Continue to the information-safety check.", "D04 · SENSITIVE INFORMATION", "Request a valid work email address.", "RETURN TO FORM", "Do not promote the rejected address into the pipeline."),
      decision("D04", "First human reader", "Does the enquiry contain passwords, medical details, employee records or sensitive operational data?", "The public form is for a process description, not confidential records.", "Stop circulating it, remove unnecessary copies and move to an approved secure channel.", "D08 · URGENT RISK CHECK", "Allow the normal controlled record to continue.", "D05 · SIGMAFY ACCEPTANCE", "Record only that secure handling was required; do not repeat the sensitive content."),
      decision("D05", "Website + Sigmafy", "Did Sigmafy accept and save the enquiry?", "The website must not claim success when the system of record does not contain the enquiry.", "Generate the public confirmation and continue.", "D06 · EXISTING LEAD MATCH", "Show a retry message, log the failure and do not send a false confirmation.", "HOLD · INTAKE FAILURE", "Timestamp, source, contact details, message and attribution."),
      decision("D06", "Sigmafy", "Does the email address already belong to an existing lead?", "A repeat enquiry should extend the existing history rather than create a duplicate.", "Append the submission and preserve any stage already further advanced.", "D07 · CONTROL FIELDS", "Create a new lead in the New stage.", "D07 · CONTROL FIELDS", "Whether the lead was created or appended, and the new history entry."),
      decision("D07", "Routing engine", "Were a reference, provisional route, functional owner and follow-up deadline created?", "Every live enquiry must be findable and have a next action before selling begins.", "Place it in human triage with those provisional fields.", "D08 · URGENT RISK CHECK", "Hold it for manual completion and log an operating-system defect.", "HOLD · MANUAL CONTROL", "Reference, route, owner, confidence, action, due date and human-review flag."),
    ],
  },
  {
    number: "02", title: "Protect the business before selling",
    purpose: "Urgent incidents and existing-client obligations take precedence over opportunity qualification.",
    decisions: [
      decision("D08", "Enquiry lead", "Is this an urgent safety, security, privacy or production-continuity incident?", "An urgent incident must not wait in a sales queue.", "Escalate to the incident or service owner; keep commercial qualification separate.", "END · INCIDENT / SERVICE PATH", "Continue normal triage.", "D09 · EXISTING CLIENT", "Incident type, escalation owner, time and safe communication channel."),
      decision("D09", "Enquiry lead", "Is the enquirer an existing client with a live 2KO system or engagement?", "Existing obligations can change the owner, scope and response time.", "Check whether the request belongs inside the existing agreement.", "D10 · SUPPORT OR NEW OUTCOME", "Treat it as a new opportunity.", "D11 · OPERATING RESULT", "Client status, current engagement and current 2KO owner."),
      decision("D10", "Current client owner", "Is the request corrective support or maintenance already covered by an agreement?", "2KO should not resell work the client has already purchased.", "Move it into the existing System Care or engagement workflow.", "END · EXISTING SERVICE PATH", "Record it as a separate improvement or expansion opportunity.", "D11 · OPERATING RESULT", "Scope test, contract reference and inside/outside-scope reason."),
      decision("D11", "Enquiry lead", "Can the enquirer describe a specific operating result that needs to change?", "A requested technology or course is not yet a business problem; the result anchors the decision.", "Test whether somebody is accountable for the result.", "D12 · ACCOUNTABILITY", "Clarify the result before discussing services.", "D13 · CLARIFICATION VIABILITY", "The result, why it matters now and what current failure looks like."),
      decision("D12", "Enquiry lead", "Is there an identifiable person accountable for the result?", "Work without a client owner rarely survives decisions, trade-offs or adoption.", "Continue to route confirmation.", "D14 · SELECTED STARTING POINT", "Establish ownership before authorising a route.", "D13 · CLARIFICATION VIABILITY", "Named owner or the role required in the next conversation."),
      decision("D13", "Enquiry lead", "Can the missing result or owner be established in one short clarification?", "A weak brief may be recoverable, but it must not become indefinite unpaid discovery.", "Ask only for what is missing, then repeat D11 and D12.", "RETURN · D11", "Close, refer or defer and state the condition required to reopen.", "END · CLEAN CLOSE", "Question asked, response deadline and reopening condition."),
    ],
  },
  {
    number: "03", title: "Confirm the route",
    purpose: "The selected website option is a signal, never an unquestioned instruction.",
    decisions: [
      decision("D14", "Enquiry lead", "Did the enquirer select a likely starting point?", "A selection can shorten routing but still requires human confirmation.", "Test the selected service family one by one.", "D15 · PARTNERSHIP", "Diagnose from the process evidence.", "D23 · FRAGMENTED SYSTEMS", "Selection and whether it matches the written problem."),
      decision("D15", "Enquiry lead", "Is the selection an improvement programme, operational-excellence partnership or transformation office?", "A partnership is an operating model, not merely a larger project.", "Test whether the work has genuine portfolio characteristics.", "D24 · CONNECTED WORKSTREAMS", "Continue through the direct service families.", "D16 · SYSTEM OR PRODUCT", "Selected partnership option and why sustained capacity may be required."),
      decision("D16", "Systems lead", "Is the request for a named system, fixed product or replacement for fragmented records?", "Clear system requests can often be validated directly without paid discovery.", "Validate users, roles, boundary, records, controls and product fit.", "ROUTE · SYS, THEN D35", "Continue to automation.", "D17 · AUTOMATION", "System, users, current record, workflow boundary and integrations."),
      decision("D17", "Automation lead", "Is the request specifically for workflow or process automation?", "Automation is responsible only when triggers, rules and exceptions can be controlled.", "Test whether the process is stable enough to automate.", "D27 · STABLE RULES", "Continue to Process Review.", "D18 · PROCESS REVIEW", "Stated trigger, repeated work and claimed benefit."),
      decision("D18", "Process lead", "Did the enquirer select the Half-Day Process Review?", "The review is designed to answer one bounded decision around one live process.", "Confirm that one observable process can answer the decision.", "D25 · ONE LIVE PROCESS", "Continue to Audit.", "D19 · AUDIT", "Proposed process and decision the review must answer."),
      decision("D19", "Diagnostic lead", "Did the enquirer select a Process and Automation Audit?", "An audit is justified by a broader evidence requirement, not simply uncertainty.", "Test the required evidence depth.", "D28 · EVIDENCE DEPTH", "Continue to capability.", "D20 · TRAINING", "Decision to support and anticipated evidence boundary."),
      decision("D20", "Capability lead", "Is training, certification or organisation-wide capability the stated need?", "Training should solve a causal capability gap, not compensate for poor process design.", "Test whether capability is the primary constraint.", "D29 · CAPABILITY CONSTRAINT", "Continue to Sigmafy.", "D21 · SIGMAFY", "Audience, level, application and assessment expectation."),
      decision("D21", "Sigmafy lead", "Is the request for Sigmafy, statistical analysis or governed project evidence?", "A platform is useful only when users, analysis and governance outcomes are understood.", "Validate the statistical platform fit.", "D30 · PLATFORM FIT", "Continue to website and care.", "D22 · WEBSITE OR CARE", "Use case, users, data sources and required output."),
      decision("D22", "Digital or care lead", "Is the request a website project or System Care engagement?", "Both have direct validation routes and do not automatically need operational discovery.", "Validate the published boundary and dependencies directly.", "ROUTE · WEB OR CARE, THEN D35", "Ignore the provisional selection and diagnose the process.", "D23 · FRAGMENTED SYSTEMS", "Direct service, requested boundary and live-system obligation."),
      decision("D23", "Enquiry lead", "Is the process already system-supported but fragmented across tools, records or teams?", "Fragmentation normally requires evidence across the process before prescribing a replacement.", "Use Audit provisionally, subject to the evidence-depth test.", "D28 · EVIDENCE DEPTH", "Test whether one bounded process can answer the decision.", "D25 · ONE LIVE PROCESS", "Systems, duplicate records, handoffs, visibility gaps and control failures."),
    ],
  },
  {
    number: "04", title: "Choose the smallest responsible intervention",
    purpose: "Diagnosis determines the route; enthusiasm for a service does not.",
    decisions: [
      decision("D24", "Principal / partnerships", "Are there several connected workstreams rather than one isolated process?", "A partnership needs a portfolio that benefits from shared governance, capability and measurement.", "Continue through partnership qualification.", "D32 · EXECUTIVE SPONSOR", "Use a bounded diagnostic or project; do not manufacture a retainer.", "D25 · ONE LIVE PROCESS", "Workstreams, interactions and why one-off delivery is insufficient."),
      decision("D25", "Process lead", "Can observing one bounded live process answer the immediate business decision?", "If one process is enough, the Process Review is the smallest paid diagnostic step.", "Recommend the Process Review and define the process.", "ROUTE · REV, THEN D35", "Test direct fixed-scope fit.", "D26 · FIXED-SCOPE FIT", "Boundary, owner, location and decision the review must answer."),
      decision("D26", "Systems lead", "Does an existing 2KO product cover the users, workflow and controls without material invention?", "A known product should not be disguised as bespoke discovery.", "Validate fixed scope, exclusions, conditions and price.", "ROUTE · SYS, THEN D35", "Test whether the work is stable enough for automation or a custom system.", "D27 · STABLE RULES", "Closest product, fit, gaps, exclusions and bespoke elements."),
      decision("D27", "Automation lead", "Are the trigger, rules, authority, normal path and meaningful exceptions understood?", "Automating an unstable process makes inconsistency faster and harder to see.", "Validate volume, access, exception ownership and measurable value.", "ROUTE · AUT, THEN D35", "Diagnose the process before proposing automation.", "D28 · EVIDENCE DEPTH", "Trigger, rules, authority, exceptions, volume and manual effort."),
      decision("D28", "Diagnostic lead", "Does the decision require quantified evidence across processes, systems, sites or material investment?", "The Audit exists to support a larger decision, not to charge for directly available information.", "Recommend the appropriate Audit depth.", "ROUTE · AUD, THEN D35", "Test capability and adoption constraints.", "D29 · CAPABILITY CONSTRAINT", "Value, sites, processes, sources, exposure and required confidence."),
      decision("D29", "Capability lead", "Would the process perform correctly if the responsible people had the required knowledge and practised capability?", "Training is appropriate when capability is causal, not when the workflow makes correct work impossible.", "Define cohort, capability, application, assessment and reinforcement.", "ROUTE · CAP, THEN D35", "Test the statistical and governance mechanism.", "D30 · PLATFORM FIT", "Observed gap, affected roles, behaviour and evidence learning can change the result."),
      decision("D30", "Sigmafy lead", "Is the missing mechanism structured analysis, project governance, benefits evidence or integrated learning?", "Sigmafy should solve an explicit analytical or governance need.", "Define users, modules, data, roles, adoption and measurement.", "ROUTE · SIG, THEN D35", "Make the final intervention-necessity decision.", "D31 · INTERVENTION NECESSITY", "Governance gap, users, data readiness and expected evidence output."),
      decision("D31", "Enquiry lead", "Is any 2KO intervention currently justified by the evidence?", "The right answer may be an existing tool, clearer ownership, waiting or doing nothing.", "Define the smallest bounded project or pilot that can prove value.", "ROUTE · BOUNDED PROJECT, THEN D35", "Explain the no-build decision and the condition for reconsideration.", "END · NO BUILD / REFER / DEFER", "Decision, evidence, rationale, alternative and reopening condition."),
      decision("D32", "Principal / partnerships", "Is an active executive sponsor prepared to own decisions and remove barriers?", "A portfolio without executive authority becomes unsupported activity.", "Test whether evidence can support the operating cadence.", "D33 · BASELINE READINESS", "Use an Audit, Review or bounded project to establish readiness.", "ROUTE · READINESS STEP, THEN D35", "Sponsor, authority, involvement and decisions they agree to own."),
      decision("D33", "Principal / measurement lead", "Does a usable baseline exist, or can one be established during paid mobilisation?", "A partnership needs evidence that separates activity from result.", "Confirm the commitment horizon.", "D34 · COMMITMENT HORIZON", "Create the baseline before agreeing outcome governance.", "ROUTE · AUDIT / MOBILISATION, THEN D35", "Measures, sources, owners, limitations and baseline plan."),
      decision("D34", "Principal / partnerships", "Is the client prepared for an annual operating cadence rather than an undefined monthly task list?", "The partnership funds sustained capacity, governance, training, automation and measurement.", "Qualify the partnership tier and paid mobilisation.", "ROUTE · PAR, THEN D35", "Offer a bounded project or diagnostic instead.", "ROUTE · PROJECT, THEN D35", "Horizon, workstreams, capability population and governance cadence."),
    ],
  },
  {
    number: "05", title: "Authorise the commercial move",
    purpose: "A sensible delivery route still does not automatically deserve a proposal.",
    decisions: [
      decision("D35", "Commercial owner", "Is this work genuinely within 2KO’s competence, capacity and ethical boundary?", "Commercial pressure must not override delivery integrity or responsible handling of risk.", "Test the value case.", "D36 · VALUE CASE", "Decline or refer clearly.", "END · DECLINE / REFER", "Fit, constraint, referral and reason for declining."),
      decision("D36", "Commercial + client owner", "Is the operational value material, credible and connected to the intervention?", "A proposal must solve a decision-worthy problem, not rely on vague efficiency language.", "Confirm decision authority.", "D37 · AUTHORITY", "Reduce scope, gather evidence or stop.", "ROUTE · DIAGNOSE / DEFER / CLOSE", "Impact, target, value mechanism, assumptions and accepted calculation."),
      decision("D37", "Commercial owner", "Is the person who can approve scope, funding and internal participation part of the decision?", "An enthusiastic contact may not have authority to commit the organisation.", "Test commercial compatibility.", "D38 · COMMERCIAL BAND", "Arrange the authority conversation before a final proposal.", "HOLD · DECISION MAKER", "Decision maker, budget owner, procurement role and required contributors."),
      decision("D38", "Commercial owner", "Is the client comfortable with the published price or realistic commercial band?", "Proposal effort is wasteful when commercial expectations are fundamentally incompatible.", "Test delivery dependencies.", "D39 · DEPENDENCIES", "Re-scope, defer or close without concealing the gap.", "ROUTE · RESCOPE / DEFER / CLOSE", "Price or band, VAT, payment expectation and procurement limit."),
      decision("D39", "Delivery lead", "Are data access, security, client participation, integrations and critical dependencies acceptable?", "Commercial agreement cannot repair a delivery path that is unsafe or blocked.", "Decide whether a formal proposal is needed.", "D40 · PROPOSAL NECESSITY", "Name and resolve the blocking dependency first.", "HOLD · READINESS CONDITION", "Dependency, owner, due date, security condition and consequence."),
      decision("D40", "Commercial owner", "Does the purchase require a bespoke proposal rather than a published booking or order?", "Proposal effort should be reserved for decisions that genuinely need tailored scope and terms.", "Prepare a controlled proposal.", "D41 · PROPOSAL COMPLETENESS", "Use the published scope, quote, booking or order route.", "D42 · ACCEPTANCE", "Why a proposal is or is not required."),
      decision("D41", "Commercial + delivery lead", "Does the proposal state the result, evidence, scope, exclusions, roles, acceptance, timing and price?", "A vague proposal transfers uncertainty into delivery.", "Issue the controlled proposal.", "D42 · ACCEPTANCE", "Correct it before sending.", "RETURN · D41", "Version, approvers, validity period and completeness check."),
      decision("D42", "Commercial owner", "Has the client explicitly accepted the scope and commercial terms?", "Conversation and verbal intent are not authority to begin delivery.", "Check the payment or purchase condition.", "D43 · PAYMENT CONDITION", "Record the objection or decision date; revise, defer or close.", "HOLD · COMMERCIAL DECISION", "Acceptance evidence, version, objections, decision date and status."),
      decision("D43", "Finance / commercial owner", "Has the required deposit, purchase order or agreed payment condition been satisfied?", "Delivery should not begin on an assumed commitment.", "Authorise delivery handover.", "D44 · HANDOVER COMPLETENESS", "Keep the engagement on hold and name what releases it.", "HOLD · PAYMENT / PO", "Invoice or quote, condition, evidence and release date."),
    ],
  },
  {
    number: "06", title: "Protect the delivery handover",
    purpose: "The promise, evidence and next decision must survive the move from sales into delivery.",
    decisions: [
      decision("D44", "Commercial + delivery lead", "Does the handover contain the problem, evidence, decision, scope, owner, dependencies and intended result?", "Delivery should not rediscover what sales learned or reinterpret the promise.", "Test baseline and result ownership.", "D45 · BASELINE AND RESULT", "Return it for completion.", "RETURN · D44", "Signed scope, history, owners, risks, dependencies and assumptions."),
      decision("D45", "Measurement + client owner", "Are the baseline, intended result, measurement owner and first review date recorded?", "Without these, 2KO can deliver activity but cannot demonstrate improvement.", "Confirm delivery capacity.", "D46 · CAPACITY TO START", "Establish the missing measurement agreement before mobilisation.", "HOLD · MEASUREMENT READINESS", "Baseline, target, definition, source, owner and review date."),
      decision("D46", "Delivery lead", "Are the accountable 2KO lead, client participants and delivery capacity available for the agreed start?", "A commercially accepted engagement is not ready until the people required can begin responsibly.", "Mobilise and start the agreed cadence.", "END · CONTROLLED DELIVERY START", "Agree a realistic start date or waitlist position.", "HOLD · SCHEDULED MOBILISATION", "2KO lead, client team, start date, first session and next review."),
    ],
  },
];

const DECISION_WIDTH = 540;
const DECISION_HEIGHT = 260;
const BRANCH_WIDTH = 430;
const BRANCH_HEIGHT = 220;
const ROW_HEIGHT = 680;
const STAGE_HEADER_HEIGHT = 320;
const STAGE_GAP = 300;
const FLOW_OFFSET = 520;
const SPLIT_OFFSET = 840;
const WORLD_WIDTH = 8400;

type PositionedDecision = Decision & { x: number; y: number; centre: number; parentSource?: Decision["id"] };
type PositionedStage = Stage & { x: number; y: number; width: number; height: number; firstDecision: Decision["id"] };

function getTarget(next: string) {
  return next.match(/D\d+/)?.[0] as Decision["id"] | undefined;
}

function createLayout() {
  const positionedStages: PositionedStage[] = [];
  const positionedDecisions: PositionedDecision[] = [];
  let y = 520;

  stages.forEach((stage) => {
    const indexById = new Map(stage.decisions.map((item, index) => [item.id, index]));
    const parentByTarget = new Map<Decision["id"], { source: Decision["id"]; branch: "yes" | "no" }>();

    stage.decisions.forEach((item, sourceIndex) => {
      ([
        ["yes", item.yesNext],
        ["no", item.noNext],
      ] as const).forEach(([branch, next]) => {
        const target = getTarget(next);
        const targetIndex = target ? indexById.get(target) : undefined;
        if (target && targetIndex !== undefined && targetIndex > sourceIndex && !parentByTarget.has(target)) {
          parentByTarget.set(target, { source: item.id, branch });
        }
      });
    });

    const childrenBySource = new Map<Decision["id"], Array<{ id: Decision["id"]; branch: "yes" | "no" }>>();
    parentByTarget.forEach((parent, target) => {
      const children = childrenBySource.get(parent.source) ?? [];
      children.push({ id: target, branch: parent.branch });
      childrenBySource.set(parent.source, children);
    });

    const relative = new Map<Decision["id"], { x: number; depth: number }>();
    let rootIndex = 0;
    stage.decisions.forEach((item) => {
      const parent = parentByTarget.get(item.id);
      if (!parent) {
        relative.set(item.id, { x: rootIndex * 1800, depth: 0 });
        rootIndex += 1;
        return;
      }

      const parentPosition = relative.get(parent.source) ?? { x: 0, depth: 0 };
      const siblings = childrenBySource.get(parent.source) ?? [];
      const direction = parent.branch === "yes" ? -1 : 1;
      const offset = direction * (siblings.length > 1 ? SPLIT_OFFSET : FLOW_OFFSET);
      relative.set(item.id, { x: parentPosition.x + offset, depth: parentPosition.depth + 1 });
    });

    const positions = [...relative.values()];
    const minimumX = Math.min(...positions.map((position) => position.x));
    const maximumX = Math.max(...positions.map((position) => position.x));
    const maximumDepth = Math.max(...positions.map((position) => position.depth));
    const stageWidth = maximumX - minimumX + 1500;
    const stageLeft = (WORLD_WIDTH - stageWidth) / 2;
    const stageHeight = STAGE_HEADER_HEIGHT + (maximumDepth + 1) * ROW_HEIGHT + 100;
    positionedStages.push({
      ...stage,
      x: stageLeft,
      y,
      width: stageWidth,
      height: stageHeight,
      firstDecision: stage.decisions[0].id,
    });

    stage.decisions.forEach((item) => {
      const position = relative.get(item.id) ?? { x: 0, depth: 0 };
      const centre = stageLeft + 750 + position.x - minimumX;
      positionedDecisions.push({
        ...item,
        x: centre - DECISION_WIDTH / 2,
        y: y + STAGE_HEADER_HEIGHT + position.depth * ROW_HEIGHT,
        centre,
        parentSource: parentByTarget.get(item.id)?.source,
      });
    });

    y += stageHeight + STAGE_GAP;
  });

  return {
    stages: positionedStages,
    decisions: positionedDecisions,
    byId: new Map(positionedDecisions.map((item) => [item.id, item])),
    height: y + 520,
  };
}

const layout = createLayout();

export default function EnquiryDecisionTree() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 0.82 });
  const viewRef = useRef(view);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<Decision["id"]>("D01");

  function focusDecision(id: Decision["id"], scale = Math.max(view.scale, 0.78)) {
    const node = layout.byId.get(id);
    const viewport = viewportRef.current;
    if (!node || !viewport) return;
    const rect = viewport.getBoundingClientRect();
    const nextScale = Math.min(Math.max(scale, 0.42), 1.35);
    setSelected(id);
    setView({
      x: rect.width / 2 - (node.x + DECISION_WIDTH / 2) * nextScale,
      y: 150 - node.y * nextScale,
      scale: nextScale,
    });
  }

  function focusStage(stage: PositionedStage) {
    focusDecision(stage.firstDecision, 0.68);
  }

  function fitOverview() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const scale = Math.max(Math.min((rect.width - 80) / WORLD_WIDTH, (rect.height - 100) / layout.height, 0.45), 0.08);
    setView({ x: (rect.width - WORLD_WIDTH * scale) / 2, y: 70, scale });
    setSelected("D01");
  }

  function zoomAt(clientX: number, clientY: number, nextScale: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const scale = Math.min(Math.max(nextScale, 0.04), 1.6);
    const pointX = (clientX - rect.left - view.x) / view.scale;
    const pointY = (clientY - rect.top - view.y) / view.scale;
    setView({ x: clientX - rect.left - pointX * scale, y: clientY - rect.top - pointY * scale, scale });
  }

  function zoomFromCentre(multiplier: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, view.scale * multiplier);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: view.x, y: view.y };
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setView((current) => ({ ...current, x: drag.x + event.clientX - drag.clientX, y: drag.y + event.clientY - drag.clientY }));
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => focusDecision("D01", 0.82));
    return () => window.cancelAnimationFrame(frame);
    // The initial camera position is deliberately applied only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const current = viewRef.current;

      if (event.ctrlKey || event.metaKey) {
        const rect = viewport.getBoundingClientRect();
        const scale = Math.min(Math.max(current.scale * Math.exp(-event.deltaY * 0.008), 0.04), 1.6);
        const pointX = (event.clientX - rect.left - current.x) / current.scale;
        const pointY = (event.clientY - rect.top - current.y) / current.scale;
        const next = {
          x: event.clientX - rect.left - pointX * scale,
          y: event.clientY - rect.top - pointY * scale,
          scale,
        };
        viewRef.current = next;
        setView(next);
        return;
      }

      const next = { ...current, x: current.x - event.deltaX, y: current.y - event.deltaY };
      viewRef.current = next;
      setView(next);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, []);

  const worldStyle = {
    width: WORLD_WIDTH,
    height: layout.height,
    left: view.x,
    top: view.y,
    transform: `scale(${view.scale})`,
  } satisfies CSSProperties;

  return (
    <section className={styles.workspace} aria-label="2KO internal enquiry decision canvas">
      <header className={styles.toolbar}>
        <div className={styles.toolbarTitle}><strong>2KO</strong><span>INTERNAL · ENQUIRY DECISION CANVAS</span></div>
        <div className={styles.stageNav} aria-label="Jump to stage">
          {layout.stages.map((stage) => <button key={stage.number} type="button" onClick={() => focusStage(stage)}>{stage.number}</button>)}
        </div>
        <div className={styles.controls}>
          <Link className={styles.libraryLink} href="/internal/processes">LIBRARY</Link>
          <button type="button" onClick={() => zoomFromCentre(0.82)} aria-label="Zoom out">−</button>
          <output>{Math.round(view.scale * 100)}%</output>
          <button type="button" onClick={() => zoomFromCentre(1.22)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => focusDecision("D01", 0.82)}>START</button>
          <button type="button" onClick={fitOverview}>OVERVIEW</button>
        </div>
      </header>

      <div
        ref={viewportRef}
        className={styles.viewport}
        data-dragging={dragging}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className={styles.instructions}>DRAG TO MOVE · SCROLL TO PAN · PINCH OR CTRL + SCROLL TO ZOOM</div>
        <div className={styles.world} style={worldStyle}>
          <div className={styles.canvasTitle}>
            <span>2KO INTERNAL OPERATING MAP</span>
            <h1>Enquiry to delivery</h1>
            <p>Follow each labelled branch to its recorded action and destination.</p>
          </div>

          {layout.stages.map((stage) => (
            <section key={stage.number} className={styles.stageMarker} style={{ left: stage.x, top: stage.y, width: stage.width, height: stage.height }}>
              <span>STAGE {stage.number}</span><h2>{stage.title}</h2><p>{stage.purpose}</p>
            </section>
          ))}

          <svg className={styles.lines} width={WORLD_WIDTH} height={layout.height} aria-hidden="true">
            <defs>
              <marker id="canvas-arrow-yes" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path className={styles.yesArrowhead} d="M0,0 L9,4.5 L0,9" /></marker>
              <marker id="canvas-arrow-no" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path className={styles.noArrowhead} d="M0,0 L9,4.5 L0,9" /></marker>
            </defs>
            {layout.decisions.flatMap((item) => {
              const branchY = item.y + 350;
              const yesX = item.centre - 360;
              const noX = item.centre + 360;
              return [
                <path key={`${item.id}-yes`} className={styles.forkLine} data-answer="yes" d={`M${item.centre} ${item.y + DECISION_HEIGHT} C${item.centre} ${item.y + 305},${yesX} ${item.y + 292},${yesX} ${branchY}`} markerEnd="url(#canvas-arrow-yes)" />,
                <path key={`${item.id}-no`} className={styles.forkLine} data-answer="no" d={`M${item.centre} ${item.y + DECISION_HEIGHT} C${item.centre} ${item.y + 305},${noX} ${item.y + 292},${noX} ${branchY}`} markerEnd="url(#canvas-arrow-no)" />,
                ...([item.yesNext, item.noNext] as const).map((next, branchIndex) => {
                  const targetId = getTarget(next);
                  const target = targetId ? layout.byId.get(targetId) : undefined;
                  if (!target || target.parentSource !== item.id) return null;
                  const sourceX = branchIndex === 0 ? yesX : noX;
                  const sourceY = branchY + BRANCH_HEIGHT;
                  const related = selected === item.id || selected === targetId;
                  const path = `M${sourceX} ${sourceY} C${sourceX} ${sourceY + 75},${target.centre} ${target.y - 75},${target.centre} ${target.y}`;
                  const answer = branchIndex === 0 ? "yes" : "no";
                  return <path key={`${item.id}-route-${branchIndex}`} className={styles.routeLine} data-answer={answer} data-active={related} d={path} markerEnd={`url(#canvas-arrow-${answer})`} />;
                }),
              ];
            })}
          </svg>

          {layout.decisions.map((item) => (
            <DecisionGroup key={item.id} item={item} selected={selected === item.id} onSelect={setSelected} onNavigate={focusDecision} />
          ))}

          <aside className={styles.finalRule} style={{ left: (WORLD_WIDTH - 1340) / 2, top: layout.height - 420 }}>
            <span>FINAL CONTROL</span><h2>Human judgement may override a default.</h2><p>Record the evidence, reason, owner and new next action.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function DecisionGroup({ item, selected, onSelect, onNavigate }: {
  item: PositionedDecision;
  selected: boolean;
  onSelect: (id: Decision["id"]) => void;
  onNavigate: (id: Decision["id"], scale?: number) => void;
}) {
  const branchY = item.y + 350;

  return (
    <>
      <article
        className={styles.decision}
        data-selected={selected}
        style={{ left: item.x, top: item.y, width: DECISION_WIDTH, height: DECISION_HEIGHT }}
        onClick={() => onSelect(item.id)}
      >
        <div className={styles.cardMeta}><span>{item.id}</span><span>OWNER · {item.owner}</span></div>
        <h3>{item.question}</h3><p>{item.why}</p>
        <footer><span>RECORD</span>{item.record}</footer>
      </article>
      <span className={styles.answerBadge} data-answer="yes" aria-hidden="true" style={{ left: item.centre - 250, top: item.y + 286 }}>YES</span>
      <span className={styles.answerBadge} data-answer="no" aria-hidden="true" style={{ left: item.centre + 170, top: item.y + 286 }}>NO</span>
      <BranchNode label="YES" action={item.yes} next={item.yesNext} x={item.centre - 360 - BRANCH_WIDTH / 2} y={branchY} onNavigate={onNavigate} />
      <BranchNode label="NO" action={item.no} next={item.noNext} x={item.centre + 360 - BRANCH_WIDTH / 2} y={branchY} onNavigate={onNavigate} />
    </>
  );
}

function BranchNode({ label, action, next, x, y, onNavigate }: {
  label: "YES" | "NO";
  action: string;
  next: string;
  x: number;
  y: number;
  onNavigate: (id: Decision["id"], scale?: number) => void;
}) {
  const target = getTarget(next);
  return (
    <article className={styles.branch} data-answer={label.toLowerCase()} style={{ left: x, top: y, width: BRANCH_WIDTH, height: BRANCH_HEIGHT }}>
      <span>{label} ACTION</span><p>{action}</p>
      {target ? <button type="button" onClick={() => onNavigate(target)}>THEN → {next}</button> : <strong>THEN → {next}</strong>}
    </article>
  );
}
