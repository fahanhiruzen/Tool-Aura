import { create } from "zustand";

export interface InitLoadingState {
  loading: boolean;
  message: string | null;
}

export interface PluginNotification {
  message: string;
  variant: "error" | "warning" | "info";
}

interface PluginState {
  initLoading: InitLoadingState;
  notification: PluginNotification | null;
  parentCacheData: string | null;
  setInitLoading: (state: InitLoadingState) => void;
  setNotification: (notification: PluginNotification | null) => void;
  setParentCacheData: (data: string | null) => void;
}

export const usePluginStore = create<PluginState>((set) => ({
  initLoading: { loading: false, message: null },
  notification: null,
  parentCacheData: null,
  setInitLoading: (initLoading) => set({ initLoading }),
  setNotification: (notification) => set({ notification }),
  setParentCacheData: (parentCacheData) => set({ parentCacheData }),
}));
