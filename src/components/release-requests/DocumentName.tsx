import { useQuery } from "@tanstack/react-query";
import { pluginSetupApi } from "@/api/endpoints";
import { useFigmaDataStore } from "@/stores/figma-data-store";

interface DocumentNameProps {
  documentKey: string;
  fallback: string;
  onEdit?: () => void;
}

export function DocumentName({ documentKey, fallback, onEdit }: DocumentNameProps) {
  const figmaToken = useFigmaDataStore((s) => s.data?.figmaToken ?? null);

  const { data, isLoading } = useQuery({
    queryKey: ["figma-file-name", documentKey],
    queryFn: () => pluginSetupApi.getFigmaFile(documentKey, figmaToken!),
    enabled: Boolean(documentKey && figmaToken),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return <div className="h-4 w-32 animate-pulse rounded bg-muted" />;
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 text-left"
    >
      {data?.name ?? fallback}
    </button>
  );
}
