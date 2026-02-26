import type { ChartSegment } from "@/api/types";
import { cn } from "@/lib/utils";

const DOT_CLASS: Record<string, string> = {
  green: "bg-emerald-500",
  gray: "bg-muted-foreground/40",
  red: "bg-destructive",
};

interface ChartLegendProps {
  segments: ChartSegment[];
  className?: string;
}

export function ChartLegend({ segments, className }: ChartLegendProps) {
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-1", className)}>
      {segments.map((seg) => (
        <div key={seg.label} className="flex items-center gap-1.5 text-sm">
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", DOT_CLASS[seg.color])}
          />
          <span className="text-muted-foreground">{seg.label}</span>
        </div>
      ))}
    </div>
  );
}
