import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigationStore } from "@/stores";

export function SidebarSearch() {
  const quickSearch = useNavigationStore((s) => s.quickSearch);
  const setQuickSearch = useNavigationStore((s) => s.setQuickSearch);

  return (
    <div className="relative px-2 py-2">
      <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={quickSearch}
        onChange={(e) => setQuickSearch(e.target.value)}
        placeholder="Quick Search"
        className="h-9 pl-9 pr-16 bg-muted/50"
      />
      <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}
