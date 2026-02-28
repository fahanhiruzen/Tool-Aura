import { useQuery } from "@tanstack/react-query";
import { pluginSetupApi } from "@/api/endpoints";
import { useFigmaDataStore } from "@/stores/figma-data-store";

export function usePluginSetup() {
  const fileId = useFigmaDataStore((s) => s.data?.fileId ?? null);
  const cddbToken = useFigmaDataStore((s) => s.data?.cddbToken ?? null);
  const figmaToken = useFigmaDataStore((s) => s.data?.figmaToken ?? null);

  const enabled = Boolean(fileId && cddbToken && figmaToken);

  const cddbQuery = useQuery({
    queryKey: ["plugin-setup", "cddb-document", fileId],
    queryFn: () => pluginSetupApi.getCddbDocument(fileId!),
    enabled,
    staleTime: Infinity,
  });

  const figmaQuery = useQuery({
    queryKey: ["plugin-setup", "figma-file", fileId],
    queryFn: () => pluginSetupApi.getFigmaFile(fileId!, figmaToken!),
    enabled,
    staleTime: Infinity,
  });

  return {
    isLoading: cddbQuery.isLoading || figmaQuery.isLoading,
    isError: cddbQuery.isError || figmaQuery.isError,
    error: cddbQuery.error ?? figmaQuery.error,
    cddbDocument: cddbQuery.data,
    figmaFile: figmaQuery.data,
  };
}
