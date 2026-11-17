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
      ["Lean and Six Sigma programmes", "/training", "Large-scale deployments inside organisations: White Belt for everyone, Yellow, Green and Black Belts in waves, each running real projects. Public certification runs through sixsigmasouthafrica.co.za and sixsigmauk.com."],
      ["Sigmafy", "/sigmafy", "The platform every belt learns, works and is measured on: guided projects, a coach that checks the work, trainer sign-off and verified savings."],
      ["Improvement partnerships", "/managed-improvement", "Monthly partnerships for coaching, sign-off, governance and savings tracking across a whole programme."],
      ["How it works", "/method", "The sequence: diagnose, train, run real projects, measure the result and hold it."],
    ],
  },
  {
    title: "Starting points",
    entries: [
      ["Pricing", "/pricing", "Training, partnerships and Sigmafy Statistics."],
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
