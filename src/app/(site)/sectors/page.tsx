import type { Metadata } from "next";
import PageHero from "@/components/cinema/PageHero";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import Photo from "@/components/cinema/Photo";
import SectorArtefact from "@/components/cinema/SectorArtefact";
import { Pill } from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Systems for Mining, Agriculture & Logistics",
  description:
    "Operational systems for South African mining, agriculture, logistics and manufacturing — where a small process slip carries a large cost.",
  alternates: { canonical: "/sectors" },
};

const sectors = [
  {
    n: "01",
    artefact: "mining" as const,
    name: "Mining and minerals",
    image: "/imagery/home/hero.jpg",
    position: "58% 45%",
    metric: "Downtime per hour",
    line: "The shift plan survives contact with reality, or it does not.",
    body: "Permit-to-work, equipment availability, contractor compliance and shift handover — each one a chain of approvals that currently lives across a radio call, a printed form and somebody's spreadsheet. When the handover fails, the cost is measured in hours of a stopped section.",
    builds: ["Permit and isolation workflows", "Contractor compliance registers", "Shift handover with an audit trail", "Availability and downtime reporting"],
  },
  {
    n: "02",
    artefact: "agriculture" as const,
    name: "Agriculture and agri-processing",
    image: "/imagery/industries/agriculture.jpg",
    position: "center",
    metric: "Perishable window",
    line: "The clock starts the moment it leaves the field.",
    body: "Intake, grading, cold chain, traceability and the packhouse's own paperwork — most of it captured on paper and rekeyed at night. By the time a discrepancy is visible in a report, the consignment has shipped and the window has closed.",
    builds: ["Intake and grading capture at the weighbridge", "Cold-chain exception alerting", "Traceability from block to pallet", "Compliance packs generated, not assembled"],
  },
  {
    n: "03",
    artefact: "logistics" as const,
    name: "Logistics and distribution",
    image: "/imagery/industries/logistics.jpg",
    position: "center",
    metric: "Cost per consignment",
    line: "Thousands of moving parts, one place they are accounted for.",
    body: "Proof of delivery, exception handling, sub-contractor rates, claims and the invoice that has to reconcile against all of it. The margin is thin enough that a percentage point of unrecovered exceptions is the whole quarter.",
    builds: ["Proof of delivery captured by the driver", "Exception and claims workflow", "Sub-contractor rate cards and reconciliation", "Consignment-level cost reporting"],
  },
  {
    n: "04",
    artefact: "manufacturing" as const,
    name: "Industrial and manufacturing",
    image: "/imagery/industries/warehouse.jpg",
    position: "center",
    metric: "Scrap and rework rate",
    line: "The improvement holds, or it quietly comes back.",
    body: "Quality checks, non-conformance, maintenance requests and the control plan a Green Belt wrote eighteen months ago. Almost every control method on that plan depends on a person remembering — which is exactly why the gain decays.",
    builds: ["In-line quality capture with validation", "Non-conformance and CAPA workflow", "Planned maintenance scheduling", "Control charts generated from live capture"],
  },
];

export default function SectorsPage() {
  return (
    <>
      <PageHero
        eyebrow="SECTORS"
        title="Where a small slip costs a large amount."
        titleClass="max-w-[15ch]"
        lead="Heavy process, thin admin capacity, and a workflow that lives across four tools and a group chat. The sector changes and the vocabulary changes; the failure almost never does."
        ctas={[
          { href: "/contact", label: "Book a process review" },
          { href: "/systems", label: "See what we build", ghost: true },
        ]}
      >
        <div className="mt-7 flex flex-wrap gap-2.5">
          {sectors.map((sector) => (
            <Pill key={sector.n}>{sector.name}</Pill>
          ))}
        </div>
      </PageHero>

      {sectors.map((sector, i) => (
        <div key={sector.n}>
          {/* Plate */}
          <section className="relative isolate flex min-h-[72svh] items-end overflow-hidden lg:min-h-[80svh]">
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
          <section
            className={`k-band k-phase-section${i % 2 === 0 ? "" : " k-band--2"}`}
          >
            <div className="k-shell k-phase-grid">
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

              {/* The same Panel four times made the sectors look interchangeable,
                  which is the opposite of what the page argues. Each now shows
                  the document that sector actually runs on. */}
              <Rise step={2}>
                <SectorArtefact kind={sector.artefact} />
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
