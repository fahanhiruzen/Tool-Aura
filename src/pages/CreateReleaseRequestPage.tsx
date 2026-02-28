import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Search,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatUsername } from "@/lib/utils";
import { useNavigationStore } from "@/stores";
import { useReleaseProcesses } from "@/hooks/use-release-request";
import { releaseRequestApi } from "@/api/release-request";
import type {
  ReleaseProcess,
  ReleaseRequestStep,
  ValidationResult,
} from "@/api/release-request";
import { usePluginSetup } from "@/hooks/use-plugin-setup";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ValidationIssuesScreen } from "@/components/ValidationIssuesScreen";
import { userManagementApi } from "@/api/user-management";
import type { ICurrentUser } from "@/api/user-management";
import { presetApi } from "@/api/preset";
import type { IPreset } from "@/api/preset";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StepStatus = "ready" | "open" | "failed";

interface Step {
  number: number;
  title: string;
  status: StepStatus;
  description: string;
  showHistoryIcon: boolean;
}

// API may return steps in any order (e.g. RELEASE, REVIEW, VALIDATION); we map by stepType.
const STEP_TYPES: Array<"VALIDATION" | "REVIEW" | "RELEASE"> = [
  "VALIDATION",
  "REVIEW",
  "RELEASE",
];

const STEPS_TEMPLATE: Omit<Step, "status">[] = [
  {
    number: 1,
    title: "Release Validation",
    description: "Choose a process type and validate for errors",
    showHistoryIcon: true,
  },
  {
    number: 2,
    title: "Review",
    description: "Choose a person to review the release before publishing.",
    showHistoryIcon: true,
  },
  {
    number: 3,
    title: "Create Release",
    description: "Add release notes and create the reviewed release.",
    showHistoryIcon: false,
  },
];

// ---------------------------------------------------------------------------
// Step badges (driven by API step status)
// ---------------------------------------------------------------------------

function DoneBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Done
    </span>
  );
}

function InProgressBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      In Progress
    </span>
  );
}

function PendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      Pending
    </span>
  );
}

function FailedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Failed
    </span>
  );
}

function StepBadge({
  status,
  isCurrentStep,
}: {
  status: StepStatus;
  isCurrentStep: boolean;
}) {
  if (status === "ready") return <DoneBadge />;
  if (status === "failed") return <FailedBadge />;
  if (status === "open" && isCurrentStep) return <InProgressBadge />;
  return <PendingBadge />;
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

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <div className="relative w-full">
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
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="rounded-md border border-border bg-popover shadow-md"
        >
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
// ReviewerSelect — multi-select for users and user groups (presets)
// ---------------------------------------------------------------------------

export interface SelectedPreset {
  id: string;
  name: string;
  memberCount: number;
}

interface ReviewerSelectProps {
  value: string[];
  onChange: (emails: string[]) => void;
  selectedPresets: SelectedPreset[];
  onPresetsChange: (presets: SelectedPreset[]) => void;
  disabled?: boolean;
}

const SEARCH_DEBOUNCE_MS = 300;
const USERS_PAGE_SIZE = 20;
const PRESETS_PAGE_SIZE = 20;

function ReviewerSelect({
  value,
  onChange,
  selectedPresets,
  onPresetsChange,
  disabled,
}: ReviewerSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["reviewer-users", debouncedSearch],
    queryFn: () =>
      userManagementApi.getUsers(
        0,
        USERS_PAGE_SIZE,
        null,
        debouncedSearch || undefined
      ),
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const { data: presetsData, isLoading: presetsLoading } = useQuery({
    queryKey: ["reviewer-presets", debouncedSearch],
    queryFn: () =>
      presetApi.fetchPresets({
        pageNumber: 0,
        pageSize: PRESETS_PAGE_SIZE,
        sort: "ASC",
        searchName: debouncedSearch,
        searchUsername: "",
        searchEmail: "",
      }),
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const users = usersData?.content ?? [];
  const presets = presetsData?.content ?? [];
  const loading = usersLoading || presetsLoading;

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onScroll(e: Event) {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setSearch("");
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !dropdownRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const GAP = 4;
    const MARGIN = 8;
    const spaceBelow = window.innerHeight - rect.bottom - GAP;
    const top =
      spaceBelow >= dropdownHeight + MARGIN
        ? rect.bottom + GAP
        : rect.top - dropdownHeight - GAP;
    setDropdownStyle({
      position: "fixed",
      top,
      left: rect.left,
      width: Math.max(rect.width, 320),
      zIndex: 9999,
    });
  }, [open]);

  function openDropdown() {
    setOpen(true);
  }

  function addUser(user: ICurrentUser) {
    const email = user.email?.trim();
    if (email && !value.includes(email)) onChange([...value, email]);
    setOpen(false);
  }

  async function addPreset(preset: IPreset) {
    let memberCount = preset.members?.length ?? 0;
    if (memberCount === 0) {
      setLoadingPreset(preset.id);
      try {
        const full = await presetApi.getById(preset.id);
        memberCount = (full.members ?? []).length;
      } catch {
        setLoadingPreset(null);
        return;
      } finally {
        setLoadingPreset(null);
      }
    }
    if (selectedPresets.some((p) => p.id === preset.id)) return;
    onPresetsChange([
      ...selectedPresets,
      { id: preset.id, name: preset.name, memberCount },
    ]);
    setOpen(false);
  }

  function removeEmail(email: string) {
    onChange(value.filter((e) => e !== email));
  }

  function removePreset(id: string) {
    onPresetsChange(selectedPresets.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {(value.length > 0 || selectedPresets.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
            >
              <User className="h-3 w-3 shrink-0 text-muted-foreground" />
              {email}
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="rounded p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${email}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedPresets.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs shadow-sm"
            >
              <Users className="h-3.5 w-3.5 shrink-0 text-primary/80" />
              <span className="font-medium text-foreground">{p.name}</span>
              <span className="text-muted-foreground">
                {p.memberCount} {p.memberCount === 1 ? "user" : "users"}
              </span>
              <button
                type="button"
                onClick={() => removePreset(p.id)}
                className="rounded p-0.5 hover:bg-muted"
                aria-label={`Remove group ${p.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-muted-foreground">
          {loading ? "Loading…" : "Select users or groups…"}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="rounded-md border border-border bg-popover shadow-md"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users or groups…"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto p-1">
          {presets.length > 0 && (
              <>
                <li className="sticky top-0 z-10 flex items-center gap-2 bg-muted/80 px-2 py-1.5 text-xs font-semibold text-foreground backdrop-blur-sm mt-1 first:mt-0">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  User groups
                </li>
                {presets.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => addPreset(p)}
                      disabled={loadingPreset === p.id}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 pl-6 text-sm text-left hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                    >
                      <Users className="h-3.5 w-3.5 shrink-0 text-primary/80" />
                      <span>{p.name}</span>
                      {loadingPreset === p.id && (
                        <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                      )}
                    </button>
                  </li>
                ))}
              </>
            )}
            {users.length > 0 && (
              <>
                <li className="sticky top-0 z-10 flex items-center gap-2 bg-muted/80 px-2 py-1.5 text-xs font-semibold text-foreground backdrop-blur-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Users
                </li>
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => addUser(u)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 pl-6 text-sm text-left hover:bg-accent hover:text-accent-foreground"
                    >
                      <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground font-size-4" />
                      <span>{formatUsername(u.username??u.email)}</span>
                      {u.email && (
                        <span className="text-muted-foreground"> - {u.email}</span>
                      )}
                    </button>
                  </li>
                ))}
              </>
            )}
            
            {!loading && users.length === 0 && presets.length === 0 && (
              <li className="px-2 py-6 text-center text-xs text-muted-foreground">
                {debouncedSearch
                  ? "No users or groups found."
                  : "Type to search users or groups."}
              </li>
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
  canExpand: boolean;
  isCurrentStep: boolean;
  expandedContent?: React.ReactNode;
}

function StepCard({
  step,
  isExpanded,
  onToggle,
  isFirst,
  canExpand,
  isCurrentStep,
  expandedContent,
}: StepCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-sm overflow-hidden",
        isFirst ? "border-border" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={() => canExpand && onToggle()}
        disabled={!canExpand}
        className={cn(
          "flex w-full items-center gap-4 px-5 py-4 text-left transition-colors",
          canExpand ? "hover:bg-muted/30 cursor-pointer" : "cursor-not-allowed opacity-60"
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            isExpanded
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-muted text-black dark:text-white"
          )}
        >
          {step.number}
        </span>
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-black dark:text-white">
              {step.title}
            </span>
            <StepBadge status={step.status} isCurrentStep={isCurrentStep} />
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            {step.description}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 text-muted-foreground">
          {step.showHistoryIcon && <RotateCcw className="h-4 w-4" />}
          {canExpand &&
            (isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            ))}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
          {expandedContent ?? (
            <>
              {step.number === 2 && (
                <p>Add a reviewer who will validate this release before it is published.</p>
              )}
              {step.number === 3 && (
                <p>
                  Provide release notes and finalize the release once the review is
                  complete.
                </p>
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

type ValidateStatus = "idle" | "loading" | "done" | "error";

interface ValidateState {
  status: ValidateStatus;
  requestId: string | null;
  result: ValidationResult | null;
  error: string | null;
}

function stepStatusFromApi(apiStatus: ReleaseRequestStep["status"]): StepStatus {
  if (apiStatus === "DONE") return "ready";
  if (apiStatus === "FAILED") return "failed";
  return "open";
}

function buildStepsWithStatus(
  requestId: string | null,
  stepsFromApi: ReleaseRequestStep[] | null
): Step[] {
  return STEPS_TEMPLATE.map((t) => {
    if (!requestId || !stepsFromApi?.length) {
      return { ...t, status: "open" as StepStatus };
    }
    const stepType = STEP_TYPES[t.number - 1];
    const apiStep = stepsFromApi.find((s) => s.stepType === stepType);
    const status = apiStep ? stepStatusFromApi(apiStep.status) : "open";
    return { ...t, status };
  });
}

export function CreateReleaseRequestPage({ requestId }: { requestId?: string }) {
  const isEditMode = !!requestId;
  const setActive = useNavigationStore((s) => s.setActive);
  const [expandedStep, setExpandedStep] = useState<number | null>(isEditMode ? null : 1);
  const [selectedProcessId, setSelectedProcessId] = useState<string>("");
  const [editProcessName, setEditProcessName] = useState<string>("");
  const [editDomainId, setEditDomainId] = useState<string>("");
  const [validateState, setValidateState] = useState<ValidateState>({
    status: "idle",
    requestId: null,
    result: null,
    error: null,
  });
  const [showIssues, setShowIssues] = useState(false);
  const [stepsFromApi, setStepsFromApi] = useState<ReleaseRequestStep[] | null>(null);
  const [selectedReviewerEmails, setSelectedReviewerEmails] = useState<string[]>([]);
  const [selectedPresets, setSelectedPresets] = useState<SelectedPreset[]>([]);
  const [assignReviewersLoading, setAssignReviewersLoading] = useState(false);
  const [assignReviewersError, setAssignReviewersError] = useState<string | null>(null);
  const [reviewersAssigned, setReviewersAssigned] = useState(false);

  const { data: processesData, isLoading: processesLoading } = useReleaseProcesses();
  const { cddbDocument } = usePluginSetup();

  // In edit mode: load the existing release request details and steps on mount
  useEffect(() => {
    if (!requestId) return;
    async function initEditMode() {
      try {
        const [details, steps] = await Promise.all([
          releaseRequestApi.getDetails(requestId!),
          releaseRequestApi.getSteps(requestId!),
        ]);
        setEditProcessName(details.releaseProcessName ?? "");
        setEditDomainId(details.domainId ?? "");
        setStepsFromApi(steps ?? null);

        // Pre-populate existing reviewers
        const reviewerEmails = (details.reviewers ?? [])
          .map((r) => r.userEmail)
          .filter(Boolean);
        if (reviewerEmails.length > 0) {
          setSelectedReviewerEmails(reviewerEmails);
        }
        const validationStep = steps?.find((s) => s.stepType === "VALIDATION");
        const reviewStep = steps?.find((s) => s.stepType === "REVIEW");
        if (validationStep?.status === "DONE") {
          setValidateState({
            status: "done",
            requestId: requestId!,
            result: { hasErrors: false, invalidElements: [], documentErrors: [], documentWarnings: [], totalErrorElements: 0, totalPassingElements: 0, totalWarningElements: 0 },
            error: null,
          });
          setExpandedStep(reviewStep?.status === "DONE" ? 3 : 2);
        } else if (validationStep?.status === "FAILED") {
          const validationResult = await releaseRequestApi.getValidationResults(requestId!).catch(() => null);
          setValidateState({
            status: "error",
            requestId: requestId!,
            result: validationResult,
            error: null,
          });
          setExpandedStep(1);
        } else {
          setValidateState({ status: "idle", requestId: requestId!, result: null, error: null });
          setExpandedStep(1);
        }
      } catch {
        // fall through to default empty state
      }
    }
    initEditMode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const steps = buildStepsWithStatus(validateState.requestId, stepsFromApi);

  async function fetchSteps(requestId: string) {
    try {
      const data = await releaseRequestApi.getSteps(requestId);
      setStepsFromApi(data ?? null);
    } catch {
      setStepsFromApi(null);
    }
  }

  useEffect(() => {
    if (validateState.requestId) {
      fetchSteps(validateState.requestId);
    } else {
      setStepsFromApi(null);
      setReviewersAssigned(false);
    }
  }, [validateState.requestId]);

  const STEPS_POLL_INTERVAL_MS = 500;

  useEffect(() => {
    if (!validateState.requestId || !reviewersAssigned) return;
    const requestId = validateState.requestId;
    const intervalId = setInterval(() => {
      fetchSteps(requestId);
    }, STEPS_POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [validateState.requestId, reviewersAssigned]);

  useEffect(() => {
    if (!processesData || selectedProcessId) return;
    const defaultProcess = processesData.content.find(
      (p) => p.name.toLowerCase() === "default"
    );
    if (defaultProcess) {
      setSelectedProcessId(String(defaultProcess.id));
    }
  }, [processesData, selectedProcessId]);

  const hasPassed =
    validateState.status === "done" &&
    validateState.result?.hasErrors === false;

  useEffect(() => {
    if (hasPassed && validateState.requestId) {
      const reviewDone = stepsFromApi?.find((s) => s.stepType === "REVIEW")?.status === "DONE";
      if (!reviewDone) setExpandedStep(2);
    }
  }, [hasPassed, validateState.requestId, stepsFromApi]);

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

  async function handleValidate() {
    if (isEditMode && requestId) {
      // Edit mode: validate the existing request without creating a new one
      setValidateState({ status: "loading", requestId, result: null, error: null });
      try {
        const validationResult = await releaseRequestApi.validate(requestId, []);
        setValidateState({
          status: validationResult.hasErrors ? "error" : "done",
          requestId,
          result: validationResult,
          error: null,
        });
        await fetchSteps(requestId);
      } catch {
        // silent fail
      }
      return;
    }

    // Create mode: create a new request then validate
    if (!selectedProcessId || !cddbDocument?.documentKey) return;
    setValidateState({ status: "loading", requestId: null, result: null, error: null });
    try {
      const created = await releaseRequestApi.create({
        documentKey: cddbDocument.documentKey,
        releaseProcessId: selectedProcessId,
      });
      const newRequestId = String(created.id);

      const [, validationResult] = await Promise.all([
        releaseRequestApi.getDetails(newRequestId),
        releaseRequestApi.validate(newRequestId, []),
      ]);
      setValidateState({
        status: validationResult.hasErrors ? "error" : "done",
        requestId: newRequestId,
        result: validationResult,
        error: null,
      });
      await fetchSteps(newRequestId);
      releaseRequestApi.getValidationResults(newRequestId).catch(() => {});
    } catch {
      // silent fail
    }
  }

  // Show issues screen as a full-page overlay
  if (
    showIssues &&
    validateState.requestId &&
    validateState.result
  ) {
    return (
      <div className="flex flex-col h-full">
        <ValidationIssuesScreen
          result={validateState.result}
          requestId={validateState.requestId}
          onBack={() => {
            setShowIssues(false);
            if (validateState.requestId) fetchSteps(validateState.requestId);
          }}
          onResultUpdate={(newResult, requestId) => {
            setValidateState((prev) => ({
              ...prev,
              result: newResult,
              status: newResult.hasErrors ? "error" : "done",
            }));
            fetchSteps(requestId);
          }}
        />
      </div>
    );
  }

  const hasFailed = validateState.status === "error";
  const reviewStepDone = stepsFromApi?.find((s) => s.stepType === "REVIEW")?.status === "DONE";

  async function handleAssignReviewers() {
    const hasEmails = selectedReviewerEmails.length > 0;
    const hasPresets = selectedPresets.length > 0;
    if (!validateState.requestId || (!hasEmails && !hasPresets)) return;
    setAssignReviewersError(null);
    setAssignReviewersLoading(true);
    try {
      let allEmails = [...selectedReviewerEmails];
      for (const preset of selectedPresets) {
        const full = await presetApi.getById(preset.id);
        const emails = (full.members ?? []).map((m) => m.userEmail).filter(Boolean);
        allEmails = [...allEmails, ...emails];
      }
      allEmails = [...new Set(allEmails)];
      await releaseRequestApi.assignReviewers(validateState.requestId, allEmails);
      await fetchSteps(validateState.requestId);
      setReviewersAssigned(true);
    } catch (err) {
      setAssignReviewersError(err instanceof Error ? err.message : "Failed to assign reviewers");
    } finally {
      setAssignReviewersLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Release Request" : "New Release Request"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditMode
              ? `${editDomainId}`
              : `[${cddbDocument?.domainId}] – [${cddbDocument?.documentNumber}]`}
            &nbsp;|&nbsp;{dateString}, {timeString}
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
        {steps.map((step, i) => (
          <StepCard
            key={step.number}
            step={step}
            isExpanded={expandedStep === step.number}
            onToggle={() => toggleStep(step.number)}
            isFirst={i === 0}
            canExpand={i === 0 || steps[i - 1].status === "ready"}
            isCurrentStep={
              step.status === "open" &&
              (i === 0
                ? !!validateState.requestId
                : steps.slice(0, i).every((s) => s.status === "ready"))
            }
            expandedContent={
              step.number === 1 ? (
                <div className="flex flex-col gap-3">
                  <p>
                    Select a process type and run validation to check for errors before
                    proceeding.
                  </p>

                  {/* Process selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Release Process
                    </label>
                    {isEditMode ? (
                      <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-1 text-sm text-muted-foreground">
                        {editProcessName || "—"}
                      </div>
                    ) : (
                      <>
                        <ProcessSelect
                          processes={processesData?.content ?? []}
                          value={selectedProcessId}
                          onChange={(id) => {
                            setSelectedProcessId(id);
                            setValidateState({
                              status: "idle",
                              requestId: null,
                              result: null,
                              error: null,
                            });
                          }}
                          loading={processesLoading}
                        />
                        {selectedProcess?.description && (
                          <p className="text-xs text-muted-foreground">
                            {selectedProcess.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Validate button */}
                  <Button
                    size="sm"
                    disabled={
                      validateState.status === "loading" ||
                      validateState.status === "done" ||
                      (!isEditMode && (!selectedProcessId || validateState.status !== "idle"))
                    }
                    onClick={handleValidate}
                    className="self-end gap-2"
                  >
                    {validateState.status === "loading" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Validating…
                      </>
                    ) : (
                      "Validate Document"
                    )}
                  </Button>

              

                  {/* Validation passed */}
                  {hasPassed && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-900/20">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Validation passed
                      </span>
                    </div>
                  )}

                  {/* Validation failed */}
                  {hasFailed &&
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-900/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <XCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-medium text-red-700 dark:text-red-400 truncate">
                          {validateState.result?.totalErrorElements} errors
                          {validateState.result?.totalWarningElements && validateState.result?.totalWarningElements > 0 &&
                            `, ${validateState.result?.totalWarningElements} warnings`}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 h-7 text-xs border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                        onClick={() => setShowIssues(true)}
                      >
                        View Issues
                      </Button>
                    </div>
                    }
                  
                </div>
              ) : step.number === 2 && hasPassed && validateState.requestId ? (
                <div className="flex flex-col gap-3">
                  <p>Add a reviewer who will validate this release before it is published.</p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Reviewers (users or groups)
                    </label>
                    <ReviewerSelect
                      value={selectedReviewerEmails}
                      onChange={setSelectedReviewerEmails}
                      selectedPresets={selectedPresets}
                      onPresetsChange={setSelectedPresets}
                      disabled={assignReviewersLoading}
                    />
                  </div>
                  {assignReviewersError && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {assignReviewersError}
                    </p>
                  )}
                  <Button
                    size="sm"
                    disabled={
                      (selectedReviewerEmails.length === 0 && selectedPresets.length === 0) ||
                      assignReviewersLoading ||
                      reviewStepDone
                    }
                    onClick={handleAssignReviewers}
                    className="self-end gap-2"
                  >
                    {assignReviewersLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Assigning…
                      </>
                    ) : (
                      "Assign reviewers"
                    )}
                  </Button>
                </div>
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
