import { useState } from "react";
import { LayoutGrid, HelpCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tab bar
// ---------------------------------------------------------------------------

type Tab = "generate" | "assign" | "custom";

const TABS: { id: Tab; label: string }[] = [
  { id: "generate", label: "Generate Screen Collections" },
  { id: "assign", label: "Assign to Collection" },
  { id: "custom", label: "Custom Categories" },
];

// ---------------------------------------------------------------------------
// Generate Screen Collections tab
// ---------------------------------------------------------------------------

const COLLECTIONS = ["Devices", "Languages", "Brands"] as const;
type Collection = (typeof COLLECTIONS)[number];

function GenerateTab() {
  const [checked, setChecked] = useState<Set<Collection>>(new Set());

  function toggle(col: Collection) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }

  return (
    <div className="space-y-0">
      {/* Selected Component */}
      <div className="px-6 py-5">
        <p className="text-sm font-semibold text-foreground mb-3">
          Selected Component
        </p>
        <p className="text-sm text-muted-foreground">Nothing Selected</p>
      </div>

      <hr className="border-border" />

      {/* Collections */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-1.5 mb-4">
          <p className="text-sm font-semibold text-foreground">Collections</p>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {COLLECTIONS.map((col) => (
            <div key={col} className="flex items-center gap-2.5">
              <Checkbox
                id={col}
                checked={checked.has(col)}
                onCheckedChange={() => toggle(col)}
              />
              <label
                htmlFor={col}
                className="text-sm text-foreground cursor-pointer select-none"
              >
                {col}
              </label>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Generate button */}
      <div className="px-6 py-5">
        <Button disabled={checked.size === 0} className="gap-2">
          <LayoutGrid className="h-4 w-4" />
          Generate Screens
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder tabs
// ---------------------------------------------------------------------------

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex h-32 items-center justify-center px-6">
      <p className="text-sm text-muted-foreground">{label} — coming soon</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ResponsiveSuitePage() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Responsive Suite</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Automatically generate instances of your layout to preview different
          modes, eg HU Sizes or Brands.
        </p>
      </div>

      <hr className="mx-6 mt-5 border-border" />

      {/* Tab bar */}
      <div className="px-6 pt-4">
        <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "generate" && <GenerateTab />}
        {activeTab === "assign" && (
          <PlaceholderTab label="Assign to Collection" />
        )}
        {activeTab === "custom" && (
          <PlaceholderTab label="Custom Categories" />
        )}
      </div>
    </div>
  );
}
