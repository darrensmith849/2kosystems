import { ReactNode } from "react";

interface CardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  number?: string;
  className?: string;
}

export default function Card({
  title,
  description,
  icon,
  number,
  className = "",
}: CardProps) {
  return (
    <div
      className={`group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/30 ${className}`}
    >
      {number && (
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
          {number}
        </span>
      )}
      {icon && <div className="mb-3 text-accent">{icon}</div>}
      <h3 className="mb-2 text-base font-semibold text-text">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
