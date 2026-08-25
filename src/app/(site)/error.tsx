"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. Without one, an unhandled exception drops to
 * Next's unstyled default page, which looks like a different website.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="k-glow -z-10" style={{ top: "-200px" }} aria-hidden="true" />
      <div className="k-shell flex min-h-[78svh] flex-col justify-center py-24">
        <p className="k-mono" style={{ color: "var(--alert)" }}>
          Something broke
        </p>
        <h1 className="k-state mt-6 max-w-[20ch]">
          That is our fault, not yours.
        </h1>
        <p className="k-lead k-measure mt-6">
          The page failed to render. Trying again usually clears it. If it keeps
          happening we would genuinely like to know — it is the kind of thing we
          build systems to stop.
        </p>

        {error.digest && (
          <p className="k-mono mt-6">Reference · {error.digest}</p>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="k-btn k-btn--solid">
            Try again
          </button>
          <Link href="/contact" className="k-btn k-btn--ghost">
            Tell us about it
          </Link>
        </div>
      </div>
    </section>
  );
}
