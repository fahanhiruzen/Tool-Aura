import { useState } from "react";
import { X, ChevronDown, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ALL_TEAM_MEMBERS = [
  { name: "Olivia Rhye",    email: "olivia@email.com" },
  { name: "Phoenix Baker",  email: "phoenix@email.com" },
  { name: "Lana Steiner",   email: "lana@email.com" },
  { name: "Demi Wilkinson", email: "demi@email.com" },
  { name: "Candice Wu",     email: "candice@email.com" },
  { name: "Natali Craig",   email: "natali@email.com" },
  { name: "Drew Cano",      email: "drew@email.com" },
];

export interface PresetMember {
  name: string;
  email: string;
}

export interface EditPresetData {
  presetName: string;
  members: PresetMember[];
}

interface EditPresetModalProps {
  initialData: EditPresetData;
  onClose: () => void;
  onSave: (data: EditPresetData) => void;
}

export function EditPresetModal({
  initialData,
  onClose,
  onSave,
}: EditPresetModalProps) {
  const [name, setName] = useState(initialData.presetName);
  const [members, setMembers] = useState<PresetMember[]>(initialData.members);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const available = ALL_TEAM_MEMBERS.filter(
    (m) => !members.some((existing) => existing.name === m.name)
  );

  function addMember(m: PresetMember) {
    setMembers((prev) => [...prev, m]);
    setDropdownOpen(false);
  }

  function removeMember(memberName: string) {
    setMembers((prev) => prev.filter((m) => m.name !== memberName));
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ presetName: name.trim(), members });
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

        {/* Icon */}
        <div className="mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shadow-sm">
            <UserPlus className="h-5 w-5 text-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Edit Preset
        </h2>

        {/* Team member dropdown */}
        <div className="mb-3 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Team member
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "text-muted-foreground"
              )}
            >
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">Select team member</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            {dropdownOpen && available.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                {available.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted"
                    onClick={() => addMember(m)}
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="ml-1.5 text-muted-foreground text-xs">
                      {m.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current members list */}
        {members.length > 0 && (
          <div className="mb-3 max-h-40 overflow-y-auto">
            {members.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {m.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(m.name)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

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
