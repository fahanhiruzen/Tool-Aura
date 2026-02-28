import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useNavigationStore } from "@/stores";
import { useCurrentCDDBUserStore } from "@/stores/current-user-store";
import { useFigmaDataStore } from "@/stores/figma-data-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function isValidPhotoUrl(url: string | undefined): url is string {
  return typeof url === "string" && url.length > 0 && url.startsWith("http");
}

export function UserProfileCard() {
  const figmaUser = useFigmaDataStore((s) => s.data?.user ?? null);
  const cddbUser = useCurrentCDDBUserStore((s) => s.currentUser);
  const isCollapsed = useNavigationStore((s) => s.isSidebarCollapsed);
  const name = figmaUser?.name ?? cddbUser?.username ?? "Figma user";
  const emailOrId =
    cddbUser?.email ?? figmaUser?.id ?? "Not signed in to Figma";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
  const showPhoto = isValidPhotoUrl(figmaUser?.photoUrl);
  const [photoError, setPhotoError] = useState(false);
  const usePhoto = showPhoto && !photoError;

  const avatar = (
    <div className="relative shrink-0">
      {usePhoto ? (
        <img
          src={figmaUser!.photoUrl}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
          onError={() => setPhotoError(true)}
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {initials}
        </div>
      )}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-xl border border-border bg-card p-1.5 shadow-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {avatar}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-semibold">{name}</p>
          <p className="text-muted-foreground">{emailOrId}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {avatar}

          <div className="flex min-w-0 flex-1 flex-col items-start text-left">
            <span
              className="w-full truncate text-sm font-semibold text-foreground leading-tight"
              title={name}
            >
              {name}
            </span>
            <span
              className="w-full truncate text-xs text-muted-foreground leading-tight"
              title={emailOrId}
            >
              {emailOrId}
            </span>
          </div>

          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
