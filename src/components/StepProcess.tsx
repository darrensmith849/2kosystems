interface Step {
  number: string;
  title: string;
  description: string;
}

interface StepProcessProps {
  steps: Step[];
}

export default function StepProcess({ steps }: StepProcessProps) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border/80 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step) => (
        <div
          key={step.number}
          className="flex flex-col gap-3 bg-surface p-6"
        >
          <span className="text-2xl font-semibold text-accent">{step.number}</span>
          <h3 className="text-base font-semibold text-text">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
