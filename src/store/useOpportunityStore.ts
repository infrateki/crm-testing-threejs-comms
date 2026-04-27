import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Opportunity, OpportunityStatus, Tier, Score } from '@/types/opportunity';
import type { Contact } from '@/types/contact';
import type { Note } from '@/types/note';
import { DEMO_OPPORTUNITIES, DEMO_CONTACTS, DEMO_NOTES } from '@/views/_fixtures';

export interface OpportunityFilters {
  status: OpportunityStatus[];
  tier: Tier[];
  owner: string[];
  portal: string[];
}

export type SortBy = 'deadline' | 'value' | 'posted_date' | 'updated_at' | 'title';
export type SortOrder = 'asc' | 'desc';

const DEFAULT_FILTERS: OpportunityFilters = { status: [], tier: [], owner: [], portal: [] };

const uid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const nowISO = (): string => new Date().toISOString();

export interface NewOpportunityInput {
  title: string;
  agency: string;
  status?: OpportunityStatus;
  tier?: Tier;
  score?: Score;
  owner?: string;
  value?: number | null;
  deadline?: string | null;
  description?: string | null;
  notes?: string | null;
  tags?: string[];
  naics_code?: string | null;
  set_aside?: string | null;
  portal_id?: string | null;
}

export interface NewContactInput {
  name: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  role_tag?: string;
  agency?: string | null;
  notes?: string | null;
  opportunity_ids?: string[];
}

interface OpportunityState {
  // Data
  opportunities: Opportunity[];
  contacts: Contact[];
  notes: Note[];

  // UI / filters
  selectedId: string | null;
  filters: OpportunityFilters;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;

  // Selectors
  getOpportunity: (id: string) => Opportunity | undefined;
  getContactsForOpportunity: (oppId: string) => Contact[];
  getNotesForOpportunity: (oppId: string) => Note[];
  getOpportunitiesForContact: (contactId: string) => Opportunity[];

  // Filter setters
  setSelectedId: (id: string | null) => void;
  setFilters: (filters: Partial<OpportunityFilters>) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  resetFilters: () => void;

  // Opportunity CRUD
  setOpportunities: (ops: Opportunity[]) => void;
  createOpportunity: (input: NewOpportunityInput) => Opportunity;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  bulkDeleteOpportunities: (ids: string[]) => void;
  bulkUpdateStatus: (ids: string[], status: OpportunityStatus) => void;

  // Contact CRUD
  createContact: (input: NewContactInput) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  linkContactToOpportunity: (contactId: string, oppId: string) => void;
  unlinkContactFromOpportunity: (contactId: string, oppId: string) => void;

  // Notes CRUD
  addNote: (oppId: string, author: string, text: string) => Note;
  deleteNote: (id: string) => void;

  // Settings
  resetToDefaults: () => void;
  importData: (data: { opportunities: Opportunity[]; contacts: Contact[]; notes: Note[] }) => void;
  exportData: () => { opportunities: Opportunity[]; contacts: Contact[]; notes: Note[] };
}

const initialData = {
  opportunities: DEMO_OPPORTUNITIES,
  contacts: DEMO_CONTACTS,
  notes: DEMO_NOTES,
};

export const useOpportunityStore = create<OpportunityState>()(
  persist(
    (set, get) => ({
      // Data
      opportunities: initialData.opportunities,
      contacts: initialData.contacts,
      notes: initialData.notes,

      // UI / filters
      selectedId: null,
      filters: DEFAULT_FILTERS,
      searchQuery: '',
      sortBy: 'deadline',
      sortOrder: 'asc',

      // Selectors
      getOpportunity: (id) => get().opportunities.find((o) => o.id === id),
      getContactsForOpportunity: (oppId) =>
        get().contacts.filter((c) => c.opportunity_ids.includes(oppId)),
      getNotesForOpportunity: (oppId) =>
        get()
          .notes.filter((n) => n.opportunity_id === oppId)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      getOpportunitiesForContact: (contactId) => {
        const contact = get().contacts.find((c) => c.id === contactId);
        if (!contact) return [];
        return get().opportunities.filter((o) => contact.opportunity_ids.includes(o.id));
      },

      // Filter setters
      setSelectedId: (selectedId) => set({ selectedId }),
      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      resetFilters: () => set({ filters: DEFAULT_FILTERS, searchQuery: '' }),

      // Opportunity CRUD
      setOpportunities: (ops) => set({ opportunities: ops }),

      createOpportunity: (input) => {
        const ts = nowISO();
        const opp: Opportunity = {
          id: uid(),
          title: input.title,
          agency: input.agency,
          portal_id: input.portal_id ?? null,
          status: input.status ?? 'radar',
          tier: input.tier ?? 2,
          score: input.score ?? 'medium',
          owner: input.owner ?? 'sergio',
          value: input.value ?? null,
          deadline: input.deadline ?? null,
          posted_date: ts,
          due_date: input.deadline ?? null,
          description: input.description ?? null,
          notes: input.notes ?? null,
          tags: input.tags ?? [],
          naics_code: input.naics_code ?? null,
          set_aside: input.set_aside ?? null,
          ghl_contact_id: null,
          created_at: ts,
          updated_at: ts,
        };
        set((s) => ({ opportunities: [opp, ...s.opportunities] }));
        return opp;
      },

      updateOpportunity: (id, updates) =>
        set((s) => ({
          opportunities: s.opportunities.map((o) =>
            o.id === id ? { ...o, ...updates, updated_at: nowISO() } : o,
          ),
        })),

      deleteOpportunity: (id) =>
        set((s) => ({
          opportunities: s.opportunities.filter((o) => o.id !== id),
          notes: s.notes.filter((n) => n.opportunity_id !== id),
          contacts: s.contacts.map((c) => ({
            ...c,
            opportunity_ids: c.opportunity_ids.filter((x) => x !== id),
          })),
        })),

      bulkDeleteOpportunities: (ids) => {
        const set_ids = new Set(ids);
        set((s) => ({
          opportunities: s.opportunities.filter((o) => !set_ids.has(o.id)),
          notes: s.notes.filter((n) => !set_ids.has(n.opportunity_id)),
          contacts: s.contacts.map((c) => ({
            ...c,
            opportunity_ids: c.opportunity_ids.filter((x) => !set_ids.has(x)),
          })),
        }));
      },

      bulkUpdateStatus: (ids, status) => {
        const set_ids = new Set(ids);
        const ts = nowISO();
        set((s) => ({
          opportunities: s.opportunities.map((o) =>
            set_ids.has(o.id) ? { ...o, status, updated_at: ts } : o,
          ),
        }));
      },

      // Contact CRUD
      createContact: (input) => {
        const contact: Contact = {
          id: uid(),
          opportunity_id: input.opportunity_ids?.[0] ?? '',
          opportunity_ids: input.opportunity_ids ?? [],
          name: input.name,
          title: input.title ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          role_tag: input.role_tag ?? 'general',
          agency: input.agency ?? null,
          ghl_contact_id: null,
          notes: input.notes ?? null,
          created_at: nowISO(),
        };
        set((s) => ({ contacts: [contact, ...s.contacts] }));
        return contact;
      },

      updateContact: (id, updates) =>
        set((s) => ({
          contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      linkContactToOpportunity: (contactId, oppId) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === contactId && !c.opportunity_ids.includes(oppId)
              ? { ...c, opportunity_ids: [...c.opportunity_ids, oppId] }
              : c,
          ),
        })),

      unlinkContactFromOpportunity: (contactId, oppId) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === contactId
              ? { ...c, opportunity_ids: c.opportunity_ids.filter((x) => x !== oppId) }
              : c,
          ),
        })),

      // Notes CRUD
      addNote: (oppId, author, text) => {
        const note: Note = {
          id: uid(),
          opportunity_id: oppId,
          author,
          text,
          created_at: nowISO(),
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },

      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // Settings
      resetToDefaults: () =>
        set({
          opportunities: initialData.opportunities,
          contacts: initialData.contacts,
          notes: initialData.notes,
          filters: DEFAULT_FILTERS,
          searchQuery: '',
          selectedId: null,
        }),

      importData: (data) =>
        set({
          opportunities: data.opportunities,
          contacts: data.contacts,
          notes: data.notes,
        }),

      exportData: () => ({
        opportunities: get().opportunities,
        contacts: get().contacts,
        notes: get().notes,
      }),
    }),
    {
      name: 'bimsearch-opportunities',
      version: 1,
      partialize: (state) => ({
        opportunities: state.opportunities,
        contacts: state.contacts,
        notes: state.notes,
      }),
    },
  ),
);
