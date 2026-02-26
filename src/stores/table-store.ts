import { create } from "zustand";

export interface TableFilter {
  id: string;
  label: string;
}

interface TableState {
  searchQuery: string;
  selectedIds: Set<string>;
  filters: TableFilter[];
  selectAll: boolean;
  setSearchQuery: (q: string) => void;
  setSelectAll: (value: boolean) => void;
  toggleSelection: (id: string) => void;
  setSelection: (ids: string[]) => void;
  addFilter: (filter: TableFilter) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
}

export const useTableStore = create<TableState>((set) => ({
  searchQuery: "",
  selectedIds: new Set(),
  filters: [],
  selectAll: false,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectAll: (value) =>
    set((state) => ({
      selectAll: value,
      selectedIds: value ? new Set(state.selectedIds) : new Set(),
    })),
  toggleSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),
  setSelection: (ids) => set({ selectedIds: new Set(ids) }),
  addFilter: (filter) =>
    set((state) => ({
      filters: state.filters.some((f) => f.id === filter.id)
        ? state.filters
        : [...state.filters, filter],
    })),
  removeFilter: (id) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.id !== id),
    })),
  clearFilters: () => set({ filters: [] }),
}));
