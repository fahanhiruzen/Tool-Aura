import { create } from "zustand";
import type { ICurrentUser } from "@/api/user";

interface CurrentCDDBUserState {
  currentUser: ICurrentUser | null;
  setCurrentUser: (user: ICurrentUser | null) => void;
  clearCurrentUser: () => void;
}

export const useCurrentCDDBUserStore = create<CurrentCDDBUserState>((set) => ({
  currentUser: null,
  setCurrentUser: (user: ICurrentUser | null) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null}),
}));
