/** Business name -> the domains worth checking. Shared by the domain-check API and its test. */

/** A business name, or a domain they already own. */
export function candidates(input: string): string[] {
  const raw = input.trim().toLowerCase();
  const asDomain = raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(asDomain) && asDomain.length <= 80) return [asDomain];
  const words = raw.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/['\u2019]/g, "").replace(/&/g, " and ").match(/[a-z0-9]+/g) ?? [];
  const slug = words.join("").slice(0, 40);
  if (slug.length < 3) return [];
  const out = [`${slug}.co.za`, `${slug}.com`];
  if (words.length > 1) out.push(`${words.join("-").slice(0, 40)}.co.za`);
  return out;
}
