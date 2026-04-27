"use client";

import Image from "next/image";
import { useState } from "react";

type IconProps = { className?: string };

const iconStroke = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const PickaxeIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="M14 13h.01" />
    <path d="M21 8a4 4 0 0 1-4 4l-4-4a4 4 0 0 1 4-4 4 4 0 0 1 4 4Z" />
    <path d="m13 12-2.79 2.79" />
    <path d="m9.21 14.21-6.36 6.36a1 1 0 1 0 1.42 1.42l6.36-6.36" />
    <path d="m18 19 3-3" />
  </svg>
);

const CarIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L17.5 11l-1.4-2.8A2 2 0 0 0 14.3 7H9.7a2 2 0 0 0-1.8 1.2L6.5 11l-3 .1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const LandmarkIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <line x1="3" x2="21" y1="22" y2="22" />
    <line x1="6" x2="6" y1="18" y2="11" />
    <line x1="10" x2="10" y1="18" y2="11" />
    <line x1="14" x2="14" y1="18" y2="11" />
    <line x1="18" x2="18" y1="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
);

const WheatIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="M2 22 16 8" />
    <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
    <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
    <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
    <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
    <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
    <path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
    <path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
  </svg>
);

const ZapIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

const TreePineIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z" />
    <path d="M12 22v-3" />
  </svg>
);

const TruckIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

const RadioTowerIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9" />
    <path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5" />
    <circle cx="12" cy="9" r="2" />
    <path d="M16.2 4.8c2 2 2.26 5.11.8 7.47" />
    <path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1" />
    <path d="M9.5 18h5" />
    <path d="m8 22 4-11 4 11" />
  </svg>
);

const ShoppingBagIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ShieldCheckIcon = ({ className }: IconProps) => (
  <svg {...iconStroke} className={className} aria-hidden="true">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const industries: { label: string; Icon: (p: IconProps) => React.JSX.Element }[] = [
  { label: "Mining", Icon: PickaxeIcon },
  { label: "Automotive", Icon: CarIcon },
  { label: "Banking", Icon: LandmarkIcon },
  { label: "Agriculture", Icon: WheatIcon },
  { label: "Energy", Icon: ZapIcon },
  { label: "Forestry", Icon: TreePineIcon },
  { label: "Logistics", Icon: TruckIcon },
  { label: "Telecommunications", Icon: RadioTowerIcon },
  { label: "FMCG", Icon: ShoppingBagIcon },
  { label: "Insurance", Icon: ShieldCheckIcon },
];

type Brand = { name: string; src: string; height?: number };

const brands: Brand[] = [
  { name: "Anglo American", src: "/client-logos/anglo-american.png" },
  { name: "WorldNet", src: "/client-logos/worldnet.png" },
  { name: "Transnet", src: "/client-logos/transnet.png" },
  { name: "Toyota", src: "/client-logos/toyota.png" },
  { name: "Standard Bank", src: "/client-logos/standard-bank.png" },
  { name: "SARS", src: "/client-logos/sars.png" },
  { name: "Nedbank", src: "/client-logos/nedbank.png" },
  { name: "John Deere", src: "/client-logos/john-deere.png" },
  { name: "Airports Company", src: "/client-logos/airports-company.png" },
  { name: "ABSA", src: "/client-logos/absa.png" },
  { name: "Valve", src: "/client-logos/valve.png" },
];

function BrandLogo({ brand }: { brand: Brand }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="text-base md:text-lg font-semibold tracking-wide text-text whitespace-nowrap">
        {brand.name}
      </span>
    );
  }
  return (
    <Image
      src={brand.src}
      alt={brand.name}
      width={160}
      height={brand.height ?? 40}
      className="h-12 md:h-14 w-auto max-w-[180px] object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}

function IndustryTrack() {
  const tripled = [...industries, ...industries, ...industries];
  return (
    <div
      className="flex shrink-0 gap-8 items-center whitespace-nowrap motion-reduce:animate-none"
      style={{
        animation: "logoScroll 60s linear infinite",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {tripled.map(({ label, Icon }, i) => (
        <span
          key={`${label}-${i}`}
          className="flex items-center gap-2 shrink-0"
        >
          <Icon className="w-4 h-4 text-accent2" />
          <span className="text-sm font-semibold tracking-wide text-text">
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}

function BrandTrack() {
  const tripled = [...brands, ...brands, ...brands];
  return (
    <div
      className="flex shrink-0 gap-16 items-center whitespace-nowrap motion-reduce:animate-none"
      style={{
        animation: "logoScrollRight 80s linear infinite",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {tripled.map((brand, i) => (
        <span
          key={`${brand.name}-${i}`}
          className="shrink-0 flex items-center justify-center"
          style={{ height: 72 }}
        >
          <BrandLogo brand={brand} />
        </span>
      ))}
    </div>
  );
}

export default function LogoStrip() {
  return (
    <section className="relative py-12 overflow-hidden bg-background">
      <div className="relative w-full">
        <div className="relative overflow-hidden border-y border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_30px_60px_-30px_rgba(0,0,0,0.6)]">
          {/* Soft accent glow inside the glass panel */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 55% 180% at 28% 50%, var(--accent-soft) 0%, transparent 65%), radial-gradient(ellipse 55% 180% at 72% 50%, var(--accent-soft) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-[1] mx-auto max-w-6xl px-6 pt-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted2 mb-1.5">
          Trusted by
        </p>
        <p className="text-center font-bold text-xl lg:text-2xl text-text mb-6">
          <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
            Leading Organisations
          </span>{" "}
          <span>Across the 2KO Group</span>
        </p>
      </div>

      {/* Industries row */}
      <div className="relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10"
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10"
          aria-hidden="true"
        />
        <div
          className="flex gap-8 items-center overflow-hidden"
          aria-label="Industries served"
        >
          <IndustryTrack />
        </div>
      </div>

      {/* Brand row */}
      <div className="relative overflow-hidden mt-3 pb-6">
        <div
          className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10"
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10"
          aria-hidden="true"
        />
        <div
          className="flex gap-16 items-center overflow-hidden"
          aria-label="Clients and reference brands"
        >
          <BrandTrack />
        </div>
      </div>
        </div>
      </div>
    </section>
  );
}
