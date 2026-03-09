"use client";

import { useEffect, useRef, useCallback } from "react";

const GRID_SPACING = 32;
const REVEAL_RADIUS = 180;
const DOT_BASE_RADIUS = 1;
const DOT_GLOW_RADIUS = 2;
const ACCENT_R = 22;
const ACCENT_G = 163;
const ACCENT_B = 74;

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const hasEnteredRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
    hasEnteredRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    hasEnteredRef.current = false;
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas || !container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    if (prefersReduced) {
      // Static faint grid only
      drawStaticGrid(ctx, container.getBoundingClientRect());
      return () => window.removeEventListener("resize", resize);
    }

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave);

    function drawStaticGrid(
      context: CanvasRenderingContext2D,
      rect: DOMRect
    ) {
      context.clearRect(0, 0, rect.width, rect.height);
      const cols = Math.ceil(rect.width / GRID_SPACING) + 1;
      const rows = Math.ceil(rect.height / GRID_SPACING) + 1;
      const offsetX = (rect.width % GRID_SPACING) / 2;
      const offsetY = (rect.height % GRID_SPACING) / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = offsetX + col * GRID_SPACING;
          const y = offsetY + row * GRID_SPACING;
          context.beginPath();
          context.arc(x, y, DOT_BASE_RADIUS, 0, Math.PI * 2);
          context.fillStyle = `rgba(245, 245, 245, 0.06)`;
          context.fill();
        }
      }
    }

    function animate() {
      if (!canvas || !ctx || !container) return;
      const rect = container.getBoundingClientRect();

      // Smooth interpolation
      const ease = hasEnteredRef.current ? 0.1 : 0.04;
      const targetX = hasEnteredRef.current
        ? mouseRef.current.x / (Math.min(window.devicePixelRatio || 1, 2))
        : smoothMouseRef.current.x;
      const targetY = hasEnteredRef.current
        ? mouseRef.current.y / (Math.min(window.devicePixelRatio || 1, 2))
        : smoothMouseRef.current.y;

      smoothMouseRef.current.x += (targetX - smoothMouseRef.current.x) * ease;
      smoothMouseRef.current.y += (targetY - smoothMouseRef.current.y) * ease;

      const mx = smoothMouseRef.current.x;
      const my = smoothMouseRef.current.y;

      ctx.clearRect(0, 0, rect.width, rect.height);

      const cols = Math.ceil(rect.width / GRID_SPACING) + 1;
      const rows = Math.ceil(rect.height / GRID_SPACING) + 1;
      const offsetX = (rect.width % GRID_SPACING) / 2;
      const offsetY = (rect.height % GRID_SPACING) / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = offsetX + col * GRID_SPACING;
          const y = offsetY + row * GRID_SPACING;

          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Base dot (always visible, very faint)
          const baseAlpha = 0.04;

          if (dist < REVEAL_RADIUS && hasEnteredRef.current) {
            // Revealed dot — glows green near cursor
            const proximity = 1 - dist / REVEAL_RADIUS;
            const glowAlpha = proximity * proximity * 0.6;
            const radius =
              DOT_BASE_RADIUS + (DOT_GLOW_RADIUS - DOT_BASE_RADIUS) * proximity;

            // Green glow
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, ${glowAlpha})`;
            ctx.fill();

            // White core
            if (proximity > 0.3) {
              ctx.beginPath();
              ctx.arc(x, y, DOT_BASE_RADIUS, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(245, 245, 245, ${proximity * 0.3})`;
              ctx.fill();
            }
          } else {
            // Static faint dot
            ctx.beginPath();
            ctx.arc(x, y, DOT_BASE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 245, 245, ${baseAlpha})`;
            ctx.fill();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Canvas grid */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      />

      {/* Static radial gradient from top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(22,163,74,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Top accent glow */}
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      {/* Bottom fade line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </div>
  );
}
