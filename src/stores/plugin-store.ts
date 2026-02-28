import { create } from "zustand";
import { toast, type ExternalToast } from "sonner";

export type NotificationVariant = "error" | "warning" | "success" | "info";

export interface PluginNotification {
  message: string;
  variant: NotificationVariant;
}

interface PluginState {
  isMinimized: boolean;
  setNotification: (notification: PluginNotification) => void;
  setMinimized: (minimized: boolean) => void;
}

const DEFAULT_TOAST_OPTIONS: ExternalToast = {
  position:"top-right",
  closeButton:true
};
export const usePluginStore = create<PluginState>((set) => ({
  isMinimized: false,
  setNotification: ({ variant, message }) => {
    if (variant === "success") toast.success(message,DEFAULT_TOAST_OPTIONS);
    else if (variant === "error") toast.error(message,DEFAULT_TOAST_OPTIONS);
    else if (variant === "warning") toast.warning(message,DEFAULT_TOAST_OPTIONS);
    else toast.info(message,DEFAULT_TOAST_OPTIONS);
  },
  setMinimized: (isMinimized) => set({ isMinimized }),
}));
