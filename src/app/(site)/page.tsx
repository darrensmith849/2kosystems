import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import Photo from "@/components/cinema/Photo";
import AfricaMap from "@/components/cinema/AfricaMap";
import OpsConsole from "@/components/cinema/OpsConsole";
import { UptimeCard } from "@/components/cinema/HeroCards";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Operational Systems for Heavy Industry",
  description:
    "2KO Systems builds the approvals, capture, escalation and reporting systems that heavy South African operations run on. Fixed scope, published prices, code you own.",
};

const systems = [
  {
    n: "01",
    name: "Approvals",
    line: "Decisions stop living in inboxes.",
    body: "Routed chains with thresholds, delegation and escalation. Every decision carries a name, a time, a value and a reason.",
  },
  {
    n: "02",
    name: "Capture",
    line: "The record is made where the work happens.",
    body: "Validated at the point of entry, on a phone, in a yard, underground. No transcription, no forms filled in afterwards from memory.",
  },
  {
    n: "03",
    name: "Escalation",
    line: "Nothing waits for someone to notice.",
    body: "Thresholds that fire the day a number moves, to the person who can act, with the history attached.",
  },
  {
    n: "04",
    name: "Reporting",
    line: "The pack builds itself.",
    body: "Live operational views with drill-down to the underlying job. Month-end stops being three days of copy-paste.",
  },
  {
    n: "05",
    name: "Portals",
    line: "The handover disappears.",
    body: "Clients, contractors and crews working in the same record, each seeing exactly what they should and nothing else.",
  },
  {
    n: "06",
    name: "Intelligence",
    line: "Judgement stays with your people.",
    body: "Classification, triage and drafting inside the workflow where it measurably helps — with a person on every consequential call.",
  },
];

const phases = [
  { letter: "D", name: "Process Review", price: RATES.review, note: "Half a day on site" },
  { letter: "M", name: "Systems Audit", price: RATES.audit, note: "Three findings, costed" },
  { letter: "A", name: "Proof-of-Value Pilot", price: `from ${RATES.pilotFrom}`, note: "One workflow, four to six weeks" },
  { letter: "C", name: "Core System Build", price: `${RATES.buildFrom}–${RATES.buildTo}`, note: "Phased, priced per phase" },
  { letter: "S", name: "Managed Retainer", price: `from ${RATES.retainerCare}/mo`, note: "Optional, never a condition" },
];

export default function CinemaHome() {
  return (
    <>
      {/* ══════════ HERO — the product, working ══════════ */}
      <section className="relative isolate overflow-hidden pt-32 pb-24 lg:pt-40">
        {/* Light seated behind the app frame, not washed over the section */}
        <div className="k-glow -z-10" style={{ top: "120px" }} aria-hidden="true" />

        <div className="k-shell">
          <Rise>
            <p className="k-mono">Operational systems · South Africa</p>
          </Rise>

          <Rise step={1}>
            <h1 className="k-hero mt-6 max-w-[21ch]">
              The operations system your business is missing.
            </h1>
          </Rise>

          <Rise step={2}>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <p className="k-lead max-w-[52ch]">
                Approvals, capture, escalation and reporting in one place — built
                around how your operation already runs. This is one we built.
                Click it.
              </p>
              <div className="flex shrink-0 gap-3">
                <Link href="/contact" className="k-btn k-btn--solid">
                  Start a project
                </Link>
                <Link href="/pricing" className="k-btn k-btn--ghost">
                  See pricing
                </Link>
              </div>
            </div>
          </Rise>

          {/* The demo itself */}
          <Rise step={3} className="relative mt-16">
            <div className="k-horizon" style={{ top: "-1px" }} aria-hidden="true" />
            <OpsConsole />
          </Rise>

          <Rise className="mt-5">
            <p className="k-mono">
              Live demo · approve a request and watch the queue, the counts and the
              audit trail update · records are invented
            </p>
          </Rise>
        </div>
      </section>

      {/* ══════════ STATEMENT ══════════ */}
      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">01 — Point of view</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-state mt-10 max-w-[17ch]">
              The best system is the one nobody mentions.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-10">
              Software that gets talked about is usually software that is getting
              in the way. What we build is meant to vanish into the work — the
              request that routes itself, the check that never gets skipped, the
              report that was already correct when you opened it.
            </p>
          </Rise>

          <div className="mt-20 grid gap-10 sm:grid-cols-3">
            {[
              ["1", "system", "Not a stack of tools that almost talk to each other."],
              ["0", "lock-in", "Mainstream technology, source and documentation yours."],
              ["24/7", "unattended", "It holds at 3am on a Sunday, or it is not finished."],
            ].map(([value, unit, note], i) => (
              <Rise key={unit} step={(i % 3) as 0 | 1 | 2}>
                <div style={{ borderTop: "1px solid var(--hair)" }} className="pt-6">
                  <p className="k-num text-[52px] leading-none">{value}</p>
                  <p className="k-mono mt-3">{unit}</p>
                  <p className="k-sm mt-4">{note}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FULL-BLEED PLATE ══════════ */}
      <section className="relative isolate flex min-h-[85svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-10">
          <Photo
            src="/imagery/industries/industrial.jpg"
            sizes="100vw"
            scrim="bottom"
            position="88% 46%"
          />
        </Rise>

        <div className="k-shell relative pb-20">
          <div className="pointer-events-none absolute right-0 top-[-140px] hidden lg:block">
            <Rise step={1}>
              <UptimeCard />
            </Rise>
          </div>
          <Rise>
            <p className="k-mono k-mono--ember">Scale</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-7 max-w-[20ch]">
              Thousands of moving parts. One place they are all accounted for.
            </h2>
          </Rise>
        </div>
      </section>

      {/* ══════════ SYSTEMS ══════════ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">02 — What we build</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-8 max-w-[18ch]">
              Six layers. Shaped to one operation.
            </h2>
          </Rise>

          <div className="mt-20">
            {systems.map((system) => (
              <Rise key={system.n}>
                <article className="k-row md:grid-cols-[80px_minmax(0,1fr)_minmax(0,1.1fr)] md:items-baseline">
                  <span className="k-mono k-mono--ember">{system.n}</span>
                  <div>
                    <h3 className="k-sub">{system.name}</h3>
                    <p className="k-lead mt-2">{system.line}</p>
                  </div>
                  <p className="k-sm">{system.body}</p>
                </article>
              </Rise>
            ))}
          </div>

          <Rise className="mt-14">
            <Link href="/systems" className="k-link">
              Every layer in detail
            </Link>
          </Rise>
        </div>
      </section>

      {/* ══════════ REACH ══════════ */}
      <section className="relative isolate min-h-[92svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-[-16%] -z-10 w-[92%] opacity-90 lg:right-[-2%] lg:w-[58%]">
          <AfricaMap />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(100deg, rgba(8,9,10,0.97) 0%, rgba(8,9,10,0.88) 30%, rgba(8,9,10,0.40) 58%, rgba(8,9,10,0) 80%)",
          }}
        />

        <div className="k-shell relative flex min-h-[92svh] items-center">
          <div>
          <Rise>
            <p className="k-mono k-mono--ember">Sectors</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-state mt-8 max-w-[15ch]">
              Where a small slip costs a large amount.
            </h2>
          </Rise>
          <Rise step={2}>
            <div className="mt-12 flex flex-wrap gap-x-12 gap-y-5">
              {[
                "Mining and minerals",
                "Agriculture and agri-processing",
                "Logistics and distribution",
                "Industrial and manufacturing",
              ].map((sector) => (
                <span key={sector} className="k-sub" style={{ color: "var(--warm-70)" }}>
                  {sector}
                </span>
              ))}
            </div>
          </Rise>
          </div>
        </div>
      </section>

      {/* ══════════ ENGAGEMENT ══════════ */}
      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">03 — How it starts</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-8 max-w-[20ch]">
              Five steps. Stop after any of them.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-8">
              Each one is a fixed price against a scope written down before work
              begins. Published, so you never have to book a call to find out what
              something costs.
            </p>
          </Rise>

          <div className="mt-20">
            {phases.map((phase) => (
              <Rise key={phase.letter}>
                <div className="k-row md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-baseline">
                  <span
                    className="k-num text-[28px] leading-none"
                    style={{ color: "var(--ember)" }}
                  >
                    {phase.letter}
                  </span>
                  <h3 className="k-sub">{phase.name}</h3>
                  <p className="k-sm">{phase.note}</p>
                  <span className="k-num text-[20px] md:text-right">{phase.price}</span>
                </div>
              </Rise>
            ))}
          </div>

          <Rise className="mt-14 flex flex-wrap items-center gap-10">
            <Link href="/pricing" className="k-link">
              Full price list and terms
            </Link>
            <Link href="/get-off-excel" className="k-link">
              Get Off Excel — {RATES.getOffExcel}, four weeks
            </Link>
          </Rise>
        </div>
      </section>

      {/* ══════════ CLOSE ══════════ */}
      <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-10">
          <Photo
            src="/imagery/industries/agriculture.jpg"
            sizes="100vw"
            scrim="bottom"
            position="center"
          />
        </Rise>

        <div className="k-shell relative pb-20">
          <Rise>
            <p className="k-mono k-mono--ember">Start</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-state mt-8 max-w-[16ch]">
              Bring us the process that keeps going wrong.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-9">
              Half a day on site, {RATES.review}, and the fee comes off whatever you
              commission next. If the honest answer is that you should not build
              anything, that is what we will tell you.
            </p>
          </Rise>
          <Rise step={3}>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="k-btn k-btn--solid">
                Start a project
              </Link>
              <Link href="/method" className="k-btn k-btn--ghost">
                Read the method
              </Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
