import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

export interface ProviderConfig {
  provider: 'anthropic' | 'mock';
  model: string;
  mockMode: boolean;
}

export function getProviderConfig(): ProviderConfig {
  const mockMode = process.env.AGENT_MOCK_MODE === 'true';
  const provider = (process.env.AI_PROVIDER ?? 'anthropic') as 'anthropic';
  const model = process.env.AGENT_MODEL ?? 'claude-sonnet-4-6';

  return {
    provider: mockMode ? 'mock' : provider,
    model,
    mockMode,
  };
}

// Calls the configured LLM provider and returns the raw text response.
// Do not call this directly in mock mode — the orchestrator short-circuits before reaching here.
export async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const config = getProviderConfig();

  if (config.provider === 'anthropic') {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected non-text response from LLM provider');
    }
    return content.text;
  }

  throw new Error(`Unsupported AI provider: ${config.provider}`);
}
