// Single source of truth for the SLA wording. Pure strings only (no pdf-lib,
// no server-only) so both the client questionnaire (modal) and the server-side
// PDF generator import the exact same clauses.

export const COMPANY_LEGAL_NAME = '2KO Systems';
export const SLA_TITLE = 'Website Development — Service Level Agreement';
export const DEFAULT_PAYMENT_TERMS = '50% upfront, 50% on completion';

export type SlaClause = { title: string; body: string };

// `{company}` is substituted with the client's business name at render time.
// Newlines in `body` are preserved (rendered as line breaks in both the modal
// and the PDF).
export const SLA_CLAUSES: SlaClause[] = [
  {
    title: '1. Parties',
    body: 'This Service Level Agreement ("Agreement") is entered into between 2KO Systems ("the Developer") and {company} ("the Client"). It sets out the terms on which the Developer will design and build a website for the Client.',
  },
  {
    title: '2. Scope — what is included',
    body: 'The Developer will design and build the website described in the brief, business information and goals captured in this onboarding questionnaire. This includes the agreed pages, a reasonable round of revisions within that scope, and handover of the completed website. Any work beyond this scope will be quoted and agreed in writing before it begins.',
  },
  {
    title: '3. What is NOT included',
    body:
      'This Agreement covers the website BUILD only. The following are not included and remain the Client’s responsibility. The Developer can arrange or quote for any of them separately:\n' +
      '• Hosting — the ongoing (usually monthly or yearly) service that keeps your website live on the internet by storing it on a server. The Client pays for hosting separately.\n' +
      '• Domain name — your web address itself (for example www.yourbusiness.com), including registering it and renewing it each year.\n' +
      '• Search Engine Optimisation (SEO) — ongoing work to help your website rank higher and appear more often in Google and other search results. Standard, sensible setup is included in the build; continued SEO campaigns are not.\n' +
      '• Content — written copy, logos and professional photography, unless specifically agreed in the brief.\n' +
      '• Ongoing maintenance, updates, backups, security and support after handover.\n' +
      '• Third-party costs — paid plugins or templates, stock images, payment-gateway fees, email or newsletter services and similar.',
  },
  {
    title: '4. Fees & payment',
    body:
      'The total fee for the project is as stated in this Agreement and is for the website build as scoped above. Payment is 50% upfront before work begins and 50% on completion. Payment is made using the method selected by the Client. Fees are exclusive of any third-party costs listed in clause 3.\n' +
      'The website will NOT be published or made live until the full fee (both payments) has been received. If full payment is not completed by the expected completion date, the website will remain unpublished and will not go live until payment is made in full.',
  },
  {
    title: '5. Timeline',
    body: 'The Client’s preferred start date and expected completion date are as captured in this questionnaire. These dates are indicative and depend on the upfront payment, the materials the Developer needs (logo, content and any access) being received, and the Client supplying feedback and approvals promptly. Estimated timelines are confirmed in writing.',
  },
  {
    title: '6. Client responsibilities',
    body: 'The Client agrees to provide accurate information, brand assets, written content and timely feedback and approvals so the project can progress without delay. Delays in providing these may extend the timeline.',
  },
  {
    title: '7. Revisions & completion',
    body: 'A reasonable round of revisions is included within the agreed scope. The project is considered complete when the agreed pages have been delivered and approved by the Client, or after 14 days of no response following delivery. Changes requested after completion will be quoted separately.',
  },
  {
    title: '8. Intellectual property',
    body: 'On receipt of full payment, ownership of the delivered website transfers to the Client. The Developer may reference and display the completed work in its portfolio and marketing unless the Client requests otherwise in writing. Third-party components remain under their own licences.',
  },
  {
    title: '9. Warranty & liability',
    body: 'The website is delivered as built and approved. The Developer is not responsible for issues arising from third-party services (such as hosting, domains or plugins), changes made by the Client or others after handover, or matters outside the Developer’s reasonable control. To the extent permitted by law, the Developer’s total liability is limited to the fees paid under this Agreement.',
  },
  {
    title: '10. Confidentiality',
    body: 'Both parties will keep any business information shared during the project confidential and use it only for the purpose of delivering this work.',
  },
  {
    title: '11. Governing law',
    body: 'This Agreement is governed by the laws of the Republic of South Africa.',
  },
  {
    title: '12. Acceptance',
    body: 'By entering their name and signing electronically below, the Client confirms they have read, understood and agree to this Service Level Agreement and its terms, including the items not included in clause 3.',
  },
];

export function fillClause(body: string, company: string): string {
  return body.replace(/\{company\}/g, company);
}
