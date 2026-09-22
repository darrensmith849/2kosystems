"use client";

import { useEffect, useState } from "react";

/**
 * Floating instrument cards layered over the map. Abstracted readouts, not
 * screenshots and not any client's data — only the clock is live.
 */

function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-ZA", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time ?? "--:--"}</span>;
}

export function ThroughputCard() {
  return (
    <div className="k-card k-card--float w-[236px]">
      <div className="flex items-center justify-between">
        <span className="k-mono">Throughput</span>
        <span className="k-dot" />
      </div>
      <p className="k-num mt-3 text-[30px] leading-none">1,284</p>
      <p className="k-mono mt-2">requests · 24h</p>
      <div className="mt-4 flex h-8 items-end gap-[3px]">
        {[38, 52, 44, 61, 49, 72, 58, 80, 66, 91, 74, 86].map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-[1px]"
            style={{
              height: `${h}%`,
              background: i > 8 ? "var(--signal)" : "rgba(244,241,234,0.28)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ApprovalCard() {
  return (
    <div className="k-card k-card--float-slow w-[252px]">
      <div className="flex items-center justify-between">
        <span className="k-mono">Approval queue</span>
        <span className="k-mono">Live</span>
      </div>
      <dl className="mt-4 flex flex-col gap-2.5">
        {[
          ["Awaiting sign-off", "3"],
          ["Escalated", "1"],
          ["Cleared today", "27"],
        ].map(([label, value], i) => (
          <div key={label} className="flex items-baseline justify-between">
            <dt className="text-[12px] text-[var(--warm-70)]">{label}</dt>
            <dd
              className="k-num text-[15px]"
              style={{ color: i === 2 ? "var(--signal)" : "var(--warm)" }}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div
        className="mt-4 flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid var(--hair)" }}
      >
        <span className="k-mono">Last sync</span>
        <span className="k-mono" style={{ color: "var(--warm-70)" }}>
          <Clock />
        </span>
      </div>
    </div>
  );
}

export function UptimeCard() {
  return (
    <div className="k-card k-card--float w-[214px]">
      <span className="k-mono">Uptime · 90d</span>
      <p className="k-num mt-3 text-[28px] leading-none" style={{ color: "var(--signal)" }}>
        99.98%
      </p>
      <div className="mt-4 flex gap-[2px]">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className="h-4 flex-1 rounded-[1px]"
            style={{
              background: i === 19 ? "var(--ember)" : "rgba(78,201,124,0.55)",
            }}
          />
        ))}
      </div>
      <p className="k-mono mt-3">1 planned window</p>
    </div>
  );
}
