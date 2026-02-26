import { Sidebar } from "./Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-full overflow-hidden bg-muted/30">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </TooltipProvider>
  );
}
