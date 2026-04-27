import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "2KO Systems — Custom Operational Systems & Intelligent Automation",
    template: "%s | 2KO Systems",
  },
  description:
    "Custom operational systems for established businesses. Workflow automation, approvals engines, dashboards, portals, and embedded AI — built for mining, agriculture, logistics, and operations-led organisations.",
  keywords: [
    "custom operational systems",
    "intelligent automation",
    "workflow automation",
    "business systems South Africa",
    "operational dashboards",
    "approvals engine",
    "client portals",
    "AI operations",
    "mining systems",
    "agriculture systems",
    "logistics systems",
  ],
  authors: [{ name: "2KO Systems" }],
  creator: "2KO Systems",
  metadataBase: new URL("https://2kosystems.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "2KO Systems",
    title: "2KO Systems — Custom Operational Systems & Intelligent Automation",
    description:
      "Custom operational systems for established businesses. Workflow automation, approvals, dashboards, portals, and embedded AI.",
    url: "https://2kosystems.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "2KO Systems — Custom Operational Systems & Intelligent Automation",
    description:
      "Custom operational systems for established businesses. Workflow automation, approvals, dashboards, portals, and embedded AI.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "2KO Systems",
  description:
    "Custom operational systems and intelligent automation for established businesses across Africa.",
  url: "https://2kosystems.vercel.app",
  parentOrganization: {
    "@type": "Organization",
    name: "2KO Group",
  },
  areaServed: {
    "@type": "Place",
    name: "Southern Africa",
  },
  knowsAbout: [
    "Custom operational systems",
    "Workflow automation",
    "Business process digitisation",
    "Approvals and governance systems",
    "Operational dashboards",
    "AI-assisted operations",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "2KO Systems Services",
    itemListElement: [
      {
        "@type": "Service",
        name: "Systems Opportunity Audit",
        description:
          "Diagnostic to identify the best workflow to digitise first and define the ROI case.",
      },
      {
        "@type": "Service",
        name: "Workflow Automation",
        description:
          "Custom workflow automation systems for operational processes.",
      },
      {
        "@type": "Service",
        name: "Client & Staff Portals",
        description:
          "Secure role-based portals for onboarding, requests, and document access.",
      },
      {
        "@type": "Service",
        name: "Dashboards & Reporting",
        description:
          "Live operational dashboards and automated reporting systems.",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChatWidget>
          <Header />
          <main className="pt-[65px]">{children}</main>
          <Footer />
        </ChatWidget>
      </body>
    </html>
  );
}
