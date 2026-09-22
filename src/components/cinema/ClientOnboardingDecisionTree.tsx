import DecisionTreeCanvas, { type CanvasDecision, type CanvasStage } from "./DecisionTreeCanvas";

const decision = (
  id: CanvasDecision["id"], owner: string, question: string, why: string,
  yes: string, yesNext: string, no: string, noNext: string, record: string,
): CanvasDecision => ({ id, owner, question, why, yes, yesNext, no, noNext, record });

const stages: CanvasStage[] = [
  {
    number: "01",
    title: "Release the promise into delivery",
    purpose: "No mobilisation begins until the commercial promise is real, complete and safe to hand over.",
    decisions: [
      decision("D01", "Commercial owner", "Is there explicit evidence that the client accepted the current scope and terms?", "A positive conversation is not permission to mobilise.", "Use the accepted version as the commercial control record.", "D02 · RELEASE CONDITION", "Return to the commercial owner for written acceptance.", "HOLD · CLIENT ACCEPTANCE", "Accepted version, approver, date and evidence location."),
      decision("D02", "Finance / commercial owner", "Has the required deposit, purchase order or agreed release condition been satisfied?", "Delivery capacity should not be committed against an assumed purchase.", "Release the engagement for delivery checks.", "D03 · HANDOVER COMPLETENESS", "State exactly what is outstanding and who must resolve it.", "HOLD · PAYMENT OR PO", "Financial condition, reference, evidence and release date."),
      decision("D03", "Commercial + delivery lead", "Does the handover contain the problem, intended result, scope, exclusions, assumptions and dependencies?", "Delivery should not rediscover the sale or reinterpret the promise.", "Accept the handover for operational setup.", "D04 · ENGAGEMENT RECORD", "Return the handover with a named completion list.", "HOLD · INCOMPLETE HANDOVER", "Handover version, missing items, owner and due date."),
      decision("D04", "Operations coordinator", "Has one controlled engagement record been created?", "The team needs one place for status, decisions, evidence and next actions.", "Assign the engagement reference and continue.", "D05 · DELIVERY OWNERSHIP", "Create the record before work is discussed or scheduled.", "HOLD · NO CONTROL RECORD", "Reference, client, service route, value, status and source agreement."),
      decision("D05", "Delivery lead", "Is a suitably competent 2KO delivery lead available for the promised start window?", "Ownership without capacity creates an immediate broken promise.", "Assign the lead and protect the required capacity.", "D06 · CLIENT OWNERSHIP", "Offer a truthful revised start or controlled waitlist position.", "HOLD · CAPACITY", "Named lead, competence check, allocation and capacity constraint."),
      decision("D06", "Commercial owner", "Has the client named an accountable sponsor or process owner?", "Mobilisation cannot resolve decisions if nobody owns the client-side result.", "Confirm that person’s role and decision authority.", "D07 · FIRST COMMITMENT", "Request an accountable owner before scheduling mobilisation.", "HOLD · CLIENT OWNER", "Sponsor, process owner, authority and contact route."),
      decision("D07", "Delivery + client owner", "Are the start date and first working session mutually agreed?", "A start date is a two-sided commitment, not a date inserted into a plan.", "Issue the controlled mobilisation notice.", "D08 · KICKOFF PACK", "Agree a realistic date before declaring the work active.", "HOLD · START DATE", "Start date, first session, participants, location and confirmation."),
    ],
  },
  {
    number: "02",
    title: "Establish shared control",
    purpose: "Translate the sold engagement into the measures, decisions and boundaries that govern the work.",
    decisions: [
      decision("D08", "Delivery lead", "Can every required participant access the current kickoff pack?", "A meeting is not ready when its evidence is scattered or inaccessible.", "Use the pack as the common starting record.", "D09 · RESULT DEFINITION", "Resolve access and version control before kickoff.", "HOLD · PACK ACCESS", "Pack version, recipients, access check and missing material."),
      decision("D09", "Measurement + client owner", "Is the intended operating result stated in measurable language?", "The team must know what should change, for whom and by when.", "Test whether the starting position is known.", "D10 · BASELINE", "Frame the result with the accountable client owner.", "D11 · BASELINE PLAN", "Result statement, measure, target, population and timing."),
      decision("D10", "Measurement lead", "Is there a usable baseline with a trusted definition and source?", "Activity cannot later be confused with improvement if the starting point is explicit.", "Adopt the baseline provisionally and define validation.", "D12 · DECISION RIGHTS", "Decide whether mobilisation can establish the baseline.", "D11 · BASELINE PLAN", "Value, period, definition, source, owner and limitations."),
      decision("D11", "Measurement + delivery lead", "Can the baseline be established responsibly during paid mobilisation?", "Some engagements begin with imperfect evidence, but the gap needs a funded plan.", "Define the baseline task, owner and deadline.", "D12 · DECISION RIGHTS", "Do not promise measurable improvement without an evidence route.", "HOLD · MEASUREMENT READINESS", "Baseline method, access need, owner, due date and confidence limit."),
      decision("D12", "Client sponsor", "Are decision rights and escalation authorities explicit?", "The team must know who can approve trade-offs, unblock access and accept change.", "Record the decision ladder and response expectations.", "D13 · CHANGE CONTROL", "Bring the missing authority into mobilisation.", "HOLD · DECISION AUTHORITY", "Decision types, named authorities, limits and escalation times."),
      decision("D13", "Commercial + delivery lead", "Are change control and acceptance rules understood by both sides?", "New requests should not silently become unpriced scope or disputed completion.", "Publish the route for requests, decisions and acceptance.", "D14 · DEPENDENCY CONTROL", "Resolve the commercial control before delivery begins.", "HOLD · CHANGE CONTROL", "Change route, acceptance evidence, approvers and commercial trigger."),
      decision("D14", "Delivery lead", "Do all known risks and dependencies have an owner and next decision date?", "A risk list without ownership only documents future surprise.", "Release the people-and-access readiness checks.", "D15 · PROCESS OWNERSHIP", "Assign or escalate every critical dependency.", "HOLD · UNOWNED DEPENDENCY", "Risk, impact, owner, action, due date and escalation level."),
    ],
  },
  {
    number: "03",
    title: "Ready the people and access",
    purpose: "Make sure the people who perform, decide, test and adopt the work can actually participate.",
    decisions: [
      decision("D15", "Client owner", "Is the person who owns the live process available during mobilisation?", "A proxy can coordinate, but cannot replace operational ownership.", "Confirm the owner’s working-session and decision commitments.", "D16 · AFFECTED ROLES", "Secure the owner or formally appoint an authorised delegate.", "HOLD · PROCESS OWNER", "Owner, delegate, availability and decisions reserved for the owner."),
      decision("D16", "Process lead", "Have the affected roles and user groups been identified?", "A solution designed around titles rather than real work will miss adoption and exception paths.", "Map each role to its work, evidence and change impact.", "D17 · PARTICIPATION CAPACITY", "Complete a rapid role and stakeholder map.", "D18 · RECOVERY PLAN", "Roles, locations, volumes, shifts, channels and impact."),
      decision("D17", "Client sponsor", "Do the required client participants have protected time for discovery, testing and adoption?", "Participation cannot be treated as spare-time goodwill.", "Confirm the working capacity in the mobilisation plan.", "D19 · DATA AND SYSTEM ACCESS", "Test whether the missing capacity can be secured.", "D18 · RECOVERY PLAN", "Participant, responsibility, required time and confirmed availability."),
      decision("D18", "Client sponsor", "Can the missing role, delegate or participation time be secured before the affected work starts?", "A recoverable readiness gap should have one clear deadline, not drift.", "Assign the recovery action and continue conditionally.", "D19 · DATA AND SYSTEM ACCESS", "Move the start or reduce the scope honestly.", "HOLD · PARTICIPATION READINESS", "Gap, recovery owner, deadline, condition and schedule effect."),
      decision("D19", "Information + system owner", "Are the required data, systems and records approved and accessible?", "The team should never discover access restrictions after committing the first deliverable.", "Validate access with the people who will use it.", "D20 · INFORMATION CONDITIONS", "Complete the access and approval route.", "HOLD · ACCESS", "Source, permission, environment, approver, test and restriction."),
      decision("D20", "Information owner", "Are privacy, security and confidentiality conditions understood and workable?", "Operational urgency does not override responsible information handling.", "Apply the agreed controls to the working environment.", "D21 · TECHNICAL READINESS", "Stop and redesign the handling route with the information owner.", "HOLD · INFORMATION RISK", "Classification, allowed use, storage, access, retention and deletion."),
      decision("D21", "Solution + delivery lead", "Are environments, integrations, equipment and third-party dependencies ready—or is there an approved workaround?", "A workaround is acceptable only when its risk, owner and removal plan are visible.", "Release the engagement into kickoff.", "D22 · KICKOFF ATTENDANCE", "Resolve the blocker or replan the first slice.", "HOLD · TECHNICAL READINESS", "Dependency, readiness test, workaround, owner and removal date."),
    ],
  },
  {
    number: "04",
    title: "Launch the working cadence",
    purpose: "Use kickoff to make real decisions and authorise the first bounded piece of work.",
    decisions: [
      decision("D22", "Delivery lead", "Are the people required for today’s decisions present or represented with authority?", "Attendance matters because kickoff must resolve decisions, not merely broadcast information.", "Open the controlled kickoff agenda.", "D23 · SHARED UNDERSTANDING", "Reschedule the decision or formally narrow the session.", "HOLD · KICKOFF AUTHORITY", "Attendees, authority, absences, deferred decisions and owner."),
      decision("D23", "Delivery + client owner", "Do both teams confirm the result, scope, roles, controls and known constraints?", "Misalignment found now is cheaper than faithful delivery of the wrong promise.", "Convert agreement into the first work decision.", "D25 · PRIORITY", "Isolate the contradiction and test whether it can be resolved.", "D24 · CONTRADICTION", "Confirmed items, objections, assumptions and decision evidence."),
      decision("D24", "Commercial + delivery lead", "Can the contradiction be resolved within the accepted authority, price and scope?", "Mobilisation may clarify language, but it must not silently rewrite the agreement.", "Record the interpretation and approval.", "D25 · PRIORITY", "Return the issue to formal commercial change control.", "HOLD · COMMERCIAL RESOLUTION", "Contradiction, impact, interpretation, approver and agreement version."),
      decision("D25", "Client owner", "Is the highest-value first work item agreed?", "The first item should improve learning or control, not simply be the easiest task.", "Place it first in the controlled backlog.", "D26 · FIRST SLICE", "Make the value and dependency trade-off explicitly.", "HOLD · PRIORITY DECISION", "Priority, value hypothesis, dependency and decision maker."),
      decision("D26", "Delivery lead", "Is the first slice bounded, testable and small enough to complete inside the mobilisation window?", "A first slice should create evidence quickly without pretending the whole engagement is simple.", "Define the start, finish and test boundary.", "D27 · OWNERSHIP AND ACCEPTANCE", "Split or reframe it before work starts.", "RETURN · D25 PRIORITY", "Boundary, inputs, output, duration, exclusions and test."),
      decision("D27", "Delivery + client owner", "Does the first slice have one 2KO owner, one client owner and explicit acceptance evidence?", "Shared ownership often means nobody can declare or challenge completion.", "Authorise the first controlled action.", "D28 · OPERATING RHYTHM", "Assign ownership and evidence before release.", "HOLD · WORK OWNERSHIP", "Owners, acceptance test, evidence location and due date."),
      decision("D28", "Delivery lead", "Are the working rhythm, decision log, status route and escalation cadence active?", "The engagement needs a repeatable operating system after kickoff energy fades.", "Start the first mobilisation action.", "D29 · FIRST ACTION", "Set up the cadence before work fragments into messages.", "HOLD · OPERATING RHYTHM", "Ceremonies, frequency, channels, logs, attendees and escalation."),
    ],
  },
  {
    number: "05",
    title: "Prove the first value",
    purpose: "Complete one controlled slice and create evidence that the engagement can produce responsible movement.",
    decisions: [
      decision("D29", "Workstream owner", "Has the first controlled action been completed by its agreed date?", "The first commitment tests the system of delivery as much as the technical output.", "Present the output and its evidence for acceptance.", "D30 · ACCEPTANCE TEST", "Identify whether the failure is a blocker, defect or planning error.", "D31 · EXCEPTION BOUNDARY", "Action, actual finish, evidence, elapsed time and variance."),
      decision("D30", "Client owner", "Does the output meet the agreed acceptance evidence?", "Completion is an observed condition, not the delivery team’s opinion.", "Accept the slice and observe use.", "D32 · USER OBSERVATION", "Classify the gap before correcting it.", "D31 · EXCEPTION BOUNDARY", "Acceptance result, evidence, approver, defects and decision."),
      decision("D31", "Delivery lead", "Can the blocker or defect be resolved inside the agreed mobilisation boundary?", "Recovery should be fast, but not conceal a material change in scope or risk.", "Assign the correction and repeat the relevant test.", "RETURN · D29 OR D30", "Invoke change control and re-authorise the affected work.", "HOLD · MATERIAL EXCEPTION", "Exception, cause, impact, owner, decision and recovery date."),
      decision("D32", "Process + adoption lead", "Has an affected user performed or observed the new way of working?", "A technically correct output can still fail at the point of use.", "Capture friction, understanding and exception behaviour.", "D33 · MEASUREMENT SOURCE", "Schedule a real-use observation before declaring mobilisation successful.", "HOLD · ADOPTION EVIDENCE", "User, scenario, observation, friction, exception and response."),
      decision("D33", "Measurement lead", "Has the agreed measurement source produced a trustworthy first reading?", "The measure must work in practice before it is used to claim improvement.", "Compare the reading with the baseline and expected mechanism.", "D34 · EARLY SIGNAL", "Repair the definition, access or collection method.", "HOLD · MEASUREMENT DEFECT", "Reading, period, definition, source, validation and limitations."),
      decision("D34", "Measurement + client owner", "Has the indicator moved—or is there credible evidence explaining why movement should lag?", "A lag can be legitimate, but it needs a causal explanation and a review point.", "Record the result or leading signal without exaggeration.", "D35 · NEXT ITERATION", "Revisit the intervention hypothesis before scaling activity.", "HOLD · HYPOTHESIS REVIEW", "Observed movement, leading evidence, explanation and next test date."),
      decision("D35", "Client sponsor + delivery lead", "Has the next iteration been explicitly authorised using the first evidence?", "Momentum is useful only when the next commitment is deliberate and owned.", "Move from mobilisation into the agreed delivery cadence.", "D36 · CONTROL RECORD", "Pause with a clear decision request and consequence.", "HOLD · NEXT AUTHORISATION", "Decision, evidence considered, scope, owners and next review."),
    ],
  },
  {
    number: "06",
    title: "Close mobilisation into live delivery",
    purpose: "Confirm that the engagement can now operate without relying on memory, goodwill or heroic coordination.",
    decisions: [
      decision("D36", "Operations coordinator", "Are decisions, actions, risks, changes and evidence current in the controlled record?", "The record must explain the engagement to somebody who missed the meetings.", "Run the final mobilisation control checks.", "D37 · CRITICAL RISK", "Update the record before requesting mobilisation acceptance.", "HOLD · RECORD COMPLETENESS", "Latest entries, owners, dates, versions and missing history."),
      decision("D37", "Delivery lead", "Is any critical risk or dependency still unresolved?", "A live risk may be acceptable, but only through an explicit owned decision.", "Test whether the residual exposure is formally controlled.", "D38 · RESIDUAL RISK", "Proceed to service-path testing.", "D39 · SERVICE PATH", "Open critical items, impact, status and escalation evidence."),
      decision("D38", "Client sponsor + 2KO principal", "Does every residual critical risk have an accountable owner, decision date and explicit acceptance?", "A labelled risk is not controlled until somebody owns the exposure and response.", "Carry the controlled residual risk into live delivery.", "D39 · SERVICE PATH", "Do not close mobilisation while the exposure is ownerless.", "HOLD · CRITICAL RISK", "Risk acceptance, owner, mitigation, review date and escalation."),
      decision("D39", "Client service owner", "Has the support, escalation or exception route been tested with the client?", "A route that exists only in documentation may fail at the first real incident.", "Publish the verified route and response expectations.", "D40 · BENEFITS REVIEW", "Run a controlled route test and correct the failure.", "HOLD · SERVICE READINESS", "Test scenario, contact route, response, issue and correction."),
      decision("D40", "Measurement lead", "Is the first formal benefits and control review scheduled with the required evidence owners?", "The engagement needs a future decision point, not an open-ended promise to improve.", "Place the review and evidence deadline in the operating cadence.", "D41 · CLIENT NEXT ACTION", "Schedule it before mobilisation closes.", "HOLD · REVIEW CADENCE", "Review date, attendees, measures, evidence owners and decision scope."),
      decision("D41", "Client owner", "Does the client own and understand the next operational action?", "Sustainable delivery requires client ownership, not dependence on 2KO to remember every move.", "Confirm the action, evidence and escalation condition.", "D42 · MOBILISATION ACCEPTANCE", "Re-brief or reassign the action before handover.", "HOLD · CLIENT OWNERSHIP", "Next action, owner, due date, evidence and escalation."),
      decision("D42", "Client sponsor + delivery lead", "Has mobilisation been explicitly accepted as complete?", "The move into live delivery should be a recorded decision with no ambiguity about what follows.", "Close mobilisation and begin the controlled delivery cadence.", "END · MOBILISATION COMPLETE", "Record the rejection, missing condition and accountable recovery action.", "RETURN · D36 CONTROL RECORD", "Acceptance, date, approvers, open controls, next action and review."),
    ],
  },
];

export default function ClientOnboardingDecisionTree() {
  return (
    <DecisionTreeCanvas
      ariaLabel="2KO internal client onboarding decision canvas"
      toolbarTitle="CLIENT ONBOARDING CANVAS"
      title="Client onboarding"
      introduction="Follow every release, readiness, control and acceptance decision from authorised delivery to a stable live cadence."
      stages={stages}
      finalTitle="Mobilisation is complete only when the operating system works."
      finalCopy="The record, owners, measures, service route and next decision must remain usable after the kickoff team leaves the room."
    />
  );
}
