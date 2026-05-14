import type { FormState } from './types';

export interface Preset {
  label: string;
  form: FormState;
}

export const PRESETS: Preset[] = [
  {
    label: 'Strong automation lead',
    form: {
      message:
        "Hi, I'm the operations manager at Hartley Mining (about 320 staff across 3 sites). We're drowning in manual approvals — capex requests, shift handovers, and incident reports are all done on paper or in email chains. We've been looking at ways to digitise these workflows and someone mentioned you build custom systems for mining operations. Would love to understand what a project like this looks like and what it costs. We have budget approved for this quarter.",
      subject: 'Workflow digitalisation enquiry — Hartley Mining',
      senderName: 'James Hartley',
      senderEmail: 'james@hartleymining.co.za',
      senderPhone: '+27 82 555 0012',
      source: 'contact_form',
    },
  },
  {
    label: 'Existing client support',
    form: {
      message:
        "Hi, it's Sarah from Agriwise. We use the purchase order approval system you built for us last year. Since last Thursday the email notifications for approved POs aren't going out — the purchase orders are approved in the system but the suppliers never receive the confirmation email. Can someone look at this urgently? We have deliveries scheduled this week.",
      subject: 'Urgent: PO approval notifications not sending',
      senderName: 'Sarah van Niekerk',
      senderEmail: 'sarah@agriwise.co.za',
      senderPhone: '+27 71 444 0098',
      source: 'email',
    },
  },
  {
    label: 'Low-fit supplier / spam',
    form: {
      message:
        "Hello, I represent Boost Digital Marketing. We specialise in SEO, Google Ads, and social media management for businesses in South Africa. We've helped dozens of companies increase their online visibility by 300%. I'd love to offer you a free audit of your website's current SEO performance. Would you be open to a quick 15-minute call this week?",
      subject: 'Free SEO Audit for 2KO Systems',
      senderName: 'Thabo Nkosi',
      senderEmail: 'thabo@boostdigital.co.za',
      senderPhone: '',
      source: 'contact_form',
    },
  },
  {
    label: 'Vague — needs review',
    form: {
      message:
        "Hey, I saw your website and I think you might be able to help us. We have some processes that need improvement. Can you let me know what you offer and how much it costs?",
      subject: 'Enquiry',
      senderName: 'Michael',
      senderEmail: 'michael.b@gmail.com',
      senderPhone: '',
      source: 'contact_form',
    },
  },
  {
    label: 'Website / system build',
    form: {
      message:
        "Hi, I run a mid-sized logistics company (Coastal Freight, 80 staff, Western Cape). We need a proper web-based system where our clients can log in, track their shipments, and submit new booking requests. Currently everything is done by phone and WhatsApp and it's becoming unmanageable. We also want a staff portal for our dispatchers to manage loads and assign drivers. Do you build this kind of thing?",
      subject: 'Client portal + dispatch system enquiry',
      senderName: 'Priya Naidoo',
      senderEmail: 'priya@coastalfreight.co.za',
      senderPhone: '+27 83 700 1122',
      source: 'contact_form',
    },
  },
  {
    label: 'CRM / dashboard enquiry',
    form: {
      message:
        "Hi there, we're a commercial cleaning company with 6 branches across Gauteng. We're trying to get visibility into which branches are profitable, which clients are at risk of churning, and how our teams are performing against targets. At the moment we have spreadsheets and nothing talks to each other. We've been told we need a CRM or a dashboard — honestly not sure which is right for us. Can you advise on what would actually help?",
      subject: 'CRM or dashboard for multi-branch operations',
      senderName: 'Brian Louw',
      senderEmail: 'brian@cleanco.co.za',
      senderPhone: '+27 79 311 5500',
      source: 'referral',
    },
  },
  {
    label: 'Discovery call request',
    form: {
      message:
        "Hi 2KO team, I came across your work and I'm interested in understanding whether your approach to operational systems is a fit for our business. We run a 150-person agricultural processing operation in Limpopo — mostly manual processes around intake, quality control, and dispatch. I'm not ready to commission anything yet, but I'd like to have a discovery conversation to understand what's possible and what it might cost. Are you available for a 30-minute call in the next couple of weeks?",
      subject: 'Request for discovery conversation — AgriProcess Limpopo',
      senderName: 'Koos Botha',
      senderEmail: 'koos@agriprocess.co.za',
      senderPhone: '+27 15 000 7788',
      source: 'contact_form',
    },
  },
  {
    label: 'Retainer / support enquiry',
    form: {
      message:
        "Hi, we're a long-standing client — you built our contractor onboarding portal about 18 months ago. We're very happy with it and now want to discuss an ongoing support and development retainer. We have regular small change requests and we'd prefer to have a structured arrangement rather than ad-hoc quotes each time. What does your retainer model look like? We'd also want to understand what support SLAs you offer.",
      subject: 'Retainer and support arrangement discussion',
      senderName: 'Lerato Dlamini',
      senderEmail: 'lerato@constructco.co.za',
      senderPhone: '+27 11 555 9900',
      source: 'email',
    },
  },
];
