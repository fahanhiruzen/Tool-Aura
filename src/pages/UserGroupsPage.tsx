import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn, formatUsername } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreatePresetModal,
  type CreatePresetPayload,
} from "@/components/user-groups/CreatePresetModal";
import {
  EditPresetModal,
  type UpdatePresetPayload,
} from "@/components/user-groups/EditPresetModal";
import {
  usePresets,
  useCreatePreset,
  useUpdatePreset,
  useDeletePreset,
} from "@/hooks/use-presets";
import { TEAMS } from "@/lib/constants";
import type { IPreset } from "@/api/preset";

const PAGE_SIZE = 10;

type SortKey = "name" | "users" | "domain";
type SortDir = "asc" | "desc";

function SortTh({
  children,
  col,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  children: React.ReactNode;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const isActive = sortKey === col;
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
        className
      )}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onSort(col)}
      >
        {children}
        {isActive ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </button>
    </th>
  );
}

export function UserGroupsPage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<IPreset | null>(null);
  const [deletingPreset, setDeletingPreset] = useState<IPreset | null>(null);

  const { data, isLoading, isError } = usePresets({
    pageNumber: page - 1,
    pageSize: PAGE_SIZE,
    sort: sortDir === "asc" ? "ASC" : "DESC",
    searchName: search || undefined,
  });

  const createPreset = useCreatePreset();
  const updatePreset = useUpdatePreset();
  const deletePreset = useDeletePreset();

  const presets = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function getTeamName(domainId: string) {
    return TEAMS.find((t) => t.id === domainId)?.label ?? domainId;
  }

  async function handleCreate(payload: CreatePresetPayload) {
    await createPreset.mutateAsync(payload);
    setShowCreateModal(false);
  }

  async function handleUpdate(payload: UpdatePresetPayload) {
    await updatePreset.mutateAsync({
      id: payload.id,
      payload: { name: payload.name, members: payload.members },
    });
    setEditingPreset(null);
  }

  async function handleDelete() {
    if (!deletingPreset) return;
    await deletePreset.mutateAsync(deletingPreset.id);
    setDeletingPreset(null);
  }
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            User Group Preset Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You can use User Groups for repetitive tasks eg. notifying a group
            of people about a release.
          </p>
        </div>
        <Button
          className="gap-2 shrink-0"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4" />
          Create User Group
        </Button>
      </div>

      <hr className="mx-6 mt-5 border-border" />

      {/* Search */}
      <div className="px-6 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pt-3 pb-2">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                <SortTh
                  col="name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  className="w-40"
                >
                  Name
                </SortTh>
                <SortTh
                  col="users"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                >
                  <span className="flex items-center gap-1">
                    Users
                    <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px]">
                      ?
                    </span>
                  </span>
                </SortTh>
                <SortTh
                  col="domain"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  className="w-32"
                >
                  Domain
                </SortTh>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3.5 align-top">
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-16" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3.5" />
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-destructive"
                  >
                    Failed to load user groups.
                  </td>
                </tr>
              ) : presets.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No user groups found.
                  </td>
                </tr>
              ) : (
                presets.map((preset) => (
                  <tr
                    key={preset.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 align-top">
                      <p className="text-sm font-semibold text-foreground">
                        {preset.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {preset.members.length} Users
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">
                      {(() => {
                        const names = preset.members.map((m) =>
                          formatUsername(m.userEmail)
                        );
                        const visible = names.slice(0, 2);
                        const overflow = names.slice(2);
                        return (
                          <div className="space-y-0.5">
                            {visible.map((name, i) => (
                              <div key={i} className="flex items-center gap-1.5 min-w-0">
                                <span className="truncate">{name}</span>
                                {i === visible.length - 1 && overflow.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="shrink-0 cursor-default rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                                        +{overflow.length}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[220px]">
                                      <p className="whitespace-pre-wrap leading-relaxed">
                                        {overflow.join("\n")}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-foreground">
                        {getTeamName(preset.domainId)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                          aria-label="Delete"
                          disabled={deletePreset.isPending}
                          onClick={() => setDeletingPreset(preset)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Edit"
                          onClick={() => setEditingPreset(preset)}
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

      {showCreateModal && (
        <CreatePresetModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
          isLoading={createPreset.isPending}
        />
      )}

      {editingPreset && (
        <EditPresetModal
          preset={editingPreset}
          onClose={() => setEditingPreset(null)}
          onSave={handleUpdate}
          isLoading={updatePreset.isPending}
        />
      )}

      {deletingPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
            <h2 className="text-base font-semibold text-foreground">
              Delete User Group
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deletingPreset.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingPreset(null)}
                disabled={deletePreset.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletePreset.isPending}
              >
                {deletePreset.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
