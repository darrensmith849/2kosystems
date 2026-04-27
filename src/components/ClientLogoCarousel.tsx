"use client";

import React from "react";

type ClientLogo = {
  name: string;
  file: string;
};

const clientLogos: ClientLogo[] = [
  { name: "Denel", file: "/client-logos/denel.png" },
  { name: "Absa", file: "/client-logos/absa.png" },
  { name: "FNB", file: "/client-logos/fnb.png" },
  { name: "Airports Company South Africa", file: "/client-logos/acsa.png" },
  { name: "DHL", file: "/client-logos/dhl.png" },
  { name: "Toyota", file: "/client-logos/toyota.png" },
  { name: "Anglo American", file: "/client-logos/anglo-american.png" },
  { name: "Standard Bank", file: "/client-logos/standard-bank.png" },
  { name: "John Deere", file: "/client-logos/john-deere.png" },
  { name: "South African Reserve Bank", file: "/client-logos/sarb.png" },
  { name: "Nedbank", file: "/client-logos/nedbank.png" },
  { name: "Chevron", file: "/client-logos/chevron.png" },
  { name: "Aspen", file: "/client-logos/aspen.png" },
  { name: "Transnet", file: "/client-logos/transnet.png" },
  { name: "Alstom", file: "/client-logos/alstom.png" },
];

const repeatedLogos = [...clientLogos, ...clientLogos, ...clientLogos];

export default function ClientLogoCarousel() {
  return (
    <section className="relative w-full overflow-hidden py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Trusted by teams across South Africa
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

          <div className="client-logo-marquee-track flex w-max items-center gap-12">
            {repeatedLogos.map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex h-16 min-w-[140px] items-center justify-center rounded-2xl px-4"
                aria-hidden={index >= clientLogos.length}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.file}
                  alt={logo.name}
                  loading="lazy"
                  draggable={false}
                  className="max-h-10 w-auto max-w-[150px] select-none object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes clientLogoMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }

          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }

        .client-logo-marquee-track {
          animation: clientLogoMarquee 34s linear infinite;
          will-change: transform;
        }

        .client-logo-marquee-track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .client-logo-marquee-track {
            animation: none;
            transform: none;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
