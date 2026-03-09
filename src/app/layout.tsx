import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    default: "2KO Systems — Custom Systems & Intelligent Automation",
    template: "%s | 2KO Systems",
  },
  description:
    "Custom operational systems for businesses that have outgrown spreadsheets, paper, and patchwork tools. Workflow automation, portals, dashboards, and embedded AI for established businesses.",
  keywords: [
    "custom systems",
    "intelligent automation",
    "workflow automation",
    "operational systems",
    "business systems",
    "dashboards",
    "portals",
    "approvals",
    "AI operations",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="pt-[65px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
