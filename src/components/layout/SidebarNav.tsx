import {
  LayoutDashboard,
  Database,
  RefreshCw,
  ArrowLeftRight,
  Layers,
  Globe,
  Type,
  SquareCode,
  FileText,
  Users,
  UsersRound,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { NavItem } from "./NavItem";
import { useNavigationStore, usePluginStore } from "@/stores";
import type { NavItem as NavItemType, NavSection } from "@/stores";
import { useListReleaseRequests } from "@/hooks/use-release-request";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  "meta-suite": Database,
  release: RefreshCw,
  "responsive-suite": ArrowLeftRight,
  widgets: Layers,
  "global-search": Globe,
  "text-grids": Type,
  "text-variables": SquareCode,
  "getting-started": FileText,
  responsive: ArrowLeftRight,
  "release-requests": RefreshCw,
  "user-groups": UsersRound,
  users: Users,
  "role-requests": ClipboardCheck,
};

export const NAV_WIDGET_CHILDREN: { id: string; label: string }[] = [
  { id: "widget-1", label: "Widget 1" },
  { id: "widget-2", label: "Widget 2" },
];

const NAV_STRUCTURE: { section: NavSection; items: NavItemType[] }[] = [
  {
    section: "START",
    items: [{ id: "dashboard", label: "Dashboard", section: "START" }],
  },
  {
    section: "PLUGIN",
    items: [
      { id: "meta-suite", label: "Meta Suite", section: "PLUGIN" },
      { id: "release", label: "Release", section: "PLUGIN" },
      { id: "responsive-suite", label: "Responsive Suite", section: "PLUGIN" },
    ],
  },
  {
    section: "DATA",
    items: [
      {
        id: "widgets",
        label: "01_Widgets",
        section: "DATA",
        children: NAV_WIDGET_CHILDREN,
      },
      { id: "global-search", label: "Global Search", section: "DATA" },
      { id: "text-grids", label: "Text Grids", section: "DATA" },
      { id: "text-variables", label: "Text Variables", section: "DATA" },
    ],
  },
  {
    section: "DESIGN",
    items: [
      { id: "getting-started", label: "Getting Started", section: "DESIGN" },
      { id: "responsive", label: "Responsive", section: "DESIGN" },
    ],
  },
  {
    section: "REVIEW & RELEASE",
    items: [
      {
        id: "release-requests",
        label: "Release Requests",
        section: "REVIEW & RELEASE",
      },
      {
        id: "user-groups",
        label: "User Groups",
        section: "REVIEW & RELEASE",
      },
    ],
  },
  {
    section: "USER MANAGEMENT",
    items: [
      { id: "users", label: "Users", section: "USER MANAGEMENT" },
      { id: "user-groups", label: "User Groups", section: "USER MANAGEMENT" },
      {
        id: "role-requests",
        label: "Role Requests",
        section: "USER MANAGEMENT",
      },
    ],
  },
];

function itemMatchesQuery(item: NavItemType, q: string): boolean {
  if (item.label.toLowerCase().includes(q)) return true;
  return item.children?.some((c) => c.label.toLowerCase().includes(q)) ?? false;
}

export function SidebarNav() {
  const activeId = useNavigationStore((s) => s.activeId);
  const expandedItemIds = useNavigationStore((s) => s.expandedItemIds);
  const quickSearch = useNavigationStore((s) => s.quickSearch);
  const setActive = useNavigationStore((s) => s.setActive);
  const toggleItemExpanded = useNavigationStore((s) => s.toggleItemExpanded);
  const isCollapsed = useNavigationStore((s) => s.isSidebarCollapsed);
  const currentDocumentKey = "f1r6GcNUhZWol5fpQQnM3u";

  const { data: toReviewData } = useListReleaseRequests({
    pageNumber: 0,
    pageSize: 1,
    currentDocumentKey,
    filter: { documentKey: "", iam: ["REVIEWER"] },
  });
  const releaseRequestsBadge = toReviewData?.totalElements ?? 0;

  const q = quickSearch.trim().toLowerCase();

  const getBadge = (itemId: string) => {
    if (itemId === "release-requests") return releaseRequestsBadge;
    return undefined;
  };

  return (
    <nav className={cn("flex flex-1 flex-col gap-4 overflow-y-auto py-2", isCollapsed ? "px-1" : "px-2")}>
      {NAV_STRUCTURE.map(({ section, items }) => {
        const visibleItems = q
          ? items.filter((item) => itemMatchesQuery(item, q))
          : items;

        if (visibleItems.length === 0) return null;

        return (
          <div key={section} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section}
              </div>
            )}
            <div className="space-y-0.5">
              {visibleItems.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                // While searching, auto-expand items whose children match
                const isExpanded =
                  expandedItemIds.has(item.id) ||
                  (!!q &&
                    (item.children?.some((c) =>
                      c.label.toLowerCase().includes(q)
                    ) ?? false));
                const Icon = NAV_ICONS[item.id];

                const childIds = item.children?.map((c) => c.id) ?? [];
                const isParentActive =
                  activeId === item.id || childIds.includes(activeId ?? "");

                return (
                  <NavItem
                    key={`${section}-${item.id}`}
                    item={item}
                    icon={Icon}
                    isActive={isParentActive}
                    onSelect={() => setActive(item.id)}
                    isExpanded={isExpanded}
                    onToggle={() => toggleItemExpanded(item.id)}
                    hasChildren={hasChildren}
                    activeId={activeId}
                    onSelectChild={setActive}
                    badge={getBadge(item.id)}
                    isCollapsed={isCollapsed}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {q && !isCollapsed && NAV_STRUCTURE.every(({ items }) => items.every((item) => !itemMatchesQuery(item, q))) && (
        <p className="px-3 py-2 text-xs text-muted-foreground">No results found.</p>
      )}
    </nav>
  );
}
