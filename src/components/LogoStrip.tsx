"use client";

const logos = [
  "Anglo American",
  "Toyota",
  "Standard Bank",
  "Nedbank",
  "John Deere",
  "Sasol",
  "Sappi",
  "Transnet",
  "Vodacom",
  "Unilever",
  "Clientele Insurance",
];

function LogoTrack() {
  return (
    <div className="flex shrink-0 items-center gap-12">
      {logos.map((name) => (
        <div
          key={name}
          className="flex h-10 shrink-0 items-center px-4 text-sm font-semibold tracking-wide text-muted2/60 md:h-14 md:text-base"
        >
          {name}
        </div>
      ))}
    </div>
  );
}

export default function LogoStrip() {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted2">
          Trusted across the 2KO group by leading organisations
        </p>

        {/* Marquee */}
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          <div className="flex w-max animate-marquee gap-12 will-change-transform [backface-visibility:hidden] motion-reduce:animate-none">
            <LogoTrack />
            <LogoTrack />
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted2">
          And over 5,000 more across the 2KO group.
        </p>
      </div>
    </section>
  );
}
