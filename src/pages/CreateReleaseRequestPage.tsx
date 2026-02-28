import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigationStore } from "@/stores";
import { useReleaseProcesses } from "@/hooks/use-release-request";
import type { ReleaseProcess } from "@/api/release-request";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StepStatus = "ready" | "open";

interface Step {
  number: number;
  title: string;
  status: StepStatus;
  description: string;
  showHistoryIcon: boolean;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Release Validation",
    status: "ready",
    description: "Choose a process type and validate for errors",
    showHistoryIcon: true,
  },
  {
    number: 2,
    title: "Review",
    status: "open",
    description: "Choose a person to review the release before publishing.",
    showHistoryIcon: true,
  },
  {
    number: 3,
    title: "Create Release",
    status: "open",
    description: "Add release notes and create the reviewed release.",
    showHistoryIcon: false,
  },
];

// ---------------------------------------------------------------------------
// ReadyBadge
// ---------------------------------------------------------------------------

function ReadyBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Ready
    </span>
  );
}

// ---------------------------------------------------------------------------
// ProcessSelect — custom searchable select
// ---------------------------------------------------------------------------

interface ProcessSelectProps {
  processes: ReleaseProcess[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
}

function ProcessSelect({ processes, value, onChange, loading }: ProcessSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = processes.find((p) => String(p.id) === value);
  const filtered = processes.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function openDropdown() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
    setOpen(true);
  }

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={loading}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn(!selected && "text-muted-foreground")}>
          {loading ? "Loading…" : selected ? selected.name : "Select a process…"}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown panel — rendered via fixed position to escape overflow:hidden */}
      {open && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="rounded-md border border-border bg-popover shadow-md"
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* List */}
          <ul className="max-h-52 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-2 py-6 text-center text-xs text-muted-foreground">
                No processes found.
              </li>
            ) : (
              filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(String(p.id));
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>{p.name}</span>
                    {String(p.id) === value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StepCard
// ---------------------------------------------------------------------------

interface StepCardProps {
  step: Step;
  isExpanded: boolean;
  onToggle: () => void;
  isFirst: boolean;
  expandedContent?: React.ReactNode;
}

function StepCard({ step, isExpanded, onToggle, isFirst, expandedContent }: StepCardProps) {
  const isReady = step.status === "ready";

  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-sm overflow-hidden",
        isFirst ? "border-border" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        {/* Step number */}
        <span
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            isReady
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground"
          )}
        >
          {step.number}
        </span>

        {/* Title + status + description */}
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-semibold",
                isReady ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
            {isReady ? (
              <ReadyBadge />
            ) : (
              <span className="text-xs text-muted-foreground">Open</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            {step.description}
          </p>
        </div>

        {/* Right icons */}
        <div className="flex flex-shrink-0 items-center gap-2 text-muted-foreground">
          {step.showHistoryIcon && (
            <RotateCcw className="h-4 w-4" />
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
          {expandedContent ?? (
            <>
              {step.number === 2 && (
                <p>Add a reviewer who will validate this release before it is published.</p>
              )}
              {step.number === 3 && (
                <p>Provide release notes and finalize the release once the review is complete.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CreateReleaseRequestPage() {
  const setActive = useNavigationStore((s) => s.setActive);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [selectedProcessId, setSelectedProcessId] = useState<string>("");
  const { data: processesData, isLoading: processesLoading } = useReleaseProcesses();

  // Auto-select the "Default" process once data loads
  useEffect(() => {
    if (!processesData || selectedProcessId) return;
    const defaultProcess = processesData.content.find(
      (p) => p.name.toLowerCase() === "default"
    );
    if (defaultProcess) {
      setSelectedProcessId(String(defaultProcess.id));
    }
  }, [processesData, selectedProcessId]);

  const now = new Date();
  const dateString = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeString = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function toggleStep(num: number) {
    setExpandedStep((prev) => (prev === num ? null : num));
  }

  const selectedProcess = processesData?.content.find(
    (p) => String(p.id) === selectedProcessId
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            New Release Request
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            [Document Name] – [Domain Name] &nbsp;|&nbsp; {dateString},{" "}
            {timeString}
          </p>
        </div>
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setActive("release")}
        >
          <Check className="h-4 w-4" />
          Done
        </Button>
      </div>

      <hr className="mx-6 mt-4 border-border" />

      {/* Steps */}
      <div className="flex flex-col gap-3 px-6 py-5">
        {STEPS.map((step, i) => (
          <StepCard
            key={step.number}
            step={step}
            isExpanded={expandedStep === step.number}
            onToggle={() => toggleStep(step.number)}
            isFirst={i === 0}
            expandedContent={
              step.number === 1 ? (
                <div className="flex flex-col gap-3">
                  <p>Select a process type and run validation to check for errors before proceeding.</p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Release Process
                    </label>
                    <ProcessSelect
                      processes={processesData?.content ?? []}
                      value={selectedProcessId}
                      onChange={setSelectedProcessId}
                      loading={processesLoading}
                    />
                    {selectedProcess?.description && (
                      <p className="text-xs text-muted-foreground">
                        {selectedProcess.description}
                      </p>
                    )}
                  </div>
                </div>
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
