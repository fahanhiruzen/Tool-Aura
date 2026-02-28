import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  XCircle,
  Copy,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { releaseRequestApi } from "@/api/release-request";
import type { ValidationResult } from "@/api/release-request";

export interface ValidationIssuesScreenProps {
  result: ValidationResult;
  requestId: string;
  onBack: () => void;
  onResultUpdate: (result: ValidationResult, requestId: string) => void;
}

export function ValidationIssuesScreen({
  result,
  requestId,
  onBack,
  onResultUpdate,
}: ValidationIssuesScreenProps) {
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(
    new Set(result.ignoredIds ?? [])
  );
  const [revalidating, setRevalidating] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const allIds = result.invalidElements.map((el) => el.uniqueId);
  const allIgnored = allIds.length > 0 && allIds.every((id) => ignoredIds.has(id));
  const errors = result.invalidElements.filter((el) => el.messageType === "ERROR");
  const warnings = result.invalidElements.filter((el) => el.messageType === "WARNING");
  const sorted = [...errors, ...warnings];

  const hasDocumentIssues =
    (result.documentErrors?.length ?? 0) > 0 ||
    (result.documentWarnings?.length ?? 0) > 0;

  function toggleIgnore(uniqueId: string) {
    setIgnoredIds((prev) => {
      const next = new Set(prev);
      if (next.has(uniqueId)) next.delete(uniqueId);
      else next.add(uniqueId);
      return next;
    });
  }

  function toggleIgnoreAll() {
    if (allIgnored) setIgnoredIds(new Set());
    else setIgnoredIds(new Set(allIds));
  }

  function toggleExpanded(uniqueId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uniqueId)) next.delete(uniqueId);
      else next.add(uniqueId);
      return next;
    });
  }

  function expandAll() {
    setExpandedIds(new Set(sorted.map((el) => el.uniqueId)));
  }

  function collapseAll() {
    setExpandedIds(new Set());
  }

  async function handleRevalidate() {
    setRevalidating(true);
    try {
      const [, newResult] = await Promise.all([
        releaseRequestApi.getDetails(requestId),
        releaseRequestApi.validate(requestId, Array.from(ignoredIds)),
      ]);
      releaseRequestApi.getValidationResults(requestId).catch(() => {});
      onResultUpdate(newResult, requestId);
      if (!newResult.hasErrors) onBack();
    } finally {
      setRevalidating(false);
    }
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center rounded-lg p-2 hover:bg-muted transition-colors -ml-1"
          aria-label="Back to validation"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Validation Issues</h1>
      </header>

      {/* Summary — single line, compact */}
      <div className="px-4 py-2 border-b border-border bg-muted/20 shrink-0">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto min-h-0">
          {/* Stats */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 rounded-md border border-emerald-200/60 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/30 px-2 py-1">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {result.totalPassingElements}
                </span>
                <span className="text-[10px] font-medium text-emerald-600/90 dark:text-emerald-400/90">
                  Passing
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-amber-200/60 bg-amber-50/80 dark:border-amber-800/50 dark:bg-amber-950/30 px-2 py-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-300">
                  {result.totalWarningElements}
                </span>
                <span className="text-[10px] font-medium text-amber-600/90 dark:text-amber-400/90">
                  Warnings
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-red-200/60 bg-red-50/80 dark:border-red-800/50 dark:bg-red-950/30 px-2 py-1">
              <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold tabular-nums text-red-700 dark:text-red-300">
                  {result.totalErrorElements}
                </span>
                <span className="text-[10px] font-medium text-red-600/90 dark:text-red-400/90">
                  Errors
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 w-px h-4 bg-border rounded-full" aria-hidden />
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ChevronsDownUp className="h-3 w-3" />
              Expand all
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ChevronsUpDown className="h-3 w-3" />
              Collapse all
            </button>
          </div>
          <button
            type="button"
            onClick={toggleIgnoreAll}
            className="flex items-center rounded px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-colors ml-auto shrink-0 whitespace-nowrap"
          >
            {allIgnored ? "Unignore all" : "Ignore all"}
          </button>
        </div>
      </div>

      {/* Document-level issues (if any) */}
      {hasDocumentIssues && (
        <div className="px-4 py-2 border-b border-border bg-amber-50 dark:bg-amber-950/20">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            {(result.documentErrors?.length ?? 0) > 0 && (
              <>{(result.documentErrors as unknown[]).length} document error(s).</>
            )}
            {(result.documentWarnings?.length ?? 0) > 0 && (
              <> {(result.documentWarnings as unknown[]).length} document warning(s).</>
            )}
          </p>
        </div>
      )}

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Check className="h-10 w-10 text-emerald-500 dark:text-emerald-400 mb-3" />
            <p className="text-sm font-medium text-foreground">No validation issues</p>
            <p className="text-xs text-muted-foreground mt-1">
              All elements passed or have been ignored.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sorted.map((el) => {
              const isIgnored = ignoredIds.has(el.uniqueId);
              const isExpanded = expandedIds.has(el.uniqueId);
              const firstMessage = el.messages[0]?.message ?? "";
              const preview = firstMessage.split(/\r?\n/)[0]?.slice(0, 80) ?? "";
              const isError = el.messageType === "ERROR";

              return (
                <li key={el.uniqueId}>
                  <div
                    className={cn(
                      "border-l-4 transition-colors",
                      isError
                        ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
                        : "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10",
                      isIgnored && "opacity-60"
                    )}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(el.uniqueId)}
                          className="flex-1 min-w-0 text-left group"
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                isError
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                              )}
                            >
                              {el.messageType === "ERROR" ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                              {el.messageType}
                            </span>
                            <code className="text-xs font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded">
                              {el.uniqueId}
                            </code>
                            
                          </div>
                          {!isExpanded && preview && (
                            <p
                              className={cn(
                                "mt-1.5 text-xs line-clamp-2",
                                isError
                                  ? "text-red-700 dark:text-red-300"
                                  : "text-amber-800 dark:text-amber-200"
                              )}
                            >
                              {preview}
                              {firstMessage.length > 80 ? "…" : ""}
                            </p>
                          )}
                          <div className="mt-1.5 flex items-center gap-1 text-muted-foreground">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 group-hover:text-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 group-hover:text-foreground" />
                            )}
                            <span className="text-[10px]">
                              {el.messages.length} {el.messages.length === 1 ? "message" : "messages"}
                            </span>
                          </div>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(el.uniqueId)}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Copy ID"
                            aria-label="Copy element ID"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <Button
                            type="button"
                            variant={isIgnored ? "secondary" : "outline"}
                            size="sm"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleIgnore(el.uniqueId);
                            }}
                          >
                            {isIgnored ? "Unignore" : "Ignore"}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded messages */}
                      {isExpanded && (
                        <div className="mt-4 pl-2 space-y-3 border-l-2 border-border/60 ml-1">
                          {el.messages.map((msg, i) => {
                            const lines = msg.message.split(/\r?\n/).filter(Boolean);
                            const msgIsError = msg.messageType === "ERROR";
                            return (
                              <div
                                key={i}
                                className={cn(
                                  "rounded-md px-3 py-2 text-xs",
                                  msgIsError
                                    ? "bg-red-100/80 dark:bg-red-900/30 text-red-900 dark:text-red-200"
                                    : "bg-amber-100/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200"
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    {lines.length > 0 ? (
                                      lines.map((line, j) => (
                                        <span key={j} className="leading-relaxed">
                                          {line}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="leading-relaxed">
                                        {msg.message || "\u00A0"}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(msg.message)}
                                    className="p-1 rounded shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                                    title="Copy message"
                                    aria-label="Copy message"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 py-3 border-t border-border bg-muted/20 shrink-0">
        <Button
          className="w-full gap-2"
          disabled={revalidating || ignoredIds.size === 0}
          onClick={handleRevalidate}
        >
          {revalidating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Re-validating…
            </>
          ) : (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              Re-validate {ignoredIds.size > 0 && `(${ignoredIds.size} ignored)`}
            </>
          )}
        </Button>
        {ignoredIds.size === 0 && sorted.length > 0 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Ignore at least one issue to re-validate
          </p>
        )}
      </footer>
    </div>
  );
}
