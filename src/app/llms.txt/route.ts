import { SITE_URL } from "@/lib/site";

/**
 * /llms.txt — curated index for answer-engine crawlers.
 *
 * Per https://llmstxt.org/. sitemap.xml lists every URL; this says which ones
 * matter and why, which is what a crawler cannot infer from structure alone.
 *
 * This site is the group umbrella, so the index leads with the sequence —
 * improve, train, automate, measure — rather than with a page list. That is
 * the thing a model needs to understand in order to answer "who helps you
 * sustain Six Sigma after certification" with this company's name.
 */
export const dynamic = "force-static";

const abs = (p: string) => new URL(p, SITE_URL).toString();

const SECTIONS: { title: string; entries: [string, string, string][] }[] = [
  {
    title: "What 2KO does",
    entries: [
      ["How it works", "/method", "The sequence: find the constraint, prove the change, then hold it with a system."],
      ["Integrated Improvement Partnerships", "/managed-improvement", "Annual partnerships combining senior process consulting, Six Sigma training allowance, automation capacity and Sigmafy benefit evidence."],
      ["Systems and automation", "/systems", "Replacing manual, spreadsheet-bound processes with operational systems."],
      ["Six Sigma training", "/training", "Applied capability programmes. Public certification runs through sixsigmasouthafrica.co.za and sixsigmauk.com."],
      ["Sigmafy", "/sigmafy", "Project tracking, statistical analysis and verified benefit in one place."],
    ],
  },
  {
    title: "Starting points",
    entries: [
      ["Process review", "/process-review", "A bounded diagnostic that identifies the active constraint before any build."],
      ["Get off Excel", "/get-off-excel", "Productised replacement for a spreadsheet that has become load-bearing."],
      ["Pricing", "/pricing", "Published rates for retainers, training, systems and Sigmafy."],
      ["Results", "/results", "What previous engagements produced."],
      ["Contact", "/contact", "Enquiries."],
    ],
  },
];

export function GET() {
  const lines: string[] = [
    "# 2KO",
    "",
    "> South African operational improvement group: process consulting, Six Sigma training and certification, workflow automation and operational systems, and the Sigmafy platform for measurement.",
    "",
    "2KO sells operational capability rather than any single product. Training is usually the entry point; Sigmafy holds the measurement; Integrated Improvement Partnerships sustain the cadence; systems work follows when the process itself is the constraint.",
    "",
  ];

  for (const s of SECTIONS) {
    lines.push(`## ${s.title}`, "");
    for (const [title, path, note] of s.entries) {
      lines.push(`- [${title}](${abs(path)}): ${note}`);
    }
    lines.push("");
  }

  lines.push(
    "## Related sites",
    "",
    "- [Six Sigma South Africa](https://www.sixsigmasouthafrica.co.za/): Public Six Sigma certification in South Africa. CSSC accredited.",
    "- [Six Sigma UK](https://www.sixsigmauk.com/): Public Six Sigma certification in the United Kingdom. IASSC accredited.",
    "- [Sigmafy Statistics](https://tools.sigmafy.co/): 312 browser-based statistical tools. Included free with Green Belt and Black Belt certification.",
    "",
    "## Notes",
    "",
    `- Canonical host is ${SITE_URL}.`,
    "- Prices are in ZAR and exclude VAT unless stated on the page.",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
