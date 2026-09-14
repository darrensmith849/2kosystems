export const SITE_NAME = "2KO";
export const SITE_HOST = "www.2ko.co.za";
export const SITE_URL = `https://${SITE_HOST}`;
export const LEGACY_SITE_HOSTS = new Set([
  "2kosystems.com",
  "www.2kosystems.com",
]);
export const PRIVACY_EMAIL = "contact@2ko.co.za";

/* Set by proxy on every pass-through so `not-found` can see which address
   missed. Internal to this app: it is set on the request, never the response. */
export const REQUESTED_PATH = "x-requested-path";

/* The link preview card is generated once at the app root by
   `src/app/opengraph-image.tsx` and shared by every page. Its dimensions and
   alt text live here so the route and the page metadata cannot drift apart. */
/* Keep a version on the public URL whenever the artwork changes. Social
   networks cache preview images aggressively, even after a page is recrawled. */
export const OG_IMAGE_PATH = "/opengraph-image?v=20260914";
export const OG_IMAGE_ALT =
  "2KO — operational improvement, training, automation and measurement";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
