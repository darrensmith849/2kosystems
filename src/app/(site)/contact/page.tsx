import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import PageHero from "@/components/cinema/PageHero";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import ContactForm from "@/components/cinema/ContactForm";
import PublicEnquiryDecisionTree from "@/components/cinema/PublicEnquiryDecisionTree";
import { Panel, QueueRows, EventFeed, Pill } from "@/components/cinema/instruments";
import { RATES } from "@/lib/pricing";

export const metadata: Metadata = completePageMetadata({
  title: "Bring Us the Result — Start with 2KO",
  description:
    "Tell 2KO where work waits, gets repeated or depends on somebody remembering. We will recommend the smallest appropriate next step.",
  alternates: { canonical: "/contact" },
});

const interests = new Set([
  "process-review",
  "audit",
  "automation",
  "systems-automation",
  "training",
  "sigmafy",
  "care",
  "managed-systems",
  "improvement-programme",
  "operational-excellence",
  "transformation-office",
  "outcome-partnership",
  "get-off-excel",
  "job-card-system",
  "sheq-incident-reporting",
  "contractor-compliance",
  "stock-and-asset-register",
  "website-project",
]);

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string }>;
}) {
  const params = await searchParams;
  const initialInterest = params.interest && interests.has(params.interest) ? params.interest : "";

  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title="Bring us the process that keeps going wrong."
        titleClass="max-w-[16ch]"
        lead={
          <>
            Tell us where the work waits, gets repeated or depends on somebody
            remembering. We will tell you whether the next step is a process
            review, an audit, training, automation—or no build at all.
          </>
        }
      >
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <span className="k-mono k-mono--ember">Process brief · intake</span>
            <span className="k-mono">No sensitive records</span>
          </div>
          <div className="grid sm:grid-cols-[minmax(0,1.35fr)_minmax(0,.65fr)]">
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="k-mono">Useful first description</p>
              <p className="k-sub mt-5 max-w-[42ch]">“This process touches six people, waits at approval, and nobody can see where a request is.”</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <Pill tone="good">The process</Pill>
                <Pill tone="warn">Where it fails</Pill>
                <Pill>Who it affects</Pill>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <p className="k-mono">Routing rule</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--signal)] shadow-[0_0_18px_var(--signal)]" aria-hidden="true" />
                <p className="k-sub">A person reads it</p>
              </div>
              <p className="k-sm mt-4">No automated sales sequence. No obligation to proceed.</p>
            </div>
          </div>
        </div>
      </PageHero>

      <section className="relative isolate flex min-h-[86svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20">
          <Photo src="/imagery/contact/hero-v1.webp" priority sizes="100vw" scrim="bottom" position="center" />
        </Rise>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/78 via-black/22 to-black/58" aria-hidden="true" />
        <div className="k-shell grid gap-12 pb-20 pt-40 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-end">
          <div>
            <Rise><p className="k-mono k-mono--ember">A low-friction first handoff</p></Rise>
            <Rise step={1}><h2 className="k-state mt-8 max-w-[14ch]">You bring the symptom. We help find the next decision.</h2></Rise>
          </div>
          <Rise step={2}>
            <ol className="overflow-hidden rounded-2xl border border-white/10 bg-black/72 backdrop-blur-xl">
              {[
                ["Send", "Describe the process in ordinary language.", "Now"],
                ["Fit", "We test whether there is a useful piece of work.", "+1 day"],
                ["Decide", "Agree the smallest next step—or no engagement.", "Next"],
              ].map(([title, body, time], index) => (
                <li key={title} className="grid grid-cols-[42px_minmax(0,.55fr)_minmax(0,1fr)] items-baseline gap-4 border-b border-white/10 px-5 py-7 last:border-b-0 sm:grid-cols-[48px_minmax(0,.55fr)_minmax(0,1fr)_64px] sm:gap-5 sm:px-6">
                  <span className="k-mono k-mono--ember">0{index + 1}</span>
                  <h3 className="k-sub">{title}</h3>
                  <p className="k-sm">{body}</p>
                  <span className="k-mono hidden text-right sm:block">{time}</span>
                </li>
              ))}
            </ol>
          </Rise>
        </div>
      </section>

      <section id="what-happens-next" className="eq-section">
        <div className="k-shell eq-section-inner">
          <div className="eq-intro">
            <Rise>
              <div><p className="k-mono k-mono--ember">WHAT HAPPENS AFTER YOU ENQUIRE</p><h2>One conversation. The right branch from there.</h2></div>
            </Rise>
            <Rise step={1}>
              <div><p>Not every enquiry is pushed into the same service. We establish what is already known, what still needs evidence and whether intervention is justified—then recommend the smallest responsible next step.</p><a href="#process-brief" className="k-link">Send a process brief ↓</a></div>
            </Rise>
          </div>
          <Rise step={2}><PublicEnquiryDecisionTree /></Rise>
          <Rise className="eq-caveat"><span>TYPICAL, NOT RIGID</span><p>The route depends on the clarity, scale and evidence already available. A defined requirement may move directly to scope; an unclear one may need diagnosis first.</p></Rise>
        </div>
      </section>

      <section id="process-brief" className="k-band k-band--2 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-12 top-24 text-[clamp(120px,22vw,320px)] font-semibold leading-none tracking-[-.09em] text-white/[.018]" aria-hidden="true">START</div>
        <div className="k-shell relative">
          <div className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <div>
              <Rise><p className="k-mono k-mono--ember">Your process brief</p></Rise>
              <Rise step={1}><h2 className="k-title mt-6 max-w-[20ch]">Enough context to have a useful first conversation.</h2></Rise>
            </div>
            <Rise step={2}><p className="k-sm">You do not need a requirements document. A short description of the process, the people it touches and the failure pattern is enough.</p></Rise>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
            <Rise>
              <div className="rounded-2xl border border-[var(--hair-2)] bg-black/35 p-5 shadow-[0_30px_90px_rgba(0,0,0,.28)] sm:p-8">
                <ContactForm initialInterest={initialInterest} />
              </div>
            </Rise>

            <Rise step={1}>
              <div className="flex flex-col gap-5 lg:sticky lg:top-24">
                <Panel label="What happens next" meta="Typical">
                  <EventFeed
                    lines={[
                      { time: "+1 day", text: "A reply from a person, not a sequence", tone: "good" },
                      { time: "+3 days", text: "Fit conversation · free, no sales deck" },
                      { time: "Next", text: "Smallest appropriate engagement agreed" },
                      { time: "Decision", text: "Process, training, automation or no build", tone: "good" },
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
        </div>
      </section>

      <section className="k-band relative overflow-hidden">
        <div className="k-shell">
          <Rise><p className="k-mono k-mono--ember">If you want to choose first</p></Rise>
          <Rise step={1}><h2 className="k-title mt-6 max-w-[22ch]">Match the starting point to the decision you need.</h2></Rise>
          <div className="mt-12 border-t border-[var(--hair-2)]">
            {[
              { number: "01", label: "The constraint is unclear", body: `Walk one process with us for half a day and receive a concise build-or-do-not-build recommendation for ${RATES.review}.`, href: "/process-review", cta: "See the Process Review" },
              { number: "02", label: "The investment needs evidence", body: "Quantify three operational opportunities and the best intervention before deciding what to build.", href: "/audit", cta: "See the Opportunity Audit" },
              { number: "03", label: "You want the whole operating logic", body: "See how diagnosis, improvement, training, automation and control fit into one method.", href: "/method", cta: "Read the method" },
            ].map((item) => (
              <Rise key={item.label}>
                <Link href={item.href} className="group grid gap-5 border-b border-[var(--hair-2)] py-8 transition-colors hover:bg-white/[.025] md:grid-cols-[54px_minmax(0,.75fr)_minmax(0,1fr)_auto] md:items-baseline md:px-5">
                  <span className="k-mono k-mono--ember">{item.number}</span>
                  <h3 className="k-sub">{item.label}</h3>
                  <p className="k-sm">{item.body}</p>
                  <span className="k-link whitespace-nowrap">{item.cta} →</span>
                </Link>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[76svh] items-end overflow-hidden">
        <Rise variant="settle" className="absolute inset-0 -z-20"><Photo src="/imagery/contact/start-conversation-v1.webp" sizes="100vw" scrim="bottom" position="center" /></Rise>
        <div className="absolute inset-0 -z-10 bg-black/48" aria-hidden="true" />
        <div className="k-shell pb-20 pt-40">
          <Rise><p className="k-mono k-mono--ember">No polished brief required</p></Rise>
          <Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Start with the sentence people keep saying at work.</h2></Rise>
          <Rise step={2}><a href="#process-brief" className="k-btn k-btn--solid mt-8">Send the process brief</a></Rise>
        </div>
      </section>
    </>
  );
}
