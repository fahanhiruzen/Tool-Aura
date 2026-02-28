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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatUsername, formatRoleName } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useUserRequests,
  useUpdateUserRequest,
} from "@/hooks/use-user-management";
import type { IRequest } from "@/api/user-management";

const PAGE_SIZE = 5;

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

// ─── User Details Modal ───────────────────────────────────────────────────────

interface UserDetailsModalProps {
  request: IRequest;
  onClose: () => void;
}

function UserDetailsModal({ request, onClose }: UserDetailsModalProps) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border px-6 pb-6 pt-5 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="mb-4 text-lg font-semibold text-foreground pr-8">
          User details
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground font-medium">Username</dt>
            <dd className="mt-0.5 text-foreground">{formatUsername(request.username)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground font-medium">Email</dt>
            <dd className="mt-0.5 text-foreground">{request.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground font-medium">Role requested</dt>
            <dd className="mt-0.5">
              <Badge variant="secondary" className="text-xs font-normal">
                {formatRoleName(request.requestedRole)}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground font-medium">Status</dt>
            <dd className="mt-0.5">
              <RequestStatusBadge status={request.status} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground font-medium">Requested at</dt>
            <dd className="mt-0.5 text-foreground">
              {formatDate(request.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground font-medium">Last updated</dt>
            <dd className="mt-0.5 text-foreground">
              {formatDate(request.modifiedAt)}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground font-medium">Current roles</dt>
            <dd className="mt-0.5 flex flex-wrap gap-1">
              {request.currentRoles.length === 0 ? (
                <span className="text-muted-foreground">None</span>
              ) : (
                request.currentRoles.map((role) => (
                  <Badge
                    key={role.id}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {formatRoleName(role.name)}
                  </Badge>
                ))
              )}
            </dd>
          </div>
          {request.message != null && request.message !== "" && (
            <div className="col-span-2">
              <dt className="text-muted-foreground font-medium">Message</dt>
              <dd className="mt-0.5 text-foreground">{request.message}</dd>
            </div>
          )}
        </dl>
        <Button
          type="button"
          variant="outline"
          className="mt-5 w-full"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
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
            {formatRoleName(request.requestedRole)}
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
  const [userDetailRequest, setUserDetailRequest] =
    useState<IRequest | null>(null);
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
      <div className="flex-1 min-h-0 overflow-auto px-6 pt-3 pb-2">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[26%]">
                  User Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[44%]">
                  Role Requested
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[18%]">
                  Status
                </th>
                <th className="px-4 py-3 w-[12%]" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-6" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-5 w-36 rounded-full" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-3.5" />
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-destructive"
                  >
                    Failed to load role requests.
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No role requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const currentRoleNames =
                    req.currentRoles.map((r) => r.name).join(", ") || "None";
                  return (
                    <tr
                      key={req.requestId}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 min-w-0">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => setUserDetailRequest(req)}
                            className="text-left text-sm font-semibold text-primary hover:underline focus:outline-none focus:underline truncate"
                          >
                            {formatUsername(req.username)}
                          </button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground truncate">
                                ({req.currentRoles.length})
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[280px]">
                              <p className="font-medium mb-1">Current roles</p>
                              <p className="text-muted-foreground">
                                {currentRoleNames}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 min-w-0">
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal truncate max-w-full"
                        >
                          {formatRoleName(req.requestedRole)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <RequestStatusBadge status={req.status} />
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
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
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
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {userDetailRequest && (
        <UserDetailsModal
          request={userDetailRequest}
          onClose={() => setUserDetailRequest(null)}
        />
      )}

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
