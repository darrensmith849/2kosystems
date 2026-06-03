// Pure utility for renewal window computation. NO server-only — safe to
// import from client components. The renewals-service module re-exports
// these for server-side callers.

export type RenewalWindow =
  | 'overdue'
  | 'due'
  | 'within_7'
  | 'within_14'
  | 'within_30'
  | 'within_60'
  | 'future';

export type ReminderState =
  | 'none'
  | 'notified_60'
  | 'notified_30'
  | 'notified_14'
  | 'notified_7'
  | 'due'
  | 'overdue';

const DAY_MS = 86_400_000;

export function computeRenewalWindow(nextDueAt: Date | string): RenewalWindow {
  const dueMs = nextDueAt instanceof Date ? nextDueAt.getTime() : new Date(nextDueAt).getTime();
  const diff = dueMs - Date.now();
  if (diff < 0) return 'overdue';
  if (diff <= DAY_MS) return 'due';
  if (diff <= 7 * DAY_MS) return 'within_7';
  if (diff <= 14 * DAY_MS) return 'within_14';
  if (diff <= 30 * DAY_MS) return 'within_30';
  if (diff <= 60 * DAY_MS) return 'within_60';
  return 'future';
}
