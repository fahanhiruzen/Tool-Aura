import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ToReviewRequest } from "@/api/types";

interface ToReviewSectionProps {
  items: ToReviewRequest[];
}

export function ToReviewSection({ items }: ToReviewSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
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

      {isOpen && (
        <div className="border-t px-5 pb-4">
          <p className="py-3 text-sm text-muted-foreground">
            Every release assigned to me for validation
          </p>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-muted-foreground">{item.assignedAt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isOpen && (
        <p className="px-5 pb-4 text-sm text-muted-foreground">
          Every release assigned to me for validation
        </p>
      )}
    </div>
  );
}

