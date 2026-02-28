import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReleaseRequestsTable } from "./ReleaseRequestsTable";
import { useListReleaseRequests } from "@/hooks/use-release-request";
import { useFigmaDataStore } from "@/stores";
import type { ReleaseRequestItem, RequestStatusType } from "@/api/release-request";
import type { ReleaseRequest as UIReleaseRequest, ReleaseProgress } from "@/api/types";

const PAGE_SIZE = 5;

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
    documentKey: item.documentKey || null,
    domainName: item.domainId || null,
    createdAt: item.createdAt,
    progress: statusToProgress(item.status),
    status: item.status === "COMPLETED" ? "completed" : "in_progress",
    reviewers: item.reviewers ?? [],
  };
}

interface CreatedByMeSectionProps {
  onEdit?: (id: string) => void;
}

export function CreatedByMeSection({ onEdit }: CreatedByMeSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const currentDocumentKey = useFigmaDataStore((x) => x.data?.fileId ?? "");
  const sectionRef = useRef<HTMLDivElement>(null);

  function handlePageChange(p: number) {
    setPage(p);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const { data, isLoading, isFetching } = useListReleaseRequests({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    currentDocumentKey,
    filter: {
      documentKey: "",
      iam: ["CREATOR"],
    },
  });

  const requests: UIReleaseRequest[] = data?.content
    ? data.content.map(mapItemToUIReleaseRequest)
    : [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div ref={sectionRef} className="rounded-xl border bg-card shadow-sm">
      {/* Header + subtitle — always visible */}
      <div className="px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between"
        >
          <span className="text-base font-semibold">Created by me</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <p className="mt-1 text-sm text-muted-foreground">
          Every release request I created
        </p>
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t px-5 pb-5 pt-4">
          <ReleaseRequestsTable
            requests={requests}
            onEdit={onEdit}
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </div>
      )}
    </div>
  );
}
