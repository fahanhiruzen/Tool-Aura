import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "linked" | "unlinked" | "draft";

const VARIANT: Record<Status, "default" | "secondary" | "outline"> = {
  linked: "default",
  unlinked: "outline",
  draft: "secondary",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={VARIANT[status]} className={cn("gap-1.5 rounded-full px-2.5 py-0.5", className)}>
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          status === "linked" && "bg-primary-foreground opacity-90",
          status === "unlinked" && "bg-muted-foreground",
          status === "draft" && "bg-muted-foreground"
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
