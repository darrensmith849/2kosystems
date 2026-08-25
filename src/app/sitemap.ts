import type { MetadataRoute } from "next";

const SITE_URL = "https://www.2kosystems.com";

/**
 * Bump this when page content is meaningfully revised. It is deliberately a
 * fixed constant rather than `new Date()` — a lastmod that always says "now"
 * is noise, and search engines learn to ignore it.
 */
const LAST_REVIEWED = new Date("2026-08-20");

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const routes: Entry[] = [
  { path: "", priority: 1.0, changeFrequency: "monthly" },
  { path: "/get-off-excel", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions", priority: 0.9, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/how-we-work", priority: 0.8, changeFrequency: "monthly" },
  { path: "/industries", priority: 0.8, changeFrequency: "monthly" },
  { path: "/case-studies", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/get-started", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: LAST_REVIEWED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
