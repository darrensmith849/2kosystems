import 'server-only';

// Snapshot data for the Email + Commercial Ops foundation phase.
//
// IMPORTANT — what this file is, and is not:
//   * It is a hand-curated catalogue of PLACEHOLDER preview rows for the
//     Email Intelligence, Services / Subscriptions, and Contacts pages.
//   * It is NOT real email content. No inbox is read or stored.
//   * No real personal contact details are committed here — names + roles
//     only, sourced from already-public 2KO/infra-handover material.
//   * Everything renders under Snapshot Mode and is clearly marked as
//     preview / planned data, never as live.
//
// When the live database connects, these rows will be replaced by real
// records that operators manually link via the future email-refs UI; this
// file then becomes documentation for what each category looks like.

// --------------------------------------------------------------- Email refs

export type EmailCategory =
  | 'billing'
  | 'domain_renewal'
  | 'hosting_renewal'
  | 'supplier_notice'
  | 'client_support'
  | 'change_request'
  | 'client_approval'
  | 'incident_comms'
  | 'quote_proposal'
  | 'internal_handover';

export type EmailProvider = 'gmail' | 'outlook' | 'manual' | 'unknown';

export type EmailLinkingStatus = 'planned' | 'manual_ready' | 'live';

export type SnapshotEmailRef = {
  id: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  category: EmailCategory;
  provider: EmailProvider;
  linkedClient?: string;
  linkedAsset?: string;
  linkedRenewal?: string;
  linkedIncident?: string;
  notes: string;
};

export const EMAIL_CATEGORY_LABEL: Record<EmailCategory, string> = {
  billing: 'Billing / invoices',
  domain_renewal: 'Domain renewals',
  hosting_renewal: 'Hosting renewals',
  supplier_notice: 'Supplier notices',
  client_support: 'Client support',
  change_request: 'Change requests',
  client_approval: 'Client approvals',
  incident_comms: 'Incident communications',
  quote_proposal: 'Quotes / proposals',
  internal_handover: 'Internal handover',
};

export const EMAIL_CATEGORY_ORDER: EmailCategory[] = [
  'billing',
  'domain_renewal',
  'hosting_renewal',
  'supplier_notice',
  'client_support',
  'change_request',
  'client_approval',
  'incident_comms',
  'quote_proposal',
  'internal_handover',
];

export const SNAPSHOT_EMAIL_REFS: SnapshotEmailRef[] = [
  {
    id: 'email-hetzner-invoice',
    subject: 'Hetzner Cloud · monthly invoice (planned example)',
    fromName: 'Hetzner Cloud',
    fromEmail: 'billing@hetzner.com',
    category: 'billing',
    provider: 'manual',
    notes:
      'Where the monthly Hetzner Cloud invoice for ma130-apps / ma130-data / ma130-tori will be linked once email references go live.',
  },
  {
    id: 'email-cloudflare-domain-notice',
    subject: 'Cloudflare · DNS / domain change notice (planned example)',
    fromName: 'Cloudflare',
    fromEmail: 'no-reply@cloudflare.com',
    category: 'domain_renewal',
    provider: 'manual',
    notes:
      'Placeholder for Cloudflare zone change confirmations and registrar notices. Real notices land in the inbox today; they will be referenced from the relevant domain or zone record.',
  },
  {
    id: 'email-vercel-billing',
    subject: 'Vercel · project / billing notice (planned example)',
    fromName: 'Vercel',
    fromEmail: 'no-reply@vercel.com',
    category: 'billing',
    provider: 'manual',
    notes:
      'Placeholder for Vercel project billing emails across both Vercel teams (pumpbots-projects and impart-global).',
  },
  {
    id: 'email-client-support-impart',
    subject: 'Impart Agency · support thread (planned example)',
    fromName: 'Impart Agency contact',
    fromEmail: 'placeholder@impartagency.co.za',
    category: 'client_support',
    provider: 'manual',
    linkedClient: 'Impart Agency',
    notes:
      'Where a real Impart support thread reference will sit (Gmail/Outlook link + subject only). No body content stored.',
  },
  {
    id: 'email-domain-renewal-reminder',
    subject: 'Domain renewal reminder · 30 days (planned example)',
    fromName: 'xneelo / GoDaddy / registrar',
    fromEmail: 'noreply@registrar.example',
    category: 'domain_renewal',
    provider: 'manual',
    notes:
      'Domain expiry reminders surface here so the team can confirm renewal and tag the matching domain record.',
  },
  {
    id: 'email-change-request-approval',
    subject: 'Change request approval · placeholder',
    fromName: 'Client billing contact',
    fromEmail: 'approvals@client.example',
    category: 'client_approval',
    provider: 'manual',
    notes:
      'Where written client approvals for change requests will be referenced so each ticket has a traceable approval source.',
  },
  {
    id: 'email-incident-followup',
    subject: 'Incident follow-up thread (planned example)',
    fromName: 'On-call operator / BetterStack',
    fromEmail: 'oncall@2ko.co.za',
    category: 'incident_comms',
    provider: 'manual',
    linkedIncident: 'placeholder incident',
    notes:
      'Where the email trail for an incident post-mortem will sit alongside the incident record.',
  },
  {
    id: 'email-supplier-subscription',
    subject: 'Supplier subscription notice (planned example)',
    fromName: 'SaaS supplier',
    fromEmail: 'billing@supplier.example',
    category: 'supplier_notice',
    provider: 'manual',
    notes:
      'Recurring SaaS / supplier notices that need to be triaged against the Services catalogue.',
  },
  {
    id: 'email-quote-proposal',
    subject: 'Client quote / proposal trail (planned example)',
    fromName: 'Operator',
    fromEmail: 'sales@2ko.co.za',
    category: 'quote_proposal',
    provider: 'manual',
    notes:
      'Quotes and proposals link here so the dashboard ties a sale to a client + asset over time.',
  },
  {
    id: 'email-internal-handover',
    subject: 'Internal handover note (planned example)',
    fromName: 'Internal',
    fromEmail: 'ops@2ko.co.za',
    category: 'internal_handover',
    provider: 'manual',
    notes:
      'Internal handover threads (e.g. operator changes, on-call rotations) get a single reference instead of being scattered in inboxes.',
  },
];

export function getEmailLinkingStatus(): EmailLinkingStatus {
  // The system is intentionally "planned" until a future, explicitly approved
  // phase wires DB-backed manual references. We never auto-flip this.
  return 'planned';
}

// --------------------------------------------------------------- Services / Subscriptions

export type ServiceCategory =
  | 'infrastructure'
  | 'dns'
  | 'runtime'
  | 'source_control'
  | 'email_sending'
  | 'workspace_email'
  | 'monitoring'
  | 'registrar'
  | 'analytics'
  | 'ai'
  | 'support_saas'
  | 'other';

export type ServiceStatus = 'active' | 'planned' | 'needs_review' | 'blocked';

export type ServiceBlocker =
  | 'db'
  | 'human_decision'
  | 'token'
  | 'subscription'
  | 'approval'
  | 'none';

export type SnapshotService = {
  id: string;
  name: string;
  provider: string;
  category: ServiceCategory;
  linkedScope: string;
  billingOwner: string;
  cadence: string;
  status: ServiceStatus;
  blockers: ServiceBlocker[];
  notes: string;
};

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  infrastructure: 'Infrastructure',
  dns: 'DNS / CDN',
  runtime: 'Runtime',
  source_control: 'Source control',
  email_sending: 'Transactional email',
  workspace_email: 'Workspace email',
  monitoring: 'Monitoring',
  registrar: 'Registrar',
  analytics: 'Analytics',
  ai: 'AI',
  support_saas: 'Support SaaS',
  other: 'Other',
};

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  active: 'Active',
  planned: 'Planned',
  needs_review: 'Needs review',
  blocked: 'Blocked',
};

export const SERVICE_STATUS_TONE: Record<ServiceStatus, 'green' | 'blue' | 'amber' | 'rose'> = {
  active: 'green',
  planned: 'blue',
  needs_review: 'amber',
  blocked: 'rose',
};

export const SNAPSHOT_SERVICES: SnapshotService[] = [
  {
    id: 'service-hetzner-cloud',
    name: 'Hetzner Cloud',
    provider: 'Hetzner',
    category: 'infrastructure',
    linkedScope: 'ma130-apps, ma130-data, ma130-tori (fsn1)',
    billingOwner: 'Needs review',
    cadence: 'Monthly',
    status: 'active',
    blockers: ['none'],
    notes: 'Three servers, ~€77.50/mo per infra-handover INVENTORY. Billing owner confirmation pending.',
  },
  {
    id: 'service-cloudflare',
    name: 'Cloudflare',
    provider: 'Cloudflare',
    category: 'dns',
    linkedScope: '~40 zones · ~20 Pages projects',
    billingOwner: 'Needs review',
    cadence: 'Annual (Pro / free mix)',
    status: 'needs_review',
    blockers: ['human_decision'],
    notes: 'DNS / CDN / Pages. Plan distribution per zone still to be reviewed.',
  },
  {
    id: 'service-vercel-pumpbots',
    name: 'Vercel · pumpbots-projects',
    provider: 'Vercel',
    category: 'runtime',
    linkedScope: 'Primary team. 2kosystems.com, FlexandFlow, etc.',
    billingOwner: 'Needs review',
    cadence: 'Monthly',
    status: 'active',
    blockers: ['human_decision'],
    notes: '~25 dormant projects to retire; cleanup tracked as a Review decision.',
  },
  {
    id: 'service-vercel-impart',
    name: 'Vercel · impart-global',
    provider: 'Vercel',
    category: 'runtime',
    linkedScope: 'coupex.net, taxup.app, impartai.co.za',
    billingOwner: 'Needs review',
    cadence: 'Monthly',
    status: 'needs_review',
    blockers: ['human_decision'],
    notes: 'Second Vercel team — not in original INVENTORY. Ownership scope still to confirm.',
  },
  {
    id: 'service-github',
    name: 'GitHub',
    provider: 'GitHub',
    category: 'source_control',
    linkedScope: 'darrensmith849/* — every 2KO + client repo',
    billingOwner: 'Internal',
    cadence: 'Free / per-user',
    status: 'active',
    blockers: ['none'],
    notes: 'Personal account; org migration is a future decision.',
  },
  {
    id: 'service-brevo',
    name: 'Brevo',
    provider: 'Brevo',
    category: 'email_sending',
    linkedScope: 'Transactional + renewal digest sender',
    billingOwner: 'Internal',
    cadence: 'Free tier today',
    status: 'planned',
    blockers: ['token'],
    notes: 'Used today by /api/contact. Will also drive the 07:00 SAST renewal digest once BREVO_OPS_DIGEST_TO is set.',
  },
  {
    id: 'service-google-workspace',
    name: 'Google Workspace',
    provider: 'Google',
    category: 'workspace_email',
    linkedScope: 'Operator inboxes (manual)',
    billingOwner: 'Needs review',
    cadence: 'Monthly per seat',
    status: 'needs_review',
    blockers: ['human_decision'],
    notes: 'No Gmail integration is active. Future manual email references will simply link to a Gmail message URL.',
  },
  {
    id: 'service-xneelo',
    name: 'xneelo',
    provider: 'xneelo',
    category: 'registrar',
    linkedScope: '4 stranded zones · email hosting',
    billingOwner: 'Needs review',
    cadence: 'Annual',
    status: 'blocked',
    blockers: ['human_decision'],
    notes: 'Stranded zones (plasticsurgerycapetown / schoolsnearme.au / leansixsigmaafrica / iammeskincare) pending NS update — tracked as incidents and a review decision.',
  },
  {
    id: 'service-betterstack',
    name: 'BetterStack',
    provider: 'BetterStack',
    category: 'monitoring',
    linkedScope: 'Uptime + incident ingestion',
    billingOwner: 'Internal',
    cadence: 'Monthly',
    status: 'planned',
    blockers: ['token'],
    notes: 'Webhook route reachable now. Goes active when BETTERSTACK_WEBHOOK_SECRET is set.',
  },
  {
    id: 'service-anthropic',
    name: 'Anthropic',
    provider: 'Anthropic',
    category: 'ai',
    linkedScope: 'Ops Assistant — AI mode',
    billingOwner: 'Internal',
    cadence: 'Usage-based',
    status: 'planned',
    blockers: ['token'],
    notes: 'Search-only mode runs today without a key. Setting ANTHROPIC_API_KEY enables AI answers on Ask + the floating widget.',
  },
  {
    id: 'service-domain-registrars',
    name: 'Domain registrars',
    provider: 'GoDaddy / xneelo / Cloudflare',
    category: 'registrar',
    linkedScope: '40+ domains',
    billingOwner: 'Needs review',
    cadence: 'Annual',
    status: 'needs_review',
    blockers: ['human_decision'],
    notes: 'Per-domain registrar + renewal owner mapping is partial today. Tracked under Renewals.',
  },
];

// --------------------------------------------------------------- Contacts

export type ContactRole =
  | 'client_owner'
  | 'billing_contact'
  | 'technical_contact'
  | 'supplier_support'
  | 'internal_owner'
  | 'approval_contact';

export type SnapshotContact = {
  id: string;
  name: string;
  organisation: string;
  role: ContactRole;
  linkedClient?: string;
  linkedAsset?: string;
  notes: string;
};

export const CONTACT_ROLE_LABEL: Record<ContactRole, string> = {
  client_owner: 'Client owner',
  billing_contact: 'Billing contact',
  technical_contact: 'Technical contact',
  supplier_support: 'Supplier support',
  internal_owner: 'Internal owner',
  approval_contact: 'Approval contact',
};

// IMPORTANT — these snapshot rows are intentionally generic placeholders. They
// do not list real personal email or phone numbers. The page makes the
// placeholder nature obvious and the real Contacts table only fills in once
// the DB is connected and an operator enters real contact rows.
export const SNAPSHOT_CONTACTS: SnapshotContact[] = [
  {
    id: 'contact-2ko-internal',
    name: 'Internal 2KO ops',
    organisation: '2KO Systems',
    role: 'internal_owner',
    notes: 'Day-to-day operator. Owns dashboard, tickets, and on-call.',
  },
  {
    id: 'contact-internal-billing',
    name: 'Internal billing',
    organisation: '2KO Systems',
    role: 'billing_contact',
    notes: 'Owns supplier invoices and client billing references.',
  },
  {
    id: 'contact-client-owner-placeholder',
    name: 'Client owner — placeholder',
    organisation: 'Client (any)',
    role: 'client_owner',
    notes: 'Per-client decision-maker contact will be tracked here once entered.',
  },
  {
    id: 'contact-supplier-support-placeholder',
    name: 'Supplier support — placeholder',
    organisation: 'Hetzner / Cloudflare / Vercel / xneelo / Brevo / BetterStack',
    role: 'supplier_support',
    notes: 'Support contact references per supplier (link to portal / shared inbox).',
  },
  {
    id: 'contact-approval-placeholder',
    name: 'Approval contact — placeholder',
    organisation: 'Client billing contact',
    role: 'approval_contact',
    notes: 'Where written change-request approvals come from.',
  },
  {
    id: 'contact-technical-placeholder',
    name: 'Technical contact — placeholder',
    organisation: 'Client / supplier',
    role: 'technical_contact',
    notes: 'Technical lead per asset / per supplier — used for incident comms.',
  },
];
