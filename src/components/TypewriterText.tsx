"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  /** ms per character. Default ~28ms so the animation reads as motion. */
  speed?: number;
  /** Delay before typing starts after the element scrolls into view. */
  startDelay?: number;
  /** Hide the caret entirely (used when typewriter is on a mockup label that
   *  shouldn't show editor chrome). */
  hideCaret?: boolean;
  /** Optional className passed through to the wrapping element. */
  className?: string;
}

/**
 * Typewriter-reveal text. Stays empty until the element scrolls into the
 * viewport, then types out one character at a time with a blinking caret
 * so the motion is always readable as "typed in". The caret stays for a
 * beat after the line is finished, then fades.
 *
 * Visitors with prefers-reduced-motion: reduce see the full text
 * immediately, no caret.
 */
export default function TypewriterText({
  text,
  speed = 28,
  startDelay = 200,
  hideCaret = false,
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
  const [finished, setFinished] = useState<boolean>(reducedMotion);
  // Caret visibility — true while typing AND for ~1.2s after the last char,
  // then false (caret fades). Reduced motion users never see a caret.
  const [caretOn, setCaretOn] = useState<boolean>(!reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.5) {
            setStarted(true);
            observer.disconnect();
            return;
          }
        }
      },
      // Only fire once the element is genuinely in the reading area — at
      // least 50% visible. This avoids the case where the wrapping
      // RevealOnScroll is still in its translateY(16px) opacity:0 state
      // and the typewriter would otherwise type out invisibly behind it.
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, reducedMotion]);

  useEffect(() => {
    if (!started || reducedMotion) return;
    let i = 0;
    let typeTimer: number | null = null;
    let caretFadeTimer: number | null = null;

    const startTimer = window.setTimeout(() => {
      typeTimer = window.setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          if (typeTimer !== null) window.clearInterval(typeTimer);
          setFinished(true);
          // Keep the caret blinking for a moment after the line lands,
          // then fade it out so the finished text reads as static copy.
          caretFadeTimer = window.setTimeout(() => setCaretOn(false), 1400);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(startTimer);
      if (typeTimer !== null) window.clearInterval(typeTimer);
      if (caretFadeTimer !== null) window.clearTimeout(caretFadeTimer);
    };
  }, [started, text, speed, startDelay, reducedMotion]);

  const showCaret = !reducedMotion && !hideCaret && (started || !finished) && caretOn;

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
      {showCaret && (
        <span
          aria-hidden="true"
          className="typewriter-caret"
          style={{
            display: "inline-block",
            width: "0.6ch",
            marginLeft: "1px",
            verticalAlign: "baseline",
            transform: "translateY(1px)",
          }}
        >
          |
        </span>
      )}
    </span>
  );
}
