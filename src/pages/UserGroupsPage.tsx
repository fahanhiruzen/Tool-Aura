import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Pencil, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CreatePresetModal } from "@/components/user-groups/CreatePresetModal";
import { EditPresetModal, type EditPresetData } from "@/components/user-groups/EditPresetModal";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface GroupMember {
  name: string;
  email: string;
}

interface UserGroup {
  id: string;
  name: string;
  userCount: number;
  members: GroupMember[];
  domain: string;
}

const MOCK_GROUPS: UserGroup[] = [
  {
    id: "1",
    name: "Preset Name",
    userCount: 12,
    members: [
      { name: "Candice Wu",     email: "candice@email.com" },
      { name: "Demi Wilkinson", email: "demi@email.com" },
      { name: "Drew Cano",      email: "drew@email.com" },
      { name: "Olivia Rhye",    email: "olivia@email.com" },
      { name: "Phoenix Baker",  email: "phoenix@email.com" },
      { name: "Lana Steiner",   email: "lana@email.com" },
      { name: "Natali Craig",   email: "natali@email.com" },
    ],
    domain: "[Domain Name]",
  },
  {
    id: "2",
    name: "Preset Name",
    userCount: 2,
    members: [
      { name: "Candice Wu",     email: "candice@email.com" },
      { name: "Demi Wilkinson", email: "demi@email.com" },
    ],
    domain: "[Domain Name]",
  },
  {
    id: "3",
    name: "Preset Name",
    userCount: 1235,
    members: [
      { name: "Olivia Rhye",    email: "olivia@email.com" },
      { name: "Phoenix Baker",  email: "phoenix@email.com" },
      { name: "Lana Steiner",   email: "lana@email.com" },
      { name: "Drew Cano",      email: "drew@email.com" },
      { name: "Natali Craig",   email: "natali@email.com" },
      { name: "Demi Wilkinson", email: "demi@email.com" },
      { name: "Candice Wu",     email: "candice@email.com" },
    ],
    domain: "[Domain Name]",
  },
  {
    id: "4",
    name: "Preset Name",
    userCount: 13,
    members: [
      { name: "Drew Cano",      email: "drew@email.com" },
      { name: "Natali Craig",   email: "natali@email.com" },
      { name: "Candice Wu",     email: "candice@email.com" },
    ],
    domain: "[Domain Name]",
  },
  {
    id: "5",
    name: "Preset Name",
    userCount: 123,
    members: [
      { name: "Phoenix Baker",  email: "phoenix@email.com" },
      { name: "Lana Steiner",   email: "lana@email.com" },
      { name: "Demi Wilkinson", email: "demi@email.com" },
    ],
    domain: "[Domain Name]",
  },
];

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Sort header
// ---------------------------------------------------------------------------

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
    <th className={cn("px-4 py-3 text-left text-sm font-medium text-muted-foreground", className)}>
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function UserGroupsPage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EditPresetData | null>(null);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_GROUPS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.domain.toLowerCase().includes(q) ||
        g.members.some((m) => m.name.toLowerCase().includes(q))
    );
  }, [search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "users") cmp = a.userCount - b.userCount;
      else if (sortKey === "domain") cmp = a.domain.localeCompare(b.domain);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            User Group Preset Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You can use User Groups for repetitive tasks eg. notifiying a group
            of people about a release.
          </p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setShowCreateModal(true)}>
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
                <SortTh col="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="w-40">
                  Name
                </SortTh>
                <SortTh col="users" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
                  <span className="flex items-center gap-1">
                    Users
                    <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px]">
                      ?
                    </span>
                  </span>
                </SortTh>
                <SortTh col="domain" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="w-32">
                  Domain
                </SortTh>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No user groups found.
                  </td>
                </tr>
              ) : (
                paginated.map((group) => (
                  <tr
                    key={group.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 align-top">
                      <p className="text-sm font-semibold text-foreground">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.userCount} Users</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">
                      {group.members.map((m) => m.name).join(", ")}
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <p className="text-sm text-foreground">{group.domain}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Edit"
                          onClick={() =>
                            setEditingGroup({
                              presetName: group.name,
                              members: group.members,
                            })
                          }
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
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
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
          onSave={() => setShowCreateModal(false)}
        />
      )}

      {editingGroup && (
        <EditPresetModal
          initialData={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSave={() => setEditingGroup(null)}
        />
      )}
    </div>
  );
}
