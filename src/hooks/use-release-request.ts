import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { releaseRequestApi } from "@/api/release-request";
import { usePluginStore } from "@/stores/plugin-store";
import type {
  UserRole,
  DateRangeFilter,
  CreateReleasePayload,
} from "@/api/release-request";

export function useReleaseProcesses() {
  return useQuery({
    queryKey: ["release-processes"],
    queryFn: () => releaseRequestApi.listReleaseProcesses(),
  });
}

export function useCreateReleaseRequest() {
  return useMutation({
    mutationFn: releaseRequestApi.create,
  });
}

export function useReleaseRequestDetails(requestId: string | null) {
  return useQuery({
    queryKey: ["release-request", requestId],
    queryFn: () => releaseRequestApi.getDetails(requestId!),
    enabled: !!requestId,
  });
}

export function useReleaseRequestSteps(requestId: string | null) {
  return useQuery({
    queryKey: ["release-request-steps", requestId],
    queryFn: () => releaseRequestApi.getSteps(requestId!),
    enabled: !!requestId,
  });
}

export function useValidateReleaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      ignoredIds,
    }: {
      requestId: string;
      ignoredIds: string[];
    }) => releaseRequestApi.validate(requestId, ignoredIds),
    onSuccess: (_, { requestId }) => {
      qc.invalidateQueries({ queryKey: ["release-request", requestId] });
    },
  });
}

export function useAssignReviewers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      reviewerEmails,
    }: {
      requestId: string;
      reviewerEmails: string[];
    }) => releaseRequestApi.assignReviewers(requestId, reviewerEmails),
    onSuccess: (_, { requestId }) => {
      qc.invalidateQueries({ queryKey: ["release-request", requestId] });
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: { approve: boolean; reviewNotes: string };
    }) => releaseRequestApi.updateReview(requestId, data),
    onSuccess: (_, { requestId }) => {
      qc.invalidateQueries({ queryKey: ["release-request", requestId] });
      qc.invalidateQueries({ queryKey: ["release-requests"] });
    },
  });
}

export function useCreateRelease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: CreateReleasePayload;
    }) => releaseRequestApi.createRelease(requestId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["release-requests"] });
      usePluginStore.getState().setNotification({
        variant: "success",
        message: "Release created successfully.",
      });
    },
  });
}

export function useListReleaseRequests(params: {
  pageNumber: number;
  pageSize: number;
  currentDocumentKey: string;
  filter: {
    documentKey: string;
    iam: UserRole[];
    dateRange?: DateRangeFilter;
    status?: string;
  };
}) {
  return useQuery({
    queryKey: ["release-requests", params],
    queryFn: () => releaseRequestApi.list(params),
  });
}
