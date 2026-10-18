import { ImageResponse } from "next/og";
import { partnerFromToken } from "@/lib/kos/brand-token";

// Neutral on purpose: the partner's name only, never ours.
export const alt = "Tools for your business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const partner = partnerFromToken((await params).token);
  const name = partner?.name ?? "Your provider";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#08090a", color: "#f7f8f8", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: partner?.colour ?? "#d9a95a", color: "#08090a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {name.charAt(0)}
          </div>
          <b>{name}</b>
        </div>
        <div style={{ fontSize: 80, lineHeight: 1.04, letterSpacing: -2, maxWidth: 900, display: "flex" }}>
          Never miss a customer again.
        </div>
        <div style={{ fontSize: 28, color: "#b4b8bf", display: "flex" }}>Every message answered · Bookings · Business email</div>
      </div>
    ),
    size,
  );
}
