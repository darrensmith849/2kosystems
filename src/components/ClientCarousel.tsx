"use client";

const clients = [
  "KPMG",
  "Vodacom",
  "Unilever",
  "Clientele Insurance",
  "Discovery",
  "Sasol",
  "Nedbank",
  "Standard Bank",
  "Old Mutual",
  "ABSA",
];

export default function ClientCarousel() {
  const loopedClients = [...clients, ...clients];

  return (
    <section className="relative overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--color-hero-bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--color-hero-bg)] to-transparent" />

      <div className="client-marquee">
        <div className="client-marquee-track">
          {loopedClients.map((client, index) => (
            <div
              key={`${client}-${index}`}
              className="client-marquee-item"
            >
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
