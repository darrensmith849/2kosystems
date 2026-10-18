"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Plays a short scene one step at a time: step 0 is the empty frame, the last
 * step the finished one. `delays[i]` is how long step i holds before the next.
 * The scene only runs while it is on screen, loops after `hold` ms on the last
 * step, and with reduced motion shows the finished frame and stays there.
 */
export function useSequence(delays: number[], hold = 3200) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const still = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  const last = delays.length;

  useEffect(() => {
    const node = ref.current;
    if (!node || still) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [still]);

  useEffect(() => {
    if (still || !visible) return;
    const wait = step >= last ? hold : delays[step];
    const timer = window.setTimeout(() => setStep(step >= last ? 0 : step + 1), wait);
    return () => window.clearTimeout(timer);
  }, [step, visible, still, last, hold, delays]);

  return { ref, step: still ? last : step };
}
