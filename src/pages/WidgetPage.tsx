import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
  Copy,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WidgetStatus = "linked" | "uncommitted" | "not-linked";

interface WidgetRow {
  id: string;
  parentName: string;
  subLabel?: string;
  type: string;
  screenId: string;
  status: WidgetStatus;
  children?: WidgetRow[];
}

// ---------------------------------------------------------------------------
// Mock data (per widget)
// ---------------------------------------------------------------------------

const MOCK_ROWS: WidgetRow[] = [
  {
    id: "r1",
    parentName: "Unique ID 20239394",
    type: "Button",
    screenId: "20239394",
    status: "linked",
  },
  {
    id: "r2",
    parentName: "Neues Element",
    type: "Button",
    screenId: "20239394",
    status: "uncommitted",
  },
  {
    id: "r3",
    parentName: "Unique ID 20239394",
    type: "Button",
    screenId: "20239394",
    status: "linked",
    children: [
      {
        id: "r3-1",
        parentName: "Unique ID 202203940",
        subLabel: "Part of 20239394",
        type: "Text",
        screenId: "20239394",
        status: "not-linked",
      },
      {
        id: "r3-2",
        parentName: "Unique ID 202203356",
        subLabel: "Part of 20239394",
        type: "Icon",
        screenId: "20239394",
        status: "linked",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: WidgetStatus }) {
  const configs: Record<WidgetStatus, { dot: string; text: string; label: string }> = {
    linked: {
      dot: "bg-green-500",
      text: "text-green-700 dark:text-green-400",
      label: "Linked",
    },
    uncommitted: {
      dot: "bg-gray-500",
      text: "text-gray-600 dark:text-gray-400",
      label: "Uncommited",
    },
    "not-linked": {
      dot: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      label: "Not Linked",
    },
  };

  const { dot, text, label } = configs[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", text)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function Row({ row, depth = 0 }: { row: WidgetRow; depth?: number }) {
  return (
    <>
      <tr className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
        <td className={cn("px-4 py-3", depth > 0 && "pl-8")}>
          <p className="text-sm font-medium text-foreground">{row.parentName}</p>
          {row.subLabel && (
            <p className="text-xs text-muted-foreground">{row.subLabel}</p>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{row.type}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{row.screenId}</td>
        <td className="px-4 py-3">
          <StatusBadge status={row.status} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Copy"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {row.children?.map((child) => (
        <Row key={child.id} row={child} depth={depth + 1} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface WidgetPageProps {
  widgetId: string;
  widgetLabel?: string;
}

export function WidgetPage({ widgetLabel = "NA.XX.23" }: WidgetPageProps) {
  const [page, setPage] = useState(1);
  const totalPages = 10;
  const [filterActive, setFilterActive] = useState(true);
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{widgetLabel}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage this document's metadata here.
          </p>
        </div>
        <Button className="shrink-0">Validate all Data</Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border flex-wrap">
        {filterActive && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium">
            [Selected Filter]
            <button
              type="button"
              onClick={() => setFilterActive(false)}
              className="hover:text-foreground text-muted-foreground transition-colors"
              aria-label="Remove filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
          <SlidersHorizontal className="h-4 w-4" />
          More filters
        </Button>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-9 w-56 rounded-md border border-input bg-background pl-9 pr-10 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pt-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    Parent Name
                    <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Screen ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((row) => (
                <Row key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 px-6 py-3 border-t border-border">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
        <div>
          <p className="text-sm font-medium">Version 3.2.1 – September 23, 2023</p>
          <p className="text-xs text-muted-foreground">Release Notes</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
        >
          <CheckCircle2 className="h-4 w-4" />
          Release Validation
        </button>
      </div>
    </div>
  );
}
