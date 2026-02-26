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
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <span className="text-base font-semibold">Created by me</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="border-t px-5 pb-5">
          <p className="py-3 text-sm text-muted-foreground">
            Every release request I created
          </p>
          <ReleaseRequestsTable requests={requests} />
        </div>
      )}

      {!isOpen && (
        <p className="px-5 pb-4 text-sm text-muted-foreground">
          Every release request I created
        </p>
      )}
    </div>
  );
}
