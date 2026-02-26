import { useFigmaAuth } from "@/hooks/useFigmaAuth";
import { useAuthStore } from "@/stores/auth-store";
import { TokenModal } from "@/components/TokenModal";

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Renders children only after the user has entered a valid token.
 * Until then, shows the token entry modal.
 */
export function AuthGate({ children }: AuthGateProps) {
  useFigmaAuth();
  const isValidated = useAuthStore((s) => s.isValidated);
  console.log("isValidated->", isValidated);
  return (
    <main>
      {isValidated ? children : <TokenModal />}
    </main>
  );
}
