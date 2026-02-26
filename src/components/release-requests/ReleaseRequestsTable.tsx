import { useState, useMemo } from "react";
import { Search, Pencil, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ReleaseStatusBadge } from "./ReleaseStatusBadge";
import type { ReleaseRequest } from "@/api/types";
import { cn } from "@/lib/utils";

const PROGRESS_COLOR: Record<string, string> = {
  "Release Created": "text-emerald-600",
  Ready: "text-emerald-600",
  "Waiting for Review": "text-amber-600",
};

interface ReleaseRequestRowProps {
  request: ReleaseRequest;
}

function ReleaseRequestRow({ request }: ReleaseRequestRowProps) {
  const hasLink = request.domainName !== null;
  const progressColor =
    PROGRESS_COLOR[request.progress] ?? "text-muted-foreground";

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

      {/* Progress */}
      <td className={cn("px-4 py-3 text-sm font-medium", progressColor)}>
        {request.progress}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <ReleaseStatusBadge status={request.status} />
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-right">
        {hasLink ? (
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Open
          </button>
        ) : (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}

type SortKey = "document" | "createdAt" | "progress" | "status";
type SortDir = "asc" | "desc";

interface ReleaseRequestsTableProps {
  requests: ReleaseRequest[];
}

export function ReleaseRequestsTable({ requests }: ReleaseRequestsTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter(
      (r) =>
        r.document.toLowerCase().includes(q) ||
        (r.domainName?.toLowerCase().includes(q) ?? false) ||
        r.progress.toLowerCase().includes(q)
    );
  }, [requests, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

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
          onChange={(e) => setSearch(e.target.value)}
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
                  Created at
                  <HelpCircle className="ml-1 h-3 w-3" />
                  <SortIcon col="createdAt" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground"
                  onClick={() => handleSort("progress")}
                >
                  Progress <SortIcon col="progress" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground"
                  onClick={() => handleSort("status")}
                >
                  Status <SortIcon col="status" />
                </button>
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No release requests found.
                </td>
              </tr>
            ) : (
              sorted.map((r) => <ReleaseRequestRow key={r.id} request={r} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
