import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userManagementApi } from "@/api/user-management";

export function useManagedUsers(params: {
  pageNumber: number;
  pageSize: number;
  role: string | null;
  search?: string;
}) {
  return useQuery({
    queryKey: ["managed-users", params],
    queryFn: () =>
      userManagementApi.getUsers(
        params.pageNumber,
        params.pageSize,
        params.role,
        params.search
      ),
  });
}

/** Flat list of all users – for dropdown selectors (large page, no filter). */
export function useAllUsers() {
  return useQuery({
    queryKey: ["all-users-dropdown"],
    queryFn: () => userManagementApi.getUsers(0, 500, null),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.content,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => userManagementApi.getRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      roleIds,
    }: {
      username: string;
      roleIds: string[];
    }) => userManagementApi.updateUserRoles(username, roleIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managed-users"] }),
  });
}

export function useUserRequests(params: {
  pageNumber: number;
  pageSize: number;
  status: string | null;
  search?: string;
}) {
  return useQuery({
    queryKey: ["user-requests", params],
    queryFn: () =>
      userManagementApi.getUserRequests(
        params.pageNumber,
        params.pageSize,
        params.status,
        params.search
      ),
  });
}

export function useUpdateUserRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: number;
      data: { status: string; message: string };
    }) => userManagementApi.updateUserRequest(requestId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-requests"] }),
  });
}
