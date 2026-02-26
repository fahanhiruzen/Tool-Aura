import { create } from "zustand";
import { useCurrentUserStore } from "./current-user-store";

const FIGMA_TOKEN_KEY = "cddb_access_token";

export interface AuthState {
  token: string | null;
  userId: string | null;
  isValidated: boolean;
  setToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void;
  setValidated: (valid: boolean) => void;
  setAuth: (token: string | null, userId: string | null, validated?: boolean) => void;
  /** Clear only token and validated state; keep userId and all Figma data. */
  clearTokenOnly: () => void;
  /** Clear all auth state (token, userId, validated). */
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isValidated: false,
  setToken: (token) => set({ token }),
  setUserId: (userId) => set({ userId }),
  setValidated: (isValidated) => set({ isValidated }),
  setAuth: (token, userId, validated = false) =>
    set({ token, userId, isValidated: validated }),
  clearTokenOnly: () => {
    set({ token: null, isValidated: false })},
  clearAuth: () =>
    set({ token: null, userId: null, isValidated: false }),
}));

/**
 * Persist token to Figma plugin cache (clientStorage).
 * Call this from the UI via postMessage to the plugin main thread.
 */
export function persistTokenToFigma(token: string): void {
  try {
    const parent = window.parent;
    if (parent && parent !== window) {
      parent.postMessage(
        { pluginMessage: { data: { key: FIGMA_TOKEN_KEY, value: token } } },
        "*"
      );
    }
  } catch {
    // Not in Figma iframe
  }
}

/**
 * Remove token from Figma plugin cache (clientStorage).
 * Call this on sign out so the token is cleared from cache and Zustand.
 */
export function clearTokenFromFigma(): void {
  try {
    const parent = window.parent;
    if (parent && parent !== window) {
      parent.postMessage(
        { pluginMessage: { type: "removeStorage", data: { key: FIGMA_TOKEN_KEY } } },
        "*"
      );
    }
  } catch {
    // Not in Figma iframe
  }
}

/**
 * Sign out: remove token and current user from Zustand and clear token from Figma cache.
 * All other Figma-provided data (userId, figma data store, etc.) is left unchanged.
 */
export function signOut(): void {
  useAuthStore.getState().clearTokenOnly();
  clearTokenFromFigma();
  useCurrentUserStore.getState().clearCurrentUser();
}

export { FIGMA_TOKEN_KEY };
