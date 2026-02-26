import { api } from "./client";

export interface IPresetUser {
  userId: number;
  userEmail: string;
}

export interface IPreset {
  id: string;
  name: string;
  domainId: string;
  members: IPresetUser[];
}

export interface IPresetListResponse {
  totalElements: number;
  totalPages: number;
  content: IPreset[];
  number: number;
  last: boolean;
}

export interface ITeam {
  id: string;
  name: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
}

export const presetApi = {
  fetchPresets: (params: {
    pageNumber: number;
    pageSize: number;
    sort: "ASC" | "DESC";
    searchName?: string;
    searchUsername?: string;
    searchEmail?: string;
  }) => {
    const qs = new URLSearchParams({
      pageNumber: String(params.pageNumber),
      pageSize: String(params.pageSize),
      sort: params.sort,
      searchName: params.searchName ?? "",
      searchUsername: params.searchUsername ?? "",
      searchEmail: params.searchEmail ?? "",
    });
    return api<IPresetListResponse>(`/v1/release-preset/search?${qs}`);
  },

  getById: (id: string) => api<IPreset>(`/v1/release-preset/${id}`),

  create: (payload: { name: string; domainId: string; members: number[] }) =>
    api<IPreset>("/v1/release-preset", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: { name: string; members: number[] }) =>
    api<IPreset>(`/v1/release-preset/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    api<void>(`/v1/release-preset/${id}`, { method: "DELETE" }),

  fetchTeams: () => api<ITeam[]>("/v1/teams"),

  fetchUsers: () => api<IUser[]>("/v1/users"),
};
