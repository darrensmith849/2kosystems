import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/system.css";
import {
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  OG_IMAGE_SIZE,
  SITE_URL,
} from "@/lib/site";

/* The 2KO mark itself. Three glyphs — 2, K and O — carrying the real
   letterforms, so typing "2KO" sets the logo with Africa in the counter.
   display:"block" rather than "swap": the mark is a logo, and swapping it
   in after a system-font paint reads as a flash of the wrong brand. */
const koMark = localFont({
  src: "../fonts/2ko-mark.woff2",
  variable: "--font-ko-mark",
  display: "block",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: {
    default: "2KO — Lean and Six Sigma Deployment at Scale",
    template: "%s | 2KO",
  },
  description:
    "2KO runs large-scale Lean and Six Sigma programmes across Africa: accredited training at every belt, real projects and measured savings on Sigmafy.",
  keywords: [
    "Lean Six Sigma deployment",
    "Six Sigma training for companies",
    "Lean Six Sigma programme Africa",
    "process improvement South Africa",
    "process optimisation",
    "Six Sigma training South Africa",
    "operational excellence Africa",
    "statistical process control",
    "Sigmafy",
    "workflow automation",
    "managed improvement",
    "custom operational systems",
    "business systems South Africa",
    "operational dashboards",
    "approvals engine",
    "client portals",
    "AI operations",
    "mining systems",
    "agriculture systems",
    "logistics systems",
  ],
  authors: [{ name: "2KO" }],
  creator: "2KO",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "2KO",
    title: "2KO — Lean and Six Sigma Deployment at Scale",
    description:
      "Train the people, run real projects and measure whether the result holds, from White Belt to Black Belt on Sigmafy.",
    url: SITE_URL,
    images: [{ url: OG_IMAGE_PATH, ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "2KO — Lean and Six Sigma Deployment at Scale",
    description:
      "Train the people, run real projects and measure whether the result holds, from White Belt to Black Belt on Sigmafy.",
    images: [{ url: OG_IMAGE_PATH, ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA" data-scroll-behavior="smooth">
      <head>
        {/* Every reveal on this site starts at opacity 0 and is switched on by
            an IntersectionObserver. With no JavaScript that switch never
            happens and the page renders blank — which on a page we pay per
            click for is a bill with nothing shown for it. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>.k-rise,.k-settle{opacity:1!important;transform:none!important}</style>",
          }}
        />
      </head>
      <body
        className={`${koMark.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
