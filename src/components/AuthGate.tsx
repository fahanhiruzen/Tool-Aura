import { useFigmaAuth } from "@/hooks/useFigmaAuth";
import { useAuthStore } from "@/stores/auth-store";
import { usePluginStore } from "@/stores/plugin-store";
import { TokenModal } from "@/components/TokenModal";
import { RestrictedView } from "@/components/RestrictedView";

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Renders children only after the user has entered a valid token and their
 * email is in the plugin allowlist. Otherwise shows token modal or restricted view.
 */
export function AuthGate({ children }: AuthGateProps) {
  useFigmaAuth();
  const isValidated = useAuthStore((s) => s.isValidated);
  const allowedToUsePlugin = usePluginStore((s) => s.allowedToUsePlugin);

  if (!isValidated) {
    return (
      <main>
        <TokenModal />
      </main>
    );
  }
  if (!allowedToUsePlugin) {
    return (
      <main>
        <RestrictedView />
      </main>
    );
  }
  return <main>{children}</main>;
}
