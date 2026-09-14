/**
 * Google Ads — what is actually being measured.
 *
 *   npm run ads:audit-tracking
 *
 * Answers three questions that the Ads UI spreads across five screens:
 * which conversion actions exist and which have ever recorded anything;
 * which goals each campaign is optimising towards; and whether the account
 * can build audiences, which needs a remarketing tag and a GA4 link rather
 * than conversion tracking alone.
 *
 * Read-only. Every section is queried independently so that one unsupported
 * field cannot take the whole report down with it.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { query } from "./ads-query.ts";

const CID = "3516006867"; // 2KO Africa — the only live account

function head(title: string) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 62 - title.length))}`);
}

/** Rows come back as loosely-typed GAQL JSON; each renderer knows its own shape. */
type Row = Record<string, any>;

async function section(title: string, gaql: string, render: (rows: Row[]) => void) {
  head(title);
  try {
    const rows = await query(CID, gaql);
    if (!rows.length) console.log("  (nothing)");
    else render(rows);
  } catch (e) {
    console.log(`  unavailable: ${(e as Error).message.slice(0, 200)}`);
  }
}

const n = (v: unknown) => Number(v ?? 0);
const rand = (micros: unknown) => `R${(n(micros) / 1e6).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

await section(
  "Campaigns, last 30 days",
  `SELECT campaign.name, campaign.status, campaign.advertising_channel_type,
          campaign_budget.amount_micros,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.all_conversions
   FROM campaign
   WHERE segments.date DURING LAST_30_DAYS AND campaign.status != 'REMOVED'
   ORDER BY metrics.cost_micros DESC`,
  (rows) => {
    for (const r of rows) {
      const m = r.metrics ?? {};
      console.log(
        `  ${(r.campaign.status as string).padEnd(8)} ${String(r.campaign.name).slice(0, 34).padEnd(35)}` +
          ` ${String(n(m.impressions)).padStart(7)} impr ${String(n(m.clicks)).padStart(5)} clicks` +
          ` ${rand(m.costMicros).padStart(10)}  conv ${n(m.conversions).toFixed(1).padStart(6)}` +
          `  all ${n(m.allConversions).toFixed(1).padStart(6)}`,
      );
    }
  },
);

await section(
  "Conversion actions — what exists, and what has ever fired",
  `SELECT conversion_action.name, conversion_action.status, conversion_action.type,
          conversion_action.category, conversion_action.counting_type,
          conversion_action.primary_for_goal,
          metrics.all_conversions
   FROM conversion_action
   WHERE segments.date DURING LAST_30_DAYS`,
  (rows) => {
    for (const r of rows) {
      const c = r.conversionAction;
      const fired = n(r.metrics?.allConversions);
      console.log(
        `  ${String(c.status).padEnd(9)} ${String(c.name).slice(0, 38).padEnd(39)}` +
          ` ${String(c.type).slice(0, 22).padEnd(23)} ${String(c.category).padEnd(14)}` +
          ` primary=${String(c.primaryForGoal ?? "-").padEnd(5)} fired=${fired}`,
      );
    }
  },
);

await section(
  "Custom conversion goals (how 2KOS and Six Sigma are separated)",
  `SELECT custom_conversion_goal.id, custom_conversion_goal.name,
          custom_conversion_goal.status, custom_conversion_goal.conversion_actions
   FROM custom_conversion_goal`,
  (rows) => {
    for (const r of rows) {
      const g = r.customConversionGoal;
      console.log(`  ${String(g.status).padEnd(9)} ${g.name}  (${(g.conversionActions ?? []).length} actions)`);
    }
  },
);

await section(
  "Which goal each campaign optimises towards",
  `SELECT campaign.name, campaign.status,
          campaign_conversion_goal.category, campaign_conversion_goal.origin,
          campaign_conversion_goal.biddable
   FROM campaign_conversion_goal
   WHERE campaign.status = 'ENABLED'`,
  (rows) => {
    const by = new Map<string, string[]>();
    for (const r of rows) {
      if (!r.campaignConversionGoal?.biddable) continue;
      const k = r.campaign.name as string;
      by.set(k, [...(by.get(k) ?? []), `${r.campaignConversionGoal.category}/${r.campaignConversionGoal.origin}`]);
    }
    if (!by.size) return console.log("  (no biddable goals on enabled campaigns)");
    for (const [name, goals] of by) console.log(`  ${name}\n      ${goals.join(", ")}`);
  },
);

await section(
  "Remarketing tag — can this account build audiences at all?",
  `SELECT remarketing_action.id, remarketing_action.name FROM remarketing_action`,
  (rows) => {
    for (const r of rows) console.log(`  ${r.remarketingAction.name}`);
  },
);

await section(
  "Audience lists, and whether they are big enough to target",
  `SELECT user_list.name, user_list.type, user_list.membership_status,
          user_list.size_for_display, user_list.size_for_search,
          user_list.eligible_for_display, user_list.eligible_for_search
   FROM user_list
   WHERE user_list.membership_status = 'OPEN'
   ORDER BY user_list.size_for_display DESC`,
  (rows) => {
    for (const r of rows) {
      const u = r.userList;
      console.log(
        `  ${String(u.name).slice(0, 40).padEnd(41)} ${String(u.type).padEnd(22)}` +
          ` display=${String(n(u.sizeForDisplay)).padStart(7)}${u.eligibleForDisplay ? "" : " (not eligible)"}` +
          `  search=${String(n(u.sizeForSearch)).padStart(7)}${u.eligibleForSearch ? "" : " (not eligible)"}`,
      );
    }
  },
);

await section(
  "Account-level conversion tracking settings",
  `SELECT customer.descriptive_name,
          customer.conversion_tracking_setting.conversion_tracking_id,
          customer.conversion_tracking_setting.conversion_tracking_status,
          customer.conversion_tracking_setting.cross_account_conversion_tracking_id
   FROM customer`,
  (rows) => {
    for (const r of rows) {
      const s = r.customer.conversionTrackingSetting ?? {};
      console.log(`  account            ${r.customer.descriptiveName}`);
      console.log(`  conversion id      ${s.conversionTrackingId ?? "(none)"}`);
      console.log(`  status             ${s.conversionTrackingStatus ?? "(none)"}`);
      console.log(`  cross-account id   ${s.crossAccountConversionTrackingId ?? "(none)"}`);
    }
  },
);

console.log();
