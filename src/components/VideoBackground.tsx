"use client";

import { useEffect, useRef, useState } from "react";

interface VideoBackgroundProps {
  /** Path to the .mp4 file in /public (e.g. "/videos/plexus-network.mp4"). */
  src: string;
  /** Path to the poster jpg in /public for instant first paint and reduced-motion fallback. */
  poster?: string;
  /**
   * Visual treatment that color-matches the source footage to the 2KO Systems palette
   * (deep black + green accent #0f7b3a + silver accent #B8C4C8).
   *
   * - "plexus":   for the abstract plexus / network background — strongest hue shift to green.
   * - "dashboard": for the futuristic dashboard footage — moderate shift, slightly desaturated.
   * - "binary":   for the binary code reveal — heavy contrast, minor green tint.
   * - "raw":      no color filter (for places where we want the original tones to show).
   */
  treatment?: "plexus" | "dashboard" | "binary" | "raw";
  /**
   * Strength of the dark overlay sitting on top of the video. 0 = no overlay,
   * 1 = fully black. Defaults to 0.55 which keeps text readable over moving video.
   */
  overlay?: number;
  /** Optional className applied to the wrapping container. */
  className?: string;
  /** If true the component keeps a 16:9 aspect-ratio box (good for embeds);
   *  if false (default) it fills its parent absolutely. */
  contained?: boolean;
}

/**
 * Color filter recipes expressed as CSS `filter` strings.  Each value is the
 * outcome of trial-and-error against the three Envato clips so the resulting
 * footage feels consistent with the site palette.
 *
 * Source clips are all cool-blue (~210deg hue). Rotating +80–110deg pushed
 * them through magenta/purple, so we rotate the other way (~-80deg) to land
 * on the brand green #0f7b3a (~140deg) without ever crossing red/purple.
 */
const TREATMENTS: Record<NonNullable<VideoBackgroundProps["treatment"]>, string> = {
  // Plexus footage is cool blue → pull -75deg backwards to teal/green, drop
  // saturation slightly so accent green orbs (added via overlay) read cleanly.
  plexus:
    "hue-rotate(-75deg) saturate(0.7) brightness(0.6) contrast(1.05)",
  // Dashboard footage carries warm-ish blue UI; slightly larger backward shift
  // keeps the panels legible while pulling overall tone toward the accent.
  dashboard:
    "hue-rotate(-90deg) saturate(0.55) brightness(0.55) contrast(1.05)",
  // Binary reveal is high-contrast neon; -80deg + heavy contrast makes the
  // falling characters look like green code on black.
  binary:
    "hue-rotate(-80deg) saturate(0.8) brightness(0.5) contrast(1.2)",
  raw: "none",
};

export default function VideoBackground({
  src,
  poster,
  treatment = "plexus",
  overlay = 0.55,
  className = "",
  contained = false,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Respect prefers-reduced-motion: pause the video and rely on the poster image.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
    } else {
      // .play() may reject on iOS if the browser hasn't granted autoplay.
      void video.play().catch(() => {});
    }
  }, [reducedMotion]);

  const filterStyle = TREATMENTS[treatment];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${
        contained
          ? "relative aspect-video w-full overflow-hidden rounded-3xl border border-border"
          : "absolute inset-0 overflow-hidden"
      } ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: filterStyle }}
      />

      {/* Hard tint to lock the video to the site's deep-black background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${overlay})` }}
      />

      {/* Subtle accent-green wash so video tones read as part of the brand */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(15,123,58,0.18) 0%, rgba(15,123,58,0.05) 45%, transparent 75%)",
        }}
      />

      {/* Edge fade so the video bleeds smoothly into the surrounding sections */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
