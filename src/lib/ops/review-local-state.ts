// Types + constants shared between the server page and the client component
// for the local-only review workflow on /admin/ops/review.
//
// IMPORTANT: this file is pure types/constants — NO 'server-only' marker, NO
// side-effects, safe to import from both server and client code. All review
// state lives in the browser's localStorage and never reaches the network
// until Hetzner Postgres is connected.

export type ReviewStatus =
  | 'none'
  | 'accepted'
  | 'discussion'
  | 'blocked'
  | 'rejected'
  | 'resolved_externally';

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  none: 'Unreviewed',
  accepted: 'Accepted',
  discussion: 'Discussion',
  blocked: 'Blocked',
  rejected: 'Rejected',
  resolved_externally: 'Resolved externally',
};

export const REVIEW_STATUS_TONE: Record<
  ReviewStatus,
  'neutral' | 'green' | 'amber' | 'rose' | 'blue'
> = {
  none: 'neutral',
  accepted: 'green',
  discussion: 'amber',
  blocked: 'rose',
  rejected: 'rose',
  resolved_externally: 'blue',
};

export type LocalReviewEntry = {
  status: ReviewStatus;
  note: string;
  updatedAt: string;
};

// Keyed by SnapshotDecision.id.
export type LocalReviewState = Record<string, LocalReviewEntry>;

export const LOCAL_REVIEW_KEY = '2ko_ops_review_state_v1';
