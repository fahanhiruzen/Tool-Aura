import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUniqueIds } from "@/hooks/use-dashboard";
import { useTableStore } from "@/stores";
import { TableControls } from "./TableControls";
import { StatusBadge } from "./StatusBadge";
import type { UniqueIdRow } from "@/api/types";

function TableRow({ row, onDelete }: { row: UniqueIdRow; onDelete?: (id: string) => void }) {
  const selectedIds = useTableStore((s) => s.selectedIds);
  const toggleSelection = useTableStore((s) => s.toggleSelection);
  const isSelected = selectedIds.has(row.id);

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="w-12 p-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelection(row.id)}
        />
      </td>
      <td className="p-3 font-medium">{row.parentName}</td>
      <td className="p-3 text-muted-foreground">{row.type}</td>
      <td className="p-3 text-muted-foreground">{row.screenId}</td>
      <td className="p-3">
        <StatusBadge status={row.status} />
      </td>
      <td className="w-12 p-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete?.(row.id)}
          aria-label={`Delete ${row.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

export function UniqueIdsTable() {
  const searchQuery = useTableStore((s) => s.searchQuery);
  const { data, isPending, error } = useUniqueIds(searchQuery || undefined);

  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      <div>
        <h2 className="text-lg font-semibold">Last edited Unique IDs</h2>
        <p className="text-sm text-muted-foreground">This Document</p>
      </div>
      <TableControls searchPlaceholder="Search" />
      <div className="rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-12 p-3 text-left font-medium" />
              <th className="p-3 text-left font-medium">Parent Name</th>
              <th className="p-3 text-left font-medium">Type</th>
              <th className="p-3 text-left font-medium">Screen ID</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="w-12 p-3" />
            </tr>
          </thead>
          <tbody>
            {isPending &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3" colSpan={6}>
                    <div className="h-6 w-full animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))}
            {error && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-destructive">
                  Failed to load unique IDs
                </td>
              </tr>
            )}
            {data?.items.map((row) => (
              <TableRow key={row.id} row={row} />
            ))}
            {data?.items.length === 0 && !isPending && !error && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No unique IDs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
