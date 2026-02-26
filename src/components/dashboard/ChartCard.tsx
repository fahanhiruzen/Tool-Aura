import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DonutChart } from "./DonutChart";
import { ChartLegend } from "./ChartLegend";
import type { ReleaseStatus } from "@/api/types";

interface ChartCardProps {
  title: string;
  data?: ReleaseStatus | null;
  isPending?: boolean;
  error?: Error | null;
}

export function ChartCard({ title, data, isPending, error }: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending && (
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive">Failed to load chart</p>
        )}
        {data && !isPending && (
          <>
            <div className="flex items-center gap-4">
              <DonutChart segments={data.segments} />
              <ChartLegend segments={data.segments} />
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-muted-foreground"
            >
              • {data.donePercent}% Done
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
