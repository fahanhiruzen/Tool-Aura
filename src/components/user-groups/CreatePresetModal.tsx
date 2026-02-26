import { useState } from "react";
import { X, ChevronDown, UserPlus, User, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAllUsers } from "@/hooks/use-user-management";
import { TEAMS } from "@/lib/constants";

export interface CreatePresetPayload {
  name: string;
  domainId: string;
  members: number[];
}

interface CreatePresetModalProps {
  onClose: () => void;
  onSave: (data: CreatePresetPayload) => void;
  isLoading?: boolean;
}

export function CreatePresetModal({
  onClose,
  onSave,
  isLoading,
}: CreatePresetModalProps) {
  const [name, setName] = useState("");
  const [domainId, setDomainId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [teamOpen, setTeamOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const { data: users = [] } = useAllUsers();

  const selectedTeam = TEAMS.find((t) => t.id === domainId);

  const filteredTeams = teamSearch.trim()
    ? TEAMS.filter((t) =>
        t.label.toLowerCase().includes(teamSearch.trim().toLowerCase())
      )
    : TEAMS;

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
    setMemberOpen(false);
    setMemberSearch("");
  }

  function removeUser(userId: string) {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  }

  function handleSave() {
    if (!name.trim() || !domainId) return;
    onSave({
      name: name.trim(),
      domainId,
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
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shadow-sm">
            <UserPlus className="h-5 w-5 text-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Create Preset
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

        {/* Team Name */}
        <div className="mb-3 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Team name
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setTeamOpen((o) => !o);
                setMemberOpen(false);
                setTeamSearch("");
              }}
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                domainId ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left truncate">
                {selectedTeam?.label ?? "Select team"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            {teamOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search teams..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      className="w-full rounded-md border border-input bg-transparent py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {filteredTeams.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No teams found
                    </p>
                  ) : (
                    filteredTeams.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted",
                          t.id === domainId && "bg-muted font-medium"
                        )}
                        onClick={() => {
                          setDomainId(t.id);
                          setTeamOpen(false);
                          setTeamSearch("");
                        }}
                      >
                        {t.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team members */}
        <div className="mb-3 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Team members
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMemberOpen((o) => !o);
                setTeamOpen(false);
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
            {memberOpen && (
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
                const user = users.find((u) => u.id === uid);
                if (!user) return null;
                return (
                  <div
                    key={uid}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
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
            disabled={!name.trim() || !domainId || isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
