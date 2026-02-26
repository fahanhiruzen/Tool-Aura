import { NavItem } from "./NavItem";
import { useNavigationStore } from "@/stores";
import type { NavItem as NavItemType, NavSection } from "@/stores";

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
        children: [
          { id: "widget-1", label: "Widget 1" },
          { id: "widget-2", label: "Widget 2" },
        ],
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
    ],
  },
];

export function SidebarNav() {
  const activeId = useNavigationStore((s) => s.activeId);
  const expandedItemIds = useNavigationStore((s) => s.expandedItemIds);
  const setActive = useNavigationStore((s) => s.setActive);
  const toggleItemExpanded = useNavigationStore((s) => s.toggleItemExpanded);

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-2">
      {NAV_STRUCTURE.map(({ section, items }) => (
        <div key={section} className="space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section}
          </div>
          <div className="space-y-0.5">
            {items.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isExpanded = expandedItemIds.has(item.id);

              return (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeId === item.id}
                  onSelect={() => setActive(item.id)}
                  isExpanded={isExpanded}
                  onToggle={() => toggleItemExpanded(item.id)}
                  hasChildren={hasChildren}
                />
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
