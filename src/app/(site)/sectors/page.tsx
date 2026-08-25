import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import Photo from "@/components/cinema/Photo";
import { Panel, QueueRows, Sparkline, Pill } from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Sectors",
  description:
    "Mining, agriculture, logistics and manufacturing — the heavy South African operations where a small process slip carries a large cost, and what 2KO Systems builds for each.",
};

const sectors = [
  {
    n: "01",
    name: "Mining and minerals",
    image: "/imagery/home/hero.jpg",
    position: "58% 45%",
    metric: "Downtime per hour",
    line: "The shift plan survives contact with reality, or it does not.",
    body: "Permit-to-work, equipment availability, contractor compliance and shift handover — each one a chain of approvals that currently lives across a radio call, a printed form and somebody's spreadsheet. When the handover fails, the cost is measured in hours of a stopped section.",
    builds: ["Permit and isolation workflows", "Contractor compliance registers", "Shift handover with an audit trail", "Availability and downtime reporting"],
    readouts: [
      { label: "Sections reporting", value: "14 / 14", tone: "good" as const },
      { label: "Permits open", value: "6" },
      { label: "Expired certifications", value: "0", tone: "good" as const },
      { label: "Handover gaps this week", value: "0", tone: "good" as const },
    ],
    points: [42, 48, 39, 55, 47, 61, 44, 38, 33, 29, 24, 21],
  },
  {
    n: "02",
    name: "Agriculture and agri-processing",
    image: "/imagery/industries/agriculture.jpg",
    position: "center",
    metric: "Perishable window",
    line: "The clock starts the moment it leaves the field.",
    body: "Intake, grading, cold chain, traceability and the packhouse's own paperwork — most of it captured on paper and rekeyed at night. By the time a discrepancy is visible in a report, the consignment has shipped and the window has closed.",
    builds: ["Intake and grading capture at the weighbridge", "Cold-chain exception alerting", "Traceability from block to pallet", "Compliance packs generated, not assembled"],
    readouts: [
      { label: "Intake captured on site", value: "100%", tone: "good" as const },
      { label: "Grading disputes", value: "2" },
      { label: "Cold-chain breaches", value: "0", tone: "good" as const },
      { label: "Trace time per pallet", value: "8 sec", tone: "good" as const },
    ],
    points: [30, 36, 33, 44, 52, 61, 68, 74, 79, 86, 91, 96],
  },
  {
    n: "03",
    name: "Logistics and distribution",
    image: "/imagery/industries/logistics.jpg",
    position: "center",
    metric: "Cost per consignment",
    line: "Thousands of moving parts, one place they are accounted for.",
    body: "Proof of delivery, exception handling, sub-contractor rates, claims and the invoice that has to reconcile against all of it. The margin is thin enough that a percentage point of unrecovered exceptions is the whole quarter.",
    builds: ["Proof of delivery captured by the driver", "Exception and claims workflow", "Sub-contractor rate cards and reconciliation", "Consignment-level cost reporting"],
    readouts: [
      { label: "PODs captured digitally", value: "98.6%", tone: "good" as const },
      { label: "Open exceptions", value: "11", tone: "warn" as const },
      { label: "Claims outside window", value: "0", tone: "good" as const },
      { label: "Invoice queries", value: "−62%", tone: "good" as const },
    ],
    points: [70, 66, 71, 62, 58, 54, 49, 45, 41, 38, 34, 31],
  },
  {
    n: "04",
    name: "Industrial and manufacturing",
    image: "/imagery/industries/warehouse.jpg",
    position: "center",
    metric: "Scrap and rework rate",
    line: "The improvement holds, or it quietly comes back.",
    body: "Quality checks, non-conformance, maintenance requests and the control plan a Green Belt wrote eighteen months ago. Almost every control method on that plan depends on a person remembering — which is exactly why the gain decays.",
    builds: ["In-line quality capture with validation", "Non-conformance and CAPA workflow", "Planned maintenance scheduling", "Control charts generated from live capture"],
    readouts: [
      { label: "First-time-right", value: "99.4%", tone: "good" as const },
      { label: "Open non-conformances", value: "3" },
      { label: "Overdue maintenance", value: "1", tone: "warn" as const },
      { label: "Manual control checks", value: "0", tone: "good" as const },
    ],
    points: [64, 58, 52, 47, 41, 36, 30, 26, 22, 18, 15, 12],
  },
];

export default function SectorsPage() {
  return (
    <>
      <section className="k-shell pt-32 pb-12 lg:pt-40">
        <Rise>
          <p className="k-mono k-mono--ember">Sectors</p>
        </Rise>
        <Rise step={1}>
          <h1 className="k-state mt-6 max-w-[16ch]">
            Where a small slip costs a large amount.
          </h1>
        </Rise>
        <Rise step={2}>
          <p className="k-lead k-measure mt-6">
            Heavy process, thin admin capacity, and a workflow that lives across
            four tools and a group chat. The sector changes and the vocabulary
            changes; the failure almost never does.
          </p>
        </Rise>
        <Rise step={3}>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {sectors.map((sector) => (
              <Pill key={sector.n}>{sector.name}</Pill>
            ))}
          </div>
        </Rise>
      </section>

      {sectors.map((sector, i) => (
        <div key={sector.n}>
          {/* Plate */}
          <section className="relative isolate flex min-h-[62svh] items-end overflow-hidden">
            <Rise variant="settle" className="absolute inset-0 -z-10">
              <Photo src={sector.image} sizes="100vw" scrim="bottom" position={sector.position} />
            </Rise>
            <div className="k-shell relative pb-12">
              <Rise>
                <p className="k-mono k-mono--ember">
                  {sector.n} — {sector.metric}
                </p>
              </Rise>
              <Rise step={1}>
                <h2 className="k-title mt-6 max-w-[20ch]">{sector.name}</h2>
              </Rise>
              <Rise step={2}>
                <p className="k-sub mt-5 max-w-[26ch]" style={{ color: "var(--warm-70)" }}>
                  {sector.line}
                </p>
              </Rise>
            </div>
          </section>

          {/* Detail */}
          <section className={i % 2 === 0 ? "k-band" : "k-band k-band--2"}>
            <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
              <div>
                <Rise>
                  <p className="k-lead k-measure">{sector.body}</p>
                </Rise>
                <Rise step={1}>
                  <p className="k-mono mt-10">What we typically build</p>
                  <ul className="mt-5">
                    {sector.builds.map((build, bi) => (
                      <li
                        key={build}
                        className="flex gap-4 py-3 text-[14px]"
                        style={{ borderTop: bi === 0 ? "1px solid var(--line-dark)" : "1px solid var(--hair)" }}
                      >
                        <span className="k-mono" style={{ color: "var(--ember)" }}>
                          {String(bi + 1).padStart(2, "0")}
                        </span>
                        <span>{build}</span>
                      </li>
                    ))}
                  </ul>
                </Rise>
              </div>

              <Rise step={2}>
                <Panel label={sector.name.split(" ")[0]} meta="Illustrative" float={i % 2 === 0 ? "on" : "slow"}>
                  <p className="k-mono">{sector.metric}</p>
                  <div className="mt-4">
                    <Sparkline points={sector.points} tone={i % 2 === 0 ? "ember" : "signal"} />
                  </div>
                  <div className="k-hairline mt-5 pt-4">
                    <QueueRows rows={sector.readouts} />
                  </div>
                </Panel>
              </Rise>
            </div>
          </section>
        </div>
      ))}

      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Start</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[20ch]">
                Not on this list? The failure is usually the same.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                We work anywhere the process is heavy and the admin is thin. Half a
                day on site, {RATES.review}, and you will know either way.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Book a process review
            </Link>
            <Link href="/systems" className="k-btn k-btn--ghost">
              See what we build
            </Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
