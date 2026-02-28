import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Loader2, X, Search, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTextVariables, useUpdateTextVariable, useTextVariableTypes } from "@/hooks/use-text-grids";
import type { TextVariable } from "@/api/types";
import type { UpdateTextVariablePayload } from "@/api/endpoints";

// ---------------------------------------------------------------------------
// Type badge
// ---------------------------------------------------------------------------

const TV_TYPES = ["All", "Comb", "Graphic", "Text", "Unit", "Data"];

const TYPE_COLORS: Record<string, string> = {
  Comb: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  Graphic:
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  Text: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
  Unit: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Data: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TYPE_COLORS[type] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {type}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Filter dropdown
// ---------------------------------------------------------------------------

function FilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50 transition-colors"
      >
        {value === "All" ? "All Types" : value}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-border bg-popover shadow-md">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                opt === value && "font-medium bg-muted"
              )}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt === "All" ? "All Types" : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared form helpers
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

const textareaCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50";

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | boolean | number | null | undefined;
  mono?: boolean;
}) {
  if (value === null || value === undefined || value === "") return null;
  const display =
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "text-xs text-foreground leading-relaxed break-words",
          mono && "font-mono"
        )}
      >
        {display}
      </p>
    </div>
  );
}

function CardDetails({ variable }: { variable: TextVariable }) {
  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="Concept Text (EN)" value={variable.conceptText} />
        <DetailField label="Concept Text (DE)" value={variable.conceptTextDeutsch} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="MK" value={variable.mk} mono />
        <DetailField label="HIL ID" value={variable.hilId} mono />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="Min Value" value={variable.minValue} />
        <DetailField label="Max Value" value={variable.maxValue} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <DetailField label="Always Show" value={variable.alwaysShow} />
        <DetailField label="Leading Zero" value={variable.leadingZero} />
        <DetailField label="Technical Compliance" value={variable.technicalCompliance} />
      </div>
      <DetailField label="Default Error Value" value={variable.defaultErrorValue} mono />
      <DetailField label="Configuration" value={variable.configuration} />
      <DetailField label="Comment" value={variable.comment} />
      <DetailField label="Comments on Texts and Dash" value={variable.commentsOnTextsAndDash} />
      <DetailField label="Relevant Documents" value={variable.relevantDocuments} />
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="GEN20x IF1 STAR3.5" value={variable.gen20xIf1Star35} />
        <DetailField label="GEN20x IF1 STAR3.5 MOPF" value={variable.gen20xIf1Star3mopf} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit modal
// ---------------------------------------------------------------------------

type EditForm = {
  type: string;
  groupName: string;
  name: string;
  description: string;
  comment: string;
  configuration: string;
  commentsOnTextsAndDash: string;
  gen20xIf1Star35: string;
  gen20xIf1Star3mopf: string;
};

function toForm(v: TextVariable): EditForm {
  return {
    type: v.type ?? "",
    groupName: v.groupName ?? "",
    name: v.name ?? "",
    description: v.description ?? "",
    comment: v.comment ?? "",
    configuration: v.configuration ?? "",
    commentsOnTextsAndDash: v.commentsOnTextsAndDash ?? "",
    gen20xIf1Star35: v.gen20xIf1Star35 ?? "",
    gen20xIf1Star3mopf: v.gen20xIf1Star3mopf ?? "",
  };
}

function toPayload(form: EditForm): UpdateTextVariablePayload {
  return {
    type: form.type,
    groupName: form.groupName,
    name: form.name,
    description: form.description,
    comment: form.comment || null,
    configuration: form.configuration || null,
    commentsOnTextsAndDash: form.commentsOnTextsAndDash || null,
    gen20xIf1Star35: form.gen20xIf1Star35 || null,
    gen20xIf1Star3mopf: form.gen20xIf1Star3mopf || null,
  };
}

function TypeSelectDropdown({
  value,
  options,
  isLoading,
  onChange,
}: {
  value: string;
  options: { name: string }[];
  isLoading: boolean;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isLoading}
        className={cn(
          inputCls,
          "flex items-center justify-between gap-2 text-left"
        )}
      >
        <span>{isLoading ? "Loading…" : value || "Select type"}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 rounded-md border border-border bg-popover shadow-md">
          {options.map((t) => (
            <button
              key={t.name}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors",
                t.name === value && "font-medium bg-muted"
              )}
              onClick={() => {
                onChange(t.name);
                setOpen(false);
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditModal({
  variable,
  onClose,
}: {
  variable: TextVariable;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditForm>(() => toForm(variable));
  const { mutate, isPending } = useUpdateTextVariable();
  const { data: typesData, isLoading: typesLoading } = useTextVariableTypes();

  function set(field: keyof EditForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      { id: variable.id, payload: toPayload(form) },
      { onSuccess: onClose }
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[600px] max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <TypeBadge type={variable.type} />
            </div>
            <h2 className="mt-1 text-sm font-semibold text-foreground">
              Edit Text Variable
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {/* Type + Group */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Type *</FieldLabel>
                <TypeSelectDropdown
                  value={form.type}
                  options={typesData ?? []}
                  isLoading={typesLoading}
                  onChange={(v) => set("type", v)}
                />
              </div>
              <div>
                <FieldLabel>Group Name *</FieldLabel>
                <input
                  type="text"
                  value={form.groupName}
                  onChange={(e) => set("groupName", e.target.value)}
                  required
                  className={inputCls}
                  placeholder="e.g. Charging"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <FieldLabel>Name *</FieldLabel>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                className={cn(inputCls, "font-mono")}
                placeholder="e.g. comb_Charging_RWA-SOC_reached"
              />
            </div>

            {/* Description */}
            <div>
              <FieldLabel>Description *</FieldLabel>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
                className={textareaCls}
                placeholder="Describe what this variable shows or does…"
              />
            </div>

            {/* Comment */}
            <div>
              <FieldLabel>Comment</FieldLabel>
              <textarea
                rows={2}
                value={form.comment}
                onChange={(e) => set("comment", e.target.value)}
                className={textareaCls}
                placeholder="Optional notes or remarks"
              />
            </div>

            {/* Configuration */}
            <div>
              <FieldLabel>Configuration</FieldLabel>
              <textarea
                rows={3}
                value={form.configuration}
                onChange={(e) => set("configuration", e.target.value)}
                className={cn(textareaCls, "font-mono text-xs")}
                placeholder="Configuration string or formula"
              />
            </div>

            {/* Comments on Texts and Dash */}
            <div>
              <FieldLabel>Comments on Texts and Dash</FieldLabel>
              <textarea
                rows={2}
                value={form.commentsOnTextsAndDash}
                onChange={(e) => set("commentsOnTextsAndDash", e.target.value)}
                className={textareaCls}
              />
            </div>

            {/* GEN20x fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>GEN20x IF1 STAR3.5</FieldLabel>
                <input
                  type="text"
                  value={form.gen20xIf1Star35}
                  onChange={(e) => set("gen20xIf1Star35", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel>GEN20x IF1 STAR3.5 MOPF</FieldLabel>
                <input
                  type="text"
                  value={form.gen20xIf1Star3mopf}
                  onChange={(e) => set("gen20xIf1Star3mopf", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pt-4 pb-0 border-t border-border shrink-0 flex items-center justify-end gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function TextVariablesPage() {
  const { data, isLoading, isError } = useTextVariables();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<TextVariable | null>(null);

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.toLowerCase();
    return list.filter((v) => {
      const matchesType = typeFilter === "All" || v.type === typeFilter;
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.groupName?.toLowerCase().includes(q) ||
        v.conceptText?.toLowerCase().includes(q) ||
        v.mk?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    }).sort((a, b) => a.id - b.id);
  }, [data, search, typeFilter]);

  function toggleExpand(id: number, e?: React.MouseEvent) {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Text Variables</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and inspect all text variable definitions
          </p>
        </div>
        <FilterDropdown
          value={typeFilter}
          options={TV_TYPES}
          onChange={setTypeFilter}
        />
      </div>

      <hr className="mx-6 mt-5 border-border" />

      {/* Search */}
      <div className="px-6 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, description, group, MK…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="px-6 pt-3 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Loading text variables…</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-destructive">Failed to load text variables.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {data?.length === 0 ? "No text variables found." : "No results match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => {
              const isExpanded = expandedIds.has(v.id);
              return (
                <div
                  key={v.id}
                  onClick={() => toggleExpand(v.id)}
                  className="rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TypeBadge type={v.type} />
                      <span className="text-xs text-muted-foreground truncate">
                        {v.groupName}
                      </span>
                      
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditing(v); }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleExpand(v.id); }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded
                          ? <ChevronUp className="h-3.5 w-3.5" />
                          : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <p className="mt-1.5 text-xs font-medium text-foreground font-mono break-all leading-relaxed">
                    {v.name}
                  </p>

                  {/* Description */}
                  {v.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {v.description}
                    </p>
                  )}

                  {/* Expanded details */}
                  {isExpanded && <CardDetails variable={v} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Result count */}
        {!isLoading && !isError && (
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length} of {data?.length ?? 0} variables
          </p>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          variable={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
