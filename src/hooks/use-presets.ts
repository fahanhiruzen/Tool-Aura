import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { presetApi } from "@/api/preset";
import { usePluginStore } from "@/stores/plugin-store";

export function usePresets(params: {
  pageNumber: number;
  pageSize: number;
  sort: "ASC" | "DESC";
  searchName?: string;
}) {
  return useQuery({
    queryKey: ["presets", params],
    queryFn: () => presetApi.fetchPresets(params),
    placeholderData: keepPreviousData,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => presetApi.fetchTeams(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => presetApi.fetchUsers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: presetApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["presets"] });
      usePluginStore.getState().setNotification({
        variant: "success",
        message: "User group preset created successfully.",
      });
    },
  });
}

export function useUpdatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name: string; members: number[] };
    }) => presetApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["presets"] });
      usePluginStore.getState().setNotification({
        variant: "success",
        message: "User group preset updated successfully.",
      });
    },
  });
}

export function useDeletePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: presetApi.delete,
    onSuccess: (_data, deletedId) => {
      qc.setQueriesData({ queryKey: ["presets"] }, (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.filter((p: any) => p.id !== deletedId),
        };
      });
      qc.invalidateQueries({ queryKey: ["presets"] });
      usePluginStore.getState().setNotification({
        variant: "success",
        message: "User group preset deleted successfully.",
      });
    },
  });
}
