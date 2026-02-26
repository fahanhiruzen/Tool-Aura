import { ShieldX } from "lucide-react";
import { signOut } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

/**
 * Shown when the user has a valid token but their email is not in the plugin allowlist.
 */
export function RestrictedView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="h-7 w-7 text-destructive" />
      </div>
      <div className="max-w-sm space-y-1 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Access restricted
        </h2>
        <p className="text-sm text-muted-foreground">
          You are not authorized to use this plugin. Only designated users can
          access it. If you believe this is an error, contact your
          administrator.
        </p>
      </div>
      <Button variant="outline" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}
