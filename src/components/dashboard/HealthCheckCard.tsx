import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useHealthCheck } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";

export function HealthCheckCard() {
  const { data, isPending, error } = useHealthCheck();

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Health Check
        </h3>
      </CardHeader>
      <CardContent className="space-y-2">
        {isPending && (
          <p className="text-2xl font-bold text-muted-foreground">...</p>
        )}
        {error && (
          <p className="text-sm text-destructive">Failed to load health</p>
        )}
        {data && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className={cn(
                "text-2xl font-bold tracking-tight",
                data.status === "good" && "text-emerald-600",
                data.status === "warning" && "text-amber-600",
                data.status === "error" && "text-destructive"
              )}
            >
              {data.message}
            </p>
            {data.allIdsLinked && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                All IDs linked
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
