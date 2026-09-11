/**
 * Keep 2KO Systems and Six Sigma conversions apart inside one Ads account.
 *
 *   node scripts/ads-split-goals.ts            rehearse
 *   node scripts/ads-split-goals.ts --apply    write
 *
 * Every campaign on this account sits at goal_config_level = CUSTOMER, which
 * means it counts — and bids on — every primary conversion action in the
 * account. So the SixSigma campaign would treat a 2KO Systems enquiry as its
 * own conversion, and the 2KOS campaign would treat a Six Sigma enquiry as
 * one of its. Both would then optimise toward the other's customers.
 *
 * This creates one custom conversion goal per business and pins each campaign
 * to its own, which separates both the reporting and the bidding without
 * needing separate Ads accounts.
 */
import { query, mutate } from "./ads-query.ts";

const CID = "351-600-6867";
const APPLY = process.argv.includes("--apply");

const GOALS = [
  {
    name: "2KO Systems",
    match: (n: string) => n.startsWith("2KOS "),
    campaigns: ["2KOS | Systems | Search | ZA", "2ko Systems"],
  },
  {
    name: "Six Sigma South Africa",
    match: (n: string) => n.startsWith("SSSA "),
    campaigns: ["SixSigma", "PMax: Six Sigma South Africa - Remarketing"],
  },
];

const log = (s: string) => console.log(`  ${s}`);

const actions = (await query(
  CID,
  `SELECT conversion_action.resource_name, conversion_action.name
   FROM conversion_action WHERE conversion_action.status = 'ENABLED'`,
)).map((r) => (r as { conversionAction: { resourceName: string; name: string } }).conversionAction);

const existingGoals = new Map(
  (await query(CID, "SELECT custom_conversion_goal.resource_name, custom_conversion_goal.name FROM custom_conversion_goal"))
    .map((r) => {
      const g = (r as { customConversionGoal: { resourceName: string; name: string } }).customConversionGoal;
      return [g.name, g.resourceName];
    }),
);

for (const spec of GOALS) {
  const mine = actions.filter((a) => spec.match(a.name));
  log(`\n${spec.name}: ${mine.length} actions — ${mine.map((m) => m.name).join(", ")}`);
  if (!mine.length) { log("  no actions, skipping"); continue; }

  let goalRn = existingGoals.get(spec.name);
  if (!goalRn) {
    if (!APPLY) { log("  would create the goal"); continue; }
    const res = await mutate(CID, "customConversionGoals", [{
      create: { name: spec.name, conversionActions: mine.map((m) => m.resourceName), status: "ENABLED" },
    }]);
    goalRn = res.results?.[0]?.resourceName;
    log(`  created goal ${goalRn}`);
  } else {
    if (APPLY) {
      await mutate(CID, "customConversionGoals", [{
        update: { resourceName: goalRn, conversionActions: mine.map((m) => m.resourceName) },
        updateMask: "conversionActions",
      }]);
    }
    log(`  goal exists, actions ${APPLY ? "refreshed" : "would be refreshed"}`);
  }

  // Pin each campaign to it. The config's resource name is derived from the
  // campaign id, so no lookup of the config itself is needed.
  const camps = await query(
    CID,
    `SELECT campaign.id, campaign.name FROM campaign
     WHERE campaign.name IN (${spec.campaigns.map((c) => `'${c}'`).join(",")})`,
  );
  for (const c of camps) {
    const { id, name } = (c as { campaign: { id: string; name: string } }).campaign;
    if (!APPLY) { log(`  would pin "${name}"`); continue; }
    await mutate(CID, "conversionGoalCampaignConfigs", [{
      update: {
        resourceName: `customers/${CID.replace(/\D/g, "")}/conversionGoalCampaignConfigs/${id}`,
        goalConfigLevel: "CAMPAIGN",
        customConversionGoal: goalRn,
      },
      updateMask: "goalConfigLevel,customConversionGoal",
    }]);
    log(`  pinned "${name}"`);
  }
}

if (!APPLY) log("\nRehearsal only. Re-run with --apply.");
