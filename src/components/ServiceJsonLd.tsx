import { SITE_URL } from "@/lib/site";

type Props = {
  name: string;
  description: string;
  path: string;
  price?: string;
  duration?: string;
};

export default function ServiceJsonLd({
  name,
  description,
  path,
  price,
  duration,
}: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: {
      "@type": "Organization",
      name: "2KO",
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: "South Africa" },
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "ZAR",
            price,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    ...(duration ? { serviceOutput: duration } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
