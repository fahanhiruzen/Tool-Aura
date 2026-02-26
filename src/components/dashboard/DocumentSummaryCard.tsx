import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDocumentSummary } from "@/hooks/use-dashboard";

export function DocumentSummaryCard() {
  const { data, isPending, error } = useDocumentSummary();

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          This Document
        </h3>
      </CardHeader>
      <CardContent>
        {isPending && (
          <p className="text-2xl font-bold text-muted-foreground">...</p>
        )}
        {error && (
          <p className="text-sm text-destructive">Failed to load document</p>
        )}
        {data && (
          <p className="text-2xl font-bold tracking-tight">{data.name}</p>
        )}
      </CardContent>
    </Card>
  );
}
