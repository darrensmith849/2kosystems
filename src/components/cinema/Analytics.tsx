"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ANALYTICS_ID, GADS_ID, GA_ID, captureClickId } from "@/lib/analytics";

/**
 * Loads gtag and captures the click id on first paint. Renders nothing and
 * loads nothing while no measurement id is set, so the site carries no
 * third-party script until you actually start advertising.
 *
 * There is deliberately no consent gate. POPIA imposes no cookie-consent
 * requirement of the kind EU law does; this runs on legitimate interest,
 * disclosed in /privacy together with how to object to it. That reasoning is
 * specific to a South African audience — if this site starts fronting EEA or
 * UK traffic the gate has to come back, region-scoped, because Google's EU
 * User Consent Policy binds us contractually as an Ads customer whatever the
 * local law says.
 */
export default function Analytics() {
  useEffect(() => {
    captureClickId();
  }, []);

  if (!ANALYTICS_ID) return null;

  const ids = [...new Set([GA_ID, GADS_ID].filter(Boolean))];

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${ids.map((id) => `gtag('config', '${id}', { send_page_view: true });`).join("\n")}`}
      </Script>
    </>
  );
}
