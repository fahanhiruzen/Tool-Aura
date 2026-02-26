import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem as NavItemType } from "@/stores";

interface NavItemProps {
  item: NavItemType;
  isActive: boolean;
  onSelect: () => void;
  isExpanded?: boolean;
  onToggle?: () => void;
  hasChildren?: boolean;
}

export function NavItem({
  item,
  isActive,
  onSelect,
  isExpanded,
  onToggle,
  hasChildren,
}: NavItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={hasChildren ? onToggle : onSelect}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span className="flex-1 text-left">{item.label}</span>
        {hasChildren && (
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")}
          />
        )}
      </button>
      {hasChildren && isExpanded && item.children && (
        <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
          {item.children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={onSelect}
              className="rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
