import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import { Panel, Readout, QueueRows, Pill, Gauge } from "@/components/cinema/instruments";
import { RATES, TERMS, TIMEBOX } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — What Custom Software Costs in South Africa",
  description: `What custom software costs in South Africa. Published prices: reviews ${RATES.review}, systems from ${RATES.getOffExcel}, builds to ${RATES.buildTo}. All ex VAT.`,
  alternates: { canonical: "/pricing" },
};

const ladder = [
  { name: "Half-Day Process Review", price: RATES.review, time: TIMEBOX.review, note: `Credited against whatever you commission next`, tone: "neutral" as const },
  { name: "Systems Opportunity Audit", price: RATES.audit, time: TIMEBOX.audit, note: `Credited in full against a pilot within ${TERMS.auditCreditDays} days`, tone: "good" as const },
  { name: "Extended Audit", price: RATES.auditExtended, time: TIMEBOX.auditExtended, note: "Multi-site or multi-process fieldwork", tone: "neutral" as const },
  { name: "Get Off Excel", price: RATES.getOffExcel, time: TIMEBOX.getOffExcel, note: "One spreadsheet, rebuilt. Scope published in full", tone: "neutral" as const, href: "/get-off-excel" },
  { name: "Proof-of-Value Pilot", price: `from ${RATES.pilotFrom}`, time: TIMEBOX.pilot, note: "One workflow. Rolls forward into the build", tone: "neutral" as const },
  { name: "Core System Build", price: `${RATES.buildFrom} – ${RATES.buildTo}`, time: TIMEBOX.buildPhase, note: "Fixed price per phase, quoted in sequence", tone: "neutral" as const },
];

const retainers = [
  { name: "Care", price: RATES.retainerCare, tagline: "Keep it running", rows: ["Next business day", "—", "—", "—"] },
  { name: "Improve", price: RATES.retainerImprove, tagline: "Keep it improving", rows: ["Same day", "~2 days / month", "Quarterly", "—"], featured: true },
  { name: "Partner", price: RATES.retainerPartner, tagline: "Own the roadmap with us", rows: ["4 hours", "~5 days / month", "Quarterly", "Included"] },
];

const retainerRows = ["Support SLA", "Included development", "Operations review", "Roadmap ownership"];

const terms = [
  { term: "Payment schedule", detail: "Reviews, audits and Get Off Excel: 50% on signature, 50% on delivery. Pilots: 40 / 40 / 20 against signature, mid-point demo and acceptance. Builds: monthly against phase milestones." },
  { term: "Retainer commitment", detail: `${TERMS.retainerMinMonths}-month minimum, then month-to-month. Twelve months up front takes ${TERMS.annualPrepayDiscount} off. Unused development days roll forward one month only.` },
  { term: "Annual escalation", detail: `Retainers escalate at ${TERMS.escalation} on the anniversary, written into the agreement so it is never a conversation.` },
  { term: "AI and third-party licences", detail: `Billed through separately at cost plus ${TERMS.passthroughMargin}, itemised. Never folded into a fixed price, because neither of us can predict them honestly.` },
  { term: "Scope changes", detail: `Quoted at ${RATES.dayRate} per day (${RATES.hourlyRate} per hour for small pieces), approved by you in writing before any work starts, never applied retrospectively.` },
  { term: "VAT", detail: "Every figure on this page excludes VAT. Quotes and invoices show it separately." },
];

const faqs = [
  { q: "Why publish prices at all?", a: "Because the silence costs everyone time. If our numbers are wrong for you, you should find that out in ninety seconds on a web page rather than after three meetings and a proposal." },
  { q: "Can we pay monthly instead of up front?", a: "Yes. Any build can be structured as capital expenditure billed against milestones, or as a monthly figure over 24 months that includes the Care retainer, with ownership transferring at the end of the term. The monthly route totals more — we carry the cost and the risk for two years — and it usually starts sooner, because a monthly operating figure tends to sit below the approval threshold that would otherwise send the decision upstairs." },
  { q: "What if a fixed-price build runs long?", a: "That is our risk. The price is fixed against the scope agreed in writing. If we estimated badly we absorb it. The only thing that moves the price is you adding scope, and that is quoted and approved before any of it gets built." },
  { q: "What if the audit says we should not build anything?", a: "Then that is what it says, and you have saved several hundred thousand rand for the price of a day and a half of fieldwork. An audit that could only ever recommend buying software from us would not be worth commissioning." },
  { q: "Where does our data live?", a: "In a region you choose, and we tell you exactly where before you sign. Access is role-based, changes are logged, and personal information is handled on a need-to-know basis. If your policy requires the data to stay in South Africa, we host it accordingly." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="k-shell pt-32 pb-12 lg:pt-40">
        <Rise>
          <p className="k-mono k-mono--ember">Pricing</p>
        </Rise>
        <Rise step={1}>
          <h1 className="k-state mt-6 max-w-[15ch]">
            Every price, published.
          </h1>
        </Rise>
        <Rise step={2}>
          <p className="k-lead k-measure mt-6">
            Fixed prices against scopes agreed in writing before work starts. No
            hourly billing, no discovery invoices, and nothing you have to book a
            call to find out. Every figure below excludes VAT.
          </p>
        </Rise>
        <Rise step={3}>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Pill tone="good">Fixed scope</Pill>
            <Pill tone="good">You own the code</Pill>
            <Pill>Audit fee credited</Pill>
            <Pill tone="warn">No lock-in</Pill>
          </div>
        </Rise>
      </section>

      {/* ═══ LADDER ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">01 — Engagements</p>
          </Rise>

          <div className="mt-10">
            {ladder.map((tier, i) => (
              <Rise key={tier.name}>
                <div
                  className="k-row md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_180px_auto] md:items-baseline"
                  style={i === 0 ? { borderTop: "1px solid var(--line-dark)" } : undefined}
                >
                  <h2 className="k-sub">
                    {tier.href ? (
                      <Link href={tier.href} className="hover:opacity-70">
                        {tier.name}
                      </Link>
                    ) : (
                      tier.name
                    )}
                  </h2>
                  <p className="k-sm">{tier.note}</p>
                  <span className="k-mono">{tier.time}</span>
                  <span
                    className="k-num text-[22px] md:text-right"
                    style={{ color: tier.tone === "good" ? "var(--signal)" : "var(--warm)" }}
                  >
                    {tier.price}
                  </span>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RETAINERS ═══ */}
      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">02 — Managed retainers</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[22ch]">
              Three ways to keep a live system healthy.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-5">
              All three include hosting, monitoring, automated backups and security
              patching. None of them are a condition of anything we build.
            </p>
          </Rise>

          <Rise step={3} className="mt-10 overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-[1.2fr_repeat(3,1fr)] gap-px" style={{ background: "var(--hair)" }}>
              <div style={{ background: "var(--black)" }} className="p-6" />
              {retainers.map((tier) => (
                <div
                  key={tier.name}
                  className="p-6"
                  style={{ background: tier.featured ? "rgba(78,201,124,0.06)" : "var(--black)" }}
                >
                  <h3 className="k-sub">{tier.name}</h3>
                  <p className="k-mono mt-1.5">{tier.tagline}</p>
                  <p className="k-num mt-5 text-[30px] leading-none">{tier.price}</p>
                  <p className="k-mono mt-2">per month, ex VAT</p>
                </div>
              ))}

              {retainerRows.map((label, ri) => (
                <div key={label} className="contents">
                  <div style={{ background: "var(--black)" }} className="p-6 text-[13px] font-semibold">
                    {label}
                  </div>
                  {retainers.map((tier) => (
                    <div
                      key={`${tier.name}-${label}`}
                      className="p-6 text-[13px] tabular-nums"
                      style={{
                        background: tier.featured ? "rgba(78,201,124,0.06)" : "var(--black)",
                        color: tier.rows[ri] === "—" ? "var(--warm-45)" : "var(--warm)",
                      }}
                    >
                      {tier.rows[ri]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Rise>

          <p className="k-mono mt-6">
            Twelve months up front takes {TERMS.annualPrepayDiscount} off · unused days roll one month
          </p>
        </div>
      </section>

      {/* ═══ CAPEX / OPEX ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">03 — Two ways to pay for a build</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[22ch]">
              Capital cost, or a monthly figure.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-5">
              The same system, structured to fit how your business approves spend.
              Figures below are illustrative — yours comes from your scope.
            </p>
          </Rise>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Rise>
              <Panel label="Capital expenditure" meta="Milestones">
                <Readout value="R420,000" unit="fixed" />
                <ul className="k-hairline mt-5 flex flex-col gap-3 pt-4 text-[13px]" style={{ color: "var(--warm-70)" }}>
                  <li>Lowest total cost.</li>
                  <li>You own the system outright on delivery.</li>
                  <li>Retainer optional and priced separately.</li>
                  <li>Usually needs capital approval before it can start.</li>
                </ul>
              </Panel>
            </Rise>
            <Rise step={1}>
              <Panel label="Operating expenditure" meta="24 months">
                <Readout value="R24,500" unit="per month" tone="good" />
                <ul className="k-hairline mt-5 flex flex-col gap-3 pt-4 text-[13px]" style={{ color: "var(--warm-70)" }}>
                  <li>Nothing up front.</li>
                  <li>Hosting, support and maintenance bundled in.</li>
                  <li>Ownership transfers at the end of the term.</li>
                  <li>Costs more in total — we carry the risk for two years — but usually starts far sooner.</li>
                </ul>
              </Panel>
            </Rise>
          </div>
        </div>
      </section>

      {/* ═══ THE RATIO ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">04 — How we size a pilot</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[20ch]">
                A pilot costs less than the problem.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                We hold ourselves to a ratio: a pilot should cost under{" "}
                {TERMS.pilotValueRatio} of the annual value of the problem it
                fixes, and the audit shows the arithmetic so you can check it
                yourself. If a finding is too small to clear that, we will tell you
                not to build anything.
              </p>
            </Rise>
          </div>
          <Rise step={1}>
            <Panel label="Worked example" meta="Illustrative">
              <Gauge value={16} label="of annual cost of the problem" />
              <div className="k-hairline mt-5 pt-4">
                <QueueRows
                  rows={[
                    { label: "Annual cost of the finding", value: "R900,000", tone: "warn" },
                    { label: "Pilot to fix it", value: RATES.pilotFrom },
                    { label: "Share of one year", value: "16%", tone: "good" },
                    { label: "Our ceiling", value: TERMS.pilotValueRatio },
                  ]}
                />
              </div>
            </Panel>
          </Rise>
        </div>
      </section>

      {/* ═══ TERMS ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">05 — Terms</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-5 max-w-[24ch]">The small print, in normal type.</h2>
          </Rise>

          <dl className="mt-10">
            {terms.map((row, i) => (
              <Rise key={row.term}>
                <div
                  className="k-row md:grid-cols-[280px_minmax(0,1fr)]"
                  style={i === 0 ? { borderTop: "1px solid var(--line-dark)" } : undefined}
                >
                  <dt className="text-[15px] font-semibold tracking-[-0.015em]">{row.term}</dt>
                  <dd className="k-sm">{row.detail}</dd>
                </div>
              </Rise>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="k-band">
        <div className="k-shell max-w-4xl">
          <Rise>
            <p className="k-mono k-mono--ember">06 — Questions about money</p>
          </Rise>
          <div className="mt-10">
            {faqs.map((faq, i) => (
              <Rise key={faq.q}>
                <div
                  className="k-row"
                  style={i === 0 ? { borderTop: "1px solid var(--line-dark)" } : undefined}
                >
                  <h3 className="k-sub text-[19px]">{faq.q}</h3>
                  <p className="k-sm mt-3">{faq.a}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Start</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[20ch]">
                Know what it costs. Now find out what you need.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                A scoping call is free and takes about thirty minutes. If the answer
                is that you should not build anything, we will say so.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Book a scoping call
            </Link>
            <Link href="/method" className="k-btn k-btn--ghost">
              Read the method
            </Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
