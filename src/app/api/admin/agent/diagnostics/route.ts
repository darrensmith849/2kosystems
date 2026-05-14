import 'server-only';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

async function isAuthorised(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token ? verifyAdminSessionToken(token) : false;
}

export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const adminUiPassword = !!process.env.AGENT_ADMIN_UI_PASSWORD;
  const adminApiKey = !!process.env.AGENT_ADMIN_API_KEY;
  const mockModeRaw = process.env.AGENT_MOCK_MODE;
  const mockMode = mockModeRaw === 'true';
  const anthropicApiKey = !!process.env.ANTHROPIC_API_KEY;
  const agentModel = process.env.AGENT_MODEL;
  const aiProvider = process.env.AI_PROVIDER;

  const runtimeMode = mockMode ? 'mock' : 'live';

  // Determine overall status
  let overallStatus: string;
  const coreConfigured = adminUiPassword && adminApiKey;
  if (!coreConfigured) {
    overallStatus = 'misconfigured';
  } else if (mockMode) {
    overallStatus = 'ready_for_mock_testing';
  } else if (!anthropicApiKey) {
    overallStatus = 'missing_anthropic_key';
  } else {
    overallStatus = 'ready_for_live_llm';
  }

  const nextSteps: string[] = [];
  if (!adminUiPassword) nextSteps.push('Set AGENT_ADMIN_UI_PASSWORD in Vercel environment variables.');
  if (!adminApiKey) nextSteps.push('Set AGENT_ADMIN_API_KEY in Vercel environment variables.');
  if (mockMode) {
    nextSteps.push('Mock mode is enabled. You can safely test the console without live LLM calls.');
  } else if (!anthropicApiKey) {
    nextSteps.push('Set ANTHROPIC_API_KEY in Vercel to enable live LLM mode, or set AGENT_MOCK_MODE=true to use mock mode.');
  } else {
    nextSteps.push('Live LLM mode is configured. Use the Diagnostics tab to run a live readiness test before using in production.');
  }

  return NextResponse.json({
    runtimeMode,
    overallStatus,
    checks: {
      adminUiPassword: {
        configured: adminUiPassword,
        required: true,
        safeLabel: adminUiPassword ? 'configured' : 'not set',
      },
      adminApiKey: {
        configured: adminApiKey,
        required: true,
        safeLabel: adminApiKey ? 'configured' : 'not set',
      },
      mockMode: {
        configured: mockModeRaw !== undefined,
        valueLabel: mockMode ? 'enabled' : 'disabled (live mode)',
      },
      anthropicApiKey: {
        configured: anthropicApiKey,
        required: !mockMode,
        safeLabel: anthropicApiKey
          ? 'configured'
          : mockMode
          ? 'not needed in mock mode'
          : 'not set — required for live mode',
      },
      agentModel: {
        configured: !!agentModel,
        safeLabel: agentModel ? `set to ${agentModel}` : 'defaulting to claude-sonnet-4-6',
      },
      aiProvider: {
        configured: !!aiProvider,
        safeLabel: aiProvider ? `set to ${aiProvider}` : 'defaulting to anthropic',
      },
    },
    nextSteps,
  });
}
