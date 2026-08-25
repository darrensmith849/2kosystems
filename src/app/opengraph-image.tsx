import { ImageResponse } from "next/og";

export const alt = "2KO Systems — operational systems for South African industry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Link preview card. Matches the site: near-black ground, a soft glow behind
 * the mark, hairline chrome and the same monospace label treatment.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090a",
          padding: 72,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/*
          Satori (next/og) renders `radial-gradient(closest-side, …)` as a hard
          rectangle, so the glow is built from linear gradients instead — they
          rasterise correctly and read the same at card size.
        */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(135deg, rgba(63,185,80,0.20) 0%, rgba(63,185,80,0.05) 34%, rgba(8,9,10,0) 62%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(215deg, rgba(232,163,61,0.16) 0%, rgba(8,9,10,0) 46%)",
          }}
        />

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#e8a33d",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 26, color: "#f7f8f8", letterSpacing: -0.4 }}>
            2KO Systems
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 19,
              color: "#8a8f98",
              letterSpacing: 3,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Operational systems · South Africa
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 76,
              lineHeight: 1.02,
              color: "#f7f8f8",
              letterSpacing: -2.6,
              maxWidth: 900,
              display: "flex",
            }}
          >
            It runs whether you&rsquo;re watching.
          </div>
        </div>

        {/* Baseline strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.10)",
            paddingTop: 22,
            fontSize: 19,
            color: "#8a8f98",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>Fixed scope · Published prices</div>
          <div style={{ display: "flex" }}>2kosystems.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
