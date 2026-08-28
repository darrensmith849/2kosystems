import type { Metadata } from "next";
import Rise from "@/components/cinema/Rise";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How 2KO Systems collects, uses and retains personal information from this website and its assistant, in line with POPIA. Your rights and how to exercise them.",
  alternates: { canonical: "/privacy" },
};

/**
 * Content carried across verbatim from the previous site. Legal wording is not
 * something to re-draft during a redesign — only the presentation changed.
 */
const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "Who we are",
    paragraphs: [
      "2KO Systems is the systems & technology arm of the 2KO Group, based in South Africa. This policy explains how we handle the personal information you share with us through this website and our chat assistant, in line with the Protection of Personal Information Act (POPIA).",
    ],
  },
  {
    title: "What we collect",
    paragraphs: [
      "When you interact with the chat assistant or request a Systems Audit, we collect the details you choose to share — typically your name, email address, optional phone number, and any context you provide about your business or workflow.",
    ],
  },
  {
    title: "How we use it",
    paragraphs: [
      "We use these details only to respond to your enquiry, route the right team member to you, and improve the quality of our service. We do not sell your information. We do not use it for unrelated marketing.",
    ],
  },
  {
    title: "The chat assistant",
    paragraphs: [
      "Our chat assistant uses an AI language model to draft responses. Conversations are kept in your browser session for the duration of your visit. When you escalate to a real agent, we email the chat transcript and your contact details to our team through Cloudflare Email Service so that whoever replies has the context.",
      "The assistant is not a substitute for legal, contractual or financial advice. Please verify any details with our team before acting on them.",
    ],
  },
  {
    title: "Cookies and advertising",
    paragraphs: [
      "We advertise on Google. If you reach this site from one of our ads, Google sets cookies in your browser so that we can tell whether the ad led to an enquiry or to nothing at all. Through this we see the pages visited on this site, and three specific actions: a contact form submitted, the scope builder completed, and a brief requested.",
      "We see that those actions happened. We do not send Google what you typed into them — not your answers, not your message, not your email address.",
      "When you arrive from an ad, Google adds an identifier to the link. We keep it in your browser's session storage for the duration of your visit so that an enquiry can be matched back to the ad it came from. It is discarded when you close the tab.",
      "You can turn off personalised Google advertising at myadcenter.google.com, or block cookies in your browser settings. Neither stops you using this site or contacting us.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "Lead and enquiry details are retained for as long as we have an ongoing business relationship, after which they are deleted on request or in line with our standard retention schedule.",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "You have the right to access, correct, or request deletion of any personal information we hold about you. To exercise these rights, contact darren@2kosystems.com.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. The most recent version will always be available at this URL.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="k-shell max-w-3xl pt-32 pb-20 lg:pt-40">
      <Rise>
        <p className="k-mono k-mono--ember">Legal</p>
      </Rise>
      <Rise step={1}>
        <h1 className="k-title mt-6">Privacy Policy</h1>
      </Rise>
      <Rise step={2}>
        <p className="k-mono mt-4">Last updated: April 2026</p>
      </Rise>

      <div className="mt-12">
        {SECTIONS.map((section, i) => (
          <Rise key={section.title}>
            <div
              className="k-row"
              style={i === 0 ? { borderTop: "1px solid var(--hair-2)" } : undefined}
            >
              <h2 className="k-sub text-[17px]">{section.title}</h2>
              <div className="mt-2.5 flex flex-col gap-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="k-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Rise>
        ))}
      </div>
    </section>
  );
}
