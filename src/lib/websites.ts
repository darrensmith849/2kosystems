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
  /**
   * Screenshot in /public/work, captured headless at 1440x900 and written out
   * at 760px wide. Re-run scripts/shoot-work.sh when any of these sites change.
   */
  shot: string;
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
        name: "Ground Control Coffee Shop",
        shot: "ground-control",
        domain: "ground-control.pages.dev",
        url: "https://ground-control.factory-previews-d8j.pages.dev/",
        line: "A George institution on York Street. The menu, the reviews, and a number that rings.",
      },
      {
        name: "M. A. Smith Town Planner",
        shot: "town-planner",
        domain: "townplannercapetown.co.za",
        url: "https://townplannercapetown.co.za/",
        line: "Cape Town land use since 1996. Feasibility to municipal decision, on one page.",
      },
      {
        name: "Flex & Flow",
        shot: "flex-and-flow",
        domain: "flexandflow.vercel.app",
        url: "https://flexandflow.vercel.app",
        line: "Stretch and mobility studio. Class times, the method, and a way to book.",
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
        name: "SPACONCEPTS",
        shot: "spaconcepts",
        domain: "spaconcepts.pages.dev",
        url: "https://spaconcepts.crosscoders-preview.pages.dev/",
        line: "Bespoke wellness destinations across Africa. Method, portfolio, product and legacy.",
      },
      {
        name: "DripTech",
        shot: "driptech",
        domain: "driptech.pages.dev",
        url: "https://driptech.pages.dev/",
        line: "Zimbabwe's irrigation people since 1995. Eleven branches, four ranges, one scroll.",
      },
      {
        name: "Crimson Media",
        shot: "crimson-media",
        domain: "crimson-media.pages.dev",
        url: "https://crimson-media.pages.dev/",
        line: "Garden Route film and photography studio. The reel does the selling.",
      },
      {
        name: "Coastal Security Systems",
        shot: "coastal-security",
        domain: "coastalsecuritysystems.co.za",
        url: "https://coastalsecuritysystems.co.za",
        line: "Connected security installations across the Southern Cape and Garden Route.",
      },
      {
        name: "CrossCoders",
        shot: "crosscoders",
        domain: "crosscoders.co.za",
        url: "https://crosscoders.co.za",
        line: "A software company that needed a site as considered as the work it sells.",
      },
      {
        name: "Smart Home Architects",
        shot: "smart-home-architects",
        domain: "smart-home-architects",
        url: "https://smart-home-architects.damp-feather-2944.workers.dev/",
        line: "Luxury home automation in Cape Town. Restrained, photographic, and quiet about it.",
      },
      {
        name: "Groenkloof Gym & Aquatic Centre",
        shot: "groenkloof-gym",
        domain: "groenkloofgym.co.za",
        url: "https://groenkloofgym.co.za/",
        line: "Pool, classes and memberships in George. Timetable up front, joining made obvious.",
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
        shot: "slabhead",
        domain: "slabhead.co.za",
        url: "https://slabhead.co.za",
        line: "South Africa's home for graded trading cards. Catalogue, cart and PayFast checkout.",
      },
      {
        name: "Activitar",
        shot: "activitar",
        domain: "activitar.2ko.co.za",
        url: "https://activitar.2ko.co.za/",
        line: "Curated tours and activities. Live supplier availability, four currencies, hosted checkout.",
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
      "At some point a website stops being a brochure and starts being software. Look at the four below: one files tax returns, one runs Six Sigma projects and grades them with AI, one is a trading desk, one builds websites out of a business's own socials. Not one of them is a website. They are systems with a public front door — and this is the rung where that starts.",
    notThis:
      "If nobody outside your company will ever see it — job cards, incidents, compliance, a spreadsheet forty people depend on — it is a system, not a website, and the Systems side is the honest place to start. Same team, same rates, and the rung above this one costs R4,500 more than this one does.",
    examples: [
      {
        name: "Vemia",
        shot: "vemia",
        domain: "vemia.app",
        url: "https://vemia.app",
        line: "AI social planning. Reads a brand's site, drafts channel-aware posts, schedules them.",
      },
      {
        name: "TaxUp",
        shot: "taxup",
        domain: "taxup.app",
        url: "https://taxup.app",
        line: "An AI tool for accountants. Income statements and returns, filed with one tap.",
      },
      {
        name: "Sigmafy",
        shot: "sigmafy",
        domain: "portal.sigmafy.co",
        url: "https://portal.sigmafy.co",
        line: "Six Sigma projects, SPC, training, exams and AI grading in one platform.",
      },
      {
        name: "TORI Trades",
        shot: "tori-trades",
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
