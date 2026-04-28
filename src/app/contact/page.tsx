import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import AmbientMotion from "@/components/home/AmbientMotion";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speak to a real agent at 2KO Systems. Send a message and the team will be in touch within one business day.",
};

const NEXT_STEPS = [
  "We review what you've sent and the right person picks it up.",
  "We schedule a short call to map the operational pain.",
  "We agree the smallest scope worth starting with — usually a Systems Audit.",
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        {/* Ambient mesh — same atmosphere we use on the home page */}
        <AmbientMotion variant="mesh" />

        {/* Soft accent glow at the top of the page */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(15,123,58,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-32 md:pt-40">
          <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1fr_1.1fr]">
            {/* Left – context */}
            <div className="reveal-up">
              <span className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                Contact
              </span>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl md:text-5xl">
                Speak to a real agent.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
                Tell us a bit about the workflow or system you want to improve,
                and a member of the 2KO Systems team will reach out within one
                business day.
              </p>

              {/* Animated three-step flow */}
              <div className="mt-10">
                <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted2">
                  What happens next
                </h2>

                <ol className="contact-steps relative pl-2">
                  {/* Vertical flow rail (only visible on the steps area) */}
                  <span
                    aria-hidden="true"
                    className="contact-steps-rail absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/0 via-accent/40 to-accent/0"
                  />
                  {/* Travelling pulse dot */}
                  <span
                    aria-hidden="true"
                    className="contact-steps-pulse absolute left-[15px] h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(15,123,58,0.8)]"
                  />

                  {NEXT_STEPS.map((item, i) => (
                    <li
                      key={item}
                      className="contact-step relative mb-6 flex items-start gap-4 last:mb-0"
                      style={{ animationDelay: `${i * 0.15 + 0.2}s` }}
                    >
                      <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/40 bg-surface text-[11px] font-bold text-accent">
                        {i + 1}
                      </span>
                      <span className="pt-2 text-sm leading-relaxed text-muted">
                        {item}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-10">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted2">
                  Direct line
                </h2>
                <a
                  href="mailto:darren@2kosystems.com"
                  className="text-sm text-accent transition-colors hover:text-accent2"
                >
                  darren@2kosystems.com
                </a>
              </div>
            </div>

            {/* Right – form */}
            <div className="card-tilt card-sweep reveal-up rounded-2xl border border-border bg-surface p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-text">Send a message</h2>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
                  <span className="contact-live-dot relative inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  Live · 1 business day
                </span>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
