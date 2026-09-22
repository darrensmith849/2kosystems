import type { Metadata } from "next";
import { completePageMetadata } from "@/lib/siteMetadata";
import Rise from "@/components/cinema/Rise";

export const metadata: Metadata = completePageMetadata({
  title: "Privacy Policy",
  description:
    "How 2KO collects, uses, shares and retains personal information across enquiries, training, consulting, systems, Sigmafy and this website.",
  alternates: { canonical: "/privacy" },
});

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "Who is responsible",
    paragraphs: [
      "2KO is a South African operational improvement group spanning consulting, Six Sigma training, systems, automation and Sigmafy. The 2KO entity named in a quotation, enrolment or agreement is the responsible party for that engagement. For website enquiries before an entity is named, 2KO coordinates the information centrally and routes it only to the appropriate team.",
      "Questions, access requests and privacy concerns can be sent to contact@2ko.co.za.",
    ],
  },
  {
    title: "What we collect",
    paragraphs: [
      "When you enquire, request a scope, use the assistant or discuss an engagement, we may collect your name, work contact details, company, site or region, service interest, process description and the answers you choose to provide about sponsorship, workstreams, training population, data readiness and timing.",
      "We also record limited technical and attribution information such as the page used, browser user-agent, campaign parameters and advertising click identifiers. Please do not submit employee records, medical information, passwords, customer records or other sensitive operational data through the public forms or assistant.",
    ],
  },
  {
    title: "Why we use it",
    paragraphs: [
      "We use the information to respond to your enquiry, assess fit, route the appropriate person, prepare a scope, administer training or consulting, provide systems or Sigmafy access, support an active engagement, keep an auditable client record and understand which campaigns produce useful enquiries.",
      "We do not sell personal information. An enquiry is not automatically added to a general marketing list. If we later ask to send marketing communications, that choice will be presented separately and can be withdrawn.",
    ],
  },
  {
    title: "Sigmafy and enquiry records",
    paragraphs: [
      "Website enquiries may be recorded in Sigmafy, the 2KO platform used to coordinate contacts, ownership, follow-up and improvement work. Notification copies may also be delivered to authorised 2KO team members by email. Access is limited to people who need the information for the enquiry or engagement.",
      "Where Sigmafy is supplied to a client or training organisation, the applicable agreement identifies the responsible party, authorised users, hosting arrangement, retention and any additional data-processing terms.",
    ],
  },
  {
    title: "The website assistant",
    paragraphs: [
      "The assistant sends the questions you type and recent conversation context to an AI service provider so that a response can be drafted. Conversations remain in the browser during the visit unless you choose to send the conversation to a person. If you request a handoff, your contact details and recent transcript are recorded with the enquiry and sent to the relevant team.",
      "Do not place confidential, personal or regulated records in the assistant. Its answers are informational and must be confirmed by 2KO before they become part of any quotation, agreement or professional advice.",
    ],
  },
  {
    title: "Cookies and advertising",
    paragraphs: [
      "The site loads Google advertising and analytics technology on every visit. We use it to measure page visits and specific actions such as a completed scope or successful enquiry, so that we can tell which pages and campaigns produce useful enquiries. We do not send Google the message, answers, name, email address or phone number entered into a form.",
      "This rests on our legitimate interest in understanding how the site is used, not on your consent, and you are entitled to object to it. Browser privacy settings, tracking protection and Google's own opt-out browser add-on all prevent this technology from loading, and the public site and enquiry forms work normally without it.",
      "Campaign parameters and advertising click identifiers may be kept in first-party session storage for the current browser session so that an enquiry can be matched to the campaign that produced it. Session storage is normally discarded when the tab is closed.",
    ],
  },
  {
    title: "Service providers and location",
    paragraphs: [
      "We use service providers for hosting, security, email delivery, analytics, AI-assisted responses and controlled client records. They receive only the information needed to provide that function and are subject to their own security and contractual safeguards.",
      "Some providers may process or store information outside South Africa. Where personal information crosses borders, 2KO applies the contractual and organisational safeguards required for the relevant engagement and the nature of the information.",
    ],
  },
  {
    title: "How long we keep it",
    paragraphs: [
      "Unsuccessful or inactive enquiry records are normally retained for no longer than 24 months after the last meaningful interaction, unless a shorter period is requested or a longer period is reasonably required for a dispute, fraud prevention or legal obligation.",
      "Active client, training, financial, contractual and system records are retained for the engagement and for the periods required by the applicable agreement and South African law. Records are then deleted, anonymised or securely archived according to their purpose.",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "Subject to POPIA and any lawful record-keeping obligation, you may ask whether we hold personal information about you, request access or correction, object to particular processing, withdraw consent where consent is the basis, or request deletion of information that no longer has to be kept.",
      "Send a request to contact@2ko.co.za. We may need to verify your identity before disclosing or changing a record. You may also lodge a complaint with the Information Regulator of South Africa at inforegulator.org.za.",
    ],
  },
  {
    title: "Security and incidents",
    paragraphs: [
      "2KO uses access controls, encryption in transit, restricted administrative access, backups and operational monitoring appropriate to the system and engagement. No internet service can promise absolute security.",
      "If a security compromise creates a material risk to personal information, 2KO will investigate, contain it and make the notifications required by applicable law.",
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
        <p className="k-mono mt-4">Last updated: September 2026</p>
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
