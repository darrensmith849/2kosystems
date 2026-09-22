"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Arc } from "@/lib/africa-map";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Milliseconds for one hop to travel, plus the beat it rests on arrival. */
const TRAVEL = 2800;
const REST = 700;

/**
 * The travelling connection.
 *
 * One line moves from A to B. Where it lands becomes the departure point for
 * the next hop, and so on around the continent; when the route completes, the
 * trail clears and it starts again. Only the arc data is passed from the server
 * component — the country geometry never reaches the browser as JavaScript.
 */
export default function TourArcs({ arcs }: { arcs: Arc[] }) {
  const [hop, setHop] = useState(0);
  const [landed, setLanded] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  const motion = !reduced;

  useEffect(() => {
    if (!motion) return;

    // Mark the arrival so the destination can ping, then step to the next hop.
    const arrival = window.setTimeout(() => setLanded(true), TRAVEL);
    const advance = window.setTimeout(() => {
      setLanded(false);
      setHop((current) => (current + 1) % (arcs.length + 1));
    }, TRAVEL + REST);

    return () => {
      window.clearTimeout(arrival);
      window.clearTimeout(advance);
    };
  }, [hop, motion, arcs.length]);

  // Reduced motion: show the finished route, no travel.
  if (!motion) {
    return (
      <g>
        {arcs.map((arc) => (
          <path
            key={`${arc.from}-${arc.to}`}
            d={arc.d}
            fill="none"
            stroke="var(--ember)"
            strokeWidth="1.6"
            opacity="0.4"
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }

  const active = arcs[hop];

  return (
    <g>
      {/* Trail — every hop already completed this cycle */}
      {arcs.slice(0, hop).map((arc) => (
        <path
          key={`${arc.from}-${arc.to}`}
          d={arc.d}
          fill="none"
          stroke="var(--ember)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.34"
        />
      ))}

      {active && (
        <g key={hop}>
          {/* The line itself, drawing from A to B */}
          <path
            d={active.d}
            fill="none"
            stroke="url(#arcFill)"
            strokeWidth="2.4"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
            style={{
              animation: `kmTravel ${TRAVEL}ms cubic-bezier(0.45, 0, 0.25, 1) forwards`,
            }}
          />

          {/* The head, riding the same curve */}
          <circle r="4" fill="var(--ember)" filter="url(#softGlow)">
            <animateMotion
              dur={`${TRAVEL}ms`}
              path={active.d}
              fill="freeze"
              calcMode="spline"
              keyPoints="0;1"
              keyTimes="0;1"
              keySplines="0.45 0 0.25 1"
            />
          </circle>

          {/* Departure marker holds while the hop is in flight */}
          <circle cx={active.x1} cy={active.y1} r="3.6" fill="var(--ember)" opacity="0.75" />

          {/* Arrival ping */}
          {landed && (
            <circle
              cx={active.x2}
              cy={active.y2}
              r="5"
              fill="none"
              stroke="var(--ember)"
              strokeWidth="1.4"
              className="km-ping"
            />
          )}
        </g>
      )}
    </g>
  );
}
