export interface TestCase {
  id: string;
  title: string;
  scenarioType: string;
  isBuiltIn: boolean;
  message: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  source: string;
  expectedRoute: string;
  expectedEnquiryType: string;
  expectedMinScore: number;
  expectedMaxScore: number;
  expectedRecommendedOffer?: string;
  notes?: string;
}

export const BUILT_IN_TEST_CASES: TestCase[] = [
  {
    id: 'tc-001',
    title: 'Strong automation lead',
    scenarioType: 'High-value new business',
    isBuiltIn: true,
    subject: 'Automating our quoting and job scheduling process',
    message: `Hi,

I'm the operations director at a mid-sized electrical contractor. We currently handle all quoting, job scheduling, and technician assignments manually in spreadsheets. It's becoming unmanageable — we're losing jobs because quotes take too long and we can't track what's happening where.

We need a system that can handle job intake, auto-assign technicians based on availability and skills, generate quote estimates, and give management a live view of all active jobs.

We have around 40 staff and typically run 15–20 active jobs at a time. Budget is in the region of R150,000–R250,000. We'd like to get started within the next 2 months.

Can we set up a call to discuss?

James Mkhize
james@voltprecision.co.za
+27 82 456 7890`,
    senderName: 'James Mkhize',
    senderEmail: 'james@voltprecision.co.za',
    senderPhone: '+27 82 456 7890',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'ai_automation_enquiry',
    expectedMinScore: 75,
    expectedMaxScore: 100,
    expectedRecommendedOffer: 'systems_opportunity_audit',
    notes: 'Clear pain point, authority, budget range, timeline, and contact info. Should score 80+.',
  },
  {
    id: 'tc-002',
    title: 'CRM / dashboard request',
    scenarioType: 'CRM or reporting system',
    isBuiltIn: true,
    subject: 'Custom CRM for property management',
    message: `Good day,

We manage a portfolio of about 120 rental properties. We currently use a mix of spreadsheets, WhatsApp, and a generic property tool that doesn't fit our workflow.

We need a custom CRM that can track tenants, lease dates, maintenance requests, and payment status. Ideally with a dashboard for the portfolio managers.

We're a 6-person team. We don't have a budget figure yet but we're serious about getting this built. Happy to do a discovery call.

Regards,
Priya Naidoo
priya@keystonepm.co.za`,
    senderName: 'Priya Naidoo',
    senderEmail: 'priya@keystonepm.co.za',
    senderPhone: '',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'crm_or_dashboard_enquiry',
    expectedMinScore: 60,
    expectedMaxScore: 80,
    expectedRecommendedOffer: 'systems_opportunity_audit',
    notes: 'Good fit, specific problem, no budget signal yet. Score 60–75 range.',
  },
  {
    id: 'tc-003',
    title: 'Client portal / staff portal',
    scenarioType: 'Web system build',
    isBuiltIn: true,
    subject: 'Client-facing portal for our legal firm',
    message: `Hi there,

We're a boutique legal firm and we want to build a client portal where clients can upload documents, track their matter status, and receive updates from us.

Currently everything happens over email and it's messy. We have about 200 active clients at any point.

We'd want the portal to integrate with our existing case management system (LegalEase). We don't have a fixed budget but we're looking for a realistic proposal.

Thabo Sithole
Managing Partner`,
    senderName: 'Thabo Sithole',
    senderEmail: '',
    senderPhone: '',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'website_or_system_build',
    expectedMinScore: 55,
    expectedMaxScore: 78,
    expectedRecommendedOffer: 'systems_opportunity_audit',
    notes: 'Clear need, integration complexity, missing email and budget. 60–75 range expected.',
  },
  {
    id: 'tc-004',
    title: 'Workflow / manual process improvement',
    scenarioType: 'Workflow automation',
    isBuiltIn: true,
    subject: 'Reducing admin overhead in our agri supply chain',
    message: `Hello,

We run a fresh produce supply chain business. We have a lot of manual processes — from supplier orders to delivery coordination to invoice reconciliation. Staff spend half their day on admin that could be automated.

We've heard that AI can help with this kind of thing but we don't know where to start. We'd love someone to come in, assess our processes, and tell us what the quick wins are.

We're based in Johannesburg. We have about 25 staff.

Kind regards,
Andre du Plessis`,
    senderName: 'Andre du Plessis',
    senderEmail: '',
    senderPhone: '',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'workflow_improvement_enquiry',
    expectedMinScore: 50,
    expectedMaxScore: 72,
    expectedRecommendedOffer: 'systems_opportunity_audit',
    notes: 'Good pain point, no contact details or budget. Audit is the natural next step.',
  },
  {
    id: 'tc-005',
    title: 'Explicit discovery call request',
    scenarioType: 'Discovery or audit request',
    isBuiltIn: true,
    subject: 'Book a discovery call',
    message: `Hi,

I saw your work and I'm interested in having a discovery call to discuss whether you can help us. We're a fintech startup and we have some operational gaps we're trying to address — specifically around onboarding automation and internal reporting.

I'm the COO. We have R80k available for an initial engagement.

When are you available?

Lungelo Dlamini
lungelo@capstonefintech.co.za
+27 71 234 5678`,
    senderName: 'Lungelo Dlamini',
    senderEmail: 'lungelo@capstonefintech.co.za',
    senderPhone: '+27 71 234 5678',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'discovery_or_audit_request',
    expectedMinScore: 60,
    expectedMaxScore: 80,
    expectedRecommendedOffer: 'proof_of_value_pilot',
    notes: 'Authority and budget confirmed. Explicit discovery request. 65–78 range expected.',
  },
  {
    id: 'tc-006',
    title: 'Retainer / managed service enquiry',
    scenarioType: 'Retainer or SLA',
    isBuiltIn: true,
    subject: 'Ongoing system support and development retainer',
    message: `Hi,

We're a growing logistics company. We had a custom system built 2 years ago by a freelancer who is no longer available. We need a reliable technology partner who can maintain the system, add features as we grow, and be on call for issues.

We'd ideally want a monthly retainer arrangement. We're comfortable with R15,000–R25,000/month depending on scope.

Can we talk?

Miriam Joubert
Head of Operations
miriam@rapidlogistics.co.za`,
    senderName: 'Miriam Joubert',
    senderEmail: 'miriam@rapidlogistics.co.za',
    senderPhone: '',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'new_business_lead',
    expectedMinScore: 68,
    expectedMaxScore: 88,
    expectedRecommendedOffer: 'managed_intelligence_retainer',
    notes: 'Strong retainer signal with budget range. High recurring revenue potential. 72–85 range expected.',
  },
  {
    id: 'tc-007',
    title: 'Existing client support request',
    scenarioType: 'Existing client support',
    isBuiltIn: true,
    subject: 'Bug on the booking module — urgent',
    message: `Hi 2KO team,

The booking module is throwing an error when users try to select a time slot after 4pm. This started yesterday afternoon. Our clients are complaining and we're losing bookings.

Can someone look at this urgently? We're on the support retainer.

Zanele
zanele@urbanwellness.co.za`,
    senderName: 'Zanele',
    senderEmail: 'zanele@urbanwellness.co.za',
    senderPhone: '',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'existing_client_support',
    expectedMinScore: 50,
    expectedMaxScore: 70,
    expectedRecommendedOffer: 'existing_client_support',
    notes: 'Existing client on retainer. Urgent. Route to support, not sales pipeline.',
  },
  {
    id: 'tc-008',
    title: 'Vague / unclear enquiry',
    scenarioType: 'Vague or underdefined',
    isBuiltIn: true,
    subject: 'Technology for our business',
    message: `Hi,

We're looking for technology solutions for our business. We have some problems we need solved and we think AI might help. Please get back to me.

Thanks,
Mike`,
    senderName: 'Mike',
    senderEmail: '',
    senderPhone: '',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'unclear_needs_review',
    expectedMinScore: 0,
    expectedMaxScore: 35,
    expectedRecommendedOffer: 'unclear_needs_review',
    notes: 'No contact info, no specifics. Should score low. Reply should ask for more details.',
  },
  {
    id: 'tc-009',
    title: 'Spam / supplier pitch',
    scenarioType: 'Spam or supplier',
    isBuiltIn: true,
    subject: 'Partnership opportunity — SEO & digital marketing',
    message: `Dear Sir/Madam,

I am reaching out from DigiBoost Agency. We specialise in SEO, Google Ads, and social media marketing. We would love to explore a white-label partnership where we can provide your clients with our services.

We have helped 500+ businesses achieve top Google rankings. Interested in a 15-minute call?

Best,
The DigiBoost Team`,
    senderName: '',
    senderEmail: 'partnerships@digiboost.agency',
    senderPhone: '',
    source: 'contact_form',
    expectedRoute: 'not_relevant',
    expectedEnquiryType: 'supplier_or_spam',
    expectedMinScore: 0,
    expectedMaxScore: 15,
    expectedRecommendedOffer: 'low_fit_or_refer_out',
    notes: 'Clear spam/supplier pitch. Route to not_relevant, score 0–10.',
  },
  {
    id: 'tc-010',
    title: 'Partnership / referral enquiry',
    scenarioType: 'Partnership or referral',
    isBuiltIn: true,
    subject: 'Referral partnership for enterprise clients',
    message: `Hi,

I run a business consulting firm focused on SMEs and enterprise clients. We frequently encounter clients who need custom software and operational systems but we don't have that capability in-house.

I'd like to explore whether 2KO would be open to a referral partnership where we refer clients to you and agree on a commission structure.

We typically work with companies turning over R20M–R200M.

Kind regards,
Sandra Ferreira
sandra@apexbizco.co.za
+27 83 987 6543`,
    senderName: 'Sandra Ferreira',
    senderEmail: 'sandra@apexbizco.co.za',
    senderPhone: '+27 83 987 6543',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'partnership_or_referral',
    expectedMinScore: 30,
    expectedMaxScore: 55,
    notes: 'Legitimate partnership enquiry. Not a direct lead. Low-medium score. No standard offer applies well.',
  },
  {
    id: 'tc-011',
    title: 'High-value priority lead',
    scenarioType: 'Priority lead with confirmed budget',
    isBuiltIn: true,
    subject: 'Full operational system overhaul — R500k budget',
    message: `Hi,

I'm the CEO of a medium-sized manufacturing company (120 employees). We need to completely overhaul our operations technology: ERP integration, production scheduling, supplier portal, quality tracking, and management dashboards.

We've set aside R500,000 for phase one. We've spoken to two other vendors and we want to make a decision within 3 weeks.

Please send your details and availability for a meeting.

David Karimi
CEO, PrecisionManufacture SA
dkarimi@precisionmfg.co.za
+27 82 111 2233`,
    senderName: 'David Karimi',
    senderEmail: 'dkarimi@precisionmfg.co.za',
    senderPhone: '+27 82 111 2233',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'proposal_or_quote_request',
    expectedMinScore: 82,
    expectedMaxScore: 100,
    expectedRecommendedOffer: 'systems_opportunity_audit',
    notes: 'CEO, large confirmed budget, short decision timeline, competitive situation. Should score 85–95.',
  },
  {
    id: 'tc-012',
    title: 'Budget-sensitive small business',
    scenarioType: 'Small budget or low commercial value',
    isBuiltIn: true,
    subject: 'Simple website and booking system for my salon',
    message: `Hi there,

I run a small hair salon with 3 stylists. I need a basic website with an online booking system. Nothing fancy — just something clean that lets clients book appointments.

My budget is around R5,000–R8,000. Is that something you do?

Nomsa`,
    senderName: 'Nomsa',
    senderEmail: '',
    senderPhone: '',
    source: 'contact_form',
    expectedRoute: 'two_ko_systems',
    expectedEnquiryType: 'website_or_system_build',
    expectedMinScore: 15,
    expectedMaxScore: 40,
    expectedRecommendedOffer: 'low_fit_or_refer_out',
    notes: 'Budget well below 2KO minimum viable engagement. Polite low-fit response appropriate. Score 20–35.',
  },
];
