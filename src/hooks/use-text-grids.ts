import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gridsApi, textVariableApi } from "@/api/endpoints";
import type { UpdateTextVariablePayload } from "@/api/endpoints";
import { usePluginStore } from "@/stores/plugin-store";

export function useGridHistory(fileType: string) {
  return useQuery({
    queryKey: ["grids", "history", fileType],
    queryFn: () => gridsApi.getGridHistory(fileType),
  });
}

export function useDownloadGrid() {
  return useMutation({
    mutationFn: async (fileType: string) => {
      const { downloadLink } = await gridsApi.getDownloadLink(fileType);
      const res = await fetch(downloadLink, { headers: { Accept: "*/*" } });
      if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`);
      return res.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Grids.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      usePluginStore.getState().setNotification({
        variant: "success",
        message: "Grids XML file downloaded successfully.",
      });
    },
    onError: (error: Error) => {
      usePluginStore.getState().setNotification({
        variant: "error",
        message: `Failed to download XML file: ${error.message}`,
      });
    },
  });
}

export function useUploadGrid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fileType, file }: { fileType: string; file: File }) =>
      gridsApi.uploadGrid(fileType, file),
    onSuccess: (_, { fileType }) => {
      qc.invalidateQueries({ queryKey: ["grids", "history", fileType] });
      usePluginStore.getState().setNotification({
        variant: "success",
        message: "Grid uploaded successfully.",
      });
    },
  });
}

export function useTextVariables() {
  return useQuery({
    queryKey: ["text-variables"],
    queryFn: () => textVariableApi.search({}),
  });
}

export function useTextVariableTypes() {
  return useQuery({
    queryKey: ["text-variable-types"],
    queryFn: () => textVariableApi.getTypes(),
    staleTime: Infinity,
  });
}

export function useUpdateTextVariable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTextVariablePayload }) =>
      textVariableApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["text-variables"] });
      usePluginStore.getState().setNotification({
        variant: "success",
        message: "Text variable updated successfully.",
      });
    },
  });
}
