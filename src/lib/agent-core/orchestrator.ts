import 'server-only';
import type { AgentOutput, EnquiryInput, BusinessProfile, RawLLMOutput } from './types';
import { callLLM, getProviderConfig } from './provider';
import { enforceSafetyFields, buildSafetyAudit } from './safety';
import { generateMockOutput } from './mock';

// Attempts to extract a JSON object from an LLM response.
// LLMs sometimes wrap JSON in markdown code fences — this strips them safely.
function safeParseJSON(raw: string): RawLLMOutput | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1] : raw;

  try {
    const parsed = JSON.parse(jsonStr.trim());
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as RawLLMOutput;
  } catch {
    return null;
  }
}

export async function runOrchestrator(
  profile: BusinessProfile,
  input: EnquiryInput
): Promise<AgentOutput> {
  const config = getProviderConfig();

  // Mock mode — no LLM call, deterministic output
  if (config.mockMode) {
    return generateMockOutput(input);
  }

  let rawOutput: RawLLMOutput | null = null;
  let llmError: string | null = null;

  try {
    const systemPrompt = profile.buildSystemPrompt(input);
    const userPrompt = profile.buildUserPrompt(input);
    const rawText = await callLLM(systemPrompt, userPrompt);
    rawOutput = safeParseJSON(rawText);

    if (!rawOutput) {
      llmError = 'LLM returned output that could not be parsed as valid JSON.';
    }
  } catch (err) {
    llmError = err instanceof Error ? err.message : 'Unknown LLM provider error.';
  }

  if (llmError || !rawOutput) {
    return enforceSafetyFields({}, input, llmError ?? 'Unknown error');
  }

  // Safety fields are always written here — the LLM-provided values are never used for these
  return {
    route: rawOutput.route,
    classification: rawOutput.classification,
    context: rawOutput.context,
    suggestedReply: rawOutput.suggestedReply,
    internalNotes: rawOutput.internalNotes,
    followUp: rawOutput.followUp,
    safety: buildSafetyAudit(
      `Analysed enquiry from ${input.senderName ?? 'unknown sender'} via source "${input.source}". ` +
        `Routed as "${rawOutput.route?.enquiryType ?? 'unknown'}" with lead score ` +
        `${rawOutput.classification?.leadScore ?? 0}/100. ` +
        `Generated a "${rawOutput.suggestedReply?.draftType ?? 'unknown'}" draft reply. ` +
        `No external actions were taken.`
    ),
  };
}
