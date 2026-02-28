import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReleaseRequestStatus } from "@/api/types";

const VARIANT_MAP: Record<ReleaseRequestStatus, "success" | "warning"> = {
  completed: "success",
  in_progress: "warning",
};

const LABEL_MAP: Record<ReleaseRequestStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
};

interface ReleaseStatusBadgeProps {
  status: ReleaseRequestStatus;
  className?: string;
}

export function ReleaseStatusBadge({ status, className }: ReleaseStatusBadgeProps) {
  return (
    <Badge
      variant={VARIANT_MAP[status]}
      className={cn("font-normal whitespace-nowrap", className)}
    >
      {LABEL_MAP[status]}
    </Badge>
  );
}
