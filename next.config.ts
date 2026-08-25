import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The old marketing URLs are indexed and linked from elsewhere. Redirect
   * them permanently onto their replacements rather than serving 404s.
   */
  async redirects() {
    return [
      { source: "/solutions", destination: "/systems", permanent: true },
      { source: "/how-we-work", destination: "/method", permanent: true },
      { source: "/industries", destination: "/sectors", permanent: true },
      { source: "/about", destination: "/studio", permanent: true },
      { source: "/get-started", destination: "/contact", permanent: true },
      { source: "/case-studies", destination: "/sectors", permanent: true },
      { source: "/v2", destination: "/", permanent: true },
      { source: "/v2/:path*", destination: "/:path*", permanent: true },
    ];
  },
  images: {
    // Serve modern formats to browsers that accept them. The site leans on
    // large photography, and these two cut hero payloads by well over half.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
