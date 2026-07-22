import { ImageResponse } from "next/og";

// Route segment config — static, generated at build time.
export const alt =
  "2KO Systems — Custom Operational Systems & Intelligent Automation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social/link preview card. Rendered as the site's og:image (and, via
// twitter-image re-export, the Twitter/X card).
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
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #06180d 0%, #0a3517 45%, #0a6e33 100%)",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            <span style={{ color: "#ffffff" }}>2</span>
            <span style={{ color: "#2dd46f" }}>KO</span>
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.62)",
              paddingTop: 8,
            }}
          >
            Systems
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              maxWidth: 900,
            }}
          >
            Custom operational systems &amp; intelligent automation.
          </div>
          <div
            style={{
              fontSize: 27,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.74)",
              maxWidth: 880,
            }}
          >
            Workflow automation, approvals, dashboards, portals and embedded AI
            — for established mining, agriculture and logistics businesses.
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 26,
              fontWeight: 600,
              color: "#2dd46f",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 12,
                background: "#2dd46f",
              }}
            />
            www.2kosystems.com
          </div>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Southern Africa
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
