/**
 * Partners whose client pages ("sales kits") exist. A short static list to
 * start; later this comes from the platform's partner brand records.
 *
 * `demo` is what partners see before they join: every detail is a stand-in.
 * `2ko` is the house brand — 2KO selling to its own clients.
 */

import type { ProductKey } from "./catalogue";

export type Partner = {
  slug: string;
  name: string;
  /** True for the stand-in shown to prospective partners. */
  demo?: boolean;
  colour: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  /** The partner's own price, if they want it shown. Rand a month. */
  prices?: Partial<Record<ProductKey, number>>;
};

export const PARTNERS: Partner[] = [
  {
    slug: "demo",
    name: "Your provider",
    demo: true,
    colour: "#d9a95a",
  },
  {
    slug: "2ko",
    name: "2KO",
    colour: "#d9a95a",
    email: "contact@2ko.co.za",
    website: "https://www.2ko.co.za",
    prices: { receptionist: 690, bookings: 399, "business-email": 299 },
  },
];

export function partnerBySlug(slug: string): Partner | undefined {
  return PARTNERS.find((partner) => partner.slug === slug);
}
