import { SidebarHeader } from "./SidebarHeader";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarNav } from "./SidebarNav";
import { UserProfileCard } from "./UserProfileCard";

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card">
      <SidebarHeader />
      <SidebarSearch />
      <SidebarNav />
      <div className="mt-auto border-t p-2">
        <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Review & Release
        </div>
        <UserProfileCard />
      </div>
    </aside>
  );
}
