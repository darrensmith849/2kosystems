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
        <p
          className="mb-4 text-[12px] font-medium uppercase text-[var(--color-fg-muted)]"
          style={{ letterSpacing: "var(--tracking-eyebrow)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="font-semibold text-[var(--color-fg)]"
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
          className={`mt-5 text-[var(--color-fg-muted)] ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
          style={{
            fontSize: "var(--text-headline)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
