import { cn } from "@/lib/utils";
import type { ChartSegment } from "@/api/types";

const COLOR_MAP = {
  green: "fill-emerald-500",
  gray: "fill-muted-foreground/40",
  red: "fill-destructive",
} as const;

interface DonutChartProps {
  segments: ChartSegment[];
  size?: number;
  className?: string;
}

export function DonutChart({ segments, size = 80, className }: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const strokeWidth = size * 0.2;
  const r = (size - strokeWidth) / 2;
  const c = size / 2;
  let offset = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("rotate-[-90deg]", className)}
    >
      {segments.map((seg) => {
        const ratio = total ? seg.value / total : 0;
        const dashArray = 2 * Math.PI * r;
        const dashOffset = dashArray - dashArray * ratio + offset;
        offset -= dashArray * ratio;

        return (
          <circle
            key={seg.label}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            className={COLOR_MAP[seg.color]}
          />
        );
      })}
    </svg>
  );
}
