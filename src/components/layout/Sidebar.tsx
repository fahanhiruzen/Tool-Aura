import { cn } from "@/lib/utils";
import { useNavigationStore } from "@/stores";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarNav } from "./SidebarNav";
import { UserProfileCard } from "./UserProfileCard";

export function Sidebar() {
  const isCollapsed = useNavigationStore((s) => s.isSidebarCollapsed);
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-x-hidden border-r bg-muted/50 transition-[width] duration-200",
        isCollapsed ? "w-14" : "w-60"
      )}
    >
      <SidebarHeader />
      {!isCollapsed && <SidebarSearch />}
      <SidebarNav />
      <div className="mt-auto border-t p-2">
        <UserProfileCard />
      </div>
    </aside>
  );
}
