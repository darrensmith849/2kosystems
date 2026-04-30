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
 * viewport, then types out one character at a time. No caret — characters
 * just appear in sequence so the text reads naturally without a blinking
 * cursor leading the eye.
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
      // Wait until the element is genuinely on-screen — at least 25% of
      // it visible and 20% past the bottom edge of the viewport. This
      // means typewriters fire as the visitor actively scrolls to look
      // at the card, not when it's still peeking from below the fold.
      { rootMargin: "0px 0px -20% 0px", threshold: 0.25 },
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
    </span>
  );
}
