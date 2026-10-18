import { KOS_URL } from "@/lib/site";

// Served as 2kosystems.com/robots.txt (proxy rewrites it here). Client pages
// are meant to be sent, not found.
export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /kit/",
    "",
    `Sitemap: ${KOS_URL}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
