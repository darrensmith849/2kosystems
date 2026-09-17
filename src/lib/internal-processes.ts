export type InternalProcessStatus = "live" | "next" | "planned";

export type InternalProcess = {
  code: string;
  title: string;
  description: string;
  owner: string;
  startsWith: string;
  endsWith: string;
  status: InternalProcessStatus;
  href?: string;
};

export type InternalProcessCategory = {
  id: string;
  number: string;
  title: string;
  description: string;
  processes: InternalProcess[];
};

export const internalProcessCategories: InternalProcessCategory[] = [
  {
    id: "win-work",
    number: "01",
    title: "Win work",
    description: "Turn an initial signal into a controlled commercial decision without overselling or losing the record.",
    processes: [
      {
        code: "WIN-01",
        title: "Enquiry routing",
        description: "Validate, qualify and route an enquiry from the website through commercial acceptance and controlled delivery start.",
        owner: "Commercial owner",
        startsWith: "Enquiry received",
        endsWith: "Delivery authorised",
        status: "live",
        href: "/internal/enquiry-routing",
      },
      {
        code: "WIN-02",
        title: "Proposal and contracting",
        description: "Control scope, evidence, pricing, approvals, changes and acceptance before work is promised.",
        owner: "Commercial + delivery lead",
        startsWith: "Qualified route",
        endsWith: "Accepted agreement",
        status: "planned",
      },
    ],
  },
  {
    id: "diagnose-design",
    number: "02",
    title: "Diagnose and design",
    description: "Establish what is really happening, what should change and the smallest responsible intervention.",
    processes: [
      {
        code: "DIA-01",
        title: "Half-Day Process Review",
        description: "Observe one live process, frame the decision and determine the right immediate next move.",
        owner: "Process lead",
        startsWith: "Review booked",
        endsWith: "Decision brief issued",
        status: "live",
        href: "/internal/process-review",
      },
      {
        code: "DIA-02",
        title: "Process and Automation Audit",
        description: "Gather evidence across work, systems and sites before recommending material change or investment.",
        owner: "Diagnostic lead",
        startsWith: "Audit authorised",
        endsWith: "Prioritised roadmap",
        status: "next",
      },
      {
        code: "DIA-03",
        title: "Solution architecture and scope",
        description: "Translate the diagnosed operating need into boundaries, controls, dependencies and acceptance evidence.",
        owner: "Solution lead",
        startsWith: "Route selected",
        endsWith: "Delivery-ready scope",
        status: "planned",
      },
    ],
  },
  {
    id: "deliver",
    number: "03",
    title: "Deliver",
    description: "Move an accepted promise into accountable execution while preserving the problem, evidence and intended result.",
    processes: [
      {
        code: "DEL-01",
        title: "Client onboarding",
        description: "Convert the commercial handover into an owned mobilisation plan, working cadence and first controlled action.",
        owner: "Delivery lead",
        startsWith: "Delivery authorised",
        endsWith: "Mobilisation complete",
        status: "live",
        href: "/internal/client-onboarding",
      },
      {
        code: "DEL-02",
        title: "Operational system delivery",
        description: "Design, build, validate and release a system against its operating controls and acceptance criteria.",
        owner: "Systems lead",
        startsWith: "Scope baselined",
        endsWith: "System accepted",
        status: "planned",
      },
      {
        code: "DEL-03",
        title: "Automation implementation",
        description: "Build and release governed automations with exception ownership, monitoring and recoverability.",
        owner: "Automation lead",
        startsWith: "Workflow approved",
        endsWith: "Automation controlled",
        status: "planned",
      },
      {
        code: "DEL-04",
        title: "Training delivery",
        description: "Take a capability requirement through cohort readiness, delivery, assessment and workplace application.",
        owner: "Capability lead",
        startsWith: "Cohort confirmed",
        endsWith: "Capability evidenced",
        status: "planned",
      },
      {
        code: "DEL-05",
        title: "Sigmafy onboarding",
        description: "Configure users, data, governance and adoption around a defined statistical or improvement outcome.",
        owner: "Sigmafy lead",
        startsWith: "Use case approved",
        endsWith: "Platform adopted",
        status: "planned",
      },
    ],
  },
  {
    id: "operate-improve",
    number: "04",
    title: "Operate and improve",
    description: "Keep live systems, capability and improvement work healthy after the initial intervention is delivered.",
    processes: [
      {
        code: "OPS-01",
        title: "Improvement partnership cadence",
        description: "Govern a portfolio of workstreams, evidence, capability and executive decisions across the retainer.",
        owner: "Partnership principal",
        startsWith: "Annual cadence agreed",
        endsWith: "Benefits sustained",
        status: "planned",
      },
      {
        code: "OPS-02",
        title: "System Care and support",
        description: "Triage incidents, distinguish support from change and restore service without losing improvement opportunities.",
        owner: "Client service owner",
        startsWith: "Support signal received",
        endsWith: "Service restored or change routed",
        status: "planned",
      },
      {
        code: "OPS-03",
        title: "Benefits and control review",
        description: "Test whether the intended result still holds and decide whether to standardise, improve, intervene or stop.",
        owner: "Measurement lead",
        startsWith: "Review date reached",
        endsWith: "Next control decision",
        status: "planned",
      },
    ],
  },
  {
    id: "govern",
    number: "05",
    title: "Govern the business",
    description: "Protect the capacity, information, money and operating standards required to make every other process reliable.",
    processes: [
      {
        code: "GOV-01",
        title: "Capacity and work allocation",
        description: "Balance commitments, competence and availability before assigning accountable delivery ownership.",
        owner: "Operations lead",
        startsWith: "Demand forecast changes",
        endsWith: "Capacity decision recorded",
        status: "planned",
      },
      {
        code: "GOV-02",
        title: "Financial authorisation",
        description: "Control pricing exceptions, purchasing, deposits, invoices and commercial release conditions.",
        owner: "Finance owner",
        startsWith: "Financial decision required",
        endsWith: "Transaction controlled",
        status: "planned",
      },
      {
        code: "GOV-03",
        title: "Information and security handling",
        description: "Classify information, restrict exposure and route privacy or security events through accountable decisions.",
        owner: "Information owner",
        startsWith: "Sensitive information identified",
        endsWith: "Handling decision evidenced",
        status: "planned",
      },
      {
        code: "GOV-04",
        title: "Process ownership and review",
        description: "Keep every internal process owned, current, measured and deliberately changed rather than informally drifting.",
        owner: "Operating-system owner",
        startsWith: "Review due or defect raised",
        endsWith: "Process version released",
        status: "planned",
      },
    ],
  },
];

export const internalProcessCount = internalProcessCategories.reduce(
  (total, category) => total + category.processes.length,
  0,
);
