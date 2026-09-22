export type EnquiryRoutingInput = {
  interest?: string;
  processState?: string;
  sponsorStatus?: string;
  workstreamCount?: string;
  trainingPopulation?: string;
  dataReadiness?: string;
  decisionTiming?: string;
};

export type EnquiryRouteKey =
  | "triage"
  | "process-review"
  | "audit"
  | "system"
  | "automation"
  | "training"
  | "sigmafy"
  | "system-care"
  | "managed-system"
  | "website"
  | "partnership";

export type EnquiryRouting = {
  reference: string;
  receivedAt: string;
  nextActionDueAt: string;
  nextActionDueLabel: string;
  responseTarget: string;
  routeKey: EnquiryRouteKey;
  routeCode: string;
  routeLabel: string;
  owner: string;
  nextAction: string;
  confidence: "explicit" | "provisional";
  signals: string[];
  humanReviewRequired: true;
};

type RouteDefinition = Pick<
  EnquiryRouting,
  "routeKey" | "routeCode" | "routeLabel" | "owner" | "nextAction"
>;

const PARTNERSHIP_INTERESTS = new Set([
  "improvement-programme",
  "operational-excellence",
  "transformation-office",
  "outcome-partnership",
]);

const SYSTEM_INTERESTS = new Set([
  "systems-automation",
  "get-off-excel",
  "job-card-system",
  "sheq-incident-reporting",
  "contractor-compliance",
  "stock-and-asset-register",
  "managed-systems",
]);

const ROUTES: Record<EnquiryRouteKey, RouteDefinition> = {
  triage: {
    routeKey: "triage",
    routeCode: "TRI",
    routeLabel: "Human triage",
    owner: "Enquiry lead",
    nextAction: "Confirm the operating problem, accountable owner and smallest useful decision.",
  },
  "process-review": {
    routeKey: "process-review",
    routeCode: "REV",
    routeLabel: "Half-Day Process Review",
    owner: "Process lead",
    nextAction: "Confirm one live process, its accountable owner, the site and a suitable review date.",
  },
  audit: {
    routeKey: "audit",
    routeCode: "AUD",
    routeLabel: "Process & Automation Audit",
    owner: "Diagnostic lead",
    nextAction: "Confirm the decision boundary, evidence sources, sites and required level of audit.",
  },
  system: {
    routeKey: "system",
    routeCode: "SYS",
    routeLabel: "System / product validation",
    owner: "Systems lead",
    nextAction: "Validate users, roles, workflow boundary, records, controls and the closest product fit.",
  },
  automation: {
    routeKey: "automation",
    routeCode: "AUT",
    routeLabel: "Automation validation",
    owner: "Automation lead",
    nextAction: "Validate the trigger, rules, volume, exceptions, authority and measurable value.",
  },
  training: {
    routeKey: "training",
    routeCode: "CAP",
    routeLabel: "Training / capability",
    owner: "Capability lead",
    nextAction: "Confirm the cohort, belt or capability level, delivery mode and workplace application.",
  },
  sigmafy: {
    routeKey: "sigmafy",
    routeCode: "SIG",
    routeLabel: "Sigmafy validation",
    owner: "Sigmafy lead",
    nextAction: "Confirm users, modules, data requirements, governance and intended adoption path.",
  },
  "system-care": {
    routeKey: "system-care",
    routeCode: "CARE",
    routeLabel: "System Care",
    owner: "Systems care lead",
    nextAction: "Confirm the live system, current support position, critical risks and service boundary.",
  },
  "managed-system": {
    routeKey: "managed-system",
    routeCode: "MSP",
    routeLabel: "Managed Systems Partnership",
    owner: "Systems lead",
    nextAction: "Confirm the system boundary, build or go-live position, operating risks and first roadmap priorities.",
  },
  website: {
    routeKey: "website",
    routeCode: "WEB",
    routeLabel: "Website project",
    owner: "Digital lead",
    nextAction: "Confirm the commercial objective, audience, required journeys, content and launch constraint.",
  },
  partnership: {
    routeKey: "partnership",
    routeCode: "PAR",
    routeLabel: "Improvement partnership qualification",
    owner: "Principal / partnerships",
    nextAction: "Review sponsorship, workstreams, capability population, evidence readiness and decision window.",
  },
};

function johannesburgDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    weekday: value("weekday"),
  };
}

/** 09:00 on the next South African business day. Public holidays remain a human override. */
export function nextBusinessActionAt(receivedAt: Date) {
  const local = johannesburgDateParts(receivedAt);
  const daysToAdd = local.weekday === "Fri" ? 3 : local.weekday === "Sat" ? 2 : 1;

  // South Africa is UTC+2 year-round, so 09:00 SAST is 07:00 UTC.
  return new Date(Date.UTC(local.year, local.month - 1, local.day + daysToAdd, 7));
}

function formatDueDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function referenceFor(receivedAt: Date) {
  const local = johannesburgDateParts(receivedAt);
  const date = `${local.year}${String(local.month).padStart(2, "0")}${String(local.day).padStart(2, "0")}`;
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `2KO-${date}-${suffix}`;
}

function routeDefinition(input: EnquiryRoutingInput): RouteDefinition {
  const interest = input.interest ?? "";

  if (PARTNERSHIP_INTERESTS.has(interest)) return ROUTES.partnership;
  if (interest === "managed-systems") return ROUTES["managed-system"];
  if (SYSTEM_INTERESTS.has(interest)) return ROUTES.system;
  if (interest === "automation") return ROUTES.automation;
  if (interest === "audit") return ROUTES.audit;
  if (interest === "process-review") return ROUTES["process-review"];
  if (interest === "training") return ROUTES.training;
  if (interest === "sigmafy") return ROUTES.sigmafy;
  if (interest === "care") return ROUTES["system-care"];
  if (interest === "website-project") return ROUTES.website;

  // A process-state answer is useful evidence, but never enough to force a sale.
  if (input.processState === "system-fragmented") return ROUTES.audit;
  if (
    input.processState === "unclear" ||
    input.processState === "agreed-manual" ||
    input.processState === "live-needs-improvement"
  ) {
    return ROUTES["process-review"];
  }

  return ROUTES.triage;
}

export function routeEnquiry(
  input: EnquiryRoutingInput,
  receivedAt = new Date(),
): EnquiryRouting {
  const route = routeDefinition(input);
  const nextActionDue = nextBusinessActionAt(receivedAt);
  const signals = [
    input.interest ? `Selected starting point: ${input.interest}` : "No starting point selected",
    input.processState ? `Process state: ${input.processState}` : "Process state not supplied",
    PARTNERSHIP_INTERESTS.has(input.interest ?? "") && input.sponsorStatus
      ? `Executive sponsorship: ${input.sponsorStatus}`
      : "",
    PARTNERSHIP_INTERESTS.has(input.interest ?? "") && input.workstreamCount
      ? `Workstreams: ${input.workstreamCount}`
      : "",
    PARTNERSHIP_INTERESTS.has(input.interest ?? "") && input.dataReadiness
      ? `Evidence readiness: ${input.dataReadiness}`
      : "",
  ].filter(Boolean);

  return {
    ...route,
    reference: referenceFor(receivedAt),
    receivedAt: receivedAt.toISOString(),
    nextActionDueAt: nextActionDue.toISOString(),
    nextActionDueLabel: formatDueDate(nextActionDue),
    responseTarget: "Within one business day",
    confidence:
      route.routeKey !== "triage" && input.interest ? "explicit" : "provisional",
    signals,
    humanReviewRequired: true,
  };
}

export function sigmafySubjectForRoute(
  route: EnquiryRouteKey,
): "corporate-training" | "consultancy" | "partnership" | "audit-request" | "general" {
  if (route === "partnership") return "partnership";
  if (route === "training") return "corporate-training";
  if (route === "triage") return "general";
  if (route === "sigmafy" || route === "website" || route === "system-care") return "consultancy";
  return "audit-request";
}

export function routingRecordText(routing: EnquiryRouting) {
  return [
    "PROVISIONAL 2KO ROUTING — HUMAN CONFIRMATION REQUIRED",
    `Reference: ${routing.reference}`,
    `Route: ${routing.routeCode} · ${routing.routeLabel}`,
    `Owner: ${routing.owner}`,
    `Response target: ${routing.responseTarget}`,
    `Next action due: ${routing.nextActionDueLabel} (${routing.nextActionDueAt})`,
    `Next action: ${routing.nextAction}`,
    `Routing confidence: ${routing.confidence}`,
    ...routing.signals.map((signal) => `Signal: ${signal}`),
  ].join("\n");
}
