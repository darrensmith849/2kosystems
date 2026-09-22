/**
 * The GA4 properties the dashboard reports on.
 *
 * Hardcoded rather than discovered at request time. Listing them costs three
 * Admin API round trips per account and the estate has 56 properties across
 * three accounts — most of which have never received a hit. Enumerating that
 * on every page load would make the dashboard slow to tell you nothing.
 *
 * Property ids are stable for the life of a property. Measurement ids are kept
 * alongside so a mismatch is obvious if a stream is ever repointed — the names
 * in this estate famously do not describe what they track, so the pairing is
 * the check. See the ga4-estate notes.
 */
export type DashboardSite = {
  /** GA4 numeric property id. */
  id: string;
  /** Measurement id, for cross-checking against the live page. */
  mid: string;
  host: string;
  label: string;
  group: "Six Sigma" | "2KO" | "Sigmafy";
  /**
   * True where the estate owns this host in Search Console, so the drill-down
   * can show queries and positions. Eight of the ten cannot — they are either
   * unverified or not added at all — and their pages show traffic only. The
   * flag lives here rather than being derived from SEARCH_SITES because the
   * nav is a client component and gsc.ts is server code.
   */
  search?: true;
};

export const SITES: DashboardSite[] = [
  { id: "319206502", mid: "G-NLFDVKD836", host: "sixsigmasouthafrica.co.za", label: "Six Sigma South Africa", group: "Six Sigma", search: true },
  { id: "367822365", mid: "G-G12VG51THV", host: "leansixsigmatraining.co.za", label: "Lean Six Sigma Training", group: "Six Sigma" },
  { id: "379342137", mid: "G-S7ZQBB3WHV", host: "sixsigmauk.com", label: "Six Sigma UK", group: "Six Sigma", search: true },
  { id: "362689848", mid: "G-7EM76QCC22", host: "sixsigmacertification.co.za", label: "Six Sigma Certification", group: "Six Sigma" },
  { id: "366743695", mid: "G-ZGHJPXXL68", host: "i2ko.com", label: "i2KO / Six Sigma Johannesburg", group: "Six Sigma" },
  { id: "364749990", mid: "G-3X2L3TMWHX", host: "2ko.co.za", label: "2KO", group: "2KO" },
  { id: "319226315", mid: "G-6D7W8GHVXP", host: "2koafrica.com", label: "2KO Africa", group: "2KO" },
  { id: "359769340", mid: "G-JR1L7YWPXC", host: "sigmafy.co", label: "Sigmafy (apex)", group: "Sigmafy" },
  { id: "554187431", mid: "G-38K9L8HZYY", host: "portal.sigmafy.co", label: "Sigmafy Portal", group: "Sigmafy" },
  { id: "554187432", mid: "G-5D086DDDBP", host: "tools.sigmafy.co", label: "Sigmafy Statistics", group: "Sigmafy" },
];
