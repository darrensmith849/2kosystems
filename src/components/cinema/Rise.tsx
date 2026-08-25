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
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const base = variant === "settle" ? "k-settle" : "k-rise";
  const stagger = variant === "rise" && step ? ` k-rise-${step}` : "";

  return (
    <div ref={ref} data-shown={shown} className={`${base}${stagger} ${className}`.trim()}>
      {children}
    </div>
  );
}
