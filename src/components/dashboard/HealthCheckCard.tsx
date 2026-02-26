import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          <>
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
              <Button
                variant="secondary"
                size="sm"
                className="h-7 gap-1.5 text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                All IDs linked
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
