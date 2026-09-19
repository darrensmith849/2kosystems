/**
 * Per-brand tracking hostnames.
 *
 * All of these point at this Worker, which is what serves /e/o and /e/c. The
 * reason they exist separately rather than everything running through
 * www.2ko.co.za is that a recipient of a Six Sigma email hovering a link
 * should see a Six Sigma domain. A 2KO URL inside Sigmafy's mail looks, at
 * best, like a mistake and at worst like a phishing attempt — which is exactly
 * the instinct you do not want to trigger in a link you are asking people to
 * click.
 *
 * It also keeps reputation separate. A deliverability problem on one brand's
 * redirect domain does not follow the others.
 */

export const TRACKING_HOSTS: Record<string, string> = {
  "sigmafy.co": "go.sigmafy.co",
  "portal.sigmafy.co": "go.sigmafy.co",
  "tools.sigmafy.co": "go.sigmafy.co",
  "sixsigmasouthafrica.co.za": "go.sixsigmasouthafrica.co.za",
  "sixsigmauk.com": "go.sixsigmauk.com",
  "2ko.co.za": "go.2ko.co.za",
  "www.2ko.co.za": "go.2ko.co.za",
  "2kosystems.com": "go.2ko.co.za",
};

/** Where a brand's own mail should point. Falls back to 2KO for anything unmapped. */
export function trackingBase(site: string): string {
  return `https://${TRACKING_HOSTS[site.toLowerCase()] ?? "go.2ko.co.za"}`;
}

/** Every hostname that exists only to serve tracking. Used by the Proxy. */
export const ALL_TRACKING_HOSTS = new Set(Object.values(TRACKING_HOSTS));

export function isTrackingHost(hostname: string): boolean {
  return ALL_TRACKING_HOSTS.has(hostname.toLowerCase());
}
