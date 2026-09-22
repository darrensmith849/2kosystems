"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The site's only animation, in two flavours that share one curve: copy
 * lifts into place, photographs settle out of a slight scale.
 */
export default function Rise({
  children,
  step = 0,
  variant = "rise",
  className = "",
}: {
  children: ReactNode;
  step?: 0 | 1 | 2 | 3;
  variant?: "rise" | "settle";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Server-rendered content starts visible. After hydration we only arm the
  // reveal for elements that are still below the first viewport, preventing a
  // slow device or paid landing-page visit from seeing an empty hero.
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (node.getBoundingClientRect().top <= window.innerHeight * 0.92) return;

    const frame = window.requestAnimationFrame(() => setShown(false));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const base = variant === "settle" ? "k-settle" : "k-rise";
  const stagger = variant === "rise" && step ? ` k-rise-${step}` : "";

  return (
    <div ref={ref} data-shown={shown} className={`${base}${stagger} ${className}`.trim()}>
      {children}
    </div>
  );
}
