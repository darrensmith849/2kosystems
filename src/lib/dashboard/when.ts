/**
 * Dates on the dashboard, in the timezone the business actually runs in.
 *
 * Two mistakes live here, both of which shipped once and both of which look
 * fine until you check them against a clock.
 *
 * The locale is not the timezone. `toLocaleString("en-ZA", …)` picks South
 * African *formatting* — 24-hour, day first — and says nothing about which
 * zone to render in, so it falls back to the runtime's. Workers run in UTC, so
 * every time on the dashboard was two hours behind the office without anything
 * looking wrong.
 *
 * "Today" is a calendar question, not an arithmetic one. Dividing elapsed
 * milliseconds by 86,400,000 answers "within the last 24 hours", which labelled
 * an enquiry from 23:29 last night as "Today" at 06:55 this morning. Leads are
 * chased by day, so that is a claim worth getting right.
 *
 * South Africa has no daylight saving, so a fixed zone stays correct year
 * round and the day-before arithmetic below cannot land on a 23- or 25-hour
 * day.
 */
export const DASHBOARD_TZ = "Africa/Johannesburg";

/** Time of day, e.g. "06:52". */
export function timeOfDay(d: Date): string {
  return d.toLocaleTimeString("en-ZA", { timeStyle: "short", timeZone: DASHBOARD_TZ });
}

/** Full stamp for anything older than yesterday, e.g. "19 Sep 2026, 23:29". */
export function stamp(d: Date): string {
  return d.toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DASHBOARD_TZ,
  });
}

/**
 * The calendar day in Johannesburg, as YYYY-MM-DD.
 *
 * en-CA is used only because it formats that way, which makes two days
 * comparable as plain strings.
 */
function dayIn(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: DASHBOARD_TZ });
}

/** "Today · 06:52", "Yesterday · 23:29", or a dated stamp. */
export function when(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const day = dayIn(d);
  if (day === dayIn(new Date())) return `Today · ${timeOfDay(d)}`;
  if (day === dayIn(new Date(Date.now() - 86_400_000))) return `Yesterday · ${timeOfDay(d)}`;

  return stamp(d);
}
