import { useState } from "react";
import { X, ChevronDown, UserPlus, User, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAllUsers } from "@/hooks/use-user-management";
import { TEAMS } from "@/lib/constants";
import type { IPreset } from "@/api/preset";

export interface UpdatePresetPayload {
  id: string;
  name: string;
  members: number[];
}

interface EditPresetModalProps {
  preset: IPreset;
  onClose: () => void;
  onSave: (data: UpdatePresetPayload) => void;
  isLoading?: boolean;
}

export function EditPresetModal({
  preset,
  onClose,
  onSave,
  isLoading,
}: EditPresetModalProps) {
  const [name, setName] = useState(preset.name);
  // Store IDs as strings (ICurrentUser.id is string); seed from existing numeric preset members
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    preset.members.map((m) => String(m.userId))
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const { data: users = [] } = useAllUsers();

  const currentTeam = TEAMS.find((t) => t.id === preset.domainId);
  const availableUsers = users.filter((u) => !selectedUserIds.includes(u.id));
  const filteredUsers = memberSearch.trim()
    ? availableUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(memberSearch.trim().toLowerCase()) ||
          u.email.toLowerCase().includes(memberSearch.trim().toLowerCase())
      )
    : availableUsers;

  function addUser(userId: string) {
    setSelectedUserIds((prev) => [...prev, userId]);
    setDropdownOpen(false);
    setMemberSearch("");
  }

  function removeUser(userId: string) {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      id: preset.id,
      name: name.trim(),
      members: selectedUserIds.map((id) => parseInt(id, 10)),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[360px] rounded-2xl bg-card border border-border px-6 pb-6 pt-5 shadow-xl">
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

        {/* Preset name */}
        <div className="mb-3 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Preset name
          </label>
          <Input
            placeholder="My Preset 01"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Team Name – read-only (domainId cannot be changed via update API) */}
        <div className="mb-3 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Team name
          </label>
          <div className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-1 text-sm text-muted-foreground cursor-not-allowed select-none">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left truncate">
              {currentTeam?.label ?? preset.domainId}
            </span>
          </div>
        </div>

        {/* Team members dropdown */}
        <div className="mb-3 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Team members
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen((o) => !o);
                setMemberSearch("");
              }}
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "text-muted-foreground"
              )}
            >
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">Add team member</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search users..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full rounded-md border border-input bg-transparent py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      {availableUsers.length === 0
                        ? "All users added"
                        : "No users found"}
                    </p>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted"
                        onClick={() => addUser(u.id)}
                      >
                        <span className="font-medium">{u.username}</span>
                        <span className="ml-1.5 text-muted-foreground text-xs">
                          {u.email}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected members list */}
          {selectedUserIds.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto divide-y divide-border rounded-lg border border-border">
              {selectedUserIds.map((uid) => {
                const fromUsers = users.find((u) => u.id === uid);
                const fromPreset = preset.members.find((m) => String(m.userId) === uid);
                const displayName = fromUsers?.username;
                const email = fromUsers?.email ?? fromPreset?.userEmail ?? "";
                return (
                  <div
                    key={uid}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <div className="min-w-0">
                      {displayName && (
                        <p className="text-sm font-semibold text-foreground truncate">
                          {displayName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUser(uid)}
                      className="ml-3 shrink-0 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
