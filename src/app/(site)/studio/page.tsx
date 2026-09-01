import type { Metadata } from "next";
import PageHero from "@/components/cinema/PageHero";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import { Panel, Readout, QueueRows, EventFeed, Pill, StatusGrid } from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "About 2KO Systems — Process People Who Build Software",
  description:
    "The systems and automation arm of the 2KO group. Process improvement people who build software for established South African operations.",
  alternates: { canonical: "/studio" },
};

const principles = [
  {
    n: "01",
    title: "Process before technology",
    body: "We map how the work actually moves before anyone opens an editor. The system is shaped by the operation, not the other way around — and sometimes the honest answer is that no system is needed.",
  },
  {
    n: "02",
    title: "Fixed scope, fixed price",
    body: "Never billed hourly. An hourly rate transfers our estimation risk onto you and gives you no way to audit it. If we estimate badly, that is ours to absorb.",
  },
  {
    n: "03",
    title: "Evidence over assertion",
    body: "Every number in an audit shows its working, and every finding is marked Observed or Reported — what we watched happen, versus what we were told. The two never get blurred.",
  },
  {
    n: "04",
    title: "You own everything",
    body: "Source, documentation and data are yours from day one, on mainstream technology any competent developer can pick up. There is no proprietary platform and no lock-in.",
  },
  {
    n: "05",
    title: "Start narrow, prove it, scale",
    body: "One workflow first, with success criteria agreed before we begin. The pilot rolls forward into the build rather than being rebuilt, so nothing you pay for gets thrown away.",
  },
  {
    n: "06",
    title: "We will talk you out of it",
    body: "If off-the-shelf software already solves your problem, we say so. We would rather lose the sale than build you something you did not need — and it is the only reason our audits are worth commissioning.",
  },
];

export default function StudioPage() {
  return (
    <>
      <PageHero
        eyebrow="STUDIO"
        title="Process improvement people who build software."
        titleClass="max-w-[16ch]"
        lead="2KO Systems is the systems and automation arm of the 2KO group. The group has spent years inside South African operations doing operational improvement, training and accreditation — which is why we start with a process map rather than a feature list."
        ctas={[
          { href: "/contact", label: "Start a project" },
          { href: "/method", label: "How we work", ghost: true },
        ]}
      />

      {/* ═══ THE GROUP ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">01 — Where we come from</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[20ch]">
                We were in the plant before we were in the code.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                Most software firms arrive at an operation as strangers and ask what
                you want built. We arrive having spent a career watching processes
                fail in the same handful of ways, and we tend to know what to look
                for before anyone tells us.
              </p>
            </Rise>
            <Rise step={3}>
              <p className="k-lead k-measure mt-5">
                That is also why we are careful about what we promise. An
                improvement that depends on someone remembering will decay, and no
                amount of software changes that unless the control itself moves into
                the system.
              </p>
            </Rise>
          </div>

          <Rise step={1}>
            <div className="flex flex-col gap-5">
              <Panel label="Engagement mix" meta="Typical year" float="slow">
                <QueueRows
                  rows={[
                    { label: "Process reviews", value: "Most" },
                    { label: "Audits", value: "Fewer" },
                    { label: "Pilots", value: "Fewer still" },
                    { label: "Builds", value: "Selective", tone: "good" },
                  ]}
                />
                <p className="k-mono mt-4">
                  Narrow at the top on purpose — not everything should be built
                </p>
              </Panel>
              <Panel label="Systems under care" meta="Live">
                <Readout value="99.98%" unit="uptime · 90d" tone="good" />
                <div className="mt-4">
                  <StatusGrid count={30} incidents={[19]} />
                </div>
              </Panel>
            </div>
          </Rise>
        </div>
      </section>

      {/* ═══ WHAT WE DO NOT DO ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">Where we stop</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[24ch]">
                We do not touch the plant.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-6">
                We are not engineers and we do not pretend to be. We will not
                reduce your changeover time, retune a circuit, redesign a layout
                or specify equipment. Where a physical process needs improving,
                that is your team&rsquo;s work, or a specialist&rsquo;s.
              </p>
            </Rise>
            <Rise step={3}>
              <p className="k-lead k-measure mt-5">
                What we build is the layer that tells you whether the plant is
                doing what you already decided it should — the check that cannot
                be skipped, the reading captured where it is taken, the number
                that escalates before anyone has to notice it. The improvement is
                physical. The control is information. We only do the second one.
              </p>
            </Rise>
          </div>

          <Rise step={1}>
            <Panel label="Boundary" meta="Plainly">
              <QueueRows
                rows={[
                  { label: "Reduce changeover time", value: "Not us", tone: "warn" },
                  { label: "Prove it stayed reduced", value: "Us", tone: "good" },
                  { label: "Specify equipment", value: "Not us", tone: "warn" },
                  { label: "Track its availability", value: "Us", tone: "good" },
                  { label: "Run your safety programme", value: "Not us", tone: "warn" },
                  { label: "Make its evidence retrievable", value: "Us", tone: "good" },
                ]}
              />
            </Panel>
          </Rise>
        </div>
      </section>

      {/* ═══ PRINCIPLES ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">02 — How we work</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[20ch]">Six things we hold to.</h2>
          </Rise>

          <div className="mt-12 grid gap-x-14 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle, i) => (
              <Rise key={principle.n} step={(i % 3) as 0 | 1 | 2}>
                <div style={{ borderTop: "1px solid var(--line-dark)" }} className="pt-6">
                  <p className="k-mono k-mono--ember">{principle.n}</p>
                  <h3 className="k-sub mt-4">{principle.title}</h3>
                  <p className="k-sm mt-3">{principle.body}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
          <Rise className="lg:order-2">
            <div className="flex flex-col gap-5">
              <Panel label="Engagement log" meta="Sample">
                <EventFeed
                  lines={[
                    { time: "D 01", text: "Fieldwork · two levels interviewed", tone: "good" },
                    { time: "D 02", text: "Findings costed · working shown", tone: "good" },
                    { time: "D 09", text: "Audit issued · one pilot named" },
                    { time: "D 21", text: "Pilot scope signed · criteria agreed", tone: "good" },
                    { time: "W 06", text: "Pilot accepted · source transferred", tone: "good" },
                  ]}
                />
              </Panel>
              <Panel label="Commitments" meta="Every engagement">
                <QueueRows
                  rows={[
                    { label: "Scope in writing first", value: "Always", tone: "good" },
                    { label: "Hourly billing", value: "Never", tone: "good" },
                    { label: "Source code handed over", value: "Day one", tone: "good" },
                    { label: "Data residency stated", value: "Before signing", tone: "good" },
                  ]}
                />
              </Panel>
            </div>
          </Rise>

          <div className="lg:order-1">
            <Rise>
              <p className="k-mono k-mono--ember">03 — Working with us</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[20ch]">
                The things a procurement department asks.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                We are a registered South African company invoicing in rand, with
                published rates and standard terms. Company registration, VAT
                number, B-BBEE level and insurance details go out with every
                proposal and are available before you ask.
              </p>
            </Rise>
            <Rise step={3}>
              <div className="mt-8 flex flex-wrap gap-2.5">
                <Pill tone="good">Registered in South Africa</Pill>
                <Pill tone="good">Invoiced in rand</Pill>
                <Pill>POPIA-aware by design</Pill>
                <Pill tone="warn">Data residency your choice</Pill>
              </div>
            </Rise>
            <Rise step={3}>
              <p className="k-mono mt-8">
                Part of the 2KO group · 2ko.co.za
              </p>
            </Rise>
          </div>
        </div>
      </section>

      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Start</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[20ch]">
                Bring us the process that keeps going wrong.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                Half a day on site, {RATES.review}, and the fee comes off whatever
                you commission next.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Start a project
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
