import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import { Panel, Readout, QueueRows, EventFeed, Pill, PipelineFlow } from "@/components/cinema/instruments";
import { RATES, TERMS, TIMEBOX } from "@/lib/pricing";

const PRICE = RATES.getOffExcel;
const TIMEBOXED = TIMEBOX.getOffExcel;

export const metadata: Metadata = {
  title: "Get Off Excel — Replace a Spreadsheet With a System",
  description: `Replace the spreadsheet your operation runs on with a real multi-user system in ${TIMEBOXED}. Fixed price ${PRICE} ex VAT, fixed scope.`,
  alternates: { canonical: "/get-off-excel" },
};

const symptoms = [
  { t: "“Locked for editing by another user”", d: "Two people need the file at once and one of them waits, asks, or works in a copy that never gets merged back." },
  { t: "Someone overwrote the master", d: "A week of captures gone, with no way to tell what changed or who did it. The backup is a copy on somebody's desktop." },
  { t: "Final_v3_USE_THIS_ONE.xlsx", d: "Nobody is certain which file is current. Decisions get made off whichever version was attached to the last email." },
  { t: "The formula broke and nobody knows why", d: "The person who built it left. The logic lives in nested formulas across four sheets and one hidden tab." },
  { t: "It only works on one laptop", d: "A macro, a plugin or a mapped drive means one machine can run it. When they are on leave, the process stops." },
  { t: "Month-end is three days of copy-paste", d: "The same numbers rekeyed into the same report every month, with a fresh chance to fat-finger a figure." },
];

const included = [
  "One spreadsheet rebuilt as a web-based system",
  "Secure login with up to three roles",
  "True multi-user access — one live set of records",
  "Your existing data migrated and reconciled",
  "Validation so bad data cannot be captured",
  "Full audit trail — who, what, when, previous value",
  "One standard report set, plus CSV and Excel export",
  "Automated daily backups",
  "Hosted and live on your own domain",
  "Training and a written handover document",
  "Source code and documentation — you own it",
  `${TERMS.postLaunchSupportDays} days of post-launch support`,
];

const excluded = [
  "Integrations with Sage, Pastel, Syspro or Xero",
  "More than three roles, or per-person permissions",
  "App-store mobile apps (it works in a phone browser)",
  "More than one spreadsheet or workflow",
  "AI features — drafting, classification, document Q&A",
  "Custom dashboards beyond the standard report set",
  "Rebuilding source data that is too broken to migrate",
  "Third-party licences and hosting after the first month",
];

const faqs = [
  { q: `What if it takes longer than ${TIMEBOXED}?`, a: `That is our risk. The price is fixed against the scope agreed in week one. If we estimated badly we absorb it. The only thing that moves the price is you adding scope — quoted at ${RATES.dayRate} per day and approved in writing before any work starts.` },
  { q: "Who owns the system and the code?", a: "You do, from day one. Source, documentation and data are yours, built on mainstream technology any competent developer can pick up. No proprietary platform holding your operation hostage." },
  { q: "Where does our data live?", a: "In a region you choose, and we tell you exactly where before you sign. Access is role-based, changes are logged, and if your policy requires the data to stay in South Africa we host it accordingly." },
  { q: "Can it talk to Sage or Pastel later?", a: `Yes, and it is built so that it can — but not inside this product. An integration changes the shape and the risk of the work, so it belongs in a Proof-of-Value Pilot (from ${RATES.pilotFrom}). Getting off the spreadsheet first gives the integration something clean to connect to.` },
  { q: `What happens after the ${TERMS.postLaunchSupportDays} days?`, a: "Nothing you have to buy. The system is built to run independently and you own everything needed to operate it. Most clients move onto a retainer; it is a choice, not a condition." },
  { q: "How do we know it fits the fixed price?", a: `We tell you before you pay anything. The scoping call is free, and if your process is bigger than this product we say so rather than sell it to you. Where it is genuinely unclear, a ${RATES.review} Half-Day Process Review settles it — and that fee comes off whatever you commission next.` },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Get Off Excel — spreadsheet replacement system",
  description: `A fixed-price, fixed-scope engagement that replaces one business-critical spreadsheet with a secure multi-user web system in ${TIMEBOXED}.`,
  brand: { "@type": "Brand", name: "2KO Systems" },
  offers: {
    "@type": "Offer",
    price: "79500",
    priceCurrency: "ZAR",
    availability: "https://schema.org/InStock",
    priceValidUntil: "2027-12-31",
    url: "https://www.2kosystems.com/get-off-excel",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function GetOffExcelPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ═══ OPENING ═══ */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 lg:pt-40">
        <div className="k-glow -z-10" style={{ top: "40px" }} aria-hidden="true" />
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">Fixed price · Fixed scope · Fixed date</p>
          </Rise>
          <Rise step={1}>
            <h1 className="k-hero mt-6 max-w-[18ch]">
              Everyone has the file. Nobody trusts it.
            </h1>
          </Rise>
          <Rise step={2}>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <p className="k-lead max-w-[54ch]">
                The spreadsheet your operation runs on, rebuilt as a real
                multi-user system in {TIMEBOXED}. {PRICE} ex VAT, agreed up front,
                with the scope written down before we start.
              </p>
              <div className="flex shrink-0 gap-3">
                <Link href="/contact" className="k-btn k-btn--solid">Book a free scoping call</Link>
                <Link href="#scope" className="k-btn k-btn--ghost">What&rsquo;s included</Link>
              </div>
            </div>
          </Rise>

          <Rise step={3} className="mt-14">
            <PipelineFlow
              stages={[
                { name: "Week 1 · Capture", meta: "scope signed off" },
                { name: "Week 2 · Build", meta: "working software" },
                { name: "Week 3 · Migrate", meta: "data reconciled" },
                { name: "Week 4 · Go live", meta: "trained and handed over" },
              ]}
            />
          </Rise>
        </div>
      </section>

      {/* ═══ SYMPTOMS ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">01 — Sound familiar?</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[24ch]">
              You are probably here because one of these happened this week.
            </h2>
          </Rise>
          <div className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {symptoms.map((s, i) => (
              <Rise key={s.t} step={(i % 3) as 0 | 1 | 2}>
                <div style={{ borderTop: "1px solid var(--hair-2)" }} className="pt-5">
                  <h3 className="text-[15px] font-medium tracking-[-0.015em]">{s.t}</h3>
                  <p className="k-sm mt-2.5">{s.d}</p>
                </div>
              </Rise>
            ))}
          </div>
          <Rise className="mt-12">
            <p className="k-lead k-measure">
              None of this is a discipline problem. It is a tooling problem — you
              are using a calculator as a database, and it has held on longer than
              it was ever designed to.
            </p>
          </Rise>
        </div>
      </section>

      {/* ═══ PRICE ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">02 — The whole price</p>
            </Rise>
            <Rise step={1}>
              <p className="k-num mt-6 text-[clamp(48px,7vw,92px)] leading-none">{PRICE}</p>
            </Rise>
            <Rise step={2}>
              <p className="k-mono mt-4">ex VAT · {TIMEBOXED} · one spreadsheet · no surprises</p>
            </Rise>
            <Rise step={3}>
              <p className="k-lead k-measure mt-6">
                Not an estimate, not a starting point, and not billed by the hour.
                It is what the work costs, agreed before we begin. If we
                under-estimated the build, that is ours to carry.
              </p>
            </Rise>
          </div>
          <Rise step={1}>
            <Panel label="Terms" meta="Fixed">
              <QueueRows
                rows={[
                  { label: "On signature", value: "50%" },
                  { label: "On go-live", value: "50%" },
                  { label: "Scope changes", value: `${RATES.dayRate}/day`, tone: "warn" },
                  { label: "Applied retrospectively", value: "Never", tone: "good" },
                ]}
              />
              <div className="k-hairline mt-4 pt-3">
                <p className="k-mono">
                  No site visit needed. Send us the spreadsheet and a call is
                  enough to scope this. If it is bigger than the box we say so
                  then, and that conversation costs nothing.
                </p>
              </div>
            </Panel>
          </Rise>
        </div>
      </section>

      {/* ═══ SCOPE ═══ */}
      <section id="scope" className="k-band k-band--2 scroll-mt-20">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">03 — The scope box</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[26ch]">
              Exactly what the price buys — and what it does not.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-5">
              Both lists are published in the same size type, because the second one
              is the reason the first can be a fixed price.
            </p>
          </Rise>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Rise>
              <Panel label={`Included in ${PRICE}`} meta="12 items">
                <ul className="flex flex-col gap-2.5">
                  {included.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] leading-[1.5]">
                      <span style={{ color: "var(--signal)" }}>—</span>
                      <span style={{ color: "var(--warm-70)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Rise>
            <Rise step={1}>
              <Panel label="Not included — quoted separately" meta="8 items">
                <ul className="flex flex-col gap-2.5">
                  {excluded.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] leading-[1.5]">
                      <span style={{ color: "var(--warm-25)" }}>—</span>
                      <span style={{ color: "var(--warm-45)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="k-hairline mt-4 pt-3">
                  <p className="k-mono">
                    Real work we do — it just changes the shape and the risk, so it
                    gets its own scope and its own price.
                  </p>
                </div>
              </Panel>
            </Rise>
          </div>
        </div>
      </section>

      {/* ═══ AFTER ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">04 — After go-live</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[22ch]">
                What actually changes on the Monday.
              </h2>
            </Rise>
            <Rise step={2}>
              <div className="mt-8 flex flex-wrap gap-2">
                <Pill tone="good">Everyone works at once</Pill>
                <Pill tone="good">Every change attributable</Pill>
                <Pill>Reports come out on their own</Pill>
                <Pill tone="warn">It survives people leaving</Pill>
              </div>
            </Rise>
          </div>
          <Rise step={1}>
            <Panel label="Capture log" meta="After">
              <Readout value="99.4%" unit="first-time-right" tone="good" />
              <div className="k-hairline mt-4 pt-3">
                <EventFeed
                  lines={[
                    { time: "07:12", text: "Record captured on site", tone: "good" },
                    { time: "07:12", text: "Validated · within range", tone: "good" },
                    { time: "07:14", text: "Out-of-range entry rejected", tone: "warn" },
                    { time: "07:14", text: "Re-entered · accepted", tone: "good" },
                    { time: "07:15", text: "Audit trail written" },
                  ]}
                />
              </div>
            </Panel>
          </Rise>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell max-w-4xl">
          <Rise>
            <p className="k-mono k-mono--ember">05 — Before you sign anything</p>
          </Rise>
          <div className="mt-12">
            {faqs.map((faq, i) => (
              <Rise key={faq.q}>
                <div className="k-row" style={i === 0 ? { borderTop: "1px solid var(--hair-2)" } : undefined}>
                  <h3 className="k-sub text-[17px]">{faq.q}</h3>
                  <p className="k-sm mt-2.5">{faq.a}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLOSE ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Start</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[24ch]">
                Send us the spreadsheet. We will tell you what it takes.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                A scoping call costs nothing and takes about thirty minutes. You will
                leave it knowing whether {PRICE} covers your process — or what would.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">Book a free scoping call</Link>
            <Link href="/pricing" className="k-btn k-btn--ghost">See the full price list</Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
