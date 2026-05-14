import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { runOrchestrator } from '@/lib/agent-core';
import { getBusinessProfile } from '@/lib/agent-profiles';
import type { EnquiryInput } from '@/lib/agent-core';

// Admin authentication via secret header.
// The key is compared directly — do not log it.
// Phase 2: replace with full session-based admin auth when the admin UI is built.
function isAuthorisedAdmin(request: NextRequest): boolean {
  const provided = request.headers.get('x-2ko-admin-agent-key');
  const expected = process.env.AGENT_ADMIN_API_KEY;
  if (!expected || !provided) return false;
  return provided === expected;
}

function normaliseInput(body: unknown): EnquiryInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;

  if (typeof b.businessKey !== 'string' || !b.businessKey.trim()) return null;
  if (typeof b.source !== 'string' || !b.source.trim()) return null;
  if (typeof b.message !== 'string' || !b.message.trim()) return null;

  return {
    businessKey: b.businessKey.trim(),
    source: b.source.trim(),
    sourceUrl: typeof b.sourceUrl === 'string' ? b.sourceUrl.trim() : undefined,
    sourcePageType: typeof b.sourcePageType === 'string' ? b.sourcePageType.trim() : undefined,
    subject: typeof b.subject === 'string' ? b.subject.trim() : undefined,
    message: b.message.trim(),
    senderName: typeof b.senderName === 'string' ? b.senderName.trim() : undefined,
    senderEmail: typeof b.senderEmail === 'string' ? b.senderEmail.trim() : undefined,
    senderPhone: typeof b.senderPhone === 'string' ? b.senderPhone.trim() : undefined,
    metadata:
      b.metadata && typeof b.metadata === 'object' && !Array.isArray(b.metadata)
        ? (b.metadata as Record<string, unknown>)
        : {},
  };
}

export async function POST(request: NextRequest) {
  if (!isAuthorisedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const input = normaliseInput(body);
  if (!input) {
    return NextResponse.json(
      { error: 'Missing required fields: businessKey, source, message' },
      { status: 400 }
    );
  }

  const profile = getBusinessProfile(input.businessKey);
  if (!profile) {
    return NextResponse.json(
      { error: `Unknown businessKey: "${input.businessKey}". Registered profiles: two_ko_systems` },
      { status: 400 }
    );
  }

  // Phase 2: persist incoming enquiry to database here before analysis

  const output = await runOrchestrator(profile, input);

  // Phase 2: persist agent output to database here (link to enquiry record)

  return NextResponse.json(output);
}
