import type { Metadata } from "next";
import { OG_IMAGE_ALT, OG_IMAGE_PATH, OG_IMAGE_SIZE } from "@/lib/site";

/**
 * Keep the document, Open Graph and Twitter descriptions aligned for every
 * static landing page. Next metadata merges nested objects shallowly, so a
 * page that only overrides `title` otherwise keeps the homepage's social copy.
 *
 * `images` has to be spelled out. Declaring `openGraph` at all replaces the
 * inherited object wholesale, and the root `opengraph-image.tsx` is only
 * re-attached on the segment that owns the file — so without this, every page
 * below the root shipped a card with no image at all.
 */
export function completePageMetadata(metadata: Metadata): Metadata {
  const title = typeof metadata.title === "string" ? metadata.title : undefined;
  const description = metadata.description ?? undefined;
  const canonical = metadata.alternates?.canonical;
  const url = typeof canonical === "string" || canonical instanceof URL ? canonical : undefined;

  return {
    ...metadata,
    openGraph: {
      title,
      description,
      url,
      siteName: "2KO",
      locale: "en_ZA",
      type: "website",
      images: [{ url: OG_IMAGE_PATH, ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: OG_IMAGE_PATH, ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT }],
    },
  };
}
