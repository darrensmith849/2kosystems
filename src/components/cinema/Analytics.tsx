"use client";

import Script from "next/script";
import { useEffect } from "react";
import { GADS_ID, captureClickId } from "@/lib/analytics";

/**
 * Loads gtag and captures the click id on first paint. Renders nothing and
 * loads nothing when NEXT_PUBLIC_GADS_ID is unset, so the site carries no
 * third-party script until you actually start advertising.
 */
export default function Analytics() {
  useEffect(() => {
    captureClickId();
  }, []);

  if (!GADS_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GADS_ID}', { send_page_view: true });`}
      </Script>
    </>
  );
}
