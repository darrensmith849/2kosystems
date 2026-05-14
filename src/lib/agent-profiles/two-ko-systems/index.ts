import type { BusinessProfile } from '../../agent-core/types';
import { buildTwoKoSystemPrompt, buildTwoKoUserPrompt } from './prompts';

export const twoKoSystemsProfile: BusinessProfile = {
  key: 'two_ko_systems',
  name: '2KO Systems',
  buildSystemPrompt: buildTwoKoSystemPrompt,
  buildUserPrompt: buildTwoKoUserPrompt,
};
