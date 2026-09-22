import { ImageResponse } from "next/og";
import { OG_IMAGE_ALT, OG_IMAGE_SIZE } from "@/lib/site";

export const alt = OG_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

const capabilities = [
  ["01", "IMPROVE", "Find the constraint", "#d9a95a"],
  ["02", "TRAIN", "Build capability", "#d9a95a"],
  ["03", "AUTOMATE", "Remove repeat work", "#3fb950"],
  ["04", "MEASURE", "Hold the result", "#55a7d8"],
] as const;

/** Link preview card — a compact expression of the operating system shown on
 * the homepage, composed as code so it stays crisp at every card density. */
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
          padding: "52px 58px 44px",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(120deg, rgba(217, 169, 90,0.10) 0%, rgba(8,9,10,0) 38%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(225deg, rgba(63,185,80,0.16) 0%, rgba(8,9,10,0) 48%)",
          }}
        />

        {/* Fine operational grid. */}
        <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.22 }}>
          {[180, 360, 540, 720, 900, 1080].map((left) => (
            <div key={left} style={{ position: "absolute", top: 0, bottom: 0, left, width: 1, background: "rgba(255,255,255,.07)", display: "flex" }} />
          ))}
          {[158, 316, 474].map((top) => (
            <div key={top} style={{ position: "absolute", left: 0, right: 0, top, height: 1, background: "rgba(255,255,255,.07)", display: "flex" }} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#d9a95a", display: "flex", boxShadow: "0 0 18px rgba(217, 169, 90,.65)" }} />
            <div style={{ fontSize: 27, fontWeight: 600, color: "#f7f8f8", letterSpacing: -0.8 }}>2KO</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#8a8f98", letterSpacing: 2.4, textTransform: "uppercase" }}>
            <div style={{ width: 7, height: 7, borderRadius: 99, background: "#3fb950", display: "flex" }} />
            Operational improvement · Africa
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2, flex: 1 }}>
          <div style={{ width: 570, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 15, color: "#d9a95a", letterSpacing: 2.7, textTransform: "uppercase" }}>One accountable improvement loop</div>
            <div style={{ marginTop: 20, fontSize: 65, lineHeight: 0.98, color: "#f7f8f8", letterSpacing: -3.2, display: "flex", flexDirection: "column" }}>
              <span>Improve the process.</span>
              <span style={{ color: "#b5bac3" }}>Make the result permanent.</span>
            </div>
            <div style={{ marginTop: 25, width: 520, display: "flex", fontSize: 19, lineHeight: 1.45, color: "#8f949d" }}>
              Process, people, systems and measurement—working as one.
            </div>
          </div>

          <div style={{ width: 442, height: 364, display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,.14)", borderRadius: 18, background: "rgba(15,17,18,.91)", boxShadow: "0 28px 80px rgba(0,0,0,.50)", overflow: "hidden" }}>
            <div style={{ height: 46, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,.10)" }}>
              <div style={{ display: "flex", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: "#da5a52", display: "flex" }} />
                <div style={{ width: 8, height: 8, borderRadius: 99, background: "#d69a3b", display: "flex" }} />
                <div style={{ width: 8, height: 8, borderRadius: 99, background: "#3fb950", display: "flex" }} />
              </div>
              <div style={{ display: "flex", fontSize: 11, color: "#747982", letterSpacing: 1.7 }}>2KO · OPERATING SYSTEM</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "17px 18px 14px", gap: 8 }}>
              {capabilities.map(([number, label, detail, color]) => (
                <div key={label} style={{ height: 61, display: "flex", alignItems: "center", padding: "0 14px", border: "1px solid rgba(255,255,255,.09)", borderRadius: 10, background: "rgba(255,255,255,.025)" }}>
                  <div style={{ width: 33, display: "flex", fontSize: 11, color, letterSpacing: 1.2 }}>{number}</div>
                  <div style={{ width: 108, display: "flex", fontSize: 13, fontWeight: 600, color: "#f2f3f4", letterSpacing: 1.2 }}>{label}</div>
                  <div style={{ display: "flex", flex: 1, fontSize: 13, color: "#81868f" }}>{detail}</div>
                  <div style={{ width: 7, height: 7, borderRadius: 99, background: color, display: "flex", boxShadow: `0 0 14px ${color}` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.10)",
            paddingTop: 18,
            fontSize: 13,
            color: "#8a8f98",
            letterSpacing: 2.1,
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex" }}>Improve · Train · Automate · Systemise · Measure</div>
          <div style={{ display: "flex" }}>2ko.co.za</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
