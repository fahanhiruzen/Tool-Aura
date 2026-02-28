import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ExternalLink, HelpCircle, X } from "lucide-react";
import { cn, formatUsername } from "@/lib/utils";
import { badgeVariants } from "@/components/ui/badge";
import type { ReleaseRequest, Reviewer } from "@/api/types";
import { DocumentName } from "./DocumentName";

const NOTES_PREVIEW_LIMIT = 120;

// ---------------------------------------------------------------------------
// Status logic
// ---------------------------------------------------------------------------

type StatusVariant = "released" | "release-pending" | "rejected" | "reviews-pending" | "no-reviewers";

function getStatus(request: ReleaseRequest): { label: string; variant: StatusVariant } {
  if (request.status === "completed") {
    return { label: "Released", variant: "released" };
  }
  const reviewers = request.reviewers ?? [];
  if (reviewers.length === 0) {
    return { label: "UnAssigned", variant: "no-reviewers" };
  }
  if (reviewers.some((r) => (r.approved as unknown) === false)) {
    return { label: "Rejected", variant: "rejected" };
  }
  if (reviewers.some((r) => r.approved === true)) {
    return { label: "Release Pending", variant: "release-pending" };
  }
  return { label: "Reviews Pending", variant: "reviews-pending" };
}

const BADGE_VARIANT_MAP: Record<StatusVariant, "success" | "warning" | "error" | "info" | "outline"> = {
  released: "success",
  "release-pending": "warning",
  rejected: "error",
  "reviews-pending": "info",
  "no-reviewers": "outline",
};

// ---------------------------------------------------------------------------
// ReviewerNotesModal
// ---------------------------------------------------------------------------

function ReviewerNotesModal({
  reviewers,
  onClose,
}: {
  reviewers: Reviewer[];
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-popover shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Reviewer Details</p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <ul className="flex flex-col gap-1.5">
            {reviewers.map((r) => (
              <ReviewerRow key={r.userEmail} reviewer={r} />
            ))}
          </ul>
          {reviewers[0]?.reviewerNotes && (
            <div className="border-t border-border pt-3">
              <p className="mb-1 text-xs font-medium text-foreground">Notes</p>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                {reviewers[0].reviewerNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// StatusBadge — clickable badge with reviewer detail popover
// ---------------------------------------------------------------------------

function ReviewerRow({ reviewer }: { reviewer: Reviewer }) {
  const approved = reviewer.approved as unknown;
  const isApproved = approved === true;
  const isRejected = approved === false;
  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={cn(
          "h-1.5 w-1.5 flex-shrink-0 rounded-full",
          isApproved ? "bg-emerald-500" : isRejected ? "bg-red-500" : "bg-amber-400"
        )}
      />
      <span className="min-w-0 flex-1 truncate text-foreground" title={reviewer.userEmail}>
        {`${formatUsername(reviewer.userEmail)}`}
      </span>
      <span className={cn(
        "ml-2 shrink-0 text-xs font-medium",
        isApproved ? "text-emerald-600" : isRejected ? "text-red-500" : "text-muted-foreground"
      )}>
        {isApproved ? "Approved" : isRejected ? "Rejected" : "Pending"}
      </span>
    </li>
  );
}

function StatusBadge({ request }: { request: ReleaseRequest }) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { label, variant } = getStatus(request);
  const reviewers = request.reviewers ?? [];
  const hasDetails = reviewers.length > 0;
  const notes = reviewers[0]?.reviewerNotes ?? "";
  const isNotesLong = notes.length > NOTES_PREVIEW_LIMIT;
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onScroll(e: Event) {
      if (popoverRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !btnRef.current || !popoverRef.current) return;
    const badgeRect = btnRef.current.getBoundingClientRect();
    const popoverHeight = popoverRef.current.offsetHeight;
    const POPOVER_WIDTH = 280;
    const GAP = 6;
    const MARGIN = 8;

    let left = badgeRect.left;
    if (left + POPOVER_WIDTH > window.innerWidth - MARGIN) {
      left = window.innerWidth - POPOVER_WIDTH - MARGIN;
    }
    if (left < MARGIN) left = MARGIN;

    const spaceBelow = window.innerHeight - badgeRect.bottom - GAP;
    const top =
      spaceBelow >= popoverHeight + MARGIN
        ? badgeRect.bottom + GAP
        : badgeRect.top - popoverHeight - GAP;

    setPopoverStyle({ position: "fixed", top, left, width: POPOVER_WIDTH, zIndex: 9999 });
  }, [open]);

  function handleOpen() {
    if (!hasDetails) return;
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          badgeVariants({ variant: BADGE_VARIANT_MAP[variant] }),
          "rounded-full font-medium",
          hasDetails ? "cursor-pointer hover:opacity-80" : "cursor-default"
        )}
      >
        {label}
      </button>

      {open && hasDetails && createPortal(
        <div
          ref={popoverRef}
          style={popoverStyle}
          className="rounded-lg border border-border bg-popover p-3 shadow-md"
        >
          <p className="mb-2 text-xs font-semibold text-foreground">Reviewers</p>
          <ul className="flex flex-col gap-1.5 overflow-hidden">
            {reviewers.map((r) => (
              <ReviewerRow key={r.userEmail} reviewer={r} />
            ))}
          </ul>
          {notes && (
            <div className="mt-2 border-t border-border pt-2">
              <p className="break-words text-xs text-muted-foreground">
                {isNotesLong ? `${notes.slice(0, NOTES_PREVIEW_LIMIT)}…` : notes}
              </p>
              {isNotesLong && (
                <button
                  type="button"
                  onClick={() => { setOpen(false); setModalOpen(true); }}
                  className="mt-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  View details
                </button>
              )}
            </div>
          )}
        </div>,
        document.body
      )}

      {modalOpen && (
        <ReviewerNotesModal reviewers={reviewers} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

interface ReleaseRequestRowProps {
  request: ReleaseRequest;
  onEdit?: (id: string) => void;
}

function ReleaseRequestRow({ request, onEdit }: ReleaseRequestRowProps) {
 
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Document */}
      <td className="px-4 py-3 text-sm">
        <div>
          {request.documentKey ? (
            <DocumentName
              documentKey={request.documentKey}
              fallback={request.document}
              onEdit={() => onEdit?.(request.id)}
            />
          ) : (
            <button
              type="button"
              onClick={() => onEdit?.(request.id)}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              {request.document}
            </button>
          )}
          {request.domainName && (
            <div className="text-xs text-muted-foreground">{request.domainName}</div>
          )}
        </div>
      </td>

      {/* Created at */}
      <td className="px-4 py-3 text-sm">
        {(() => {
          try {
            const d = new Date(request.createdAt);
            const day = d.toLocaleDateString("en-GB", { day: "2-digit" });
            const month = d.toLocaleDateString("en-GB", { month: "short" });
            const year = d.toLocaleDateString("en-GB", { year: "numeric" });
            const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
            return (
              <>
                <div className="text-foreground">{`${day}. ${month}. ${year}`}</div>
                <div className="text-muted-foreground">{time}</div>
              </>
            );
          } catch {
            return <div className="text-foreground">{request.createdAt}</div>;
          }
        })()}
      </td>

      {/* Status (merged Release + Review Status) */}
      <td className="px-4 py-3">
        <StatusBadge request={request} />
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          aria-label="Open document"
          onClick={() => window.open(`https://www.figma.com/file/${request.documentKey}`, "_blank")}
          className="text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-1.5 h-3 w-10 animate-pulse rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="ml-auto h-4 w-4 animate-pulse rounded bg-muted" />
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

interface ReleaseRequestsTableProps {
  requests: ReleaseRequest[];
  onEdit?: (id: string) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

export function ReleaseRequestsTable({
  requests,
  onEdit,
  page,
  totalPages,
  pageSize,
  onPageChange,
  isLoading = false,
  isFetching = false,
}: ReleaseRequestsTableProps) {
  const isPaging = isFetching && !isLoading;
  return (
    <div className="space-y-3">
      <div
        className="overflow-x-auto rounded-lg border transition-opacity duration-150"
        style={{ minHeight: isLoading ? 41 + pageSize * 57 : undefined, opacity: isPaging ? 0.5 : 1 }}
      >
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                Document
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  Created At
                  <HelpCircle className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No release requests found.
                </td>
              </tr>
            ) : (
              requests.map((r: ReleaseRequest) => (
                <ReleaseRequestRow key={r.id} request={r} onEdit={onEdit} />
              ))
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
