import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ToReviewTable } from "./ToReviewTable";
import type { ReleaseRequestItem } from "@/api/release-request";

interface ToReviewSectionProps {
  items: ReleaseRequestItem[];
}

export function ToReviewSection({ items }: ToReviewSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Header + subtitle — always visible */}
      <div className="px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold">To review</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Assigned to me
            </span>
            <span className="text-sm text-muted-foreground">{items.length}</span>
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
          <ToReviewTable items={items} />
        </div>
      )}
    </div>
  );
}
