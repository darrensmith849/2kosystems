/**
 * Seed data for the embedded operations console.
 *
 * Invented, plausible records for a fictional mining-services operation —
 * this is a demo of our own software, not any client's data.
 */

export type Status = "pending" | "approved" | "declined" | "escalated";
export type Priority = "urgent" | "high" | "normal";

export type Entry = { at: string; who: string; what: string; tone?: "good" | "warn" | "bad" };

/** One step in an approval chain — drawn as a row of avatars in the UI. */
export type Step = { who: string; role: string; state: "done" | "active" | "waiting" };

export type Request = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  site: string;
  raisedBy: string;
  owner: string;
  value: number;
  age: string;
  category: string;
  detail: string;
  /** Short label for the dashboard tiles — the long title is for the detail pane. */
  short: string;
  chain: Step[];
  /** Twelve weeks of the metric this request affects, for the row sparkline. */
  trend: number[];
  trail: Entry[];
};

export const SITES = ["Rustenburg", "Steelpoort", "Mokopane", "Central"] as const;

export const REQUESTS: Request[] = [
  {
    id: "REQ-2418",
    short: "Gearbox",
    chain: [{ who: "T. Nkosi", role: "Raised", state: "done" }, { who: "J. Meyer", role: "Supervisor", state: "done" }, { who: "You", role: "Ops Director", state: "active" }, { who: "K. Botha", role: "Finance", state: "waiting" }],
    trend: [42, 48, 39, 55, 47, 61, 58, 64, 71, 78, 84, 92],
    title: "Conveyor CV-14 gearbox replacement",
    status: "escalated",
    priority: "urgent",
    site: "Rustenburg",
    raisedBy: "T. Nkosi",
    owner: "You",
    value: 184500,
    age: "3d 4h",
    category: "Unplanned maintenance",
    detail:
      "Vibration on CV-14 exceeded threshold for the third consecutive shift. Section is running at reduced rate. Gearbox lead time is 6 working days; supplier holds one unit.",
    trail: [
      { at: "Mon 06:12", who: "System", what: "Vibration threshold breached · 3rd occurrence", tone: "warn" },
      { at: "Mon 06:13", who: "System", what: "Request raised automatically from condition rule" },
      { at: "Mon 08:40", who: "T. Nkosi", what: "Quote attached · R184,500 ex VAT" },
      { at: "Wed 07:02", who: "System", what: "No decision in 48h · escalated to Ops Director", tone: "bad" },
    ],
  },
  {
    id: "REQ-2417",
    short: "Contractor",
    chain: [{ who: "P. Dlamini", role: "Raised", state: "done" }, { who: "System", role: "Compliance", state: "done" }, { who: "You", role: "Site lead", state: "active" }],
    trend: [30, 34, 31, 38, 36, 41, 39, 44, 42, 47, 45, 50],
    title: "Contractor access — Mavuso Electrical (4 crew)",
    status: "pending",
    priority: "high",
    site: "Steelpoort",
    raisedBy: "P. Dlamini",
    owner: "You",
    value: 0,
    age: "6h",
    category: "Contractor access",
    detail:
      "Four-person crew for switchgear inspection, Thursday 06:00–14:00. All medicals current. One induction expires in 11 days — flagged but not blocking.",
    trail: [
      { at: "Today 05:58", who: "P. Dlamini", what: "Request raised on site" },
      { at: "Today 05:58", who: "System", what: "Medicals verified · 4 of 4 current", tone: "good" },
      { at: "Today 05:59", who: "System", what: "Induction expiring in 11 days · noted", tone: "warn" },
    ],
  },
  {
    id: "REQ-2416",
    short: "Diesel",
    chain: [{ who: "S. Mahlangu", role: "Raised", state: "done" }, { who: "K. Botha", role: "First sign", state: "done" }, { who: "You", role: "Second sign", state: "active" }],
    trend: [64, 61, 66, 72, 68, 75, 71, 78, 74, 81, 77, 84],
    title: "Diesel bulk order — 12,000 L",
    status: "pending",
    priority: "normal",
    site: "Rustenburg",
    raisedBy: "S. Mahlangu",
    owner: "You",
    value: 268400,
    age: "1d 2h",
    category: "Procurement",
    detail:
      "Routine replenishment against forecast. Above the R250,000 threshold, so it needs a second signature under the delegation policy.",
    trail: [
      { at: "Yest 09:14", who: "S. Mahlangu", what: "Request raised" },
      { at: "Yest 09:14", who: "System", what: "Above R250,000 · second signature required", tone: "warn" },
      { at: "Yest 11:30", who: "K. Botha", what: "First signature recorded", tone: "good" },
    ],
  },
  {
    id: "REQ-2415",
    short: "Overtime",
    chain: [{ who: "L. van Wyk", role: "Raised", state: "done" }, { who: "You", role: "Ops Director", state: "active" }, { who: "K. Botha", role: "Payroll", state: "waiting" }],
    trend: [20, 24, 22, 28, 26, 33, 30, 37, 34, 41, 38, 45],
    title: "Overtime authorisation — night shift, Section 4",
    status: "pending",
    priority: "high",
    site: "Mokopane",
    raisedBy: "L. van Wyk",
    owner: "You",
    value: 42800,
    age: "9h",
    category: "Labour",
    detail:
      "Twelve operators, two nights, to recover the backlog created by the CV-14 slowdown. Within the shift-pattern rules; no fatigue-rule conflicts.",
    trail: [
      { at: "Today 02:41", who: "L. van Wyk", what: "Request raised" },
      { at: "Today 02:41", who: "System", what: "Fatigue rules checked · no conflicts", tone: "good" },
    ],
  },
  {
    id: "REQ-2414",
    short: "Calibration",
    chain: [{ who: "System", role: "Raised", state: "done" }, { who: "K. Botha", role: "Approved", state: "done" }],
    trend: [50, 48, 52, 49, 54, 51, 56, 53, 58, 55, 60, 57],
    title: "Weighbridge calibration certificate renewal",
    status: "approved",
    priority: "normal",
    site: "Central",
    raisedBy: "N. Pillay",
    owner: "K. Botha",
    value: 18600,
    age: "2d",
    category: "Compliance",
    detail:
      "Annual SANAS calibration. Certificate expires in 21 days; the system raised this from the expiry rule rather than anyone remembering.",
    trail: [
      { at: "Sat 04:00", who: "System", what: "Certificate expiring in 21 days · request raised" },
      { at: "Mon 10:22", who: "K. Botha", what: "Approved · R18,600", tone: "good" },
      { at: "Mon 10:22", who: "System", what: "Supplier notified · booking requested", tone: "good" },
    ],
  },
  {
    id: "REQ-2413",
    short: "Laptop",
    chain: [{ who: "A. Fourie", role: "Raised", state: "done" }, { who: "K. Botha", role: "Declined", state: "done" }],
    trend: [18, 22, 19, 25, 21, 27, 24, 29, 26, 31, 28, 33],
    title: "Replacement laptop — planning office",
    status: "declined",
    priority: "normal",
    site: "Central",
    raisedBy: "A. Fourie",
    owner: "K. Botha",
    value: 24900,
    age: "4d",
    category: "IT",
    detail:
      "Declined — existing unit is 14 months old and within the refresh policy window. Reassigned to the IT queue for a memory upgrade instead.",
    trail: [
      { at: "Fri 13:05", who: "A. Fourie", what: "Request raised" },
      { at: "Fri 15:48", who: "K. Botha", what: "Declined · within refresh policy", tone: "bad" },
      { at: "Fri 15:48", who: "System", what: "Routed to IT queue as an upgrade" },
    ],
  },
];
