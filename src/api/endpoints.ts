import type {
  DocumentSummary,
  HealthCheck,
  ReleaseStatus,
  UniqueIdsResponse,
} from "./types";
import { api } from "./client";

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
