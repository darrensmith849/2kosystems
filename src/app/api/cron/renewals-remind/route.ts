import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getCronSecret } from '@/lib/runtime';
import { isDbConfigured } from '@/lib/db/client';
import { runRenewalReminders } from '@/lib/ops/renewals-reminders';

// Daily renewals digest cron.
// Vercel Cron calls this via GET at 07:00 SAST (see vercel.json).
// Both GET and POST are accepted so a future Hetzner systemd timer or a
// manual `curl -X POST` for an ops-triggered run-through works without any
// platform-specific glue.

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function checkAuth(request: NextRequest): boolean {
  const expected = getCronSecret();
  if (!expected) return false;
  const provided = request.headers.get('x-cron-secret');
  if (!provided) return false;
  return provided === expected;
}

async function handle(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'db_not_connected',
        message: 'Cron route reachable; reminders activate once DATABASE_URL is set.',
      },
      { status: 503 },
    );
  }

  const report = await runRenewalReminders({ dryRun: false });
  const httpStatus = report.status === 'failed' ? 500 : 200;
  return NextResponse.json({ ok: report.status === 'ok', ...report }, { status: httpStatus });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
