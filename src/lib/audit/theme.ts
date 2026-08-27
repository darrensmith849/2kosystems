/**
 * Theme derivation.
 *
 * A token list cannot catch a competitor called "Mancosa" or "Regenesys" — there
 * is no generic word in either. So instead of enumerating who the rivals are, we
 * derive what the account is *about* and flag spend on terms that share none of
 * its distinctive vocabulary.
 *
 * "mancosa durban" shares nothing with {six, sigma, lean, belt}. Neither does
 * "training classes near me", once the generic education words are discounted.
 * Both are things this advertiser cannot sell to.
 */

/** Words that appear in every education advertiser's account and identify nothing. */
const GENERIC = new Set([
  "course", "courses", "class", "classes", "training", "trainings", "certification",
  "certificate", "certified", "diploma", "degree", "qualification", "programme",
  "program", "learn", "learning", "study", "studies", "online", "distance",
  "part", "time", "full", "near", "me", "best", "top", "cheap", "price", "prices",
  "cost", "costs", "fees", "fee", "south", "africa", "african", "sa", "durban",
  "johannesburg", "cape", "town", "pretoria", "gauteng", "the", "and", "for",
  "with", "in", "of", "a", "an", "to", "how", "what", "is", "are", "do", "does",
  "can", "i", "you", "your", "my", "it", "on", "at", "by", "from", "or",
  // campaign-structure noise, not subject matter
  "pmax", "remarketing", "display", "search", "brand", "generic", "dynamic",
  "group", "groups", "run", "test", "new", "old", "copy", "campaign", "ad",
]);

const tokens = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

export type Theme = {
  distinctive: Set<string>;
  sources: string[];
};

/**
 * Built from what the advertiser has explicitly chosen: campaign and ad group
 * names, plus every search term they added as a keyword. Never from the raw
 * search terms — that would learn the waste along with the intent.
 */
export function deriveTheme(sources: string[], extra: string[] = []): Theme {
  const distinctive = new Set<string>();
  for (const source of [...sources, ...extra]) {
    for (const t of tokens(source)) {
      if (t.length < 2 || GENERIC.has(t)) continue;
      if (/^\d+$/.test(t)) continue;
      distinctive.add(t);
    }
  }
  return { distinctive, sources: [...new Set(sources)].slice(0, 12) };
}

/** True when the term shares no distinctive vocabulary with what the account sells. */
export function isOffTheme(term: string, theme: Theme, brandTerms: string[]): boolean {
  const lower = term.toLowerCase();
  if (brandTerms.some((b) => b && lower.includes(b.toLowerCase()))) return false;
  const ts = tokens(term);
  if (!ts.length) return false;
  if (ts.every((t) => GENERIC.has(t))) return true;
  return !ts.some((t) => {
    if (theme.distinctive.has(t)) return true;
    // catch sixsigma / six sigma and simple plurals
    for (const d of theme.distinctive) {
      if (d.length >= 4 && (t.startsWith(d) || d.startsWith(t)) && Math.abs(d.length - t.length) <= 2) return true;
      if (d.length >= 6 && t.length >= 6 && d.includes(t)) return true;
    }
    return false;
  });
}
