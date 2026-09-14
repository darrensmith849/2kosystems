/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Google Ads — take the Display Network off the SixSigma *Search* campaign.
 *
 *   npm run ads:kill-display -- --apply
 *
 * "Include Google Display Network" is on by default when a Search campaign is
 * created in the Google Ads UI, and it is the single most expensive default in
 * the product. On this account, over the last seven days:
 *
 *     SEARCH           R  277    120 clicks
 *     SEARCH_PARTNERS  R    7     19 clicks
 *     CONTENT          R2,112    597 clicks   <- 88% of the campaign
 *
 * Those 597 clicks are banner impressions on unrelated websites, not people
 * searching for Six Sigma training. It is why keyword spend never reconciled
 * with campaign spend, and why the search-term report looked so off-theme:
 * most of the money was never matched to a keyword at all.
 *
 * Search Partners stays on — R7 for 19 clicks is not worth an argument.
 */
import { query, mutate } from "./ads-query.ts";

const CID = "3516006867";
const APPLY = process.argv.includes("--apply");

async function main() {
  console.log(`\n  ${APPLY ? "APPLYING" : "DRY RUN — pass --apply to write"}\n`);

  const rows = (await query(
    CID,
    `SELECT campaign.id, campaign.name, campaign.advertising_channel_type,
            campaign.network_settings.target_content_network
     FROM campaign
     WHERE campaign.status = 'ENABLED' AND campaign.advertising_channel_type = 'SEARCH'`,
  )) as any[];

  const targets = rows.filter((r) => r.campaign.networkSettings?.targetContentNetwork);
  if (!targets.length) {
    console.log("  No enabled Search campaign has Display turned on.\n");
    return;
  }

  for (const r of targets) {
    console.log(`  ${r.campaign.name} — Display currently ON`);
    await mutate(
      CID,
      "campaigns",
      [
        {
          updateMask: "networkSettings.targetContentNetwork",
          update: {
            resourceName: `customers/${CID}/campaigns/${r.campaign.id}`,
            networkSettings: { targetContentNetwork: false },
          },
        },
      ],
      !APPLY,
    );
    console.log(`    → Display ${APPLY ? "turned off" : "would be turned off"}\n`);
  }
}

main().catch((e) => { console.error(`\n  ✖ ${e.message}\n`); process.exit(1); });
