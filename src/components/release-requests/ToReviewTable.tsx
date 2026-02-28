import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReleaseRequestItem, RequestStatusType } from "@/api/release-request";
import { DocumentName } from "./DocumentName";

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

function ToReviewRow({ item, onEdit }: { item: ReleaseRequestItem; onEdit?: (id: string) => void }) {
  const isApproved = item.reviewers.some((r) => r.approved);
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm max-w-0">
        <div className="min-w-0">
          {item.documentKey ? (
            <DocumentName
              documentKey={item.documentKey}
              fallback={item.documentKey}
              onEdit={() => onEdit?.(item.id)}
            />
          ) : (
            <button
              type="button"
              onClick={() => onEdit?.(item.id)}
              className="block truncate font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              —
            </button>
          )}
          {item.domainId && (
            <div className="truncate text-xs text-muted-foreground" title={item.domainId}>{item.domainId}</div>
          )}
        </div>
      </td>

      <td className="px-4 py-3 text-sm font-medium text-foreground truncate max-w-0">
        <span className="block truncate" title={item.releaseProcessName}>
          {item.releaseProcessName || "—"}
        </span>
      </td>

      <td className="px-4 py-3">
        {isApproved ? (
          <Badge variant="outline" className="font-normal border-emerald-300 text-emerald-700">
            Approved
          </Badge>
        ) : (
          <ReviewStatusBadge status={item.status} />
        )}
      </td>

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
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="border-b">
      <td className="px-4 py-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="mx-auto h-4 w-4 animate-pulse rounded bg-muted" />
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

interface ToReviewTableProps {
  items: ReleaseRequestItem[];
  onEdit?: (id: string) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

export function ToReviewTable({
  items,
  onEdit,
  page,
  totalPages,
  pageSize,
  onPageChange,
  isLoading = false,
  isFetching = false,
}: ToReviewTableProps) {
  const isPaging = isFetching && !isLoading;
  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded-lg border transition-opacity duration-150"
        style={{ minHeight: isLoading ? 41 + pageSize * 57 : undefined, opacity: isPaging ? 0.5 : 1 }}
      >
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
                Document Name
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                Release Process
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                Review Status
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No items to review.
                </td>
              </tr>
            ) : (
              items.map((item) => <ToReviewRow key={item.id} item={item} onEdit={onEdit} />)
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
