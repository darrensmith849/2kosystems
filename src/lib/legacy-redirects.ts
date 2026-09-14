/**
 * Legacy 2ko.co.za URL map.
 *
 * The umbrella site replaced a WordPress/WooCommerce install that had been
 * accumulating search equity since the late 1990s. The new routes share almost
 * no paths with the old ones, so without this every indexed legacy URL lands on
 * the 404 page — 378 of them, including 147 city-targeted course pages that
 * were the whole long-tail.
 *
 * Inventory source: `docs/redirects/legacy-inventory.txt`, recovered from the
 * Wayback Machine crawl plus the archived WordPress sitemaps. It is a sample of
 * what was indexed, not a complete list, which is why the rules below are
 * pattern-based wherever the legacy URLs had a pattern — an unseen
 * `/virtual-green-belt-courses-in-witbank/` resolves on the same rule as the
 * ones we did recover.
 *
 * Two destinations, and the split is deliberate:
 *
 *   Course URLs go to sixsigmasouthafrica.co.za, which holds the actual course
 *   pages with dates and prices. Sending a black-belt query to an umbrella
 *   capability page would be a soft 404 in everything but the status code, and
 *   Google passes little through a redirect it judges irrelevant.
 *
 *   Everything else stays on 2ko.co.za.
 *
 * Anything with no honest equivalent is left to 404 on purpose. A redirect to a
 * page that does not answer the query is worse than a clean miss: it wastes the
 * visitor's click and teaches Google the target is a dumping ground. The retired
 * IT-training catalogue is the large example — 2KO no longer sells Cisco, AWS or
 * Microsoft certification, so those URLs get the 404 page and its onward links.
 */

/** Where the course catalogue actually lives. */
const SSSA = "https://sixsigmasouthafrica.co.za";

/** Cities with a dedicated landing page on the Six Sigma site. */
const SSSA_CITIES = new Set([
  "cape-town",
  "johannesburg",
  "durban",
  "pretoria",
  "port-elizabeth",
]);

/**
 * Legacy belt naming to current course slugs. Order matters: `lean-green-belt`
 * has to be tested before `green-belt` or it matches the wrong entry.
 *
 * Minitab and SigmaXL were software variants of the same qualification. The
 * current catalogue does not split them, so both fold into the DMAIC course.
 */
const BELTS: [RegExp, string][] = [
  [/^lean-green-belt$/, "lean-green-belt"],
  [/^lean-black-belt$/, "lean-black-belt"],
  [/^dmaic-green-belt$/, "dmaic-green-belt"],
  [/^dmaic-black-belt$/, "dmaic-black-belt"],
  [/^core-green-belt$/, "core-green-belt"],
  [/^white-belt$/, "white-belt"],
  [/^yellow-belt$/, "yellow-belt"],
  [/^green-belt$/, "dmaic-green-belt"],
  [/^black-belt$/, "dmaic-black-belt"],
];

/** Legacy delivery-mode prefixes, longest first so the specific ones win. */
const MODES: [RegExp, "classroom" | "online" | "virtual"][] = [
  [/^virtual-/, "virtual"],
  [/^online-six-sigma-minitab-/, "online"],
  [/^online-six-sigma-sigma-xl-/, "online"],
  [/^online-six-sigma-/, "online"],
  [/^online-minitab-/, "online"],
  [/^online-sigma-xl-/, "online"],
  [/^online-/, "online"],
  [/^classroom-/, "classroom"],
  [/^six-sigma-/, "classroom"],
];

function belt(slug: string) {
  for (const [pattern, name] of BELTS) if (pattern.test(slug)) return name;
  return null;
}

/** Splits `virtual-black-belt` into its mode and its course. */
function course(slug: string) {
  for (const [pattern, mode] of MODES) {
    if (!pattern.test(slug)) continue;
    const name = belt(slug.replace(pattern, ""));
    if (name) return { name, mode };
  }
  const bare = belt(slug);
  return bare ? { name: bare, mode: "classroom" as const } : null;
}

/**
 * `/{mode}-{belt}-courses-in-{city}/` — 147 of these, and the single largest
 * block of lost long-tail.
 *
 * Classroom pages keep the city, because someone searching for a course in
 * Bloemfontein is asking where they can physically attend. Virtual and online
 * pages keep the belt instead, because the location was never the point.
 */
function cityPage(path: string) {
  const match = /^\/(.+)-courses-in-([a-z-]+)$/.exec(path);
  if (!match) return null;
  const [, prefix, city] = match;
  const found = course(prefix);
  if (!found) return null;
  if (found.mode === "classroom" && SSSA_CITIES.has(city)) {
    return `${SSSA}/courses/in/${city}`;
  }
  return `${SSSA}/courses/${found.name}-${found.mode}`;
}

/** `/product/{slug}/` — the WooCommerce catalogue. */
function product(path: string) {
  const match = /^\/product\/(.+)$/.exec(path);
  if (!match) return null;
  const slug = match[1];

  // Lean levels that predate the current belt naming.
  const lean = /^(classroom|online|virtual)-lean-(practitioner|expert|leader)$/.exec(
    `${slug}`,
  );
  if (lean) {
    const grade = lean[2] === "practitioner" ? "lean-green-belt" : "lean-black-belt";
    return `${SSSA}/courses/${grade}-${lean[1]}`;
  }
  const leanAlt = /^lean-(practitioner|expert|leader)-(classroom|online|virtual)$/.exec(slug);
  if (leanAlt) {
    const grade = leanAlt[1] === "practitioner" ? "lean-green-belt" : "lean-black-belt";
    return `${SSSA}/courses/${grade}-${leanAlt[2]}`;
  }

  const found = course(slug);
  if (found) return `${SSSA}/courses/${found.name}-${found.mode}`;

  // Business-skills products are a retired line. The training capability page
  // is the honest destination: same subject, current offer.
  if (/^(budgeting|business-process|business-strategy|change-management|computerised|education-management|financial-management|principles-of-management|procurement|project-management|quality-management|zones)/.test(slug)) {
    return "/training";
  }
  if (/^excel-/.test(slug)) return "/training";

  // Six Sigma subjects with no single current course page.
  if (/^(design-for-six-sigma|six-sigma-champion|six-sigma-principles|toyota-kata|opex|lean-office|lean-product-development|lean-six-sigma-it-training|\d-day-stats-course)/.test(slug)) {
    return `${SSSA}/courses`;
  }
  return null;
}

/**
 * One-off paths. Everything here was decided individually; nothing is a guess
 * dressed up as a rule.
 */
const EXPLICIT: Record<string, string> = {
  // Corporate
  "/contact-us": "/contact",
  "/privacy-policy": "/privacy",
  "/category/privacy-policy": "/privacy",
  "/category/contact-us": "/contact",
  "/why-choose-us": "/studio",
  "/category/why-choose-us": "/studio",
  "/accreditation": `${SSSA}/accreditation`,
  "/category/accredittation-post-rotation": `${SSSA}/accreditation`,

  // Course hubs
  "/courses": `${SSSA}/courses`,
  "/which-course": `${SSSA}/courses`,
  "/all-black-belt-courses": `${SSSA}/courses/dmaic-black-belt-classroom`,
  "/all-green-belt-courses": `${SSSA}/courses/dmaic-green-belt-classroom`,
  "/all-white-belt-courses": `${SSSA}/courses/white-belt-classroom`,
  "/all-yellow-belt-courses": `${SSSA}/courses/yellow-belt-classroom`,
  "/all-pure-lean-courses": `${SSSA}/courses/lean-green-belt-classroom`,
  "/all-business-courses": "/training",
  "/business-courses": "/training",
  "/category/business-course": "/training",
  "/virtual-training-4": `${SSSA}/courses`,
  "/online-video-courses-1": `${SSSA}/courses`,
  "/category/online-video-courses-post-rotation": `${SSSA}/courses`,
  "/category/our-training-post-rotation": `${SSSA}/courses`,
  "/category/virtual-training-post-rotation": `${SSSA}/courses`,

  // Belt landing pages
  "/white-belt": `${SSSA}/courses/white-belt-classroom`,
  "/yellow-belt": `${SSSA}/courses/yellow-belt-classroom`,
  "/green-belt": `${SSSA}/courses/dmaic-green-belt-classroom`,
  "/category/white-belt": `${SSSA}/courses/white-belt-classroom`,
  "/category/yellow-belt": `${SSSA}/courses/yellow-belt-classroom`,
  "/category/green-belt": `${SSSA}/courses/dmaic-green-belt-classroom`,
  "/category/black-belt": `${SSSA}/courses/dmaic-black-belt-classroom`,
  "/black-belt-courses-5": `${SSSA}/courses/dmaic-black-belt-classroom`,
  "/green-belt-courses-1": `${SSSA}/courses/dmaic-green-belt-classroom`,
  "/green-belt-courses-5": `${SSSA}/courses/dmaic-green-belt-classroom`,
  "/category/black-belt-courses-post-rotation": `${SSSA}/courses/dmaic-black-belt-classroom`,
  "/category/dmaic-green-belt-post-rotation": `${SSSA}/courses/dmaic-green-belt-classroom`,
  "/category/lean-black-belt-post-rotation": `${SSSA}/courses/lean-black-belt-classroom`,
  "/lean-and-six-sigma": `${SSSA}/courses`,
  "/pure-lean": `${SSSA}/courses/lean-green-belt-classroom`,

  // Six Sigma subjects
  "/category/design-for-six-sigma": `${SSSA}/courses`,
  "/category/six-sigma-principles": `${SSSA}/courses`,
  "/category/six-sigma-champion": `${SSSA}/courses`,
  "/category/toyota-kata": `${SSSA}/courses`,
  "/category/lean-office-and-service": `${SSSA}/courses`,
  "/category/lean-product-development": `${SSSA}/courses`,
  "/category/lean-six-sigma-it-training": `${SSSA}/courses`,
  "/category/green-process-management": `${SSSA}/courses`,

  // Statistical work is what Sigmafy is.
  "/statistics": "/sigmafy",
  "/category/stats": "/sigmafy",

  // Operational excellence and diagnostics map onto current offers.
  "/opex": "/managed-improvement",
  "/category/opex": "/managed-improvement",
  "/detailed-assessment-tool": "/process-review",
  "/category/detailed-assessment-tool": "/process-review",
  "/at-my-company-1": "/training",
  "/at-my-company-2": "/training",
  "/category/at-my-company-post-rotation": "/training",

  // Business-skills subject pages
  "/budgeting-financial-management": "/training",
  "/business-process-management": "/training",
  "/business-strategy-planning": "/training",
  "/computerised-financial-management": "/training",
  "/financial-management": "/training",
  "/principles-of-management": "/training",
  "/procurement-logistics": "/training",
  "/project-management": "/training",
  "/quality-management": "/training",
  "/excel-courses": "/training",

  // The one legacy line the new site still sells.
  "/web-design": "/websites",
  "/website-development": "/websites",

  // Static pages from the pre-WordPress site. "sixisgma" is a typo that was
  // live long enough to be indexed under it.
  "/courses/sixisgma-courses-in-africa.html": `${SSSA}/courses`,
  "/alphabetical-list.html": `${SSSA}/courses`,
  "/faq.html": `${SSSA}/faqs`,
  "/specials.html": `${SSSA}/courses`,
  "/special_offers.html": `${SSSA}/courses`,
  "/courses/project-management-courses.html": "/training",
  "/courses/setaaccreditedcourses.html": "/training",
  "/one-on-one-classes.html": "/training",

  // Offices and enquiries both end at the same place now.
  "/2ko-offices": "/contact",
  "/category/2ko-offices-post-rotation": "/contact",
  "/need-help": "/contact",
  "/category/need-help": "/contact",
  "/category/need-help-post-rotation": "/contact",

  "/category/our-amazing-clients-post-rotation": "/results",
  "/category/effective-supply-chain-management-post-rotation": "/training",
};

/** Suffix-bearing legacy patterns handled as rules rather than 378 literals. */
function byPattern(path: string) {
  // WooCommerce category archives: /product-category/courses/green-belt
  const archive = /^\/product-category\/courses\/(.+)$/.exec(path);
  if (archive) {
    const name = belt(archive[1]);
    return name ? `${SSSA}/courses/${name}-classroom` : `${SSSA}/courses`;
  }
  // `/six-sigma-principles-in-cape-town-johannesburg-and-other-parts-of-south-africa`
  const spun = /^\/(.+)-in-cape-town-johannesburg-and-other-parts-of-south-africa$/.exec(path);
  if (spun) {
    const subject = `/${spun[1]}`;
    return EXPLICIT[subject] ?? EXPLICIT[`/category${subject}`] ?? `${SSSA}/courses`;
  }
  // Old static business-skills pages.
  if (/^\/business-skills\//.test(path)) return "/training";
  // Numbered WordPress duplicates: /lean-black-belt-2-2, /pure-lean-2, /yellow-belt-8
  const numbered = /^\/(.+?)-\d+(?:-\d+)?$/.exec(path);
  if (numbered) {
    const base = `/${numbered[1]}`;
    if (EXPLICIT[base]) return EXPLICIT[base];
    const found = course(numbered[1]);
    if (found) return `${SSSA}/courses/${found.name}-${found.mode}`;
  }
  return null;
}

/**
 * Normalises the way a legacy URL might arrive. Old links carry trailing
 * slashes, mixed case (`project-Management-courses.html`) and percent-encoded
 * spaces, and all three have to land on the same key.
 */
export function normalise(pathname: string) {
  let path = pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // A malformed escape sequence is not a legacy URL. Match on the raw form.
  }
  path = path.toLowerCase().replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/** The destination for a legacy path, or null to let it 404. */
export function legacyDestination(pathname: string): string | null {
  const path = normalise(pathname);
  if (path === "/") return null;
  return (
    EXPLICIT[path] ??
    cityPage(path) ??
    product(path) ??
    byPattern(path) ??
    null
  );
}

/* ------------------------------------------------------ retired lines */

/**
 * The complement of the map above: legacy URLs with no honest destination.
 *
 * These stay 404. A 200-status "no longer available" page is classified as a
 * soft 404 by Google regardless of how it is worded, so it leaves the index
 * anyway — and in the meantime it competes for queries 2KO cannot serve, which
 * teaches the search engine this domain does not satisfy that intent.
 *
 * What the status code cannot do is talk to the person who arrived. That is
 * what this is for: the 404 page reads the address it was asked for and answers
 * the specific thing they were looking for, while still telling Google to drop
 * the URL.
 */
export type RetiredLine = {
  subject: string;
  line: string;
  links: { href: string; label: string; note: string }[];
};

const RETIRED: { match: RegExp; value: RetiredLine }[] = [
  {
    // The IT certification catalogue, across both the /courses/ pages and the
    // per-certification /online/ pages.
    match:
      /^\/(?:courses\/(?:it-security|adobe|amazon|apple|cisco|cloud-technology|comptia|linux|microsoft|other|programming_?|web-development|app-development|google\/)|online\/)/,
    value: {
      subject: "IT certification training",
      line:
        "2KO ran Cisco, Microsoft, CompTIA, Adobe and AWS certification courses for many years. There is no replacement for that catalogue on this site.",
      links: [
        { href: "/training", label: "Training", note: "Accredited Six Sigma capability" },
        { href: "/method", label: "Method", note: "How improvement work runs" },
        { href: "/systems", label: "What we build", note: "The six operational layers" },
        { href: "/contact", label: "Contact", note: "Ask us directly" },
      ],
    },
  },
  {
    match: /^\/(?:seo|digital-marketing)$/,
    value: {
      subject: "SEO and digital marketing",
      line:
        "We build and run the sites and systems that marketing depends on, but we do not run campaigns or optimise anyone else's site for search.",
      links: [
        { href: "/websites", label: "Website services", note: "Four tiers, priced" },
        { href: "/systems", label: "What we build", note: "The six operational layers" },
        { href: "/pricing", label: "Pricing", note: "Every price, published" },
        { href: "/contact", label: "Contact", note: "Ask us directly" },
      ],
    },
  },
];

/** The retired line a legacy address belongs to, if it belongs to one. */
export function retiredLine(pathname: string): RetiredLine | null {
  const path = normalise(pathname);
  for (const { match, value } of RETIRED) if (match.test(path)) return value;
  return null;
}
