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
   * 1 = fully black. Defaults to 0.4 which keeps text readable over moving
   * video without washing out the footage itself.
   */
  overlay?: number;
  /** Optional className applied to the wrapping container. */
  className?: string;
  /** If true the component keeps a 16:9 aspect-ratio box (good for embeds);
   *  if false (default) it fills its parent absolutely. */
  contained?: boolean;
}

/**
 * Brightness/contrast tuning per source clip. Color is removed up-front
 * (`grayscale(1)`) and the brand color is then re-introduced by a `color`
 * blend layer of the accent green over the top.
 *
 * `color` blend preserves the luminance of the underlying (grayscale) video
 * while applying the chroma of the brand green — so highlights stay bright
 * and shadows stay dark, just tinted. This avoids the "everything goes
 * muddy dark" effect that `multiply` produced and keeps the source motion
 * clearly readable while still landing on palette.
 */
const TREATMENTS: Record<NonNullable<VideoBackgroundProps["treatment"]>, string> = {
  // Plexus: airy abstract — lift brightness so the network nodes pop, mild
  // contrast bump.
  plexus: "grayscale(1) brightness(1.05) contrast(1.15)",
  // Dashboard: UI panels — slightly more contrast so chart shapes stay sharp.
  dashboard: "grayscale(1) brightness(1.0) contrast(1.25)",
  // Binary reveal: high-contrast neon — bright with strong contrast so the
  // falling digits read clearly against deep-black.
  binary: "grayscale(1) brightness(1.1) contrast(1.35)",
  raw: "none",
};

export default function VideoBackground({
  src,
  poster,
  treatment = "plexus",
  overlay = 0.4,
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

      {/* Brand duotone: solid accent green applied with `color` blend mode so
          the grayscale video keeps its full luminance — highlights stay bright,
          shadows stay dark, the whole thing just reads as brand-green. */}
      {treatment !== "raw" && (
        <div
          className="absolute inset-0 mix-blend-color"
          style={{ backgroundColor: "#0f7b3a" }}
        />
      )}

      {/* Soft dark tint for legibility, lighter than before so the footage
          doesn't get washed out */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${overlay})` }}
      />

      {/* Subtle radial accent — pushes a touch more green into the centre */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(15,123,58,0.10) 0%, rgba(15,123,58,0.03) 45%, transparent 75%)",
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
