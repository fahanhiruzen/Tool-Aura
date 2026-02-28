import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToReviewTable } from "./ToReviewTable";
import { useListReleaseRequests } from "@/hooks/use-release-request";
import { useFigmaDataStore } from "@/stores";

const PAGE_SIZE = 5;

interface ToReviewSectionProps {
  onEdit?: (id: string) => void;
}

export function ToReviewSection({ onEdit }: ToReviewSectionProps) {
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
      iam: ["REVIEWER"],
    },
  });

  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div ref={sectionRef} className="rounded-xl border bg-card shadow-sm">
      {/* Header + subtitle — always visible */}
      <div className="px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold">To review</span>
            <Badge variant="warning" className="rounded-full font-medium gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Assigned to me
            </Badge>
            <span className="text-sm text-muted-foreground">{totalElements}</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <p className="mt-1 text-sm text-muted-foreground">
          Every release assigned to me for validation
        </p>
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t px-5 pb-5 pt-4">
          <ToReviewTable
            items={items}
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
