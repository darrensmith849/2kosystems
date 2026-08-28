import { RATES, TIMEBOX } from "./pricing";

/**
 * The website tiers, and the real work behind each one.
 *
 * Single source for /websites and for the four /websites/[slug] pages, so the
 * summary cards and the detail pages cannot drift apart.
 *
 * Every example here was checked live before it went in. Three candidates were
 * cut on evidence rather than taste: Crewter returned a 500, one artist site
 * still had PLACEHOLDER_ARTIST_NAME as its title, and CrossCoders and Smart
 * Home Architects had no cart, checkout or payment gateway anywhere on them —
 * so they moved from Commerce to Business, where they are honest.
 *
 * `reel` names which build sequence the page's demo runs. A shop page shows a
 * shop being built; a portal page shows a portal.
 */

export type ReelKind = "trades" | "legal" | "shop" | "portal";

export type Example = {
  name: string;
  url: string;
  line: string;
  /** Shown as the link label. Bare domains read better than full URLs. */
  domain: string;
};

export type WebTier = {
  slug: string;
  name: string;
  price: string;
  time: string;
  line: string;
  for: string;
  has: string[];
  featured?: boolean;
  reel: ReelKind;
  /** Page-specific opening, used only on the detail page. */
  intro: string;
  examples: Example[];
  /** What this tier is not, said plainly, so nobody buys the wrong one. */
  notThis: string;
};

export const WEB_TIERS: WebTier[] = [
  {
    slug: "launch",
    name: "Launch",
    price: RATES.siteLaunch,
    time: TIMEBOX.siteLaunch,
    line: "One page that does the job properly.",
    for: "Trades, consultants, single-service businesses — anyone whose customers just need to find them, believe them, and call them.",
    has: [
      "A single, long-scrolling page",
      "Written for you, not templated",
      "Mobile-first — most of your traffic is a phone",
      "Contact form and click-to-call",
      "Google Business Profile connected",
      "Live on your own domain",
    ],
    reel: "trades",
    intro:
      "Most small businesses do not need eight pages. They need one page that loads fast, says what they do, proves they are real, and makes it obvious how to get hold of them. That page can be live in a week.",
    notThis:
      "If you have several services to explain, a team to introduce, or anything to sell, you want Business or Commerce instead. We will say so rather than sell you a page you outgrow in a month.",
    examples: [
      {
        name: "Riley's Car Wash",
        domain: "rileyscarwash.vercel.app",
        url: "https://rileyscarwash.vercel.app",
        line: "Weekend car washes in George. One service, one page, one call to action.",
      },
      {
        name: "Flex & Flow",
        domain: "flexandflow.vercel.app",
        url: "https://flexandflow.vercel.app",
        line: "Stretch and mobility studio. Class times, the method, and a way to book.",
      },
      {
        name: "Moki",
        domain: "lovelace-moki.vercel.app",
        url: "https://lovelace-moki.vercel.app",
        line: "Original art out of Constantia. The work is the page; everything else gets out of its way.",
      },
      {
        name: "Daniel Jenkins",
        domain: "edenlang.vercel.app",
        url: "https://edenlang.vercel.app",
        line: "Guitarist, producer and songwriter. Listen, read, book — in that order.",
      },
    ],
  },
  {
    slug: "business",
    name: "Business",
    price: RATES.siteBusiness,
    time: TIMEBOX.siteBusiness,
    line: "The site most companies actually need.",
    for: "Established businesses with services to explain, a team to introduce and work to show. The version people expect when they look you up.",
    has: [
      "Up to eight pages",
      "Custom design — not a bought theme",
      "You edit the content yourself",
      "Built to be found: speed, structure, schema",
      "Enquiry routing to the right inbox",
      "Analytics that report on enquiries, not hits",
    ],
    featured: true,
    reel: "legal",
    intro:
      "This is the one most companies are actually looking for. Enough room to explain several services properly, introduce the people, and show the work — built so that you can change the words yourself afterwards without phoning anyone.",
    notThis:
      "If you need to take payment, that is Commerce. If the site has to do something — logins, bookings, a portal — that is Bespoke.",
    examples: [
      {
        name: "Coastal Security Systems",
        domain: "coastalsecuritysystems.co.za",
        url: "https://coastalsecuritysystems.co.za",
        line: "Connected security installations across the Southern Cape and Garden Route.",
      },
      {
        name: "CrossCoders",
        domain: "crosscoders.co.za",
        url: "https://crosscoders.co.za",
        line: "A software company that needed a site as considered as the work it sells.",
      },
      {
        name: "Smart Home Architects",
        domain: "smart-home-architects",
        url: "https://smart-home-architects.damp-feather-2944.workers.dev/",
        line: "Luxury home automation in Cape Town. Restrained, photographic, and quiet about it.",
      },
      {
        name: "SA Private Schools",
        domain: "saprivateschools.vercel.app",
        url: "https://saprivateschools.vercel.app",
        line: "Find, compare and enquire across South African private schools. A directory that stays fast.",
      },
    ],
  },
  {
    slug: "commerce",
    name: "Commerce",
    price: `from ${RATES.siteCommerceFrom}`,
    time: TIMEBOX.siteCommerce,
    line: "A shop that takes money properly.",
    for: "Anyone selling online — products, bookings or subscriptions. The bit most website builds get wrong is everything after the customer clicks buy.",
    has: [
      "Everything in Business",
      "Product catalogue you manage yourself",
      "South African payment gateway",
      "Stock, shipping rules and VAT",
      "Order and customer emails that arrive",
      "Abandoned-cart recovery",
    ],
    reel: "shop",
    intro:
      "Anyone can put a product grid on a page. The work is in what happens after someone clicks buy: the gateway clearing, the stock decrementing, the confirmation email actually arriving, and you being able to find the order three months later.",
    notThis:
      "A handful of products and no stock to track may not need this. Ask us — sometimes Business with an enquiry form sells more than a shop nobody finishes checking out on.",
    examples: [
      {
        name: "Slabhead",
        domain: "slabhead.co.za",
        url: "https://slabhead.co.za",
        line: "South Africa's home for graded trading cards. Catalogue, cart and PayFast checkout.",
      },
      {
        name: "Activitar",
        domain: "activitar.com",
        url: "https://activitar.com",
        line: "Go. Do. Enjoy. Activity bookings taken and paid for online.",
      },
    ],
  },
  {
    slug: "bespoke",
    name: "Bespoke",
    price: `from ${RATES.siteBespokeFrom}`,
    time: TIMEBOX.siteBespoke,
    line: "When the site has to do something.",
    for: "Booking, member areas, quoting, portals, integrations. Where the website stops being a brochure and starts being part of how the business runs.",
    has: [
      "Everything in Business",
      "Custom functionality, scoped in week one",
      "Integrations with what you already run",
      "Roles and secure logins",
      "Built by the team that builds our systems",
      "Quoted against a written scope, fixed after that",
    ],
    reel: "portal",
    intro:
      "At some point a website stops being a brochure and starts being software. Logins, dashboards, calculations, things that talk to other systems. This is the same team that builds our operational systems, working at website scale.",
    notThis:
      "If it is really an operational system — job cards, incidents, compliance — look at our Systems work instead. Same people, different shape, published prices there too.",
    examples: [
      {
        name: "Vemia",
        domain: "my.vemia.app",
        url: "https://my.vemia.app",
        line: "A platform that builds a real website from the socials a business already runs.",
      },
      {
        name: "TaxUp",
        domain: "taxup.app",
        url: "https://taxup.app",
        line: "An AI tool for accountants. Income statements and returns, filed with one tap.",
      },
      {
        name: "Sigmafy",
        domain: "sigmafynew.vercel.app",
        url: "https://sigmafynew.vercel.app",
        line: "288 Six Sigma statistical tools in one studio, running entirely in the browser.",
      },
      {
        name: "TORI Trades",
        domain: "toritradestodamoon.vercel.app",
        url: "https://toritradestodamoon.vercel.app",
        line: "A premium trading operating system — live data, strategy and execution in one place.",
      },
    ],
  },
];

export function tierBySlug(slug: string) {
  return WEB_TIERS.find((t) => t.slug === slug);
}
