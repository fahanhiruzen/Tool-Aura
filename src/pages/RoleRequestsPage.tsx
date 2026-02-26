import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardCheck,
  Check,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useUserRequests,
  useUpdateUserRequest,
} from "@/hooks/use-user-management";
import type { IRequest } from "@/api/user-management";

const PAGE_SIZE = 10;

type StatusFilter = "ALL" | "REQUESTED" | "APPROVED" | "REJECTED";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function RequestStatusBadge({
  status,
}: {
  status: IRequest["status"];
}) {
  const config = {
    REQUESTED: {
      label: "Requested",
      className:
        "border border-amber-300 bg-transparent text-amber-700 dark:text-amber-400",
    },
    APPROVED: {
      label: "Approved",
      className:
        "border border-emerald-300 bg-transparent text-emerald-700 dark:text-emerald-400",
    },
    REJECTED: {
      label: "Rejected",
      className:
        "border border-red-300 bg-transparent text-red-700 dark:text-red-400",
    },
  } as const;

  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={cn("font-normal text-xs", className)}>
      {label}
    </Badge>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

interface ReviewModalProps {
  request: IRequest;
  action: "APPROVED" | "REJECTED";
  onClose: () => void;
  onConfirm: (message: string) => void;
  isLoading?: boolean;
}

function ReviewModal({
  request,
  action,
  onClose,
  onConfirm,
  isLoading,
}: ReviewModalProps) {
  const [message, setMessage] = useState("");
  const isApprove = action === "APPROVED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[380px] rounded-2xl bg-card border border-border px-6 pb-6 pt-5 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm",
              isApprove
                ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30"
                : "border-red-200 bg-red-50 dark:bg-red-950/30"
            )}
          >
            {isApprove ? (
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>

        <h2 className="mb-1 text-base font-semibold text-foreground">
          {isApprove ? "Approve Request" : "Reject Request"}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{request.username}</span>{" "}
          is requesting the{" "}
          <span className="font-medium text-foreground">
            {request.requestedRole}
          </span>{" "}
          role.
        </p>

        <div className="mb-5 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Message{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <textarea
            rows={3}
            placeholder={
              isApprove
                ? "Add a note for the user..."
                : "Provide a reason for rejection..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(message)}
            disabled={isLoading}
            className={cn(
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            )}
          >
            {isLoading
              ? "Saving..."
              : isApprove
              ? "Approve"
              : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Requests Page ───────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Requested", value: "REQUESTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function RoleRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [reviewTarget, setReviewTarget] = useState<{
    request: IRequest;
    action: "APPROVED" | "REJECTED";
  } | null>(null);

  const { data, isLoading, isError } = useUserRequests({
    pageNumber: page - 1,
    pageSize: PAGE_SIZE,
    status: statusFilter === "ALL" ? null : statusFilter,
    search: search || undefined,
  });

  const updateRequest = useUpdateUserRequest();

  const requests = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  async function handleConfirm(message: string) {
    if (!reviewTarget) return;
    await updateRequest.mutateAsync({
      requestId: reviewTarget.request.requestId,
      data: { status: reviewTarget.action, message },
    });
    setReviewTarget(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage user role change requests.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shadow-sm">
          <ClipboardCheck className="h-5 w-5 text-foreground" />
        </div>
      </div>

      <hr className="mx-6 mt-5 border-border" />

      {/* Status Tabs */}
      <div className="flex items-center gap-1 px-6 pt-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-6 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by username or email"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pt-3 pb-2">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-36">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-36">
                  Requested Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Current Roles
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-28">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-28">
                  Date
                </th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-destructive"
                  >
                    Failed to load role requests.
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No role requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.requestId}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">
                        {req.username}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-muted-foreground">
                        {req.email}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {req.requestedRole}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {req.currentRoles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            None
                          </span>
                        ) : (
                          req.currentRoles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {role.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <RequestStatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(req.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      {req.status === "REQUESTED" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            aria-label="Approve"
                            onClick={() =>
                              setReviewTarget({
                                request: req,
                                action: "APPROVED",
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Reject"
                            onClick={() =>
                              setReviewTarget({
                                request: req,
                                action: "REJECTED",
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-6 py-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-foreground">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || data?.last}
          onClick={() => setPage((p) => p + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {reviewTarget && (
        <ReviewModal
          request={reviewTarget.request}
          action={reviewTarget.action}
          onClose={() => setReviewTarget(null)}
          onConfirm={handleConfirm}
          isLoading={updateRequest.isPending}
        />
      )}
    </div>
  );
}
