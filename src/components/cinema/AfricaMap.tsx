import { MAP, CITIES, TOUR } from "@/lib/africa-map";
import TourArcs from "@/components/cinema/TourArcs";

/**
 * The hero map.
 *
 * Server-rendered on purpose: the path data is large, and emitting it as HTML
 * keeps it out of the client bundle entirely. Every animation below is CSS, so
 * nothing here needs JavaScript to run.
 *
 * Geometry is Natural Earth 1:50m projected with d3-geo — see
 * scripts/build-africa.mjs. The coastline is real and the city markers are real
 * coordinates through the same projection, which is the only way this reads as
 * a map rather than a decoration.
 */
export default function AfricaMap() {
  return (
    <svg
      viewBox={`0 0 ${MAP.width} ${MAP.height}`}
      className="h-full w-full"
      role="img"
      aria-label="A map of Africa with connections radiating from Johannesburg to major cities across the continent."
    >
      <defs>
        <linearGradient id="arcFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.15" />
          <stop offset="45%" stopColor="#ffd9a0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--ember)" stopOpacity="1" />
        </linearGradient>

        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

      </defs>

      <image href="/imagery/africa-map-base.svg" width={MAP.width} height={MAP.height} className="km-land" />

      {/* Connections — one line, travelling the route hop by hop */}
      <g filter="url(#glow)">
        <TourArcs arcs={TOUR} />
      </g>

      {/* Centres */}
      <g>
        {CITIES.map((city, i) => (
          <g key={city.name} className="km-city" style={{ animationDelay: `${600 + i * 130}ms` }}>
            <circle
              cx={city.x}
              cy={city.y}
              r={city.home ? 5 : 3}
              fill={city.home ? "var(--ember)" : "#dcfbe8"}
              filter="url(#glow)"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
