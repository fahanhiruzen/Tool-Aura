import { useState } from "react";
import { X, ChevronDown, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TEAM_MEMBERS = [
  "Olivia Rhye",
  "Phoenix Baker",
  "Lana Steiner",
  "Demi Wilkinson",
  "Candice Wu",
  "Natali Craig",
  "Drew Cano",
];

interface CreatePresetModalProps {
  onClose: () => void;
  onSave: (data: { member: string; name: string }) => void;
}

export function CreatePresetModal({ onClose, onSave }: CreatePresetModalProps) {
  const [member, setMember] = useState("");
  const [name, setName] = useState("");
  const [memberOpen, setMemberOpen] = useState(false);

  function handleSave() {
    if (!name.trim()) return;
    onSave({ member, name: name.trim() });
    onClose();
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal card */}
      <div className="relative w-[340px] rounded-2xl bg-card border border-border px-6 pb-6 pt-5 shadow-xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon row */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shadow-sm">
            <UserPlus className="h-5 w-5 text-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Create Preset
        </h2>

        {/* Team member */}
        <div className="mb-3 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Team member
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMemberOpen((o) => !o)}
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                member ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">
                {member || "Select team member"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            {memberOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                {TEAM_MEMBERS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted",
                      m === member && "bg-muted font-medium"
                    )}
                    onClick={() => {
                      setMember(m);
                      setMemberOpen(false);
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preset name */}
        <div className="mb-5 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Preset name
          </label>
          <Input
            placeholder="My Preset 01"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
