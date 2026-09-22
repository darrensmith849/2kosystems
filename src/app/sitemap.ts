import type { MetadataRoute } from "next";
import { WEB_TIERS } from "@/lib/websites";
import { PRODUCTS } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

/**
 * Bump when page content is meaningfully revised. Deliberately a fixed
 * constant — a lastmod that always says "now" is noise.
 */
const LAST_REVIEWED = new Date("2026-09-12");

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const routes: Entry[] = [
  { path: "", priority: 1.0, changeFrequency: "monthly" },
  { path: "/process-review", priority: 1.0, changeFrequency: "monthly" },
  { path: "/audit", priority: 1.0, changeFrequency: "monthly" },
  { path: "/automation", priority: 1.0, changeFrequency: "monthly" },
  { path: "/training", priority: 1.0, changeFrequency: "monthly" },
  { path: "/sigmafy", priority: 1.0, changeFrequency: "monthly" },
  { path: "/systems", priority: 0.9, changeFrequency: "monthly" },
  { path: "/managed-improvement", priority: 0.9, changeFrequency: "monthly" },
  { path: "/method", priority: 0.9, changeFrequency: "monthly" },
  { path: "/results", priority: 0.9, changeFrequency: "monthly" },
  // Retained for paid-search and direct website-service demand, but no longer
  // positioned as the primary operational offer.
  { path: "/websites", priority: 0.7, changeFrequency: "monthly" },
  // One landing page per tier, each targeting a different search intent.
  ...WEB_TIERS.map((t) => ({
    path: `/websites/${t.slug}`,
    priority: 0.9,
    changeFrequency: "monthly" as const,
  })),
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/quote", priority: 0.9, changeFrequency: "monthly" },
  { path: "/get-off-excel", priority: 0.9, changeFrequency: "monthly" },
  // Productised systems — high-intent search landing pages.
  ...PRODUCTS.map((product) => ({
    path: `/systems/${product.slug}`,
    priority: 0.9,
    changeFrequency: "monthly" as const,
  })),
  { path: "/sectors", priority: 0.8, changeFrequency: "monthly" },
  { path: "/studio", priority: 0.6, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: LAST_REVIEWED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
