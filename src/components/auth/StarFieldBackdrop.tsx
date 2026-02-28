import { cn } from "@/lib/utils";
import { StarField } from "./StarField";

/**
 * Full-height backdrop with animated star field. Theme-aware (dark/light).
 * Use for auth-related screens: login, token wait, loading.
 */
export function StarFieldBackdrop({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-full overflow-hidden bg-background",
        className
      )}
    >
      <StarField />
      <div className={cn("relative z-10 h-full", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
