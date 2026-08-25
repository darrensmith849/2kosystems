import type { Metadata } from "next";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";
import QuoteBuilder from "@/components/cinema/QuoteBuilder";
import { Pill } from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Build a Scope — What Would It Cost",
  description: `Answer five questions and see what your system would cost, with the scope and the exclusions. Prices from ${RATES.review} to ${RATES.buildTo}, all published. No email required to see the price.`,
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pt-32 pb-12 lg:pt-40">
        <div className="k-glow -z-10" style={{ top: "20px" }} aria-hidden="true" />
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">Scope builder</p>
          </Rise>
          <Rise step={1}>
            <h1 className="k-hero mt-6 max-w-[19ch]">
              Five questions. Then the price, on screen.
            </h1>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-6">
              This lands on one of our published prices, or it tells you that your
              problem does not fit a fixed-price box and why. It will not invent a
              number — every figure it shows is one you can already find on this
              site.
            </p>
          </Rise>
          <Rise step={3}>
            <div className="mt-7 flex flex-wrap gap-2">
              <Pill tone="good">No email to see the price</Pill>
              <Pill>Exclusions shown, not hidden</Pill>
              <Pill tone="warn">Says no when it should</Pill>
            </div>
          </Rise>
        </div>
      </section>

      <section className="k-shell pb-16">
        <Rise>
          <QuoteBuilder />
        </Rise>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Honest about the limits</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[24ch]">
                A form cannot see your operation. A person can.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                Five questions get you a defensible starting point, not a contract.
                What they cannot tell you is whether the process you described is
                the one that is actually costing you — which is what the{" "}
                {RATES.review} Half-Day Process Review is for, and why that fee
                comes off whatever you commission next.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Book a scoping call
            </Link>
            <Link href="/pricing" className="k-btn k-btn--ghost">
              See every price
            </Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
