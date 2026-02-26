import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "linked" | "unlinked" | "draft";

const VARIANT: Record<Status, "success" | "secondary" | "outline"> = {
  linked: "success",
  unlinked: "outline",
  draft: "secondary",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={VARIANT[status]} className={cn("gap-1", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
