import { ReactNode } from "react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon?: ReactNode;
}

interface StepProcessProps {
  steps: Step[];
}

export default function StepProcess({ steps }: StepProcessProps) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border-subtle)] sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step) => (
        <div
          key={step.number}
          className="flex flex-col gap-3 bg-[var(--color-surface)] p-6 transition-colors hover:bg-[var(--color-bg-2)]"
        >
          <div className="flex items-center gap-3">
            <span
              className="text-[26px] font-semibold tracking-[var(--tracking-display)] text-[var(--accent)] tabular-nums"
            >
              {step.number}
            </span>
            {step.icon && (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--accent)]"
                style={{
                  background:
                    "color-mix(in srgb, var(--accent) 10%, transparent)",
                }}
              >
                {step.icon}
              </span>
            )}
          </div>
          <h3 className="text-[15px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg)]">
            {step.title}
          </h3>
          <p className="text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
