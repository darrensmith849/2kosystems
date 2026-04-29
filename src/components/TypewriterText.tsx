"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  /** ms per character. Default ~22ms ≈ 45 chars/sec — readable, not slow. */
  speed?: number;
  /** Delay before typing starts after the element scrolls into view. */
  startDelay?: number;
  /** Optional className passed through to the wrapping element. */
  className?: string;
}

/**
 * Typewriter-reveal text. Stays empty until the element scrolls into the
 * viewport, then types out one character at a time with a blinking caret
 * while typing. After the message completes the caret is removed.
 *
 * Visitors with prefers-reduced-motion: reduce see the full text immediately.
 */
export default function TypewriterText({
  text,
  speed = 22,
  startDelay = 200,
  className = "",
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  // Read the reduced-motion preference once at render time so the
  // initial state is correct without needing setState-in-effect.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = useState<string>(reducedMotion ? text : "");
  const [done, setDone] = useState<boolean>(reducedMotion);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    if (reducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
            return;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, reducedMotion]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    let timer: number | null = null;

    const startTimer = window.setTimeout(() => {
      timer = window.setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          if (timer !== null) window.clearInterval(timer);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(startTimer);
      if (timer !== null) window.clearInterval(timer);
    };
  }, [started, text, speed, startDelay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
      {!done && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-[0.95em] w-[2px] -mb-[1px] bg-accent align-baseline animate-pulse motion-reduce:animate-none"
        />
      )}
    </span>
  );
}
