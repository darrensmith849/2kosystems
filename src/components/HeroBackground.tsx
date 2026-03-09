"use client";

import { useEffect, useRef, useCallback } from "react";

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    container.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    let currentX = 0.5;
    let currentY = 0.5;

    function animate() {
      // Ease toward target
      currentX += (mouseRef.current.x - currentX) * 0.08;
      currentY += (mouseRef.current.y - currentY) * 0.08;

      if (glow) {
        glow.style.transform = `translate(${currentX * 100 - 50}%, ${currentY * 100 - 50}%)`;
        glow.style.opacity = "1";
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(245,245,245,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Static radial gradient from top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(22,163,74,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Mouse-reactive glow */}
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full opacity-0 transition-opacity duration-1000 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />

      {/* Subtle pulse ring */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden">
        <div className="hero-pulse h-[300px] w-[300px] rounded-full border border-accent/[0.04]" />
      </div>

      {/* Top accent glow */}
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      {/* Bottom fade line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </div>
  );
}
