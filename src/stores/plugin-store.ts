import { create } from "zustand";

export interface InitLoadingState {
  loading: boolean;
  message: string | null;
}

export type NotificationVariant = "error" | "warning" | "success" | "info";

export interface PluginNotification {
  message: string;
  variant: NotificationVariant;
}

interface PluginState {
  initLoading: InitLoadingState;
  notification: PluginNotification | null;
  parentCacheData: string | null;
  isMinimized: boolean;
  /** True when current user's email is in the plugin allowlist. */
  allowedToUsePlugin: boolean;
  setInitLoading: (state: InitLoadingState) => void;
  setNotification: (notification: PluginNotification | null) => void;
  setParentCacheData: (data: string | null) => void;
  setMinimized: (minimized: boolean) => void;
  setAllowedToUsePlugin: (allowed: boolean) => void;
}

export const usePluginStore = create<PluginState>((set) => ({
  initLoading: { loading: false, message: null },
  notification: null,
  parentCacheData: null,
  isMinimized: false,
  allowedToUsePlugin: false,
  setInitLoading: (initLoading) => set({ initLoading }),
  setNotification: (notification) => set({ notification }),
  setParentCacheData: (parentCacheData) => set({ parentCacheData }),
  setMinimized: (isMinimized) => set({ isMinimized }),
  setAllowedToUsePlugin: (allowedToUsePlugin) => set({ allowedToUsePlugin }),
}));
