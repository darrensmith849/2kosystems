import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getCronSecret } from '@/lib/runtime';
import { isDbConfigured } from '@/lib/db/client';
import { syncGithubRepos } from '@/lib/ops/github-service';

const PROVIDER = 'github';
const GITHUB_OWNER = 'darrensmith849';

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
        message: 'Cron route reachable; sync activates once DATABASE_URL is set.',
      },
      { status: 503 },
    );
  }

  const result = await syncGithubRepos({
    owner: GITHUB_OWNER,
    operatorSlug: 'cron',
    triggeredBy: 'cron',
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'db_not_connected',
        message: 'Cron route reachable; sync activates once DATABASE_URL is set.',
        info: {
          provider: PROVIDER,
          owner: GITHUB_OWNER,
          methods: ['GET', 'POST'],
          note: 'Vercel Cron triggers GET; both verbs run the same sync.',
        },
      },
      { status: 503 },
    );
  }
  return handle(request);
}
