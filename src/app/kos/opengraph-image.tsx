import { ImageResponse } from "next/og";

export const alt = "2KO Systems — tools you sell under your own name";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#08090a", color: "#f7f8f8", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30 }}>
          <div style={{ width: 12, height: 12, borderRadius: 99, background: "#d9a95a", display: "flex" }} />
          <b>2KO</b>
          <span style={{ color: "#8a8f98" }}>Systems</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 76, lineHeight: 1.04, letterSpacing: -2, maxWidth: 940, display: "flex" }}>
            Sell our tools under your own name.
          </div>
          <div style={{ fontSize: 30, color: "#b4b8bf", display: "flex" }}>Receptionist · Bookings · Business email</div>
        </div>
        <div style={{ fontSize: 24, color: "#d9a95a", display: "flex" }}>For agencies, web designers and consultants</div>
      </div>
    ),
    size,
  );
}
