import { create } from "zustand";
import type { ICurrentUser } from "@/api/user";

interface CurrentUserState {
  currentUser: ICurrentUser | null;
  userRoles: string[];
  setCurrentUser: (user: ICurrentUser | null) => void;
  setUserRoles: (roles: string[]) => void;
  /** Clear current user and roles (e.g. on sign out). */
  clearCurrentUser: () => void;
}

export const useCurrentUserStore = create<CurrentUserState>((set) => ({
  currentUser: null,
  userRoles: [],
  setCurrentUser: (currentUser) => set({ currentUser }),
  setUserRoles: (userRoles) => set({ userRoles }),
  clearCurrentUser: () => set({ currentUser: null, userRoles: [] }),
}));
