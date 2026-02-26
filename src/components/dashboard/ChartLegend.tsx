import type { ChartSegment } from "@/api/types";
import { cn } from "@/lib/utils";

const DOT_COLOR: Record<string, string> = {
  green: "#22c55e",
  gray: "#e5e7eb",
  red: "#ef4444",
};

interface ChartLegendProps {
  segments: ChartSegment[];
  className?: string;
}

export function ChartLegend({ segments, className }: ChartLegendProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {segments.map((seg) => {
        const pct = total ? Math.round((seg.value / total) * 100) : 0;
        return (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: DOT_COLOR[seg.color] }}
            />
            <span className="text-foreground">{seg.label}</span>
            <span className="ml-auto pl-2 text-muted-foreground">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
