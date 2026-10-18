import { ImageResponse } from "next/og";
import { PARTNERS, partnerBySlug } from "@/lib/kos/partners";

// The partner's initial in the browser tab, instead of the 2KO icon.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PARTNERS.map((partner) => ({ partner: partner.slug }));
}

export default async function Icon({ params }: { params: Promise<{ partner: string }> }) {
  const partner = partnerBySlug((await params).partner);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: partner?.colour ?? "#d9a95a", color: "#08090a", fontSize: 40, fontWeight: 700, fontFamily: "sans-serif" }}>
        {(partner?.name ?? "Y").charAt(0)}
      </div>
    ),
    size,
  );
}
