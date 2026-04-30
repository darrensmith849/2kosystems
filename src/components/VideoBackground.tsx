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
 * Brightness/contrast tuning per source clip. Color is removed up-front
 * (`grayscale(1)`) and the brand color is then re-introduced by a `multiply`
 * layer of the accent green over the top — a classic duotone effect that
 * guarantees the result lands on-palette regardless of source hue.
 *
 * Hue-rotate alone can never produce a clean brand green from cool-blue
 * footage because CSS hue-rotate is a luminance-preserving matrix that drifts
 * through teal or magenta on the way; the duotone approach side-steps that
 * entirely.
 */
const TREATMENTS: Record<NonNullable<VideoBackgroundProps["treatment"]>, string> = {
  // Plexus: airy abstract, keep mid contrast and slightly lift highlights so
  // network nodes still read after the green multiply layer.
  plexus: "grayscale(1) brightness(0.85) contrast(1.05)",
  // Dashboard: UI panels need a touch more contrast so chart shapes stay
  // legible once the duotone is applied.
  dashboard: "grayscale(1) brightness(0.8) contrast(1.15)",
  // Binary reveal: high-contrast neon — push contrast harder so the digits
  // pop against the deep-black background after tinting.
  binary: "grayscale(1) brightness(0.85) contrast(1.25)",
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

      {/* Brand duotone: solid accent green multiplied over the grayscale video.
          Highlights pick up the green; shadows stay near black, so the result
          always reads as on-palette regardless of source footage. */}
      {treatment !== "raw" && (
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ backgroundColor: "#0f7b3a" }}
        />
      )}

      {/* Hard tint to lock the video to the site's deep-black background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${overlay})` }}
      />

      {/* Soft radial accent so the centre of frame catches a touch more green */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(15,123,58,0.12) 0%, rgba(15,123,58,0.04) 45%, transparent 75%)",
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
