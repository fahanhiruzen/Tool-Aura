import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTableStore } from "@/stores";

interface TableControlsProps {
  onMoreFilters?: () => void;
  selectAllLabel?: string;
  searchPlaceholder?: string;
  /** When true, only filters + More filters + search are shown (select all is rendered elsewhere) */
  filtersAndSearchOnly?: boolean;
}

export function TableControls({
  onMoreFilters,
  selectAllLabel = "Select all Unique IDs",
  searchPlaceholder = "Search",
  filtersAndSearchOnly = false,
}: TableControlsProps) {
  const searchQuery = useTableStore((s) => s.searchQuery);
  const setSearchQuery = useTableStore((s) => s.setSearchQuery);
  const selectAll = useTableStore((s) => s.selectAll);
  const setSelectAll = useTableStore((s) => s.setSelectAll);
  const filters = useTableStore((s) => s.filters);
  const removeFilter = useTableStore((s) => s.removeFilter);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!filtersAndSearchOnly && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={(v) => setSelectAll(v === true)}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {selectAllLabel}
          </label>
        </div>
      )}
          {filters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium"
            >
              {f.label}
              <button
                type="button"
                onClick={() => removeFilter(f.id)}
                className="hover:text-foreground"
                aria-label={`Remove ${f.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {onMoreFilters !== undefined && (
        <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={onMoreFilters}>
          <SlidersHorizontal className="h-4 w-4" />
          More filters
        </Button>
      )}
      <div className="relative ml-auto">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-64 pl-9 pr-16"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 font-mono text-[10px] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}
