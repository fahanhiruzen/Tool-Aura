function ToolHubLogo() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-foreground"
        aria-hidden
      >
        <path
          d="M9 2L3 16H8L9 12L10 16H15L9 2Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export function SidebarHeader() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <ToolHubLogo />
      <span className="text-lg font-semibold text-foreground">ToolHub</span>
    </div>
  );
}
