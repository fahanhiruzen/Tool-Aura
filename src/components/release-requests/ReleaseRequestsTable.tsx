import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ReleaseStatusBadge } from "./ReleaseStatusBadge";
import type { ReleaseRequest } from "@/api/types";

const PAGE_SIZE = 5;

interface ReleaseRequestRowProps {
  request: ReleaseRequest;
}

function ReleaseRequestRow({ request }: ReleaseRequestRowProps) {
  const hasLink = request.domainName !== null;
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Document */}
      <td className="px-4 py-3 text-sm">
        {hasLink ? (
          <div>
            <button
              type="button"
              className="font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-2 hover:decoration-foreground"
            >
              {request.document}
            </button>
            <div className="text-xs text-muted-foreground">
              {request.domainName}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">{request.document}</span>
        )}
      </td>

      {/* Created at — date on line 1, time on line 2 */}
      <td className="px-4 py-3 text-sm">
        {(() => {
          const [date, ...rest] = request.createdAt.split(" ");
          return (
            <>
              <div className="text-foreground">{date}</div>
              <div className="text-muted-foreground">{rest.join(" ")}</div>
            </>
          );
        })()}
      </td>

      {/* Release */}
      <td className="px-4 py-3">
        <ReleaseStatusBadge status={request.status} />
      </td>

      {/* Review Status */}
      <td className="px-4 py-3 text-sm font-medium">
        {(() => {
          const reviewers = request.reviewers ?? [];
          if (reviewers.length === 0) {
            return <span className="text-muted-foreground whitespace-nowrap">No Reviewers</span>;
          }
          const approved = reviewers.some((r) => r.approved);
          return approved ? (
            <span className="text-emerald-600">Approved</span>
          ) : (
            <span className="text-red-500">Rejected</span>
          );
        })()}
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={!hasLink}
          aria-label="Open document"
          onClick={() => hasLink && window.open(request.domainName!, "_blank")}
          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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

export type SortKey = "document" | "createdAt" | "progress" | "status";
export type SortDir = "asc" | "desc";

interface ReleaseRequestsTableProps {
  requests: ReleaseRequest[];
}

export function ReleaseRequestsTable({ requests }: ReleaseRequestsTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleSort(key: SortKey) {
    const nextDir =
      key === sortKey ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    setSortKey(key);
    setSortDir(nextDir);
    setPage(0);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(
      (r) =>
        r.document?.toLowerCase().includes(q) ||
        r.domainName?.toLowerCase().includes(q),
    );
  }, [requests, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] ?? "";
      const bv = (b as unknown as Record<string, unknown>)[sortKey] ?? "";
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
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search"
          className="pl-9"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground"
                  onClick={() => handleSort("document")}
                >
                  Document <SortIcon col="document" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground"
                  onClick={() => handleSort("createdAt")}
                >
                  Created At
                  <HelpCircle className="ml-1 h-3 w-3" />
                  <SortIcon col="createdAt" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground"
                  onClick={() => handleSort("status")}
                >
                  Release <SortIcon col="status" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground"
                  onClick={() => handleSort("progress")}
                >
                  Review Status <SortIcon col="progress" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No release requests found.
                </td>
              </tr>
            ) : (
              paginated.map((r: ReleaseRequest) => (
                <ReleaseRequestRow key={r.id} request={r} />
              ))
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
