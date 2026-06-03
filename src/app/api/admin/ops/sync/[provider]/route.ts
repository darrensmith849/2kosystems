import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireOps, dbUnavailable } from '../../_helpers';
import { isDbConfigured } from '@/lib/db/client';
import { syncGithubRepos } from '@/lib/ops/github-service';
import { syncVercelProjects } from '@/lib/ops/vercel-service';
import { writeAudit } from '@/lib/ops/audit';

const SUPPORTED = new Set(['github', 'vercel', 'cloudflare', 'hetzner']);
const GITHUB_OWNER = 'darrensmith849';

export async function POST(_request: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const gate = await requireOps();
  if (gate instanceof NextResponse) return gate;
  if (!isDbConfigured()) return dbUnavailable();

  const { provider } = await ctx.params;
  if (!SUPPORTED.has(provider)) {
    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  }

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'sync_started',
    entityType: 'sync',
    entityId: provider,
  });

  let result: unknown;
  switch (provider) {
    case 'github':
      result = await syncGithubRepos({ owner: GITHUB_OWNER, operatorSlug: gate.operatorSlug, triggeredBy: 'manual' });
      break;
    case 'vercel':
      result = await syncVercelProjects({ operatorSlug: gate.operatorSlug, triggeredBy: 'manual' });
      break;
    case 'cloudflare':
    case 'hetzner':
      // Phase 1 placeholder: connect schemas later. For now return a clear
      // not-implemented response so the UI button shows a clean message.
      return NextResponse.json(
        { error: `Sync for ${provider} is scaffolded but not yet wired in MVP. Coming in Phase 1b.` },
        { status: 501 },
      );
  }

  await writeAudit({
    operatorSlug: gate.operatorSlug,
    action: 'sync_finished',
    entityType: 'sync',
    entityId: provider,
    diff: result as Record<string, unknown>,
  });

  return NextResponse.json(result);
}
