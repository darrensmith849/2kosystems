"use client";

import { useEffect, useRef, useState } from "react";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  /** ms delay after entering view before starting the fade-up. */
  delay?: number;
  /** Translate distance in px before reveal — small by default. */
  fromY?: number;
  /** Reveal duration in ms. */
  duration?: number;
}

/**
 * Wraps content in a small reveal-on-scroll animation: fades up and into
 * view the first time the element enters the viewport, then stays put.
 *
 * Cheap (single IntersectionObserver per element, disconnects after firing)
 * and respects prefers-reduced-motion (renders fully visible immediately).
 */
export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  fromY = 16,
  duration = 700,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Read the reduced-motion preference at render time so the initial state
  // is correct without a setState-in-effect dance.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [visible, setVisible] = useState<boolean>(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            window.setTimeout(() => setVisible(true), delay);
            observer.disconnect();
            return;
          }
        }
      },
      // Fire a touch before the element fully arrives so the animation
      // starts as the user scrolls toward it, not after they've passed it.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, reducedMotion]);

  const style: React.CSSProperties = {
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : `translateY(${fromY}px)`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
