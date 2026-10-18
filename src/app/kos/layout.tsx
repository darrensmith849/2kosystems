import type { Metadata } from "next";
import { KOS_URL } from "@/lib/site";
import "./kos.css";

/**
 * 2KO Systems — 2kosystems.com. Served from this app but reached only through
 * that host (see proxy.ts), so everything here overrides the consultancy's
 * root metadata rather than inheriting it.
 */
export const metadata: Metadata = {
  metadataBase: new URL(KOS_URL),
  title: {
    absolute: "2KO Systems — tools you sell under your own name",
    template: "%s | 2KO Systems",
  },
  description:
    "Sell an AI receptionist, online bookings and business email to your clients, under your own brand and at your own price. We do the work.",
  keywords: [],
  authors: [{ name: "2KO Systems" }],
  creator: "2KO Systems",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "2KO Systems",
    url: KOS_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function KosLayout({ children }: { children: React.ReactNode }) {
  return <div data-k className="min-h-svh">{children}</div>;
}
