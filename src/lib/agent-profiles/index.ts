import 'server-only';
import type { BusinessProfile } from '../agent-core/types';
import { twoKoSystemsProfile } from './two-ko-systems';

// Registry of all business profiles.
// Phase 2+: add additional profiles here as new client deployments are onboarded.
// e.g. sa_private_schools, six_sigma_sa, vemia
const profiles: Record<string, BusinessProfile> = {
  two_ko_systems: twoKoSystemsProfile,
};

export function getBusinessProfile(key: string): BusinessProfile | null {
  return profiles[key] ?? null;
}
