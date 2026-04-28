import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speak to a real agent at 2KO Systems. Send a message and the team will be in touch within one business day.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(15,123,58,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-32 md:pt-40">
          <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1fr_1.1fr]">
            {/* Left – context */}
            <div>
              <span className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                Contact
              </span>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl md:text-5xl">
                Speak to a real agent.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
                Tell us a bit about the workflow or system you want to improve, and a member
                of the 2KO Systems team will reach out within one business day.
              </p>

              <div className="mt-10">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted2">
                  What happens next
                </h2>
                <ol className="flex flex-col gap-3">
                  {[
                    "We review what you've sent and the right person picks it up.",
                    "We schedule a short call to map the operational pain.",
                    "We agree the smallest scope worth starting with — usually a Systems Audit.",
                  ].map((item, i) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 text-[10px] font-bold text-accent">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-muted">{item}</span>
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
            <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
              <h2 className="mb-6 text-xl font-semibold text-text">Send a message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
