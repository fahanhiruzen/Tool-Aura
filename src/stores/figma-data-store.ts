import { create } from "zustand";

/** User from Figma plugin (figma.currentUser). user.id is the userId used for API calls. */
export interface FigmaUser {
  id: string;
  name: string;
  photoUrl?: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  parentId: string | null;
  type: string;
  parentNames: string[];
  width: number;
  height: number;
  fontStyle: string | null;
  worstCaseNoLines: number | null;
}

export interface FigmaSizes {
  id: string;
  modes: { modeId: string; name: string }[];
  name: string;
  variableIds: string[];
}

/**
 * Payload sent from the plugin main thread (getFigmaData in main/code.ts).
 * Stored in Zustand when the UI receives it via postMessage.
 * user.id is the userId used for API calls (e.g. getStateCode).
 */
export interface FigmaDataPayload {
  pageId: string;
  nodeId: string | null;
  sizes: FigmaSizes;
  nodes: (FigmaNode | null)[];
  mode: string;
  user: FigmaUser | null;
  figmaToken: string | null;
  cddbToken: string | null;
  elementData: string;
  fileId: string | null;
  init: boolean;
}

/** Minimal shape to detect the plugin init message (has user + pageId/fileId). */
export type FigmaDataMessage = Pick<FigmaDataPayload, "user"> &
  Partial<FigmaDataPayload>;

interface FigmaDataState {
  data: FigmaDataPayload | null;
  setFigmaData: (data: FigmaDataPayload | null) => void;
  setCddbToken: (token: string | null) => void;
  setFigmaAccessToken: (token: string | null) => void;
  clearTokens: () => void;
}

export const useFigmaDataStore = create<FigmaDataState>((set) => ({
  data: null,
  setFigmaData: (data) => set({ data }),
  setCddbToken: (token:string|null) => set((state) => ({ data: { ...state.data, cddbToken: token } as FigmaDataPayload })),  
  setFigmaAccessToken: (token:string|null) => set((state) => ({ data: { ...state.data, figmaToken: token } as FigmaDataPayload })),  
  clearTokens: () => set((state) => ({ data: { ...state.data, figmaToken: null, cddbToken: null } as FigmaDataPayload })),  
}));
