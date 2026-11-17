import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Link from "next/link";
import PageHero from "@/components/cinema/PageHero";
import Photo from "@/components/cinema/Photo";
import Rise from "@/components/cinema/Rise";
import ContactForm from "@/components/cinema/ContactForm";
import PublicEnquiryDecisionTree from "@/components/cinema/PublicEnquiryDecisionTree";
import { Panel, QueueRows, EventFeed, Pill } from "@/components/cinema/instruments";

export const metadata: Metadata = completePageMetadata({
  title: "Plan a Lean and Six Sigma Deployment",
  description:
    "Tell 2KO how many people you want to develop and what results you need. We will plan the first cohort, the belts and how the results will be measured.",
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
        title="Plan a deployment that proves itself."
        titleClass="max-w-[16ch]"
        lead={
          <>
            Tell us how many people you want to develop and the results you
            need. We will plan the first cohort, the belts and the projects with
            you, and show you how every result will be measured.
          </>
        }
      >
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <span className="k-mono k-mono--ember">Programme brief · intake</span>
            <span className="k-mono">No sensitive records</span>
          </div>
          <div className="grid sm:grid-cols-[minmax(0,1.35fr)_minmax(0,.65fr)]">
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="k-mono">Useful first description</p>
              <p className="k-sub mt-5 max-w-[42ch]">“We have about 2,000 people in operations, and we want our first 20 Green Belts running projects this year.”</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <Pill tone="good">How many people</Pill>
                <Pill tone="warn">The results you need</Pill>
                <Pill>Who sponsors it</Pill>
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
            <Rise step={1}><h2 className="k-state mt-8 max-w-[14ch]">You bring the ambition. We plan the first cohort.</h2></Rise>
          </div>
          <Rise step={2}>
            <ol className="overflow-hidden rounded-2xl border border-white/10 bg-black/72 backdrop-blur-xl">
              {[
                ["Send", "Tell us the people, the belts and the results you need.", "Now"],
                ["Fit", "We test whether training is the right answer.", "+1 day"],
                ["Plan", "Agree the first cohort and its projects—or no engagement.", "Next"],
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
              <div><p>Not every enquiry is pushed into the same service. We establish what is already known, what still needs evidence and whether intervention is justified—then recommend the smallest responsible next step.</p><a href="#process-brief" className="k-link">Send us the brief ↓</a></div>
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
              <Rise><p className="k-mono k-mono--ember">Your programme brief</p></Rise>
              <Rise step={1}><h2 className="k-title mt-6 max-w-[20ch]">Enough context to have a useful first conversation.</h2></Rise>
            </div>
            <Rise step={2}><p className="k-sm">You do not need a requirements document. A rough number of people, the belts you have in mind and the results that matter are enough.</p></Rise>
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
                      { time: "Next", text: "First cohort and projects agreed" },
                      { time: "Decision", text: "A pilot cohort, waves or a full deployment", tone: "good" },
                    ]}
                  />
                </Panel>

                <Panel label="Good to know" meta="Before you write">
                  <QueueRows
                    rows={[
                      { label: "Reply time", value: "1 business day", tone: "good" },
                      { label: "Scoping call", value: "Free", tone: "good" },
                      { label: "White Belt Online", value: "Free" },
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
              { number: "01", label: "You want to see the belts first", body: "What each belt learns, how long it takes and what people do on their projects.", href: "/training", cta: "See the belts" },
              { number: "02", label: "You want to see the platform", body: "How every belt learns, works and is measured on Sigmafy, from one person to thousands.", href: "/sigmafy", cta: "See Sigmafy" },
              { number: "03", label: "You need a long-term partner", body: "Coaching, sign-off and savings tracking across the whole programme, under one relationship.", href: "/managed-improvement", cta: "See partnerships" },
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
          <Rise step={1}><h2 className="k-state mt-8 max-w-[15ch]">Start with a number and an ambition.</h2></Rise>
          <Rise step={2}><a href="#process-brief" className="k-btn k-btn--solid mt-8">Send us the brief</a></Rise>
        </div>
      </section>
    </>
  );
}
