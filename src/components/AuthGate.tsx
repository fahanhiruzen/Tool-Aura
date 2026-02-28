import { useFigmaAuth } from "@/hooks/useFigmaAuth";
import { LoginPage } from "@/components/LoginPage";
import { useFigmaDataStore } from "@/stores";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { FigmaTokenWaitScreen } from "@/components/auth/FigmaTokenWaitScreen";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  useFigmaAuth();
  const data = useFigmaDataStore((x) => x.data);
  const figmaAccessToken = data?.figmaToken;
  const cddbToken = data?.cddbToken;

  // Plugin hasn't sent the init message yet — show a neutral loading screen
  // instead of flashing TokenModal or FigmaTokenWaitScreen prematurely.
  if (data === null) {
    return (
      <main style={{ height: "100vh" }}>
        <LoadingScreen />
      </main>
    );
  }

  if (!cddbToken) {
    return (
      <main>
        <LoginPage />
      </main>
    );
  }

  if (!figmaAccessToken) {
    return (
      <main style={{ height: "100vh" }}>
        <FigmaTokenWaitScreen />
      </main>
    );
  }

  return <main>{children}</main>;
}
