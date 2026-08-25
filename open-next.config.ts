import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Brochure site: every page is prerendered static and the only dynamic routes
 * are four fetch-based API handlers (Brevo and Gemini). There is nothing to
 * revalidate, so no incremental cache override is configured — adding one
 * would mean provisioning an R2 bucket for a cache that never gets written.
 */
export default defineCloudflareConfig();
