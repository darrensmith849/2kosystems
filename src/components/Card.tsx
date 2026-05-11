import { ReactNode } from "react";

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
 *  - Subtle accent-tinted hover (no heavy shadow lift)
 */
export default function Card({
  title,
  description,
  icon,
  number,
  className = "",
}: CardProps) {
  return (
    <div
      className={`card-sweep group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-200 hover:border-[var(--accent-border)] hover:-translate-y-0.5 ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
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
          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--accent)]"
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
  );
}
