interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={`reveal-up mb-12 ${centered ? "text-center" : ""}`}>
      {eyebrow && (
        <span className="mb-4 inline-block rounded-full border border-accent-border bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-accent">
          {eyebrow}
        </span>
      )}
      <h2
        className="font-semibold text-text"
        style={{
          fontSize: "var(--text-display-md)",
          letterSpacing: "var(--tracking-display)",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="mx-auto mt-5 max-w-2xl leading-relaxed text-muted"
          style={{
            fontSize: "var(--text-headline)",
            letterSpacing: "var(--tracking-tight)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
