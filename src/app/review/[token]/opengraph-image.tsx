import { ImageResponse } from "next/og";
import { getReview, reviewTotals, rand } from "@/lib/reviews";

export const alt = "Improvement review";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The hook. When this link is pasted into WhatsApp, Slack or an email client,
 * the preview shows the sponsor's own company name and their own number —
 * which is what earns the click.
 */
export default async function ReviewOgImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const review = getReview(token);
  const t = review ? reviewTotals(review) : null;

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
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -240,
            left: 240,
            width: 860,
            height: 660,
            display: "flex",
            background: "radial-gradient(closest-side, rgba(232,163,61,0.22), rgba(232,163,61,0))",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#e8a33d", display: "flex" }} />
          <div style={{ fontSize: 24, color: "#f7f8f8" }}>2KO Systems</div>
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
            Improvement review · {review?.company ?? "Private"}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 62,
              lineHeight: 1.05,
              color: "#f7f8f8",
              letterSpacing: -2.2,
              maxWidth: 940,
              display: "flex",
            }}
          >
            {t
              ? `${t.manualCount} of your ${t.projectCount} improvements depend on someone remembering.`
              : "Improvement review"}
          </div>
          {t && (
            <div style={{ marginTop: 26, fontSize: 34, color: "#e8a33d", display: "flex" }}>
              {rand(t.atRisk)} a year sitting behind a manual control
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.10)",
            paddingTop: 22,
            fontSize: 18,
            color: "#8a8f98",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>Costed by your own team</div>
          <div style={{ display: "flex" }}>Private link</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
