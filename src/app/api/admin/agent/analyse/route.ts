import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { runOrchestrator } from '@/lib/agent-core';
import { getBusinessProfile } from '@/lib/agent-profiles';
import type { EnquiryInput } from '@/lib/agent-core';

// Server-side proxy — checks admin session cookie, then calls the agent.
// AGENT_ADMIN_API_KEY is never sent to or seen by the browser.
async function isAuthorised(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token ? verifyAdminSessionToken(token) : false;
}

function normaliseInput(body: unknown): EnquiryInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.message !== 'string' || !b.message.trim()) return null;

  return {
    businessKey: 'two_ko_systems',
    source:
      typeof b.source === 'string' && b.source.trim() ? b.source.trim() : 'admin_ui',
    subject: typeof b.subject === 'string' ? b.subject.trim() : undefined,
    message: b.message.trim(),
    senderName: typeof b.senderName === 'string' ? b.senderName.trim() : undefined,
    senderEmail: typeof b.senderEmail === 'string' ? b.senderEmail.trim() : undefined,
    senderPhone: typeof b.senderPhone === 'string' ? b.senderPhone.trim() : undefined,
    metadata: {},
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorised())) {
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
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const profile = getBusinessProfile(input.businessKey);
  if (!profile) {
    return NextResponse.json({ error: 'Business profile not found' }, { status: 400 });
  }

  // Phase 2: persist enquiry and result to database here
  const output = await runOrchestrator(profile, input);
  return NextResponse.json(output);
}
