import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import {
  ASSISTANT_RETRIEVAL_BOTS,
  BLOCKED_BOTS,
  SEARCH_ENGINE_BOTS,
} from "@/lib/bots";

/** Internal tooling and API routes, kept out of every crawler. */
const DISALLOW = ["/api", "/review", "/internal"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },

      // Named explicitly because these are the crawlers that produce citations
      // in answer engines, and this site sells to people who increasingly ask
      // a model before they ask a search box. Same policy as
      // sixsigmasouthafrica.co.za and sixsigmauk.com.
      ...ASSISTANT_RETRIEVAL_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: DISALLOW,
      })),
      ...SEARCH_ENGINE_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: DISALLOW,
      })),
      ...BLOCKED_BOTS.map((bot) => ({ userAgent: bot, disallow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
