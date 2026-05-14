import 'server-only';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { runOrchestrator } from '@/lib/agent-core';
import { getBusinessProfile } from '@/lib/agent-profiles';
import type { EnquiryInput } from '@/lib/agent-core';

async function isAuthorised(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token ? verifyAdminSessionToken(token) : false;
}

const TEST_PAYLOAD: EnquiryInput = {
  businessKey: 'two_ko_systems',
  source: 'live_readiness_test',
  subject: 'Internal live readiness test',
  message:
    'We are testing the 2KO Systems internal agent analyser. Please classify this as a workflow automation enquiry and return a draft-only response. Do not send anything.',
};

export async function POST() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const mockMode = process.env.AGENT_MOCK_MODE === 'true';

  if (mockMode) {
    const profile = getBusinessProfile(TEST_PAYLOAD.businessKey);
    if (!profile) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 500 });
    }
    const output = await runOrchestrator(profile, TEST_PAYLOAD);
    return NextResponse.json({
      status: 'mock_mode_active',
      message: 'Mock mode is enabled. No live LLM call was made.',
      output,
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        status: 'misconfigured',
        error: 'ANTHROPIC_API_KEY is not set. No call was made.',
      },
      { status: 400 },
    );
  }

  const profile = getBusinessProfile(TEST_PAYLOAD.businessKey);
  if (!profile) {
    return NextResponse.json({ error: 'Business profile not found' }, { status: 500 });
  }

  try {
    const output = await runOrchestrator(profile, TEST_PAYLOAD);
    return NextResponse.json({
      status: 'live_test_passed',
      output,
      safetyCheck: {
        humanReviewRequired: true,
        autoSent: false,
        productionActionTaken: false,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    // Map provider errors to admin-friendly messages (no stack traces, no secrets)
    if (msg.includes('api_key') || msg.includes('401') || msg.includes('Authentication')) {
      return NextResponse.json(
        { status: 'error', error: 'The API key was rejected by the provider. Check ANTHROPIC_API_KEY in Vercel.' },
        { status: 502 },
      );
    }
    if (msg.includes('404') || msg.includes('model_not_found') || msg.includes('not found')) {
      return NextResponse.json(
        { status: 'error', error: 'The specified model was not found. Check AGENT_MODEL in Vercel.' },
        { status: 502 },
      );
    }
    if (msg.includes('429') || msg.includes('rate_limit') || msg.includes('rate limit')) {
      return NextResponse.json(
        { status: 'error', error: 'Rate limit reached. Wait a moment and try again.' },
        { status: 502 },
      );
    }
    if (msg.includes('timeout') || msg.includes('ETIMEDOUT') || msg.includes('ECONNRESET')) {
      return NextResponse.json(
        { status: 'error', error: 'The provider timed out. Try again or check your AGENT_MODEL setting.' },
        { status: 504 },
      );
    }
    if (msg.includes('5') && (msg.includes('500') || msg.includes('503') || msg.includes('502'))) {
      return NextResponse.json(
        { status: 'error', error: 'The AI provider is temporarily unavailable. Try again shortly.' },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { status: 'error', error: 'Live readiness test failed. Check your environment configuration and try again.' },
      { status: 500 },
    );
  }
}
