import { useState, useMemo, useEffect, useRef } from "react";
import { Upload, Download, ChevronDown, ChevronUp, ChevronsUpDown, Loader2, FileText, X } from "lucide-react";
import { cn, formatUsername } from "@/lib/utils";
import { useGridHistory, useDownloadGrid, useUploadGrid } from "@/hooks/use-text-grids";
import type { GridIdHistory } from "@/api/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GridRow {
  id: string;
  name: string;
  handle: string;
  date: string;
  time: string;
  rawDate: string;
  uploadedFileName: string;
  gridIdHistories: GridIdHistory[];
}

const GRID_FILTERS = ["IC Grids", "HU Grids"];

const FILTER_TO_FILE_TYPE: Record<string, string> = {
  "IC Grids": "IC",
  "HU Grids": "HU",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

function emailToDisplayName(email: string): string {
  return formatUsername(email);
}

function formatMessage(message: string): string {
  let result = message.replace(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?/g,
    (ts) => `${formatDate(ts)}, ${formatTime(ts)}`
  );
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    emailToDisplayName
  );
  return result;
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
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
// Sort controls
// ---------------------------------------------------------------------------

type SortKey = "name" | "date";
type SortDir = "asc" | "desc";

function SortButton({
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
    <button
      type="button"
      onClick={() => onSort(col)}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
      {isActive ? (
        sortDir === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Grid IDs pill
// ---------------------------------------------------------------------------

const GRID_IDS_PREVIEW = 2;

function GridIdsPill({ gridId }: { gridId: string }) {
  return (
    <span className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground border border-border truncate max-w-[160px]">
      {gridId.trim()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Expanded grid changes
// ---------------------------------------------------------------------------

function GridChangesExpanded({ histories }: { histories: GridIdHistory[] }) {
  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        Grid Changes ({histories.length})
      </p>
      {histories.length === 0 ? (
        <p className="text-xs text-muted-foreground">No grid changes recorded.</p>
      ) : (
        <ul className="space-y-2">
          {histories.map((item, i) => (
            <li
              key={`${item.gridId}-${i}`}
              className="rounded-lg border border-border bg-muted/40 px-3 py-2.5"
            >
              <p className="text-xs font-semibold text-foreground font-mono">
                {item.gridId}
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {formatMessage(item.message)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload modal
// ---------------------------------------------------------------------------

function UploadModal({
  fileType,
  onClose,
}: {
  fileType: string;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: upload, isPending } = useUploadGrid();

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) setFile(picked);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    upload({ fileType, file }, { onSuccess: onClose });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-[440px] flex flex-col rounded-2xl bg-card border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Upload grids.xml
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            {file ? (
              <p className="text-sm font-medium text-foreground text-center break-all">
                {file.name}
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  Drag & drop your file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse — .xml only
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xml,application/xml,text/xml"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function TextGridsPage() {
  const [filter, setFilter] = useState("IC Grids");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);

  const fileType = FILTER_TO_FILE_TYPE[filter];
  const { data, isLoading, isError } = useGridHistory(fileType);
  const { mutate: downloadGrid, isPending: isDownloading } = useDownloadGrid();

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const rows: GridRow[] = useMemo(
    () =>
      (data?.changes ?? []).map((change, index) => ({
        id: `${change.updatedAt}-${index}`,
        name: emailToDisplayName(change.updatedBy),
        handle: change.updatedBy,
        date: formatDate(change.updatedAt),
        time: formatTime(change.updatedAt),
        rawDate: change.updatedAt,
        uploadedFileName: change.uploadedFileName,
        gridIdHistories: change.gridIdHistories,
      })),
    [data]
  );

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "name") cmp = a.name.localeCompare(b.name);
        else if (sortKey === "date") cmp = a.rawDate.localeCompare(b.rawDate);
        return sortDir === "asc" ? cmp : -cmp;
      }),
    [rows, sortKey, sortDir]
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Text Grids</h1>
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
          onClick={() => setUploadOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
        >
          <Upload className="h-4 w-4" />
          Upload grids.xml
        </button>
        <button
          type="button"
          onClick={() => downloadGrid(fileType)}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isDownloading ? "Downloading…" : "Download latest grids.xml"}
        </button>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-1 px-6 pt-4">
        <span className="text-xs text-muted-foreground mr-1">Sort by:</span>
        <SortButton col="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
          User
        </SortButton>
        <SortButton col="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
          Date
        </SortButton>
      </div>

      {/* Cards */}
      <div className="px-6 pt-3 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Loading history…</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-destructive">Failed to load grid history.</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No history found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((row) => {
              const isExpanded = expandedIds.has(row.id);
              const previewIds = row.gridIdHistories.slice(0, GRID_IDS_PREVIEW);
              const rest = row.gridIdHistories.length - GRID_IDS_PREVIEW;
              return (
                <div
                  key={row.id}
                  onClick={() => toggleExpand(row.id)}
                  className="rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted shrink-0">
                        <FileText className="h-3.5 w-3.5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{row.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{row.handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">{row.date}</p>
                        <p className="text-[10px] text-muted-foreground">{row.time}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleExpand(row.id); }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded
                          ? <ChevronUp className="h-3.5 w-3.5" />
                          : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* File name */}
                  <p className="mt-1.5 text-xs font-medium text-foreground font-mono break-all leading-relaxed">
                    {row.uploadedFileName}
                  </p>

                  {/* Grid IDs preview (collapsed) */}
                  {!isExpanded && row.gridIdHistories.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                      {previewIds.map((h, i) => (
                        <GridIdsPill key={`${h.gridId}-${i}`} gridId={h.gridId} />
                      ))}
                      {rest > 0 && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          +{rest} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expanded grid changes */}
                  {isExpanded && <GridChangesExpanded histories={row.gridIdHistories} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Result count */}
        {!isLoading && !isError && (
          <p className="mt-3 text-xs text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
          </p>
        )}
      </div>

      {/* Upload modal */}
      {uploadOpen && (
        <UploadModal
          fileType={fileType}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  );
}
