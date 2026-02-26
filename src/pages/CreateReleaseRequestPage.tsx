import { useState } from "react";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigationStore } from "@/stores";

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (v: string) => void;
}

function SelectField({
  label,
  value,
  options,
  placeholder = "Select…",
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span>{value || placeholder}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                  opt === value && "bg-muted font-medium"
                )}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reviewer tag
// ---------------------------------------------------------------------------

interface ReviewerTagProps {
  name: string;
  onRemove: () => void;
}

function ReviewerTag({ name, onRemove }: ReviewerTagProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
      {name}
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground"
        aria-label={`Remove ${name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Reviewers input
// ---------------------------------------------------------------------------

const REVIEWER_OPTIONS = [
  "Alice Müller",
  "Bob Schmidt",
  "Clara Weber",
  "David Fischer",
  "Eva Braun",
];

interface ReviewersFieldProps {
  reviewers: string[];
  onChange: (r: string[]) => void;
}

function ReviewersField({ reviewers, onChange }: ReviewersFieldProps) {
  const [open, setOpen] = useState(false);
  const available = REVIEWER_OPTIONS.filter((o) => !reviewers.includes(o));

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Reviewer(s)</label>
      <div className="relative">
        <div
          className={cn(
            "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 shadow-sm",
            "focus-within:ring-1 focus-within:ring-ring cursor-text"
          )}
          onClick={() => setOpen((o) => !o)}
        >
          {reviewers.map((r) => (
            <ReviewerTag
              key={r}
              name={r}
              onRemove={() => onChange(reviewers.filter((x) => x !== r))}
            />
          ))}
          <span className="text-sm text-muted-foreground">
            {reviewers.length === 0 ? "Add reviewers…" : ""}
          </span>
        </div>
        {open && available.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
            {available.map((opt) => (
              <button
                key={opt}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([...reviewers, opt]);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CreateReleaseRequestPage() {
  const setActive = useNavigationStore((s) => s.setActive);

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [version, setVersion] = useState("");
  const [releaseType, setReleaseType] = useState("");
  const [reviewers, setReviewers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to API
    setActive("release");
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-1">
        <button
          type="button"
          onClick={() => setActive("release")}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Release Request
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Fill in the details below to submit a new release request.
          </p>
        </div>
      </div>

      <hr className="mx-6 mt-4 border-border" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
        {/* Release details card */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-5 pt-4 pb-3">
            <h2 className="text-base font-semibold">Release Details</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Basic information about this release
            </p>
          </div>
          <div className="border-t px-5 pb-5 pt-4 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Release Title
              </label>
              <Input
                id="title"
                placeholder="e.g. HMI Release v2.5.0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Domain"
                value={domain}
                placeholder="Select domain…"
                options={[
                  "Instrument Cluster",
                  "Head Unit",
                  "Rear Seat",
                  "MBUX",
                ]}
                onChange={setDomain}
              />
              <SelectField
                label="Version"
                value={version}
                placeholder="Select version…"
                options={["v1.x", "v2.x", "v3.x"]}
                onChange={setVersion}
              />
            </div>

            <SelectField
              label="Release Type"
              value={releaseType}
              placeholder="Select type…"
              options={["Major", "Minor", "Patch", "Hotfix"]}
              onChange={setReleaseType}
            />
          </div>
        </div>

        {/* Review card */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-5 pt-4 pb-3">
            <h2 className="text-base font-semibold">Review</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Who should validate this release
            </p>
          </div>
          <div className="border-t px-5 pb-5 pt-4">
            <ReviewersField reviewers={reviewers} onChange={setReviewers} />
          </div>
        </div>

        {/* Notes card */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-5 pt-4 pb-3">
            <h2 className="text-base font-semibold">Notes</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Optional context for reviewers
            </p>
          </div>
          <div className="border-t px-5 pb-5 pt-4">
            <textarea
              placeholder="Add any notes or context…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={cn(
                "w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActive("release")}
          >
            Cancel
          </Button>
          <Button type="submit">Submit Release Request</Button>
        </div>
      </form>
    </div>
  );
}
