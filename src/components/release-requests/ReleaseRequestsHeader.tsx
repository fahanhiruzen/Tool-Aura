import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigationStore } from "@/stores";

export function ReleaseRequestsHeader() {
  const setActive = useNavigationStore((s) => s.setActive);

  return (
    <div className="flex items-start justify-between px-6 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Release Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Validate Metadata and create a release.
        </p>
      </div>
      <Button className="gap-2" onClick={() => setActive("create-release")}>
        <Plus className="h-4 w-4" />
        Create Release Request
      </Button>
    </div>
  );
}
