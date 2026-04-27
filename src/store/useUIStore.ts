import { create } from 'zustand';

export type ActiveView =
  | 'dashboard'
  | 'showcase'
  | 'pipeline'
  | 'portals'
  | 'processor'
  | 'card-builder';

interface UIState {
  activeView: ActiveView;
  selectedOpportunityId: string | null;
  isModalOpen: boolean;
  sidebarCollapsed: boolean;
  setActiveView: (view: ActiveView) => void;
  setSelectedOpportunityId: (id: string | null) => void;
  setModalOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'dashboard',
  selectedOpportunityId: null,
  isModalOpen: false,
  sidebarCollapsed: false,

  setActiveView: (activeView) => set({ activeView }),

  setSelectedOpportunityId: (selectedOpportunityId) =>
    set({ selectedOpportunityId }),

  setModalOpen: (isModalOpen) => set({ isModalOpen }),

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
