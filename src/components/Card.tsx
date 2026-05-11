"use client";

import { ReactNode, useState } from "react";

interface CardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  number?: string;
  className?: string;
}

/**
 * Light-theme card primitive.
 *  - White surface with hairline border + soft elevation
 *  - Brand-green accent for icons and numbered tags
 *  - Tighter display tracking on the title, tabular-nums on the number
 *  - Lifts and brightens on hover with a soft accent-tinted glow,
 *    mirroring the phone-card aesthetic on the hero
 */
export default function Card({
  title,
  description,
  icon,
  number,
  className = "",
}: CardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`card-sweep group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--accent-border)] ${className}`}
      style={{
        boxShadow: hovered
          ? "var(--shadow-glow-accent)"
          : "var(--shadow-card)",
      }}
    >
      {/* Accent radial that lights up on hover — the same trick the
          phone notification card uses for its focal point */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background:
            "radial-gradient(120% 60% at 0% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%)",
        }}
      />

      <div className="relative flex flex-1 flex-col">
        {number && (
          <span
            className="mb-3 inline-block text-[11px] font-semibold uppercase text-[var(--accent)] tabular-nums"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            {number}
          </span>
        )}
        {icon && (
          <div
            className="mb-3 inline-flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl text-[var(--accent)] transition-transform duration-300 group-hover:scale-105"
            style={{
              background:
                "color-mix(in srgb, var(--accent) 10%, transparent)",
            }}
          >
            {icon}
          </div>
        )}
        <h3 className="mb-2 text-[17px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
          {title}
        </h3>
        <p className="text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}
