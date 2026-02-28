import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReleaseRequestItem, RequestStatusType } from "@/api/release-request";

const PAGE_SIZE = 5;

// ---------------------------------------------------------------------------
// Review status badge
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  RequestStatusType,
  { label: string; className: string }
> = {
  NEW: {
    label: "New",
    className: "border-slate-300 text-slate-600",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "border-blue-300 text-blue-700",
  },
  VALIDATION: {
    label: "Validating",
    className: "border-amber-300 text-amber-700",
  },
  VALIDATION_FAILED: {
    label: "Validation Failed",
    className: "border-red-300 text-red-700",
  },
  VALIDATION_SUCCEEDED: {
    label: "Validation Passed",
    className: "border-emerald-300 text-emerald-700",
  },
  REVIEW: {
    label: "Pending Review",
    className: "border-amber-300 text-amber-700",
  },
  RELEASE: {
    label: "Releasing",
    className: "border-blue-300 text-blue-700",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-emerald-300 text-emerald-700",
  },
};

function ReviewStatusBadge({ status }: { status: RequestStatusType }) {
  const { label, className } = STATUS_CONFIG[status] ?? {
    label: status,
    className: "border-slate-300 text-slate-600",
  };
  return (
    <Badge variant="outline" className={cn("font-normal whitespace-nowrap", className)}>
      {label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

function ToReviewRow({ item }: { item: ReleaseRequestItem }) {
  const isApproved = item.reviewers.some((r) => r.approved);
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Document Name */}
      <td className="px-4 py-3 text-sm max-w-0">
        {item.documentLink ? (
          <div className="min-w-0">
            <a
              href={item.documentLink}
              target="_blank"
              rel="noreferrer"
              className="block truncate font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-2 hover:decoration-foreground"
              title={item.documentKey}
            >
              {item.documentKey}
            </a>
            {item.domainId && (
              <div className="truncate text-xs text-muted-foreground" title={item.domainId}>{item.domainId}</div>
            )}
          </div>
        ) : (
          <div className="min-w-0">
            <span className="block truncate text-muted-foreground" title={item.documentKey}>{item.documentKey || "—"}</span>
            {item.domainId && (
              <div className="truncate text-xs text-muted-foreground" title={item.domainId}>{item.domainId}</div>
            )}
          </div>
        )}
      </td>

      {/* Release Process */}
      <td className="px-4 py-3 text-sm font-medium text-foreground truncate max-w-0">
        <span className="block truncate" title={item.releaseProcessName}>
          {item.releaseProcessName || "—"}
        </span>
      </td>

      {/* Review Status */}
      <td className="px-4 py-3">
        {isApproved ? (
          <Badge
            variant="outline"
            className="font-normal border-emerald-300 text-emerald-700"
          >
            Approved
          </Badge>
        ) : (
          <ReviewStatusBadge status={item.status} />
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => item.documentLink && window.open(item.documentLink)}
          disabled={!item.documentLink}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Open document"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="rounded p-1 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-xs text-muted-foreground">
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="rounded p-1 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

type SortKey = "documentKey" | "releaseProcessName" | "status";
type SortDir = "asc" | "desc";

interface ToReviewTableProps {
  items: ReleaseRequestItem[];
}

export function ToReviewTable({ items }: ToReviewTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("releaseProcessName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.documentKey?.toLowerCase().includes(q) ||
        item.domainId?.toLowerCase().includes(q) ||
        item.releaseProcessName?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 text-muted-foreground">
      {sortKey === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search"
          className="pl-9"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[48%]" />
            <col className="w-[20%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground"
                  onClick={() => handleSort("documentKey")}
                >
                  Document Name <SortIcon col="documentKey" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground ">
                <button
                  type="button"
                  className="flex text-left hover:text-foreground"
                  onClick={() => handleSort("releaseProcessName")}
                >
                  Release Process <SortIcon col="releaseProcessName" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground"
                  onClick={() => handleSort("status")}
                >
                  Review Status <SortIcon col="status" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No items to review.
                </td>
              </tr>
            ) : (
              paginated.map((item) => <ToReviewRow key={item.id} item={item} />)
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
