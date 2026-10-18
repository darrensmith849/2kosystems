import { PRODUCTS } from "@/lib/kos/catalogue";
import { KOS_URL } from "@/lib/site";

// Served as 2kosystems.com/sitemap.xml. Partner pages only.
const PATHS = ["/", ...PRODUCTS.map((p) => `/${p.key}`), "/earn", "/try", "/apply", "/faq", "/contact", "/privacy", "/terms"];

export function GET() {
  const urls = PATHS.map((path) => `  <url><loc>${KOS_URL}${path === "/" ? "" : path}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
