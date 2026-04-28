/** Shared types for the server-side imagery layer. */

export type ImageMeta = {
  /** Public URL the browser can load (always under /imagery/...). */
  src: string;
  width: number;
  height: number;
  /** Source provenance — which API produced this. */
  source: "pexels" | "nano" | "static";
  alt: string;
  /** Optional photographer attribution (Pexels). */
  photographer?: string;
  photographerUrl?: string;
  /** When this entry was created (ISO timestamp). */
  cachedAt: string;
};

export type ImageryIntent =
  | "intelligent-systems"
  | "automation-workflows"
  | "software-dashboards"
  | "neural-architecture"
  | "command-centre"
  | "digital-infrastructure"
  | "premium-dark-tech"
  | "south-african-business"
  | "process-automation"
  | "ai-operations";
