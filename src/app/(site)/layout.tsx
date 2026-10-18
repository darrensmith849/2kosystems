import type { ReactNode } from "react";
import Nav from "@/components/cinema/Nav";
import Footer from "@/components/cinema/Footer";
import Analytics from "@/components/cinema/Analytics";
import ChatWidget from "@/components/cinema/ChatWidget";
import { SITE_URL } from "@/lib/site";

/* The consultancy's organisation record. It lives here rather than in the
   root layout so 2kosystems.com (app/kos), which shares that root, does not
   carry it. JSON-LD is read the same in <body> as in <head>. */
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

export default function CinemaLayout({ children }: { children: ReactNode }) {
  return (
    <div data-k>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>{children}</main>
      <Footer />
      <Analytics />
      <ChatWidget />
    </div>
  );
}
