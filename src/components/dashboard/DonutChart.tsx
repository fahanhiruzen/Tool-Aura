import { cn } from "@/lib/utils";
import type { ChartSegment } from "@/api/types";

const STROKE_COLOR: Record<string, string> = {
  green: "#22c55e",
  gray: "#e5e7eb",
  red: "#ef4444",
};

interface DonutChartProps {
  segments: ChartSegment[];
  size?: number;
  className?: string;
}

export function DonutChart({ segments, size = 80, className }: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const strokeWidth = size * 0.2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  let cumulativeOffset = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("rotate-[-90deg]", className)}
    >
      {segments.map((seg) => {
        const ratio = total ? seg.value / total : 0;
        const dashLength = circumference * ratio;
        const dashOffset = -cumulativeOffset;
        cumulativeOffset += dashLength;

        return (
          <circle
            key={seg.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={STROKE_COLOR[seg.color]}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference}`}
            strokeDashoffset={dashOffset}
          />
        );
      })}
    </svg>
  );
}
