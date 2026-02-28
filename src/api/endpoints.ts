import type {
  CddbFigmaDocument,
  DocumentSummary,
  FigmaFileData,
  GridHistoryResponse,
  HealthCheck,
  ReleaseStatus,
  TextVariable,
  UniqueIdsResponse,
} from "./types";
import { api, apiForm } from "./client";

const FIGMA_BASE = "https://api.figma.com/v1";

export const pluginSetupApi = {
  getCddbDocument: (fileId: string) =>
    api<CddbFigmaDocument>(`/v1/figma-document/${fileId}`),

  getFigmaFile: async (fileId: string, figmaToken: string): Promise<FigmaFileData> => {
    const res = await fetch(`${FIGMA_BASE}/files/${fileId}?branch_data=true`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${figmaToken}`,
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text);
    }
    return res.json() as Promise<FigmaFileData>;
  },
};

export const gridsApi = {
  getGridHistory: (fileType: string) =>
    api<GridHistoryResponse>(`/v1/grids/history?fileType=${fileType}`),

  getDownloadLink: (fileType: string) =>
    api<{ downloadLink: string }>(`/v1/grids/downloadLink?fileType=${fileType}`),

  uploadGrid: (fileType: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiForm<void>(`/v1/grids/xml?fileType=${fileType}`, formData);
  },
};

export interface UpdateTextVariablePayload {
  type: string;
  groupName: string;
  description: string;
  name: string;
  comment: string | null;
  configuration: string | null;
  commentsOnTextsAndDash: string | null;
  gen20xIf1Star35: string | null;
  gen20xIf1Star3mopf: string | null;
}

export const textVariableApi = {
  search: (body: Record<string, unknown> = {}) =>
    api<TextVariable[]>("/v1/text-variable/search", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getTypes: () =>
    api<{ name: string }[]>("/v1/text-variable/type"),

  update: (id: number, payload: UpdateTextVariablePayload) =>
    api<TextVariable>(`/v1/text-variable?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const dashboardApi = {
  getDocumentSummary: () =>
    api<DocumentSummary>("/dashboard/document-summary"),
  getHealthCheck: () => api<HealthCheck>("/dashboard/health-check"),
  getReleaseStatus: () => api<ReleaseStatus>("/dashboard/release-status"),
  getSubdomainChart: () =>
    api<ReleaseStatus>("/dashboard/subdomain"), // same shape
  getUniqueIds: (params?: { search?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return api<UniqueIdsResponse>(`/dashboard/unique-ids${qs ? `?${qs}` : ""}`);
  },
};
