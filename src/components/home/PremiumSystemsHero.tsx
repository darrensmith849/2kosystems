"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import VideoBackground from "@/components/VideoBackground";
import TypewriterText from "@/components/TypewriterText";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function PremiumSystemsHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const targetRef = useRef({ x: 50, y: 36 });
  const currentRef = useRef({ x: 50, y: 36 });
  const activeRef = useRef(false);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setReducedMotion(media.matches);
    };

    updatePreference();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updatePreference);
      return () => media.removeEventListener("change", updatePreference);
    }

    media.addListener(updatePreference);
    return () => media.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const applyVars = (x: number, y: number, opacity: number) => {
      element.style.setProperty("--mx", `${x}%`);
      element.style.setProperty("--my", `${y}%`);
      element.style.setProperty("--glow-opacity", `${opacity}`);
    };

    applyVars(50, 36, 0.45);

    if (reducedMotion) {
      return;
    }

    const tick = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.09;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.09;

      applyVars(
        currentRef.current.x,
        currentRef.current.y,
        activeRef.current ? 0.9 : 0.45,
      );

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [reducedMotion]);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    if (event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

    targetRef.current = { x, y };
    activeRef.current = true;
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => {
    handlePointerMove(event);
    activeRef.current = true;
  };

  const handlePointerLeave = () => {
    targetRef.current = { x: 50, y: 36 };
    activeRef.current = false;
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="relative isolate overflow-hidden border-b border-white/10 bg-[#050913] text-white"
      style={
        {
          "--mx": "50%",
          "--my": "36%",
          "--glow-opacity": "0.45",
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Brand-tinted binary-reveal video sits at the very bottom of the stack */}
        <VideoBackground
          src="/videos/binary-code.mp4"
          poster="/videos/binary-code-poster.jpg"
          treatment="binary"
          overlay={0.4}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,16,28,0.45) 0%, rgba(5,9,19,0.55) 48%, rgba(3,6,13,0.7) 100%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 420px at 50% -8%, rgba(255,255,255,0.08), transparent 58%)",
          }}
        />

        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: reducedMotion ? 0.45 : 1,
            background:
              "radial-gradient(560px 560px at var(--mx) var(--my), rgba(91, 123, 255, calc(var(--glow-opacity) * 0.22)) 0%, rgba(66, 98, 214, calc(var(--glow-opacity) * 0.14)) 24%, rgba(18, 31, 68, calc(var(--glow-opacity) * 0.08)) 42%, rgba(0,0,0,0) 70%)",
          }}
        />

        <div
          className="absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />

        <div
          className="absolute -right-20 top-16 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(88,112,255,0.10)" }}
        />

        <div
          className="absolute bottom-[-8rem] left-[15%] h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(255,255,255,0.03)" }}
        />

        {/* Soft accent-green glow orb */}
        <div
          className="absolute right-[8%] top-[28%] h-64 w-64 rounded-full blur-3xl"
          style={{ background: "rgba(15,123,58,0.13)" }}
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:py-14">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70 backdrop-blur">
            2KO Systems
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Custom systems for businesses that have outgrown outdated software.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            We build operational systems, approvals flows, client portals, and
            reporting dashboards that cut admin, improve visibility, and help
            teams move faster.
          </p>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-accent-border bg-accent px-6 py-3 text-sm font-medium text-white transition duration-200 hover:bg-accent2 hover:text-black hover:scale-[1.02] active:bg-accent-pressed"
            >
              Book a Systems Audit
            </Link>

            <Link
              href="/solutions"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-medium text-white transition duration-200 hover:bg-white/10"
            >
              Explore Solutions
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
            <div className="rounded-[22px] border border-white/10 bg-[#081120]/88 p-4 shadow-2xl shadow-black/25">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    How it works in practice
                  </p>
                  <h3 className="mt-0.5 text-base font-medium text-white">
                    One clear operating system
                  </h3>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70">
                  Real-time
                </div>
              </div>

              <div className="space-y-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white/88">
                      Requests &amp; approvals
                    </span>
                    <span className="text-[11px] text-white/45">
                      In one place
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white/50" />
                        <span className="text-[13px] text-white/72">
                          <TypewriterText
                            text="Request logged"
                            speed={22}
                            startDelay={300}
                          />
                        </span>
                      </div>
                      <span className="text-[11px] text-white/45">Captured</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white/65" />
                        <span className="text-[13px] text-white/72">
                          <TypewriterText
                            text="Under review"
                            speed={22}
                            startDelay={900}
                          />
                        </span>
                      </div>
                      <span className="text-[11px] text-white/45">Tracked</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-300/80" />
                        <span className="text-[13px] text-white/72">
                          <TypewriterText
                            text="Approved & visible"
                            speed={22}
                            startDelay={1500}
                          />
                        </span>
                      </div>
                      <span className="text-[11px] text-white/45">Actioned</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Faster decisions
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      Less chasing
                    </p>
                    <p className="mt-0.5 text-[12px] text-white/55">
                      Clear ownership and status
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Live reporting
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      Better visibility
                    </p>
                    <p className="mt-0.5 text-[12px] text-white/55">
                      One source of truth
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                    Embedded AI support
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-white/72">
                    Search, summaries, drafting, and routing built directly into
                    the workflow where they add real value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
