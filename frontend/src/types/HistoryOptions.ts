export interface HistoryOptions {
  sortBy: 'timestamp' | 'verified';
  sortOrder: 'asc' | 'desc';
  filterVerified?: boolean | null; // null = show all, true = verified only, false = unverified only
}
