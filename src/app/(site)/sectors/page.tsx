import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import PageHero from "@/components/cinema/PageHero";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import SectorArtefact from "@/components/cinema/SectorArtefact";
import TrackedLink from "@/components/cinema/TrackedLink";
import { Panel, Pill } from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "Process Optimisation & Automation Across Industries",
  description:
    "Process optimisation, workflow automation and operational systems for physical and service operations across South Africa and Africa—from mining and logistics to banking, contact centres and professional services.",
  alternates: { canonical: "/sectors" },
});

const processSignals = [
  ["Handoffs", "Work waits for somebody to forward, approve or remember it."],
  ["Re-entry", "The same information is captured across forms, sheets and systems."],
  ["Exceptions", "The normal path is understood; failures disappear into messages."],
  ["Evidence", "The work happened, but proving when, why and by whom takes hours."],
];

const coreSectors = [
  {
    n: "01",
    artefact: "mining" as const,
    slug: "mining",
    name: "Mining and minerals",
    image: "/imagery/sectors/mining-v1.webp",
    position: "center",
    metric: "Downtime per hour",
    line: "The shift plan survives contact with reality, or it does not.",
    body: "Permit-to-work, equipment availability, contractor compliance and shift handover form chains of approval that often live across a radio call, a printed form and somebody's spreadsheet. 2KO improves the information flow around the operation; site engineering and safety authority remain with the accountable experts.",
    measures: ["Permit cycle time", "Downtime", "Contractor compliance", "Shift exceptions"],
    builds: ["Permit and isolation workflows", "Contractor compliance registers", "Shift handover with an audit trail", "Availability and downtime reporting"],
  },
  {
    n: "02",
    artefact: "agriculture" as const,
    slug: "agriculture",
    name: "Agriculture and agri-processing",
    image: "/imagery/sectors/agriculture-v1.webp",
    position: "center",
    metric: "Perishable window",
    line: "The clock starts the moment it leaves the field.",
    body: "Intake, grading, cold chain, traceability and the packhouse's own paperwork are frequently captured on paper and rekeyed later. By the time a discrepancy becomes visible in a report, the consignment may have shipped and the window has closed.",
    measures: ["Trace time", "Cold-chain exceptions", "Packout yield", "Rejection rate"],
    builds: ["Intake and grading capture", "Cold-chain exception alerting", "Traceability from block to pallet", "Compliance packs generated from the record"],
  },
  {
    n: "03",
    artefact: "logistics" as const,
    slug: "logistics",
    name: "Logistics and distribution",
    image: "/imagery/sectors/logistics-v1.webp",
    position: "center",
    metric: "Cost per consignment",
    line: "Thousands of moving parts, one place they are accounted for.",
    body: "Proof of delivery, exception handling, sub-contractor rates, claims and the invoice must reconcile against one another. The margin can be thin enough that avoidable handling and unrecovered exceptions materially change the result.",
    measures: ["POD turnaround", "Claims recovery", "Cost per load", "On-time delivery"],
    builds: ["Driver proof-of-delivery capture", "Exception and claims workflow", "Rate-card reconciliation", "Consignment-level cost reporting"],
  },
  {
    n: "04",
    artefact: "manufacturing" as const,
    slug: "manufacturing",
    name: "Industrial and manufacturing",
    image: "/imagery/sectors/manufacturing-v1.webp",
    position: "center",
    metric: "Scrap and rework",
    line: "The improvement holds, or it quietly comes back.",
    body: "Quality checks, non-conformance, maintenance requests and control plans often depend on a person remembering. The process may have improved once; the operational system is what makes the new standard visible and repeatable.",
    measures: ["First-pass yield", "Scrap and rework", "Downtime", "CAPA close time"],
    builds: ["In-line quality capture and validation", "Non-conformance and CAPA workflow", "Maintenance request coordination", "Live control and exception reporting"],
  },
];

const serviceSectors = [
  {
    n: "05",
    code: "CASE",
    slug: "financial-services",
    name: "Financial services and insurance",
    image: "/imagery/sectors/services/financial-services-v1.webp",
    metric: "Case turnaround",
    line: "A case should move with its evidence, owner and decision intact.",
    body: "Onboarding, lending, claims and policy administration create long chains of document checks, handoffs and accountable decisions. The opportunity is not to automate regulated judgement; it is to stop complete work waiting behind incomplete information.",
    measures: ["Onboarding lead time", "First-time completeness", "Case ageing", "Rework per case"],
    flows: ["Client and document intake", "Verification and exception routing", "Decision packs with source evidence", "SLA and ageing control"],
  },
  {
    n: "06",
    code: "QUEUE",
    slug: "customer-operations",
    name: "Contact centres and customer operations",
    image: "/imagery/sectors/services/customer-operations-v1.webp",
    metric: "Resolution flow",
    line: "The conversation ends. The responsibility should not disappear with it.",
    body: "Enquiries, complaints and service requests move across channels, teams and escalation levels. A dependable service process preserves context, makes ownership visible and gives the next person what they need without asking the customer to begin again.",
    measures: ["First-contact resolution", "Escalation age", "After-call work", "Repeat contact"],
    flows: ["Omnichannel intake and triage", "Knowledge at the point of service", "Escalation with full context", "Quality review and coaching evidence"],
  },
  {
    n: "07",
    code: "CLOSE",
    slug: "professional-services",
    name: "Accounting and professional services",
    image: "/imagery/sectors/services/accounting-v1.webp",
    metric: "Work in review",
    line: "Expert time should resolve exceptions, not chase the same document twice.",
    body: "Client intake, month-end work, reviews, approvals and recurring reporting depend on evidence arriving in the right sequence. Better workflow protects professional judgement while removing status chasing, re-entry and avoidable review loops.",
    measures: ["Close cycle time", "Review turnaround", "Missing evidence", "Work in progress"],
    flows: ["Client document collection", "Preparation and review routing", "Deadline and dependency control", "Recurring packs from one record"],
  },
  {
    n: "08",
    code: "SERVE",
    slug: "multi-site-services",
    name: "Multi-site and regulated services",
    image: "/imagery/sectors/services/multi-site-v1.webp",
    metric: "Service continuity",
    line: "Different branches. One standard. Every exception visible.",
    body: "Healthcare administration, education, property, hospitality and other distributed services coordinate requests, suppliers, appointments and records across locations. The process must stay consistent without removing the local judgement the service requires.",
    measures: ["Request turnaround", "Referral completeness", "Branch exceptions", "SLA attainment"],
    flows: ["Intake and service coordination", "Branch and role-based routing", "Supplier and exception follow-up", "Evidence-ready service records"],
  },
];

const adjacentGroups = [
  {
    code: "FIELD",
    title: "Asset and field operations",
    sectors: [
      ["Construction and field services", "Work orders, site packs, variation approvals and proof of completion."],
      ["Energy, utilities and infrastructure", "Inspections, maintenance coordination, contractor records and outage evidence."],
      ["Environmental and infrastructure services", "Inspections, field evidence, permitting handoffs and corrective-action control."],
    ],
  },
  {
    code: "CONTROL",
    title: "Regulated and high-control work",
    sectors: [
      ["Healthcare and life sciences", "Intake, referrals, inventory, document control and service coordination outside clinical judgement."],
      ["Public service and education", "Applications, cases, inspections, record completeness and service-status workflows."],
      ["Legal and governance functions", "Matter intake, evidence assembly, review routing, deadlines and decision records."],
    ],
  },
  {
    code: "SCALE",
    title: "Distributed and service operations",
    sectors: [
      ["Retail, wholesale and multi-site", "Branch routines, stock exceptions, maintenance, onboarding and performance follow-up."],
      ["Telecoms and technology operations", "Service requests, field dispatch, provisioning handoffs and SLA exceptions."],
      ["Membership and non-profit operations", "Applications, renewals, case coordination, programme evidence and recurring reporting."],
    ],
  },
];

export default function SectorsPage() {
  return (
    <>
      <PageHero
        eyebrow="SECTORS AND OPERATING ENVIRONMENTS"
        title="Different sectors. The same operational friction."
        titleClass="max-w-[16ch]"
        lead="The vocabulary changes—permit, pallet, claim, case or work order. Underneath it, work still enters, waits, moves, breaks its normal path and needs a reliable record. That process shape is where 2KO works."
        ctas={[
          { href: "/contact", label: "Bring us the process", offer: "sector process" },
          { href: "#broader-fit", label: "Explore the broader fit", ghost: true, offer: "broader sectors" },
        ]}
        facts={[
          { value: "4 + 4", label: "physical and service sectors" },
          { value: "9", label: "adjacent sectors shown" },
          { value: "Process", label: "qualifies the opportunity" },
          { value: "Experts", label: "retain domain authority" },
        ]}
      >
        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)]">
          <Panel label="Process-fit scan" meta="Qualification lens" float="slow">
            <div className="divide-y divide-[var(--hair-2)]">
              {processSignals.map(([name, body], index) => (
                <div key={name} className="grid gap-2 py-4 sm:grid-cols-[32px_110px_1fr] sm:items-baseline">
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <strong className="text-[13px] font-medium">{name}</strong>
                  <span className="k-sm">{body}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel label="The shared process shape" meta="Sector-neutral">
            <ol className="grid gap-2 sm:grid-cols-5">
              {[
                ["Enter", "request"],
                ["Validate", "rules"],
                ["Route", "owner"],
                ["Decide", "human"],
                ["Record", "proof"],
              ].map(([name, meta], index) => (
                <li key={name} className="relative min-w-0 rounded-lg border border-[var(--hair-2)] bg-black/20 p-3 sm:min-h-[118px]">
                  <span className="k-mono">0{index + 1}</span>
                  <strong className="mt-5 block text-[12px] font-medium sm:text-[11px] xl:text-[12px]">{name}</strong>
                  <span className="k-mono mt-3 block">{meta}</span>
                  {index < 4 && <span className="absolute -right-[7px] top-1/2 z-10 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--ember)] shadow-[0_0_10px_var(--ember)] sm:block" aria-hidden="true" />}
                </li>
              ))}
            </ol>
            <div className="k-hairline mt-7 pt-5">
              <p className="k-mono">The nouns change. The mechanism repeats.</p>
            </div>
          </Panel>
        </div>
      </PageHero>

      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/sectors/logistics-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/84 via-black/28 to-black/55" aria-hidden="true" />
        <div className="k-shell pb-20 pt-40">
          <Rise><p className="k-mono k-mono--ember">Sector is context · process is mechanism</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[16ch]">We do not automate an industry. We improve the work moving through it.</h2></Rise>
          <Rise step={2}><p className="k-lead mt-8 max-w-[54ch]">A useful sector conversation starts with the costly workflow: where it waits, where data is re-entered, where an exception goes missing and which decision must remain human.</p></Rise>
          <Rise step={3}>
            <div className="mt-12 flex max-w-[920px] flex-wrap gap-2.5">
              {["Approvals", "Field capture", "Exceptions", "Reconciliation", "Compliance evidence", "Handover", "Reporting", "Knowledge retrieval"].map((item) => <Pill key={item}>{item}</Pill>)}
            </div>
          </Rise>
        </div>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.55fr)] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">Physical operations</p></Rise>
            <Rise step={1}><h2 className="k-title mt-6 max-w-[20ch]">Four environments where the process moves through sites, equipment and goods.</h2></Rise>
          </div>
          <Rise step={2}><p className="k-lead">These remain the site&apos;s deepest sector translations. The examples below describe workflow mechanisms and illustrative records—not claimed client outcomes.</p></Rise>
        </div>
      </section>

      {coreSectors.map((sector, index) => (
        <section id={sector.slug} key={sector.slug} className={`k-band ${index % 2 ? "k-band--2" : ""}`}>
          <div className="k-shell">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
              <Rise className={index % 2 ? "lg:order-2" : ""}>
                <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-[var(--hair-2)]">
                  <div className="absolute inset-0">
                    <Photo src={sector.image} sizes="(min-width: 1024px) 50vw, 100vw" scrim="bottom" position={sector.position} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/15" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                    <p className="k-mono k-mono--ember">{sector.n} — {sector.metric}</p>
                    <h2 className="k-title mt-5 max-w-[16ch]">{sector.name}</h2>
                    <p className="k-sub mt-5 max-w-[26ch] text-[var(--warm-70)]">{sector.line}</p>
                  </div>
                </div>
              </Rise>

              <div className={index % 2 ? "lg:order-1" : ""}>
                <Rise><p className="k-lead">{sector.body}</p></Rise>
                <Rise step={1}>
                  <p className="k-mono mt-9">Measures buyers recognise</p>
                  <div className="mt-4 flex flex-wrap gap-2.5">{sector.measures.map((measure) => <Pill key={measure}>{measure}</Pill>)}</div>
                </Rise>
                <Rise step={1}>
                  <p className="k-mono mt-9">Typical process and system controls</p>
                  <ol className="mt-4 border-t border-[var(--hair-2)]">
                    {sector.builds.map((build, buildIndex) => (
                      <li key={build} className="grid grid-cols-[38px_1fr] gap-3 border-b border-[var(--hair-2)] py-4 text-[14px]">
                        <span className="k-mono k-mono--ember">0{buildIndex + 1}</span><span>{build}</span>
                      </li>
                    ))}
                  </ol>
                </Rise>
                <Rise step={2} className="mt-9"><SectorArtefact kind={sector.artefact} /></Rise>
                <Rise step={3} className="mt-8"><TrackedLink href="/audit" eventOffer={`${sector.name} opportunity audit`} className="k-link">Quantify a process in this sector →</TrackedLink></Rise>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section id="service-operations" className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/home/service-coordination-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/84 via-black/28 to-black/45" aria-hidden="true" />
        <div className="k-shell pb-20 pt-40">
          <Rise><p className="k-mono k-mono--ember">Information and service operations</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[17ch]">The process may be invisible. The delay, rework and risk are not.</h2></Rise>
          <Rise step={2}><p className="k-lead mt-8 max-w-[54ch]">Cases, conversations, documents and decisions need the same operational discipline as physical work. These sectors are not adjacent to the 2KO proposition—they are a core part of it.</p></Rise>
        </div>
      </section>

      <section className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-14 top-14 text-[clamp(92px,19vw,300px)] font-semibold leading-none tracking-[-.08em] text-white/[.018]" aria-hidden="true">SERVICE</div>
        <div className="k-shell relative">
          <div className="grid gap-5 lg:grid-cols-12">
            {serviceSectors.map((sector, index) => (
              <Rise key={sector.slug} step={(index % 3) as 0 | 1 | 2} className={index === 0 || index === 3 ? "lg:col-span-7" : "lg:col-span-5"}>
                <article id={sector.slug} className="group h-full overflow-hidden rounded-2xl border border-[var(--hair-2)] bg-black/30 shadow-2xl">
                  <div className="relative min-h-[360px] overflow-hidden sm:min-h-[430px]">
                    <div className="absolute inset-0">
                      <Photo src={sector.image} sizes="(min-width: 1024px) 58vw, 100vw" scrim="bottom" position="center" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <div className="flex items-center justify-between gap-5">
                        <span className="k-mono k-mono--ember">{sector.n} · {sector.code}</span>
                        <span className="k-mono">{sector.metric}</span>
                      </div>
                      <h3 className="k-title mt-5 max-w-[17ch]">{sector.name}</h3>
                      <p className="k-sub mt-4 max-w-[30ch] text-[var(--warm-70)]">{sector.line}</p>
                    </div>
                  </div>
                  <div className="grid gap-8 border-t border-white/10 p-6 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(210px,.72fr)]">
                    <div>
                      <p className="k-sm">{sector.body}</p>
                      <div className="mt-6 flex flex-wrap gap-2">{sector.measures.map((measure) => <Pill key={measure}>{measure}</Pill>)}</div>
                    </div>
                    <ol className="border-t border-[var(--hair-2)] xl:border-t-0">
                      {sector.flows.map((flow, flowIndex) => (
                        <li key={flow} className="grid grid-cols-[28px_1fr] gap-3 border-b border-[var(--hair-2)] py-3 text-[12px] text-[var(--warm-70)]">
                          <span className="k-mono k-mono--ember">0{flowIndex + 1}</span><span>{flow}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              </Rise>
            ))}
          </div>

          <Rise className="mt-10"><TrackedLink href="/audit" eventOffer="service operations opportunity audit" className="k-link">Quantify a service workflow →</TrackedLink></Rise>
        </div>
      </section>

      <section id="broader-fit" className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 top-24 text-[clamp(92px,20vw,310px)] font-semibold leading-none tracking-[-.08em] text-white/[.018]" aria-hidden="true">BEYOND</div>
        <div className="k-shell relative">
          <Rise><p className="k-mono k-mono--ember">Broader reach · same qualification bar</p></Rise>
          <Rise step={1}><h2 className="k-title mt-6 max-w-[21ch]">The opportunity is larger than any sector list.</h2></Rise>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.62fr)] lg:items-start">
            <Rise step={2}><p className="k-lead max-w-[58ch]">Any organisation with repeatable administrative or operational workflows can benefit when delay, variation, rework, poor visibility or missed controls create material cost or risk.</p></Rise>
            <Rise step={2}><aside className="rounded-xl border border-[var(--ember)]/40 bg-[var(--ember)]/[.06] p-5"><p className="k-mono k-mono--ember">Important boundary</p><p className="k-sm mt-3">2KO designs information flow, workflow controls, automation and operational records. Engineering, clinical, legal, credit and other regulated judgement stays with the client&apos;s authorised domain experts.</p></aside></Rise>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {adjacentGroups.map((group, groupIndex) => (
              <Rise key={group.code} step={(groupIndex % 3) as 0 | 1 | 2}>
                <article className="relative h-full overflow-hidden rounded-2xl border border-[var(--hair-2)] bg-black/25 p-6 sm:p-8">
                  <span className="absolute left-0 top-0 h-[2px] w-[62%] bg-gradient-to-r from-[var(--signal)] via-[var(--ember)] to-transparent" />
                  <p className="text-[clamp(52px,7vw,88px)] font-semibold leading-none tracking-[-.07em] text-white/[.045]">{group.code}</p>
                  <h3 className="k-sub mt-4">{group.title}</h3>
                  <div className="mt-8 divide-y divide-[var(--hair-2)] border-y border-[var(--hair-2)]">
                    {group.sectors.map(([name, body]) => (
                      <div key={name} className="py-6">
                        <h4 className="text-[15px] font-medium text-[var(--warm)]">{name}</h4>
                        <p className="k-sm mt-3">{body}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/sectors/agriculture-v1.webp" sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden="true" />
        <div className="k-shell pb-20 pt-40">
          <Rise><p className="k-mono k-mono--ember">The sector-neutral fit test</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">If the process repeats, breaks and matters, it is worth examining.</h2></Rise>
          <div className="mt-14 grid overflow-hidden rounded-2xl border border-white/10 bg-black/72 backdrop-blur-xl md:grid-cols-3">
            {[
              ["Repeats", "Enough volume or frequency for a better method to compound."],
              ["Breaks", "Visible delay, rework, chasing, exceptions, missed controls or weak evidence."],
              ["Matters", "The cost, risk or capacity recovered can justify changing how the work operates."],
            ].map(([name, body], index) => (
              <article key={name} className="min-h-[210px] border-b border-white/10 p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <span className="k-mono k-mono--ember">0{index + 1}</span><h3 className="k-title mt-10">{name}</h3><p className="k-sm mt-4">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">Start with the process</p></Rise>
            <Rise step={1}><h2 className="k-title mt-6 max-w-[20ch]">Not on the list? Bring us the workflow anyway.</h2></Rise>
            <Rise step={2}><p className="k-lead k-measure mt-5">A {RATES.review} Half-Day Process Review can establish whether the constraint is worth pursuing. For several opportunities or a material investment decision, the {RATES.audit} Opportunity Audit builds the financial case.</p></Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <TrackedLink href="/contact" eventOffer="sector process review" className="k-btn k-btn--solid">Bring us the process</TrackedLink>
            <Link href="/automation" className="k-btn k-btn--ghost">Explore process automation</Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
