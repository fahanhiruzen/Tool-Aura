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
  quickSearch: string;
  expandedItemIds: Set<string>;
  setActive: (id: string) => void;
  setQuickSearch: (value: string) => void;
  toggleItemExpanded: (id: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeId: "dashboard",
  quickSearch: "",
  expandedItemIds: new Set(["widgets"]),
  setActive: (id) => set({ activeId: id }),
  setQuickSearch: (value) => set({ quickSearch: value }),
  toggleItemExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedItemIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedItemIds: next };
    }),
}));
