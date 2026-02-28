import { create } from "zustand";

export type NavSection =
  | "START"
  | "PLUGIN"
  | "DATA"
  | "DESIGN"
  | "REVIEW & RELEASE"
  | "USER MANAGEMENT";

export interface NavItem {
  id: string;
  label: string;
  section: NavSection;
  href?: string;
  children?: { id: string; label: string }[];
}

interface NavigationState {
  activeId: string | null;
  releaseRequestId: string | null;
  quickSearch: string;
  expandedItemIds: Set<string>;
  isSidebarCollapsed: boolean;
  setActive: (id: string) => void;
  setActiveWithReleaseId: (id: string, releaseRequestId: string) => void;
  setQuickSearch: (value: string) => void;
  toggleItemExpanded: (id: string) => void;
  toggleSidebar: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeId: "dashboard",
  releaseRequestId: null,
  quickSearch: "",
  expandedItemIds: new Set(["widgets"]),
  isSidebarCollapsed: false,
  setActive: (id) => set({ activeId: id, releaseRequestId: null }),
  setActiveWithReleaseId: (id, releaseRequestId) => set({ activeId: id, releaseRequestId }),
  setQuickSearch: (value) => set({ quickSearch: value }),
  toggleItemExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedItemIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedItemIds: next };
    }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
