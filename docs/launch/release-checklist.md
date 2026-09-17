# 2KO website release checklist

This is the operational go/no-go list for moving the new umbrella site to `www.2ko.co.za`. It deliberately separates staging verification from the public domain cutover.

## Release ownership

Assign one named owner for each area before deployment:

| Area | Owner | Approval evidence |
| --- | --- | --- |
| Commercial offers and pricing | To assign | Pricing page reviewed and dated |
| Training and certification claims | To assign | Six Sigma South Africa owner sign-off |
| Sigmafy product readiness | To assign | Supported features and access route confirmed |
| Privacy and terms | To assign | Legal/entity details completed and approved |
| Lead delivery | To assign | Test leads received in every intended destination |
| DNS and Cloudflare | To assign | Rollback owner and access confirmed |
| Google Ads and analytics | To assign | Destination URLs and conversions tested |

## Gate 1 — content and legal

- [ ] Enter the exact legal entity name, registration number, physical address and responsible privacy contact in the Privacy Policy and Terms.
- [ ] Confirm every statement in the claim register and retain the supporting source.
- [ ] Confirm the client strip wording accurately describes the relationship with every displayed organisation.
- [ ] Confirm all public prices, VAT wording, inclusions, exclusions and validity dates.
- [ ] Confirm what Sigmafy can deliver on launch day. Keep company access routed through 2KO until self-service is production-ready.
- [ ] Confirm the training certification, assessment, attendance and refund language with the training owner.
- [ ] Confirm that demonstration data and interfaces remain clearly labelled as illustrative where required.

## Gate 2 — production configuration

- [ ] Set `OPENAI_API_KEY` as a Cloudflare Worker secret.
- [ ] Set `SIGMAFY_LEADS_URL` and `SIGMAFY_INGEST_TOKEN` as Worker secrets if Sigmafy ingest is enabled.
- [ ] Set strong, unique `INTERNAL_ACCESS_USERNAME` and `INTERNAL_ACCESS_PASSWORD` Worker secrets.
- [ ] Configure Cloudflare Email Service and verify the permitted sender and recipient addresses.
- [ ] Add Cloudflare Turnstile to the contact, quote and chat-handoff forms, with mandatory server-side Siteverify validation.
- [ ] Configure a durable Cloudflare rate limit for public POST endpoints; the in-application limiter is only a per-instance safety net.
- [ ] Confirm Cloudflare observability and an accountable person who will monitor errors after release.
- [ ] Confirm `2ko.co.za`, `www.2ko.co.za`, `2kosystems.com` and `www.2kosystems.com` are present in the intended Cloudflare zone and account.

## Gate 3 — staging test matrix

- [ ] Home, Training, Sigmafy, Systems, Automation, Managed Improvement, Results, Sectors, Pricing, About and Contact load on desktop and mobile.
- [ ] Navigation, footer links, breadcrumbs and all primary calls to action reach the intended destinations.
- [ ] Contact form: valid submission, invalid submission, duplicate/rapid submission and delivery-failure behaviour tested.
- [ ] Quote form: valid submission, validation errors and delivery tested.
- [ ] Chat: ordinary reply, service qualification, rate limiting and failure behaviour tested.
- [ ] Chat handoff: consent, valid handoff, invalid email, Turnstile rejection and lead delivery tested.
- [ ] Training and Sigmafy contact links preselect the correct enquiry interest.
- [ ] Analytics remains disabled after "Essential only" and loads only after "Allow analytics".
- [ ] `/internal/*` returns 404 when production credentials are absent, 401 when credentials are configured but missing, and 200 only with valid credentials.
- [ ] `/robots.txt` disallows `/internal`, `/api` and `/review`; `/sitemap.xml` contains only intended public URLs.
- [ ] Canonical URLs and social metadata use `https://www.2ko.co.za`.
- [ ] Accessibility pass completed: keyboard navigation, visible focus, form labels, heading order, contrast and reduced-motion behaviour.
- [ ] Performance pass completed on the homepage and the heaviest visual pages using a production build and representative mobile throttling.
- [ ] `npm run lint`, `npm audit`, `npm run build` and `npx opennextjs-cloudflare build` all pass from a clean install.

## Gate 4 — domain cutover

- [ ] Export or record the current DNS configuration before changing it.
- [ ] Lower DNS TTL early enough for the planned migration window where applicable.
- [ ] Deploy the release to a non-primary hostname and complete Gate 3 there.
- [ ] Verify the existing `2ko.co.za` URL inventory and map any replaced paths to their closest new equivalents.
- [ ] Route apex `2ko.co.za` to canonical `www.2ko.co.za`.
- [ ] Route the legacy 2KO Systems domains through the Worker so path-preserving permanent redirects are active.
- [ ] Test representative redirects, including deep links and query strings.
- [ ] Update Google Ads final URLs only after their landing pages are live and verified.
- [ ] Submit the new sitemap and inspect indexing/canonical status in Google Search Console.
- [ ] Retain an immediately executable rollback path for the migration window.

## First 72 hours

- [ ] Send a real enquiry through every lead path immediately after cutover.
- [ ] Check delivery destinations, email logs, Worker exceptions and rate-limit/Turnstile events.
- [ ] Check 404s, redirect loops, CSP violations and unexpected legacy-domain traffic.
- [ ] Confirm Google Ads conversion events with a controlled test; do not infer success from page views.
- [ ] Review mobile performance and layout on at least one iPhone-class and one Android-class device.
- [ ] Record incidents and ownership in a single launch log.

## Go/no-go rule

Launch only when every item in Gates 1–3 has an owner and all critical items are complete. A missing legal identity, unverified lead delivery, absent internal-route credentials or client-side-only Turnstile validation is a no-go. Non-critical copy or decorative refinements may move to a dated post-launch backlog.
