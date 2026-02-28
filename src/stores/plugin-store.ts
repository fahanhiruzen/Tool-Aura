import { create } from "zustand";

export type NotificationVariant = "error" | "warning" | "success" | "info";

export interface PluginNotification {
  message: string;
  variant: NotificationVariant;
}

interface PluginState {
  notification: PluginNotification | null;
  isMinimized: boolean;
  setNotification: (notification: PluginNotification | null) => void;
  setMinimized: (minimized: boolean) => void;
}

export const usePluginStore = create<PluginState>((set) => ({
  notification: null,
  isMinimized: false,
  setNotification: (notification) => set({ notification }),
  setMinimized: (isMinimized) => set({ isMinimized }),
}));
