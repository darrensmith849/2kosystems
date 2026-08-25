import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats to browsers that accept them. The site leans on
    // large photography, and these two cut hero payloads by well over half.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
