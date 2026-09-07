import type { Metadata } from "next";
import Rise from "@/components/cinema/Rise";
import { RATES, TERMS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "How 2KO Systems engagements work: fixed prices against a written scope, changes quoted in advance, and code you own from day one.",
  alternates: { canonical: "/terms" },
};

/**
 * Terms of service.
 *
 * Almost nothing here is new. The commitments are already made across
 * /pricing, /method and every product page — fixed price against a week-one
 * scope, changes quoted before anyone starts, source and data yours from day
 * one — and this is the page that states them in one place so they hold.
 *
 * Every figure comes from lib/pricing, so a rate change cannot leave the legal
 * page contradicting the sales pages. That contradiction is the usual reason
 * terms pages become a liability rather than a protection.
 */
const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "Who these terms are between",
    paragraphs: [
      "These terms apply to work carried out by 2KO Systems, part of the 2KO group, for the client named on the quotation or statement of work. They are governed by the law of the Republic of South Africa, and any dispute falls to the South African courts.",
      "Where a signed statement of work says something different from this page, the statement of work wins. This page covers everything it does not.",
    ],
  },
  {
    title: "Prices and what fixes them",
    paragraphs: [
      "Prices published on this site are in South African rand and exclude VAT. A fixed price is fixed against the scope agreed in writing in the first week of the engagement, and against nothing else. If we estimate the work badly inside that scope, absorbing it is our problem rather than yours.",
      `Anything outside that scope is quoted before it is started, at ${RATES.dayRate} per day or ${RATES.hourlyRate} per hour, and only proceeds once you have agreed it in writing. We do not bill hourly against an open-ended brief.`,
      `Third-party licences, hosting beyond the first month, and AI usage are billed at cost plus ${TERMS.passthroughMargin}. These are named before they are incurred.`,
    ],
  },
  {
    title: "Payment",
    paragraphs: [
      "Fixed-price engagements are invoiced 50% on acceptance of the scope and 50% on go-live, unless the statement of work sets out a different schedule. Retainers are invoiced monthly in advance.",
      "Invoices are payable within 30 days. Work on later phases may be held while an invoice is overdue, but nothing already delivered and paid for is ever withheld or disabled.",
    ],
  },
  {
    title: "What you own",
    paragraphs: [
      "You own the source code, the documentation and the data, from the first day of the engagement rather than on final payment. It is built on mainstream technology that any competent developer can pick up, and it is handed over with credentials and a written handover document.",
      "We retain no proprietary platform, no licence you must keep paying, and no ability to switch off something you have paid for. Where we reuse general techniques, patterns or non-client-specific tooling on other work, that is ours to reuse; your business logic, your data and your brand are not.",
    ],
  },
  {
    title: "Your responsibilities",
    paragraphs: [
      "Fixed timelines assume you give us access to the people who actually do the work, and the content, data and credentials the build needs, within the timescales agreed in week one. Where that is delayed, the date moves; the price does not.",
      "You confirm that data you give us is yours to give, and that you have the lawful basis under POPIA to share it with us for the purpose of the engagement.",
    ],
  },
  {
    title: "Support after go-live",
    paragraphs: [
      `Every fixed-price build includes ${TERMS.postLaunchSupportDays} days of support after go-live, for fixes and questions, whether or not you take a retainer.`,
      `Retainers run for a minimum of ${TERMS.retainerMinMonths} months and then continue month to month, cancellable with 30 days' notice. Annual prepayment carries a ${TERMS.annualPrepayDiscount} discount. Retainer fees escalate annually at ${TERMS.escalation}.`,
      "A retainer is never a condition of anything we build. The systems are designed to be operated without us, and taking the hosting and maintenance in-house is a supported outcome, not a penalty.",
    ],
  },
  {
    title: "Credits on audits and reviews",
    paragraphs: [
      `The ${RATES.review} Half-Day Process Review fee is credited against whatever you commission next. The ${RATES.audit} Systems Opportunity Audit fee is credited in full against a pilot commissioned within ${TERMS.auditCreditDays} days.`,
      "These credits apply once each and are not exchangeable for cash or transferable to another party.",
    ],
  },
  {
    title: "Warranty, and its limits",
    paragraphs: [
      `We warrant that the work will materially meet the scope agreed in writing, and we will correct defects reported within the ${TERMS.postLaunchSupportDays}-day support window at no charge.`,
      "We do not warrant uninterrupted or error-free operation, and we are not liable for third-party services we do not control, for changes made to the system by others after handover, or for data loss where an agreed backup regime was declined or discontinued.",
      "Our total liability under an engagement is limited to the fees paid for that engagement. Neither party is liable to the other for indirect or consequential loss, including loss of profit. Nothing here limits liability that cannot lawfully be limited.",
    ],
  },
  {
    title: "Confidentiality",
    paragraphs: [
      "Each party keeps the other's confidential information confidential and uses it only for the engagement. That obligation survives the end of the engagement.",
      "We will not name you as a client or describe your project publicly without your permission. Where examples appear on this site, they are either published with consent or invented and labelled as illustrative.",
    ],
  },
  {
    title: "Ending an engagement",
    paragraphs: [
      "Either party may end an engagement in writing. You pay for work completed and accepted up to that point, and we hand over the source, the documentation and the data as they stand.",
      "Phased builds are quoted one phase at a time precisely so that stopping is straightforward: you are never committed to a number for work nobody has scoped yet.",
    ],
  },
  {
    title: "Changes to these terms",
    paragraphs: [
      "We may update this page. The version that applies to your engagement is the one published when your scope was agreed, and we will not apply a later change retrospectively to work already quoted.",
      "Questions about any of this go to contact@2ko.co.za and get a real answer.",
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="k-shell max-w-3xl pt-32 pb-20 lg:pt-40">
      <Rise>
        <p className="k-mono k-mono--ember">Legal</p>
      </Rise>
      <Rise step={1}>
        <h1 className="k-title mt-6">Terms of Service</h1>
      </Rise>
      <Rise step={2}>
        <p className="k-mono mt-4">Last updated: September 2026</p>
      </Rise>
      <Rise step={2}>
        <p className="k-lead mt-6">
          Most of this is already on the site — the fixed price, the written scope, the
          code you own. This is the page that puts it in one place so it holds.
        </p>
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
