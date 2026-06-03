import 'server-only';
import { isDbConfigured } from '@/lib/db/client';
import { listRenewals, markReminded, type RenewalWithRefs } from './renewals-service';
import { computeRenewalWindow, type RenewalWindow, type ReminderState } from './renewals-window';
import { writeAudit } from './audit';
import { escapeHtml } from '@/lib/brevo';

// Server-only orchestrator for the daily renewal-reminder digest.
//
// Run shape:
//   - Triggered by /api/cron/renewals-remind at 07:00 SAST.
//   - Reads renewals once, buckets by window (60/30/14/7/due/overdue).
//   - For renewals whose current reminderState is BEHIND the bucket they now
//     fall into, builds a digest line and (when Brevo is configured and not
//     dryRun) emails a single ops mailbox.
//   - On successful send, advances reminderState via markReminded(...).
//
// Read-only outside ops: this never emails clients. The digest is internal.

const WINDOW_KEYS = [
  'overdue',
  'due',
  'within_7',
  'within_14',
  'within_30',
  'within_60',
] as const satisfies readonly RenewalWindow[];

type DigestWindow = (typeof WINDOW_KEYS)[number];

export type ReminderRunReport = {
  status: 'ok' | 'skipped' | 'failed';
  perWindow: Record<string, number>;
  emailsSent: number;
  durationMs: number;
  error?: string;
};

function emptyCounts(): Record<DigestWindow, number> {
  return {
    overdue: 0,
    due: 0,
    within_7: 0,
    within_14: 0,
    within_30: 0,
    within_60: 0,
  };
}

/**
 * Map a current window to the reminderState that "fully covers" it.
 * If a renewal already has THIS state (or stronger), we skip it.
 */
function targetStateFor(window: DigestWindow): ReminderState {
  switch (window) {
    case 'overdue':
      return 'overdue';
    case 'due':
      return 'due';
    case 'within_7':
      return 'notified_7';
    case 'within_14':
      return 'notified_14';
    case 'within_30':
      return 'notified_30';
    case 'within_60':
      return 'notified_60';
  }
}

// Ordinal so we can detect "this renewal already past this stage".
const STATE_ORDER: Record<ReminderState, number> = {
  none: 0,
  notified_60: 1,
  notified_30: 2,
  notified_14: 3,
  notified_7: 4,
  due: 5,
  overdue: 6,
};

function needsReminder(current: ReminderState, target: ReminderState): boolean {
  return STATE_ORDER[current] < STATE_ORDER[target];
}

function formatLine(r: RenewalWithRefs): string {
  const due = new Date(r.nextDueAt).toISOString().slice(0, 10);
  const client = r.client?.name ?? r.client?.legalName ?? '—';
  return `<li><strong>${escapeHtml(r.name)}</strong> — due ${due} · ${escapeHtml(client)} · ${escapeHtml(r.kind)}</li>`;
}

function buildHtml(bucketed: Record<DigestWindow, RenewalWithRefs[]>): string {
  const sections: string[] = [];
  for (const w of WINDOW_KEYS) {
    const rows = bucketed[w];
    if (rows.length === 0) continue;
    const heading = {
      overdue: 'Overdue',
      due: 'Due today',
      within_7: 'Due within 7 days',
      within_14: 'Due within 14 days',
      within_30: 'Due within 30 days',
      within_60: 'Due within 60 days',
    }[w];
    sections.push(
      `<h2 style="margin:24px 0 8px;font-size:16px;color:#111;">${heading} (${rows.length})</h2><ul style="margin:0;padding-left:20px;color:#111;">${rows.map(formatLine).join('')}</ul>`,
    );
  }
  return `<html><body style="font-family:Arial,sans-serif;background:#0b0b10;color:#111;margin:0;padding:24px;">
    <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#666;">2KO Systems · Ops</p>
      <h1 style="margin:0 0 8px;font-size:22px;color:#111;">Renewal reminders</h1>
      <p style="margin:0 0 16px;font-size:13px;color:#444;">Digest generated at ${new Date().toISOString()}. Internal use only.</p>
      ${sections.join('')}
    </div></body></html>`;
}

async function sendBrevoDigest(opts: {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  recipient: string;
  html: string;
  totalCount: number;
}): Promise<void> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': opts.apiKey,
    },
    body: JSON.stringify({
      sender: { email: opts.senderEmail, name: opts.senderName },
      to: [{ email: opts.recipient, name: '2KO Ops' }],
      subject: `Renewals digest — ${opts.totalCount} item${opts.totalCount === 1 ? '' : 's'} need attention`,
      htmlContent: opts.html,
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    // Read body for diagnostics but never echo the api key.
    const text = await res.text().catch(() => '');
    throw new Error(`Brevo send failed: ${res.status} ${text.slice(0, 200)}`);
  }
}

export async function runRenewalReminders(input: {
  dryRun: boolean;
}): Promise<ReminderRunReport> {
  const started = Date.now();
  const perWindow = emptyCounts();

  if (!isDbConfigured()) {
    return {
      status: 'skipped',
      perWindow,
      emailsSent: 0,
      durationMs: Date.now() - started,
      error: 'db_not_connected',
    };
  }

  try {
    const all = await listRenewals();

    // Bucket every renewal by its current window.
    const bucketed: Record<DigestWindow, RenewalWithRefs[]> = {
      overdue: [],
      due: [],
      within_7: [],
      within_14: [],
      within_30: [],
      within_60: [],
    };

    // Subset that actually needs reminding (state has not caught up).
    const toRemind: Record<DigestWindow, RenewalWithRefs[]> = {
      overdue: [],
      due: [],
      within_7: [],
      within_14: [],
      within_30: [],
      within_60: [],
    };

    for (const r of all) {
      if (r.archivedAt) continue;
      const window = computeRenewalWindow(r.nextDueAt);
      if (window === 'future') continue;
      bucketed[window].push(r);
      perWindow[window] += 1;
      const target = targetStateFor(window);
      const current = (r.reminderState as ReminderState) ?? 'none';
      if (needsReminder(current, target)) {
        toRemind[window].push(r);
      }
    }

    const totalToRemind = WINDOW_KEYS.reduce((sum, w) => sum + toRemind[w].length, 0);

    let emailsSent = 0;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || '2KO Systems';
    const recipient = process.env.BREVO_OPS_DIGEST_TO || senderEmail || '';

    const canSend = Boolean(brevoApiKey && senderEmail && recipient);

    if (totalToRemind > 0 && canSend && !input.dryRun) {
      const html = buildHtml(toRemind);
      await sendBrevoDigest({
        apiKey: brevoApiKey!,
        senderEmail: senderEmail!,
        senderName,
        recipient,
        html,
        totalCount: totalToRemind,
      });
      emailsSent = 1;

      // Only advance reminderState on successful send.
      for (const w of WINDOW_KEYS) {
        const target = targetStateFor(w);
        for (const r of toRemind[w]) {
          await markReminded(r.id, target);
        }
      }
    }

    await writeAudit({
      operatorSlug: 'cron',
      action: 'sync_finished',
      entityType: 'renewal_reminders',
      entityId: null,
      diff: {
        dryRun: input.dryRun,
        perWindow,
        toRemindCounts: {
          overdue: toRemind.overdue.length,
          due: toRemind.due.length,
          within_7: toRemind.within_7.length,
          within_14: toRemind.within_14.length,
          within_30: toRemind.within_30.length,
          within_60: toRemind.within_60.length,
        },
        emailsSent,
        brevoConfigured: canSend,
      },
    });

    return {
      status: 'ok',
      perWindow,
      emailsSent,
      durationMs: Date.now() - started,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 'failed',
      perWindow,
      emailsSent: 0,
      durationMs: Date.now() - started,
      error: message,
    };
  }
}
