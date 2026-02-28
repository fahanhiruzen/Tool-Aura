import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReleaseRequestStatus } from "@/api/types";

const CONFIG: Record<
  ReleaseRequestStatus,
  { label: string; className: string }
> = {
  completed: {
    label: "Completed",
    className:
      "border border-emerald-300 bg-transparent text-emerald-700 dark:text-emerald-400",
  },
  in_progress: {
    label: "In Progress",
    className:
      "border border-amber-300 bg-transparent text-amber-700 dark:text-amber-400",
  },
};

interface ReleaseStatusBadgeProps {
  status: ReleaseRequestStatus;
  className?: string;
}

export function ReleaseStatusBadge({
  status,
  className,
}: ReleaseStatusBadgeProps) {
  const { label, className: variantClass } = CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("font-normal whitespace-nowrap", variantClass, className)}
    >
      {label}
    </Badge>
  );
}
