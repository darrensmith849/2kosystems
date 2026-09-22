import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/system.css";
import {
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  OG_IMAGE_SIZE,
  SITE_URL,
} from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* v2 type. Apple hardware renders SF Pro through the system stack in
   system.css; Inter is the fallback everywhere else, and IBM Plex Mono
   supplies the monospace labels where SF Mono is unavailable. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-fallback",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

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
    default: "2KO — Operational Improvement, Training & Automation",
    template: "%s | 2KO",
  },
  description:
    "2KO improves processes, builds Six Sigma capability, automates operational work and measures whether the result holds across Africa.",
  keywords: [
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
    title: "2KO — Operational Improvement, Training & Automation",
    description:
      "Improve the process, train the people, automate repeatable work and measure whether the result holds.",
    url: SITE_URL,
    images: [{ url: OG_IMAGE_PATH, ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "2KO — Operational Improvement, Training & Automation",
    description:
      "Improve the process, train the people, automate repeatable work and measure whether the result holds.",
    images: [{ url: OG_IMAGE_PATH, ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  name: "2KO",
  description:
    "Operational improvement, Six Sigma training, workflow automation, systems and statistical measurement for organisations across Africa.",
  url: SITE_URL,
  areaServed: { "@type": "Place", name: "Africa" },
  priceRange: "R7,500+",
  currenciesAccepted: "ZAR",
  knowsAbout: [
    "Custom operational systems",
    "Process improvement",
    "Process optimisation",
    "Six Sigma training",
    "Operational excellence",
    "Statistical process control",
    "Sigmafy",
    "Managed improvement",
    "Workflow automation",
    "Business process digitisation",
    "Approvals and governance systems",
    "Operational dashboards",
    "AI-assisted operations",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "2KO operational improvement capabilities",
    itemListElement: [
      { slug: "", url: "https://www.sixsigmasouthafrica.co.za/", name: "Six Sigma Training", description: "Accredited capability development connected to applied operational improvement." },
      { slug: "sigmafy", name: "Sigmafy", description: "Statistical process control, project execution and measurement support for operational improvement." },
      { slug: "process-review", name: "Half-Day Process Review", description: "One process walked end to end, followed by a build-or-do-not-build recommendation." },
      { slug: "audit", name: "Process and Automation Opportunity Audit", description: "Three quantified improvement opportunities and one recommended intervention." },
      { slug: "get-off-excel", name: "Get Off Excel", description: "One spreadsheet rebuilt as a secure multi-user system." },
      { slug: "systems/job-card-system", name: "Job Card System", description: "Raise, assign, schedule and close out work with proof captured on site." },
      { slug: "systems/sheq-incident-reporting", name: "SHEQ Incident Reporting", description: "Incident capture, investigation, corrective actions and regulator-ready reporting." },
      { slug: "systems/contractor-compliance", name: "Contractor Compliance Register", description: "Onboarding, medicals, inductions, expiry alerts and site access approval." },
      { slug: "systems/stock-and-asset-register", name: "Stock & Asset Register", description: "One register for what you own, where it is and what moved." },
    ].map((item: { slug: string; url?: string; name: string; description: string }) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: item.name,
        description: item.description,
        url: item.url ?? `${SITE_URL}/${item.slug}`,
      },
    })),
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${plexMono.variable} ${koMark.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
