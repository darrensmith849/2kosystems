import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How 2KO Systems collects, uses, and protects your information when you interact with our website and chat assistant.",
};

export default function PrivacyPage() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:pt-40">
        <span className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          Legal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted2">Last updated: April 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted md:text-base">
          <div>
            <h2 className="mb-3 text-base font-semibold text-text md:text-lg">
              Who we are
            </h2>
            <p>
              2KO Systems is the systems & technology arm of the 2KO Group, based in South Africa. This policy explains how we handle the personal information you share with us through this website and our chat assistant, in line with the Protection of Personal Information Act (POPIA).
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-text md:text-lg">
              What we collect
            </h2>
            <p>
              When you interact with the chat assistant or request a Systems Audit, we collect the details you choose to share — typically your name, email address, optional phone number, and any context you provide about your business or workflow.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-text md:text-lg">
              How we use it
            </h2>
            <p>
              We use these details only to respond to your enquiry, route the right team member to you, and improve the quality of our service. We do not sell your information. We do not use it for unrelated marketing.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-text md:text-lg">
              The chat assistant
            </h2>
            <p>
              Our chat assistant uses an AI language model (provided by Anthropic) to draft responses. Conversations are kept in your browser session for the duration of your visit. When you escalate to a real agent, we send the chat transcript and your contact details through our email and CRM partner (Brevo) so the team has context for the follow-up.
            </p>
            <p className="mt-3">
              The assistant is not a substitute for legal, contractual or financial advice. Please verify any details with our team before acting on them.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-text md:text-lg">
              Data retention
            </h2>
            <p>
              Lead and enquiry details are retained for as long as we have an ongoing business relationship, after which they are deleted on request or in line with our standard retention schedule.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-text md:text-lg">
              Your rights
            </h2>
            <p>
              You have the right to access, correct, or request deletion of any personal information we hold about you. To exercise these rights, contact{" "}
              <a
                href="mailto:darren@2kosystems.com"
                className="text-accent transition-colors hover:text-accent2"
              >
                darren@2kosystems.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-text md:text-lg">
              Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. The most recent version will always be available at this URL.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
