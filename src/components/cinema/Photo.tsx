import Image from "next/image";

type Scrim = "bottom" | "left" | "edges" | "none";

/**
 * Every photograph on the site goes through here, which is the point: one
 * grade, one set of scrims, one behaviour. Nothing is styled per-image.
 */
export default function Photo({
  src,
  priority = false,
  sizes = "100vw",
  alt = "",
  scrim = "none",
  position = "center",
  className = "",
}: {
  src: string;
  /**
   * Leave empty for decorative plates — every one of ours sits behind a
   * heading that already carries the meaning, and alt text there is noise a
   * screen reader has to sit through. Pass real text only when the photograph
   * itself conveys something the surrounding copy does not.
   */
  alt?: string;
  priority?: boolean;
  sizes?: string;
  scrim?: Scrim;
  /** CSS object-position, for framing the crop. */
  position?: string;
  className?: string;
}) {
  return (
    <div className={`k-photo ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        style={{ objectPosition: position }}
      />
      {scrim !== "none" && <div className={`k-scrim-${scrim}`} aria-hidden="true" />}
    </div>
  );
}
