import {
  ReleaseRequestsHeader,
  ToReviewSection,
  CreatedByMeSection,
} from "@/components/release-requests";
import { useListReleaseRequests } from "@/hooks/use-release-request";
import type { ReleaseRequestItem, RequestStatusType } from "@/api/release-request";
import type {
  ReleaseRequest as UIReleaseRequest,
  ReleaseProgress,
} from "@/api/types";

// ---------------------------------------------------------------------------
// Mappers: API types → UI types
// ---------------------------------------------------------------------------

function formatDisplayDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function statusToProgress(status: RequestStatusType): ReleaseProgress {
  switch (status) {
    case "COMPLETED":
      return "Release Created";
    case "REVIEW":
      return "Waiting for Review";
    default:
      return "Ready";
  }
}

function mapItemToUIReleaseRequest(item: ReleaseRequestItem): UIReleaseRequest {
  const documentLabel = item.documentKey
    ? item.documentKey.length > 16
      ? `${item.documentKey.slice(0, 13)}...`
      : item.documentKey
    : "[No document]";
  return {
    id: item.id,
    document: documentLabel,
    domainName: item.domainId || null,
    createdAt: formatDisplayDate(item.createdAt),
    progress: statusToProgress(item.status),
    status: item.status === "COMPLETED" ? "completed" : "in_progress",
    reviewers: item.reviewers ?? [],
  };
}

// ---------------------------------------------------------------------------
// Page — fetch all data; search/sort/pagination handled client-side in tables
// ---------------------------------------------------------------------------

const FETCH_ALL_SIZE = 500;

export function ReleaseRequestsPage() {
  const currentDocumentKey = "f1r6GcNUhZWol5fpQQnM3u";

  const toReviewQuery = useListReleaseRequests({
    pageNumber: 0,
    pageSize: FETCH_ALL_SIZE,
    currentDocumentKey,
    filter: {
      documentKey: "",
      iam: ["REVIEWER"],
    },
  });

  const createdByMeQuery = useListReleaseRequests({
    pageNumber: 0,
    pageSize: FETCH_ALL_SIZE,
    currentDocumentKey,
    filter: {
      documentKey: "",
      iam: ["CREATOR"],
    },
  });

  const toReview: ReleaseRequestItem[] = toReviewQuery.data?.content ?? [];

  const createdByMe: UIReleaseRequest[] = createdByMeQuery.data?.content
    ? createdByMeQuery.data.content.map(mapItemToUIReleaseRequest)
    : [];

  const isLoading = toReviewQuery.isLoading || createdByMeQuery.isLoading;
  const isError = toReviewQuery.isError || createdByMeQuery.isError;
  const errorMessage =
    toReviewQuery.error instanceof Error
      ? toReviewQuery.error.message
      : createdByMeQuery.error instanceof Error
        ? createdByMeQuery.error.message
        : "Failed to load release requests.";

  if (isError) {
    return (
      <div className="flex flex-col">
        <ReleaseRequestsHeader />
        <hr className="mx-6 mt-4 border-border" />
        <div className="px-6 py-4">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <ReleaseRequestsHeader />
        <hr className="mx-6 mt-4 border-border" />
        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="rounded-xl border bg-card shadow-sm px-5 pt-4 pb-3">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="rounded-xl border bg-card shadow-sm px-5 pt-4 pb-3">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-56 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ReleaseRequestsHeader />
      <hr className="mx-6 mt-4 border-border" />
      <div className="flex flex-col gap-4 px-6 py-4">
        <ToReviewSection items={toReview} />
        <CreatedByMeSection requests={createdByMe} />
      </div>
    </div>
  );
}
