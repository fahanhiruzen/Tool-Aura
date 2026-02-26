import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem as NavItemType } from "@/stores";

interface NavItemProps {
  item: NavItemType;
  icon?: LucideIcon;
  isActive: boolean;
  onSelect: () => void;
  isExpanded?: boolean;
  onToggle?: () => void;
  hasChildren?: boolean;
  activeId?: string | null;
  onSelectChild?: (id: string) => void;
  badge?: number;
}

export function NavItem({
  item,
  icon: Icon,
  isActive,
  onSelect,
  isExpanded,
  onToggle,
  hasChildren,
  activeId,
  onSelectChild,
  badge,
}: NavItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={hasChildren ? onToggle : onSelect}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-muted text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {Icon && (
          <Icon
            className={cn("h-4 w-4 shrink-0", isActive && "text-primary")}
            aria-hidden
          />
        )}
        <span className="flex-1 text-left">{item.label}</span>
        {badge != null && badge > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {badge}
          </span>
        )}
        {hasChildren && (
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-180")}
          />
        )}
      </button>
      {hasChildren && isExpanded && item.children && (
        <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
          {item.children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelectChild?.(child.id)}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                activeId === child.id
                  ? "bg-muted text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
