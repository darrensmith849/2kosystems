// Single source of truth for the SLA wording. Pure strings only (no pdf-lib,
// no server-only) so both the client questionnaire (T&C panel) and the
// server-side PDF generator can import the exact same clauses.

export const COMPANY_LEGAL_NAME = '2KO Systems';
export const SLA_TITLE = 'Website Development — Service Level Agreement';
export const DEFAULT_PAYMENT_TERMS = '50% upfront, 50% on completion';

export type SlaClause = { title: string; body: string };

// `{company}` is substituted with the client's business name at render time.
export const SLA_CLAUSES: SlaClause[] = [
  {
    title: '1. Scope of work',
    body: '2KO Systems will design and build a website for {company} based on the brief, business aim and goals captured in this onboarding questionnaire. Any work beyond that scope will be quoted separately and agreed in writing first.',
  },
  {
    title: '2. Fees & payment',
    body: 'The total fee for the project is as stated in this agreement. Payment is 50% upfront before work begins and 50% on completion, before final handover or go-live. Payment is made using the method selected by the client below.',
  },
  {
    title: '3. Timeline',
    body: 'Work begins once the upfront payment and the materials we need (logo, content and any access) have been received. Estimated timelines are confirmed in writing and depend on the client supplying content and feedback promptly.',
  },
  {
    title: '4. Client responsibilities',
    body: 'The client agrees to provide accurate information, brand assets, written content and timely feedback and approvals so the project can progress without delay.',
  },
  {
    title: '5. Revisions & completion',
    body: 'Reasonable revisions are included within the agreed scope. The project is considered complete when the agreed pages have been delivered and approved by the client.',
  },
  {
    title: '6. Intellectual property',
    body: 'On receipt of full payment, ownership of the delivered website transfers to the client. 2KO Systems may reference the completed work in its portfolio unless the client requests otherwise in writing.',
  },
  {
    title: '7. Confidentiality',
    body: 'Both parties will keep any business information shared during the project confidential and use it only for the purpose of delivering this work.',
  },
  {
    title: '8. Acceptance',
    body: 'By signing electronically below, the client confirms they have read and agree to this Service Level Agreement and its terms.',
  },
];

export function fillClause(body: string, company: string): string {
  return body.replace(/\{company\}/g, company);
}
