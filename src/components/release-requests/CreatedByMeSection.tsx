import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReleaseRequestsTable } from "./ReleaseRequestsTable";
import type { ReleaseRequest } from "@/api/types";

interface CreatedByMeSectionProps {
  requests: ReleaseRequest[];
}

export function CreatedByMeSection({ requests }: CreatedByMeSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
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
          <ReleaseRequestsTable requests={requests} />
        </div>
      )}
    </div>
  );
}
