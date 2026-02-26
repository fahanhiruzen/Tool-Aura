import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-1 px-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Everything at a glance.</p>
        </div>
        <Button
          size="sm"
          className="rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 focus-visible:ring-sky-300"
        >
          Personalize Dashboard
        </Button>
      </div>
    </div>
  );
}
