import { RATES, TERMS, TIMEBOX } from "@/lib/pricing";

/**
 * Productised systems — fixed scope, published price, one landing page each.
 *
 * These exist for the search long tail: people do not search "custom
 * operational software", they search "job card system south africa". Each entry
 * renders through one template, so adding another product is a data change
 * rather than a new page.
 *
 * Prices come from `@/lib/pricing` so a rate change never leaves a page stale.
 */

export type Product = {
  slug: string;
  /** Short label for the catalogue and nav. */
  name: string;
  /** Page headline — a short declarative plus a counterpoint. */
  headline: string;
  /** One line for the catalogue row. */
  summary: string;
  price: string;
  timebox: string;
  /** Search intent this page exists to serve — used in the meta description. */
  metaDescription: string;
  /** The pain, in the words someone would actually use. */
  symptoms: { t: string; d: string }[];
  /** Four delivery stages, drawn as the pipeline diagram. */
  stages: { name: string; meta: string }[];
  included: string[];
  excluded: string[];
  /** What changes once it is live. */
  outcomes: string[];
  faqs: { q: string; a: string }[];
};

const SHARED_FAQS = (price: string, timebox: string): Product["faqs"] => [
  {
    q: `What if it takes longer than ${timebox}?`,
    a: `That is our risk. The price is fixed against the scope agreed in week one. If we estimated badly we absorb it. The only thing that moves the price is you adding scope — quoted at ${RATES.dayRate} per day and approved in writing before any work starts.`,
  },
  {
    q: "Who owns the system?",
    a: "You do, from day one. Source code, documentation and data are yours, on mainstream technology any competent developer can pick up. No proprietary platform, no lock-in.",
  },
  {
    q: "Can it integrate with our ERP later?",
    a: `Yes, and it is built so that it can — but not inside this price. An integration with Sage, Pastel or Syspro changes the shape and the risk of the work, so it is scoped and quoted separately as a Proof-of-Value Pilot (from ${RATES.pilotFrom}).`,
  },
  {
    q: "What happens after go-live?",
    a: `${TERMS.postLaunchSupportDays} days of support are included for fixes and questions. After that the system is built to run without us. Most clients take a Managed Retainer from ${RATES.retainerCare} a month for hosting, monitoring and backups, but it is optional.`,
  },
  {
    q: `How do we know ${price} covers our version of this?`,
    a: `We tell you before you pay anything. The scoping call is free, and if your process is bigger than this product we say so rather than sell it to you. Where it is genuinely unclear, a ${RATES.review} Half-Day Process Review settles it, and that fee comes off whatever you commission next.`,
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: "job-card-system",
    name: "Job Card System",
    headline: "The job got done. The paperwork is still in the bakkie.",
    summary: "Raise, assign, schedule and close out work with proof captured on site.",
    price: RATES.jobCard,
    timebox: TIMEBOX.jobCard,
    metaDescription: `A fixed-price job card and work order system for South African field operations. Capture on site, sign-off, costing and reporting in ${TIMEBOX.jobCard} for ${RATES.jobCard} ex VAT.`,
    symptoms: [
      { t: "Job cards come back three days late", d: "Written on site, driven back to the office, then retyped by someone who was not there. By the time it is in the system the week has moved on." },
      { t: "Nobody can say what a job actually cost", d: "Labour on one sheet, parts on another, travel nowhere. The margin on a job is a guess made at month-end." },
      { t: "The client disputes the hours", d: "No timestamp, no photo, no signature. The argument is settled by whoever sounds more certain." },
      { t: "Two crews were dispatched to the same site", d: "Scheduling lives in a WhatsApp group and one person's head. When they are on leave, dispatch degrades." },
      { t: "Warranty claims get rejected", d: "The serial number was recorded on a card that is now illegible, or missing." },
      { t: "You find out about the callback from the client", d: "Nothing links the second visit to the first, so repeat failures never surface as a pattern." },
    ],
    stages: [
      { name: "Week 1 · Capture", meta: "job types and fields agreed" },
      { name: "Week 2 · Build", meta: "raise, assign, schedule" },
      { name: "Week 3 · Field", meta: "on-site capture tested" },
      { name: "Week 4–5 · Go live", meta: "trained and handed over" },
    ],
    included: [
      "Job raised from a request, a schedule or a fault report",
      "Assignment to a technician, crew or contractor",
      "Scheduling view by day, crew and site",
      "On-site capture on a phone — photos, readings, parts used, time",
      "Works offline and syncs when signal returns",
      "Customer or supervisor signature captured on the device",
      "Labour, parts and travel costed per job",
      "Status visible to the office in real time",
      "Full audit trail on every job",
      "Standard report set plus CSV and Excel export",
      "Hosting, backups, training and handover documentation",
      `Source code and ${TERMS.postLaunchSupportDays} days of post-launch support`,
    ],
    excluded: [
      "Integration with Sage, Pastel, Syspro or Xero",
      "Live GPS vehicle tracking",
      "Customer-facing booking portal",
      "Automated invoicing or payment collection",
      "Inventory replenishment and purchase orders",
      "App-store mobile apps — it runs in a phone browser",
      "More than three roles or a per-person permission matrix",
      "Third-party licences and hosting after the first month",
    ],
    outcomes: [
      "The card is closed before the crew leaves site",
      "Job cost is known the same day, not at month-end",
      "Disputes end with a timestamped photo",
      "Repeat callbacks surface as a pattern",
    ],
    faqs: [
      {
        q: "Will it work underground or on a farm with no signal?",
        a: "Yes. Capture works offline on the device and syncs when the phone next has signal. Nothing is lost and nothing needs to be retyped.",
      },
      ...SHARED_FAQS(RATES.jobCard, TIMEBOX.jobCard),
    ],
  },

  {
    slug: "sheq-incident-reporting",
    name: "SHEQ Incident Reporting",
    headline: "The incident was reported. The corrective action was not.",
    summary: "Incident capture, investigation, corrective actions and regulator-ready reporting.",
    price: RATES.sheq,
    timebox: TIMEBOX.sheq,
    metaDescription: `Fixed-price SHEQ incident reporting for South African mining and industry. Capture, root cause and corrective actions in ${TIMEBOX.sheq}, ${RATES.sheq} ex VAT.`,
    symptoms: [
      { t: "The register is a spreadsheet one person maintains", d: "It is current until they are on leave, and nobody else knows the conventions they use." },
      { t: "Corrective actions have no owner or due date", d: "They are agreed in the investigation meeting and then live in the minutes, which nobody reopens." },
      { t: "An audit means three days of assembling evidence", d: "Reports, photos, sign-offs and training records live in four places, and the pack is rebuilt by hand every time." },
      { t: "Near misses are under-reported", d: "Reporting one means finding the form, filling it in and handing it to someone. So people do not." },
      { t: "The same root cause keeps recurring", d: "Each incident is closed on its own. Nothing aggregates them, so the pattern is invisible until it is serious." },
      { t: "Section 54 risk is managed on hope", d: "You cannot show, on demand, that every action from the last inspection is closed out." },
    ],
    stages: [
      { name: "Week 1–2 · Capture", meta: "classifications and workflow agreed" },
      { name: "Week 3 · Build", meta: "reporting and investigation" },
      { name: "Week 4 · Actions", meta: "CAPA tracking and alerts" },
      { name: "Week 5–6 · Go live", meta: "trained and handed over" },
    ],
    included: [
      "Incident reported from a phone in under a minute, including near misses",
      "Photos, location and time captured at the point of report",
      "Classification by type, severity and area",
      "Investigation workflow with root cause capture",
      "Corrective and preventive actions with an owner and a due date",
      "Automatic escalation when an action passes its due date",
      "Standing register of every incident, searchable and filterable",
      "Trend reporting by type, area, cause and period",
      "Evidence pack export for an inspection or audit",
      "Full audit trail — who recorded what, and when",
      "Hosting, backups, training and handover documentation",
      `Source code and ${TERMS.postLaunchSupportDays} days of post-launch support`,
    ],
    excluded: [
      "Integration with an existing ERP or HR system",
      "Statutory submission directly to a regulator",
      "Medical surveillance or occupational health records",
      "Risk assessment and HIRA authoring tools",
      "Training and competency management",
      "Legal appointment registers",
      "App-store mobile apps — it runs in a phone browser",
      "Third-party licences and hosting after the first month",
    ],
    outcomes: [
      "Near-miss reporting rises because reporting takes a minute",
      "Every corrective action has a name and a date against it",
      "The audit pack is exported, not assembled",
      "Recurring root causes become visible while they are still cheap",
    ],
    faqs: [
      {
        q: "Does this make us compliant with the Mine Health and Safety Act?",
        a: "No system makes you compliant on its own — compliance is what your operation does. What this does is make the evidence of it retrievable on demand instead of reconstructed under pressure, and stop corrective actions from quietly lapsing. We are not a compliance consultancy and will not advise on your statutory obligations.",
      },
      ...SHARED_FAQS(RATES.sheq, TIMEBOX.sheq),
    ],
  },

  {
    slug: "contractor-compliance",
    name: "Contractor Compliance Register",
    headline: "He is on site. His induction expired on Tuesday.",
    summary: "Onboarding, medicals, inductions, expiry alerts and site access approval.",
    price: RATES.contractor,
    timebox: TIMEBOX.contractor,
    metaDescription: `Fixed-price contractor compliance and site access for South African operations. Medicals, inductions and expiry alerts in ${TIMEBOX.contractor}, ${RATES.contractor} ex VAT.`,
    symptoms: [
      { t: "Expiry dates live in a spreadsheet nobody opens", d: "Medicals, inductions and certificates all expire on their own schedule, and the register is only checked when something has already gone wrong." },
      { t: "Access is granted on someone's word at the gate", d: "The guard has no way to check, so the answer is whoever is standing there sounding confident." },
      { t: "Onboarding a crew takes a week of email", d: "Documents arrive as photos in a WhatsApp thread and get filed by hand, if at all." },
      { t: "You cannot answer 'who was on site on the 14th'", d: "Not quickly, and not with evidence. The sign-in book is a book." },
      { t: "The same contractor is re-inducted every visit", d: "Nothing remembers that they were inducted six weeks ago, so time is spent redoing it." },
      { t: "An audit asks for one contractor's file", d: "It is assembled from three drives, an inbox and a filing cabinet." },
    ],
    stages: [
      { name: "Week 1 · Capture", meta: "document types and rules agreed" },
      { name: "Week 2 · Build", meta: "register and onboarding" },
      { name: "Week 3 · Access", meta: "approval and expiry alerts" },
      { name: "Week 4–5 · Go live", meta: "trained and handed over" },
    ],
    included: [
      "Contractor company and individual records in one register",
      "Document upload for medicals, inductions, certificates and insurance",
      "Expiry dates tracked per document with automatic advance warning",
      "Site access request and approval workflow",
      "Blocking rules — expired document, no approval, no access",
      "Contractor self-service upload so documents do not arrive by email",
      "Gate view showing who is cleared for site today",
      "Attendance record by contractor, site and date",
      "Evidence pack export per contractor for an audit",
      "Full audit trail on every approval and every document",
      "Hosting, backups, training and handover documentation",
      `Source code and ${TERMS.postLaunchSupportDays} days of post-launch support`,
    ],
    excluded: [
      "Biometric or turnstile hardware integration",
      "Integration with an existing ERP, HR or payroll system",
      "Contractor procurement, tendering or rate negotiation",
      "Invoice and payment processing",
      "Training delivery or assessment",
      "App-store mobile apps — it runs in a phone browser",
      "More than three roles or a per-person permission matrix",
      "Third-party licences and hosting after the first month",
    ],
    outcomes: [
      "Nobody reaches the gate with an expired document",
      "Onboarding is a self-service upload, not a week of email",
      "Who was on site, and when, is a query rather than a search",
      "The contractor file is exported for an audit in seconds",
    ],
    faqs: [
      {
        q: "Can it talk to our turnstiles or biometric readers?",
        a: "Not inside this price. Hardware integration changes the risk profile of the work and needs its own scope, so it is quoted as a Proof-of-Value Pilot. The system is built so that the integration is straightforward when you want it.",
      },
      ...SHARED_FAQS(RATES.contractor, TIMEBOX.contractor),
    ],
  },

  {
    slug: "stock-and-asset-register",
    name: "Stock & Asset Register",
    headline: "The count says 40. The shelf says 31.",
    summary: "One register for what you own, where it is and what moved.",
    price: RATES.assetRegister,
    timebox: TIMEBOX.assetRegister,
    metaDescription: `Fixed-price stock control and asset register for South African operations. Locations, movements and stock counts in ${TIMEBOX.assetRegister}, ${RATES.assetRegister} ex VAT.`,
    symptoms: [
      { t: "The count never reconciles", d: "Two people counted, one wrote it in a different unit, and the variance is written off rather than explained." },
      { t: "Nobody knows where an asset physically is", d: "It was moved between sites by someone who has since left, and the register still shows the old location." },
      { t: "Stock is ordered that is already on a shelf", d: "In a different store, under a slightly different name, because there is no single register." },
      { t: "The insurance schedule is a year out of date", d: "Assets bought since the last review are not on it. Assets scrapped still are." },
      { t: "Issuing stock is a signature in a book", d: "So the book is the only record of who has what, and it does not add up." },
      { t: "Depreciation is rebuilt by hand each year", d: "From a spreadsheet whose formulas nobody currently working there wrote." },
    ],
    stages: [
      { name: "Week 1 · Capture", meta: "categories and locations agreed" },
      { name: "Week 2 · Build", meta: "register and movements" },
      { name: "Week 3 · Migrate", meta: "existing data reconciled" },
      { name: "Week 4 · Go live", meta: "trained and handed over" },
    ],
    included: [
      "One register for stock items and fixed assets",
      "Categories, locations, sites and custodians",
      "Movements — issue, return, transfer, scrap, with a reason and a person",
      "Stock counts on a phone, with variance reported against the register",
      "Minimum levels with a low-stock alert",
      "Serial and asset number tracking",
      "Your existing spreadsheet migrated and reconciled line by line",
      "Depreciation schedule export for finance",
      "Insurance schedule export",
      "Full audit trail on every movement",
      "Hosting, backups, training and handover documentation",
      `Source code and ${TERMS.postLaunchSupportDays} days of post-launch support`,
    ],
    excluded: [
      "Integration with Sage, Pastel, Syspro or Xero",
      "Purchase orders, requisitions and supplier management",
      "Barcode or RFID hardware and label printing",
      "Automated replenishment or demand forecasting",
      "Multi-currency or import costing",
      "App-store mobile apps — it runs in a phone browser",
      "More than three roles or a per-person permission matrix",
      "Third-party licences and hosting after the first month",
    ],
    outcomes: [
      "A count produces a variance report, not an argument",
      "Every movement has a person and a reason attached",
      "Finance and insurance schedules are exports, not projects",
      "Nothing is ordered that is already sitting in a store",
    ],
    faqs: [
      {
        q: "Can we scan barcodes?",
        a: "The system reads a barcode through the phone camera where the label already exists. Buying scanners, printing labels or running an RFID rollout is hardware work and sits outside this price.",
      },
      ...SHARED_FAQS(RATES.assetRegister, TIMEBOX.assetRegister),
    ],
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((product) => product.slug === slug);
}

/** Catalogue rows, with Get Off Excel included at its existing URL. */
export const CATALOGUE = [
  {
    href: "/get-off-excel",
    name: "Get Off Excel",
    summary: "One spreadsheet, rebuilt as a real multi-user system.",
    price: RATES.getOffExcel,
    timebox: TIMEBOX.getOffExcel,
  },
  ...PRODUCTS.map((product) => ({
    href: `/systems/${product.slug}`,
    name: product.name,
    summary: product.summary,
    price: product.price,
    timebox: product.timebox,
  })),
];
