import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useManagedUsers,
  useRoles,
  useUpdateUserRoles,
} from "@/hooks/use-user-management";
import type { ICurrentUser, IRole } from "@/api/user-management";

const PAGE_SIZE = 10;

// ─── Edit Roles Modal ────────────────────────────────────────────────────────

interface EditRolesModalProps {
  user: ICurrentUser;
  allRoles: IRole[];
  onClose: () => void;
  onSave: (roleIds: string[]) => void;
  isLoading?: boolean;
}

function EditRolesModal({
  user,
  allRoles,
  onClose,
  onSave,
  isLoading,
}: EditRolesModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    user.roles.map((r) => r.id)
  );

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[360px] rounded-2xl bg-card border border-border px-6 pb-6 pt-5 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shadow-sm">
            <ShieldCheck className="h-5 w-5 text-foreground" />
          </div>
        </div>

        <h2 className="mb-1 text-base font-semibold text-foreground">
          Edit Roles
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {user.username} &middot; {user.email}
        </p>

        <div className="mb-5 space-y-2 max-h-60 overflow-y-auto">
          {allRoles.map((role) => {
            const checked = selectedIds.includes(role.id);
            return (
              <label
                key={role.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors",
                  checked
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-primary"
                  checked={checked}
                  onChange={() => toggle(role.id)}
                />
                <span className="text-sm font-medium text-foreground">
                  {role.name}
                </span>
              </label>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
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
            onClick={() => onSave(selectedIds)}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Filter Dropdown ─────────────────────────────────────────────────────

interface RoleFilterProps {
  roles: IRole[];
  selected: string | null;
  onChange: (role: string | null) => void;
}

function RoleFilter({ roles, selected, onChange }: RoleFilterProps) {
  const [open, setOpen] = useState(false);
  const label = roles.find((r) => r.id === selected)?.name ?? "All Roles";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 min-w-[140px] items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
      >
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 min-w-full rounded-md border border-border bg-popover shadow-md">
          <button
            type="button"
            className={cn(
              "w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted",
              !selected && "bg-muted font-medium"
            )}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            All Roles
          </button>
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted",
                selected === r.id && "bg-muted font-medium"
              )}
              onClick={() => {
                onChange(r.id);
                setOpen(false);
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Users Page ───────────────────────────────────────────────────────────────

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<ICurrentUser | null>(null);

  const { data, isLoading, isError } = useManagedUsers({
    pageNumber: page - 1,
    pageSize: PAGE_SIZE,
    role: roleFilter,
    search: search || undefined,
  });

  const { data: roles = [] } = useRoles();
  const updateRoles = useUpdateUserRoles();

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  async function handleSaveRoles(roleIds: string[]) {
    if (!editingUser) return;
    await updateRoles.mutateAsync({ username: editingUser.username, roleIds });
    setEditingUser(null);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage user accounts and their assigned roles.
        </p>
      </div>

      <hr className="mx-6 mt-5 border-border" />

      {/* Controls */}
      <div className="flex items-center gap-3 px-6 pt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by username or email"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <RoleFilter
          roles={roles}
          selected={roleFilter}
          onChange={(r) => {
            setRoleFilter(r);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pt-3 pb-2">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-44">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Roles
                </th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-destructive"
                  >
                    Failed to load users.
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">
                        {user.username}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            No roles
                          </span>
                        ) : (
                          user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {role.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Edit roles"
                          onClick={() => setEditingUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-6 py-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-foreground">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || data?.last}
          onClick={() => setPage((p) => p + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {editingUser && (
        <EditRolesModal
          user={editingUser}
          allRoles={roles}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveRoles}
          isLoading={updateRoles.isPending}
        />
      )}
    </div>
  );
}
