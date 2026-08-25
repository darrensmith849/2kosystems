import type { MetadataRoute } from "next";

const SITE_URL = "https://www.2kosystems.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin console, tokenised questionnaire links and API routes carry
        // client data and must never be indexed.
        // `/v2` is the staging area for the site rebuild — it must not be
        // indexed while it duplicates live pages. Remove at cutover.
        disallow: ["/admin", "/api", "/q", "/v2"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
