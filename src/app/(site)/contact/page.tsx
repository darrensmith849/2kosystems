import type { Metadata } from "next";
import Rise from "@/components/cinema/Rise";
import ContactForm from "@/components/cinema/ContactForm";
import { Panel, QueueRows, EventFeed, Pill } from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Contact — Book a R7,500 Half-Day Process Review",
  description:
    "Book a half-day process review with 2KO Systems. Fixed price, credited against whatever you commission next.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="k-shell pt-40 pb-20 lg:pt-48">
        <Rise>
          <p className="k-mono k-mono--ember">Contact</p>
        </Rise>
        <Rise step={1}>
          <h1 className="k-state mt-6 max-w-[18ch]">
            Bring us the process that keeps going wrong.
          </h1>
        </Rise>
        <Rise step={2}>
          <p className="k-lead k-measure mt-6">
            If you already know what needs building, this is a thirty-minute call
            and a fixed price — no site visit required. If something is wrong and
            you cannot name it, that is what the {RATES.review} Half-Day Process
            Review is for, and the fee comes off whatever you commission next.
          </p>
        </Rise>
        <Rise step={3}>
          <div className="mt-8 flex flex-wrap gap-2">
            <Pill tone="good">Free scoping call</Pill>
            <Pill>No site visit for fixed-price systems</Pill>
            <Pill tone="warn">On site only when it is needed</Pill>
          </div>
        </Rise>
      </section>

      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <Rise>
            <ContactForm />
          </Rise>

          <Rise step={1}>
            <div className="flex flex-col gap-5">
              <Panel label="What happens next" meta="Typical">
                <EventFeed
                  lines={[
                    { time: "+1 day", text: "A reply from a person, not a sequence", tone: "good" },
                    { time: "+3 days", text: "Thirty-minute call · free, no deck" },
                    { time: "+1 week", text: "Review scheduled on site" },
                    { time: "+2 weeks", text: "Memo issued · go or no-go", tone: "good" },
                  ]}
                />
              </Panel>

              <Panel label="Good to know" meta="Before you write">
                <QueueRows
                  rows={[
                    { label: "Reply time", value: "1 business day", tone: "good" },
                    { label: "Scoping call", value: "Free", tone: "good" },
                    { label: "Process review", value: RATES.review },
                    { label: "Added to a mailing list", value: "No", tone: "good" },
                  ]}
                />
                <div className="k-hairline mt-5 flex flex-wrap gap-2.5 pt-4">
                  <Pill tone="good">POPIA-aware</Pill>
                  <Pill>Rand invoicing</Pill>
                </div>
              </Panel>
            </div>
          </Rise>
        </div>
      </section>

      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">Also useful</p>
          </Rise>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Already know the problem", body: "If it is one spreadsheet that has outgrown itself, there is a fixed-price product for exactly that.", href: "/get-off-excel", cta: "Get Off Excel" },
              { label: "Want the numbers first", body: "Every engagement price and term is published, including the day rate for out-of-scope work.", href: "/pricing", cta: "See the price list" },
              { label: "Want to know how we run", body: "Five phases, fixed price each, and you can stop after any of them.", href: "/method", cta: "Read the method" },
            ].map((item, i) => (
              <Rise key={item.label} step={(i % 3) as 0 | 1 | 2}>
                <a href={item.href} className="k-card block h-full transition-colors">
                  <span className="k-mono">{item.label}</span>
                  <p className="k-sm mt-4">{item.body}</p>
                  <span className="k-link mt-5 inline-flex">{item.cta} →</span>
                </a>
              </Rise>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
