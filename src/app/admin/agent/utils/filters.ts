import type { LocalAgentJob, LocalStatus } from './types';

export type SortField = 'createdAt' | 'leadScore' | 'temperature' | 'localStatus' | 'localFollowUpDate';
export type SortDir = 'asc' | 'desc';
export type FollowUpFilter = 'all' | 'overdue' | 'today' | 'upcoming' | 'none';

export interface FilterState {
  query: string;
  status: LocalStatus | '';
  temperature: string;
  minScore: number;
  followUpFilter: FollowUpFilter;
  sortField: SortField;
  sortDir: SortDir;
}

export const DEFAULT_FILTERS: FilterState = {
  query: '',
  status: '',
  temperature: '',
  minScore: 0,
  followUpFilter: 'all',
  sortField: 'createdAt',
  sortDir: 'desc',
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function applyFilters(items: LocalAgentJob[], filters: FilterState): LocalAgentJob[] {
  let result = items;

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter((item) =>
      [
        item.senderName,
        item.enquirySummary,
        item.enquiryType,
        item.recommendedOffer,
        item.localAdminNote,
        item.result?.context?.companyName,
        item.result?.context?.leadName,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }

  if (filters.status) {
    result = result.filter((item) => item.localStatus === filters.status);
  }

  if (filters.temperature) {
    result = result.filter((item) => item.temperature === filters.temperature);
  }

  if (filters.minScore > 0) {
    result = result.filter((item) => item.leadScore >= filters.minScore);
  }

  if (filters.followUpFilter !== 'all') {
    const today = todayStr();
    result = result.filter((item) => {
      if (filters.followUpFilter === 'none') return !item.localFollowUpDate;
      if (!item.localFollowUpDate) return false;
      if (filters.followUpFilter === 'overdue') return item.localFollowUpDate < today;
      if (filters.followUpFilter === 'today') return item.localFollowUpDate === today;
      if (filters.followUpFilter === 'upcoming') return item.localFollowUpDate > today;
      return true;
    });
  }

  const tempOrder: Record<string, number> = { hot: 2, warm: 1, cold: 0 };

  result = [...result].sort((a, b) => {
    let cmp = 0;
    switch (filters.sortField) {
      case 'createdAt':
        cmp = a.createdAt - b.createdAt;
        break;
      case 'leadScore':
        cmp = a.leadScore - b.leadScore;
        break;
      case 'temperature':
        cmp = (tempOrder[a.temperature] ?? 0) - (tempOrder[b.temperature] ?? 0);
        break;
      case 'localStatus':
        cmp = a.localStatus.localeCompare(b.localStatus);
        break;
      case 'localFollowUpDate': {
        const da = a.localFollowUpDate ?? '';
        const db = b.localFollowUpDate ?? '';
        cmp = da.localeCompare(db);
        break;
      }
    }
    return filters.sortDir === 'desc' ? -cmp : cmp;
  });

  return result;
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.query !== '' ||
    filters.status !== '' ||
    filters.temperature !== '' ||
    filters.minScore > 0 ||
    filters.followUpFilter !== 'all'
  );
}
