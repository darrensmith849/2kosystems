import { RATES, TIMEBOX } from "./pricing";

/**
 * One ladder, both ends.
 *
 * The websites work and the systems work were priced separately and, on the
 * site, never mentioned each other. Laid out by price they turn out to be a
 * single continuum with a seam in the middle:
 *
 *   Bespoke        from R75,000   6 weeks
 *   Get Off Excel       R79,500   4 weeks
 *   Job Card System     R95,000   5 weeks
 *
 * Same money, same duration, same team, two pages that behaved as if the other
 * did not exist. And every example on the Bespoke page — Vemia, TaxUp, Sigmafy,
 * TORI — is software with a public front door rather than a website.
 *
 * So this is the shared spine. `seam` marks the rung where a website stops
 * being a brochure and starts being software; everything above it is bought by
 * operations, everything below by the owner.
 */

export type Rung = {
  name: string;
  price: string;
  time: string;
  /** What you get, in the buyer's terms, not ours. */
  what: string;
  href: string;
  side: "web" | "system";
  /** The crossing point. Rendered with the divider above it. */
  seam?: true;
};

export const LADDER: Rung[] = [
  {
    name: "Launch",
    price: RATES.siteLaunch,
    time: TIMEBOX.siteLaunch,
    what: "One page. Who you are, what you do, how to call you.",
    href: "/websites/launch",
    side: "web",
  },
  {
    name: "Business",
    price: RATES.siteBusiness,
    time: TIMEBOX.siteBusiness,
    what: "The full site. Services, team, work — and you edit it yourself.",
    href: "/websites/business",
    side: "web",
  },
  {
    name: "Commerce",
    price: `from ${RATES.siteCommerceFrom}`,
    time: TIMEBOX.siteCommerce,
    what: "A shop. Catalogue, gateway, stock, VAT, order emails that arrive.",
    href: "/websites/commerce",
    side: "web",
  },
  {
    name: "Bespoke",
    price: `from ${RATES.siteBespokeFrom}`,
    time: TIMEBOX.siteBespoke,
    what: "Logins, portals, calculations. A website that does something.",
    href: "/websites/bespoke",
    side: "web",
  },
  {
    name: "Get Off Excel",
    price: RATES.getOffExcel,
    time: TIMEBOX.getOffExcel,
    what: "One spreadsheet that half the company depends on, rebuilt properly.",
    href: "/get-off-excel",
    side: "system",
    seam: true,
  },
  {
    name: "Job Card System",
    price: RATES.jobCard,
    time: TIMEBOX.jobCard,
    what: "One operational process, productised. Capture, route, approve, record.",
    href: "/systems/job-card-system",
    side: "system",
  },
  {
    name: "Proof-of-Value Pilot",
    price: `from ${RATES.pilotFrom}`,
    time: TIMEBOX.pilot,
    what: "One workflow proven end to end, on your data, before you commit.",
    href: "/pricing",
    side: "system",
  },
  {
    name: "Core System Build",
    price: `${RATES.buildFrom} – ${RATES.buildTo}`,
    /** TIMEBOX.buildPhase reads "4–6 weeks per phase" — too long for the column,
        and the "per phase" half is already said in `what`. */
    time: "per phase",
    what: "The operation itself, phased. Fixed price per phase.",
    href: "/pricing",
    side: "system",
  },
];

/**
 * The self-selection test. People cannot reliably say whether they want a
 * website or a system, but they can always answer this one.
 */
export const LOGIN_TEST = [
  { who: "Nobody", then: "A website.", where: "Launch, Business", href: "/websites" },
  { who: "Customers, to buy", then: "A shop.", where: "Commerce", href: "/websites/commerce" },
  {
    who: "Customers, to do business with you",
    then: "Both, and this is the seam.",
    where: "Bespoke",
    href: "/websites/bespoke",
  },
  {
    who: "Your staff, every morning",
    then: "A system. The website is the least of it.",
    where: "Systems",
    href: "/systems",
  },
];
