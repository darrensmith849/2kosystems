import type { MetadataRoute } from "next";

const SITE_URL = "https://www.2kosystems.com";

/**
 * Bump when page content is meaningfully revised. Deliberately a fixed
 * constant — a lastmod that always says "now" is noise.
 */
const LAST_REVIEWED = new Date("2026-08-25");

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const routes: Entry[] = [
  { path: "", priority: 1.0, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/get-off-excel", priority: 0.9, changeFrequency: "monthly" },
  { path: "/systems", priority: 0.9, changeFrequency: "monthly" },
  { path: "/method", priority: 0.8, changeFrequency: "monthly" },
  { path: "/sectors", priority: 0.8, changeFrequency: "monthly" },
  { path: "/studio", priority: 0.6, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
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
