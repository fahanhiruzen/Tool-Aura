import { useState } from "react";
import { Upload, Download, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type ChangeType = "upload" | "download";

interface GridRow {
  id: string;
  name: string;
  handle: string;
  date: string;
  time: string;
  change: ChangeType;
}

const MOCK_ROWS: GridRow[] = [
  { id: "1", name: "Olivia Rhye",    handle: "@olivia",  date: "June 24, 2024", time: "02:30 pm", change: "upload" },
  { id: "2", name: "Phoenix Baker",  handle: "@phoenix", date: "June 24, 2024", time: "02:30 pm", change: "download" },
  { id: "3", name: "Lana Steiner",   handle: "@lana",    date: "June 24, 2024", time: "02:30 pm", change: "download" },
  { id: "4", name: "Demi Wilkinson", handle: "@demi",    date: "June 24, 2024", time: "02:30 pm", change: "upload" },
  { id: "5", name: "Candice Wu",     handle: "@candice", date: "June 24, 2024", time: "02:30 pm", change: "download" },
  { id: "6", name: "Natali Craig",   handle: "@natali",  date: "June 24, 2024", time: "02:30 pm", change: "upload" },
  { id: "7", name: "Drew Cano",      handle: "@drew",    date: "June 24, 2024", time: "02:30 pm", change: "upload" },
  { id: "8", name: "Orlando Diggs",  handle: "@orlando", date: "June 24, 2024", time: "02:30 pm", change: "download" },
];

const GRID_FILTERS = ["IC Grids", "HU Grids", "RSE Grids"];

// ---------------------------------------------------------------------------
// Change badge
// ---------------------------------------------------------------------------

function ChangeBadge({ type }: { type: ChangeType }) {
  if (type === "upload") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400">
        <Upload className="h-3 w-3" />
        Upload
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600 border border-violet-200 dark:bg-violet-950/30 dark:border-violet-800 dark:text-violet-400">
      <Download className="h-3 w-3" />
      Download
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sort header button
// ---------------------------------------------------------------------------

type SortKey = "name" | "date" | "change";
type SortDir = "asc" | "desc";

function SortTh({
  children,
  col,
  sortKey,
  sortDir,
  onSort,
}: {
  children: React.ReactNode;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const isActive = sortKey === col;
  return (
    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onSort(col)}
      >
        {children}
        {isActive ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </button>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Filter dropdown
// ---------------------------------------------------------------------------

function FilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50 transition-colors"
      >
        {value}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-border bg-popover shadow-md">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                opt === value && "font-medium bg-muted"
              )}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function TextGridsPage() {
  const [filter, setFilter] = useState("IC Grids");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...MOCK_ROWS].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "date") cmp = a.date.localeCompare(b.date);
    else if (sortKey === "change") cmp = a.change.localeCompare(b.change);
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grids</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage text attributes and created Grids
          </p>
        </div>
        <FilterDropdown
          value={filter}
          options={GRID_FILTERS}
          onChange={setFilter}
        />
      </div>

      <hr className="mx-6 mt-5 border-border" />

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 px-6 pt-5">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
        >
          <Upload className="h-4 w-4" />
          Upload grids.xml
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download latest grids.xml
        </button>
      </div>

      {/* Table */}
      <div className="px-6 pt-4 pb-6">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                <SortTh col="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
                  User
                </SortTh>
                <SortTh col="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
                  Time
                </SortTh>
                <SortTh col="change" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
                  Change
                </SortTh>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.handle}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-foreground">{row.date}</p>
                    <p className="text-xs text-muted-foreground">{row.time}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <ChangeBadge type={row.change} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
