import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/endpoints";
import {
  mockDocumentSummary,
  mockHealthCheck,
  mockReleaseStatus,
  mockSubdomainChart,
  mockUniqueIds,
} from "@/api/mocks";

const useMock = !import.meta.env.VITE_API_BASE;

export function useDocumentSummary() {
  return useQuery({
    queryKey: ["dashboard", "document-summary"],
    queryFn: () =>
      useMock ? Promise.resolve(mockDocumentSummary) : dashboardApi.getDocumentSummary(),
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["dashboard", "health-check"],
    queryFn: () =>
      useMock ? Promise.resolve(mockHealthCheck) : dashboardApi.getHealthCheck(),
  });
}

export function useReleaseStatus() {
  return useQuery({
    queryKey: ["dashboard", "release-status"],
    queryFn: () =>
      useMock ? Promise.resolve(mockReleaseStatus) : dashboardApi.getReleaseStatus(),
  });
}

export function useSubdomainChart() {
  return useQuery({
    queryKey: ["dashboard", "subdomain"],
    queryFn: () =>
      useMock ? Promise.resolve(mockSubdomainChart) : dashboardApi.getSubdomainChart(),
  });
}

export function useUniqueIds(search?: string) {
  return useQuery({
    queryKey: ["dashboard", "unique-ids", search],
    queryFn: () =>
      useMock
        ? Promise.resolve(mockUniqueIds)
        : dashboardApi.getUniqueIds({ search }),
  });
}
