/**
 * The 2KO Systems catalogue — one place for every name, line and price the
 * partner site and the client pages show, so the two can never disagree.
 *
 * Prices are in rand, per client, per month. They are proposals until the
 * first partners sign: every page that shows one says so (PRICE_NOTE).
 * Later this file is fed by the platform's public catalogue endpoint.
 *
 * Written so a 12-year-old gets it.
 */

export type ProductKey = "receptionist" | "bookings" | "business-email";

export type Product = {
  key: ProductKey;
  name: string;
  /** One sentence, for partners. */
  line: string;
  /** What it is, for the business owner (client pages). */
  client: { title: string; lead: string; points: string[] };
  /** What the partner's client gets. */
  gets: string[];
  youDo: string[];
  weDo: string[];
  setup: string;
  needs: string;
  /** What 2KO charges the partner. */
  wholesale: number;
  /** What we suggest the partner charges. */
  suggested: number;
  unit: string;
  status: string;
};

export const PRICE_NOTE = "Proposed prices. We confirm them with you when you join.";

export const PRODUCTS: Product[] = [
  {
    key: "receptionist",
    name: "Receptionist",
    line: "Answers your client's WhatsApp day and night, and books people in.",
    client: {
      title: "Every message answered. Even at 10pm.",
      lead: "A helper that replies on your own WhatsApp number in seconds. It knows your prices and your hours, and it books people in while you sleep.",
      points: [
        "Replies in seconds, every time",
        "Only says what you told it",
        "Books people into open times",
        "Hands over to you when it's unsure",
      ],
    },
    gets: [
      "Replies on their own WhatsApp number",
      "Answers from their prices, hours and services",
      "Books people in, with Bookings",
      "Follows up people who asked but didn't book",
      "Passes tricky messages to the owner",
    ],
    youDo: ["Sell it", "Tell us about the business", "Be their first call"],
    weDo: ["Connect their WhatsApp", "Teach it the business", "Watch the answers for the first two weeks", "Keep it running"],
    setup: "About a week. Their WhatsApp number has to be connected and approved.",
    needs: "A WhatsApp Business number. No website needed.",
    wholesale: 290,
    suggested: 690,
    unit: "a month",
    status: "In build",
  },
  {
    key: "bookings",
    name: "Bookings",
    line: "A booking link with reminders and review requests built in.",
    client: {
      title: "Fewer no-shows. More five-star reviews.",
      lead: "One link where customers pick a time. It reminds them the day before, thanks them after, and asks every customer for a Google review.",
      points: [
        "Customers book any time",
        "A reminder the day before",
        "A thank-you after the visit",
        "Every customer asked for a review",
      ],
    },
    gets: [
      "A booking link with their open times",
      "On their Google “Book” button, Instagram and WhatsApp",
      "Confirmation and a reminder the day before",
      "A thank-you and a review request after each visit",
      "Their day and week on one screen",
    ],
    youDo: ["Sell it", "Share their services and hours", "Be their first call"],
    weDo: ["Build the booking page", "Put it on Google, Instagram and WhatsApp", "Send every reminder", "Keep it running"],
    setup: "One or two days.",
    needs: "Nothing. It works without a website.",
    wholesale: 149,
    suggested: 399,
    unit: "a month",
    status: "Next up",
  },
  {
    key: "business-email",
    name: "Business email",
    line: "name@theirbusiness.com on Google Workspace, set up for them.",
    client: {
      title: "Look like a real business in every email.",
      lead: "Swap the Gmail address for one with your business name in it. Same Gmail you know, on your phone and laptop, set up for you.",
      points: [
        "you@yourbusiness.co.za",
        "The Gmail app you already use",
        "Works on your phone and laptop",
        "Set up for you, nothing to learn",
      ],
    },
    gets: [
      "name@theirbusiness.com on Google Workspace",
      "Set up on their phone and laptop",
      "Old emails moved across",
      "A domain bought for them if they don't have one",
    ],
    youDo: ["Sell it", "Tell us the name they want", "Be their first call"],
    weDo: ["Buy or connect the domain", "Set up the mailbox", "Move their old email", "Fix it if it breaks"],
    setup: "Same day, in most cases.",
    needs: "A domain name. We can buy one for them.",
    wholesale: 169,
    suggested: 299,
    unit: "a mailbox a month",
    status: "Ready first",
  },
];

/** Included free with any product, for clients with no website. */
export const LANDING_PAGE = {
  name: "Landing page",
  line: "One clean page with their name, services, hours and a booking button. Free with any product.",
};

export function productByKey(key: string): Product | undefined {
  return PRODUCTS.find((product) => product.key === key);
}

export function rand(value: number) {
  // Spelled out rather than toLocaleString, which differs between the server
  // and browsers and would break hydration.
  const whole = Math.round(value);
  const digits = String(Math.abs(whole)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${whole < 0 ? "-" : ""}R${digits}`;
}

/** Card fees on the monthly charge: 2.9% + R1, the local card rate. */
export const CARD_FEE = { percent: 0.029, fixed: 1 };
