import { create } from 'zustand';
import type { Opportunity, OpportunityStatus, Tier } from '@/types/opportunity';

export interface OpportunityFilters {
  status: OpportunityStatus[];
  tier: Tier[];
  owner: string[];
  portal: string[];
}

export type SortBy = 'deadline' | 'value' | 'posted_date' | 'updated_at' | 'title';
export type SortOrder = 'asc' | 'desc';

const DEFAULT_FILTERS: OpportunityFilters = { status: [], tier: [], owner: [], portal: [] };

interface OpportunityState {
  opportunities: Map<string, Opportunity>;
  selectedId: string | null;
  filters: OpportunityFilters;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  setOpportunities: (ops: Opportunity[]) => void;
  setSelectedId: (id: string | null) => void;
  setFilters: (filters: Partial<OpportunityFilters>) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  resetFilters: () => void;
}

export const useOpportunityStore = create<OpportunityState>((set) => ({
  opportunities: new Map(),
  selectedId: null,
  filters: DEFAULT_FILTERS,
  searchQuery: '',
  sortBy: 'deadline',
  sortOrder: 'asc',

  setOpportunities: (ops) =>
    set({ opportunities: new Map(ops.map((o) => [o.id, o])) }),

  setSelectedId: (selectedId) => set({ selectedId }),

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSortOrder: (sortOrder) => set({ sortOrder }),

  updateOpportunity: (id, updates) =>
    set((s) => {
      const existing = s.opportunities.get(id);
      if (!existing) return s;
      const next = new Map(s.opportunities);
      next.set(id, { ...existing, ...updates });
      return { opportunities: next };
    }),

  resetFilters: () =>
    set({ filters: DEFAULT_FILTERS, searchQuery: '' }),
}));
