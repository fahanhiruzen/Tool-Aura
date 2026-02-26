import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const defaultUser = {
  name: "Olivia Rhye",
  email: "olivia@mercedes-benz.de",
  avatar: null as string | null,
};

export function UserProfileCard() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-lg px-3 py-2 h-auto font-normal"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {defaultUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex flex-1 flex-col items-start text-left text-sm">
            <span className="font-medium text-foreground">{defaultUser.name}</span>
            <span className="text-xs text-muted-foreground">{defaultUser.email}</span>
          </div>
          <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
