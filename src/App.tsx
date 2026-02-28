import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { AuthGate } from "@/components/AuthGate";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReleaseRequestsPage } from "@/pages/ReleaseRequestsPage";
import { GettingStartedPage } from "@/pages/GettingStartedPage";
import { CreateReleaseRequestPage } from "@/pages/CreateReleaseRequestPage";
import { ResponsiveSuitePage } from "@/pages/ResponsiveSuitePage";
import { TextGridsPage } from "@/pages/TextGridsPage";
import { TextVariablesPage } from "@/pages/TextVariablesPage";
import { UserGroupsPage } from "@/pages/UserGroupsPage";
import { GlobalSearchPage } from "@/pages/GlobalSearchPage";
import { UsersPage } from "@/pages/UsersPage";
import { RoleRequestsPage } from "@/pages/RoleRequestsPage";
import { WidgetPage } from "@/pages/WidgetPage";
import { sendPluginResize } from "@/lib/figma-plugin";
import { useNavigationStore, usePluginStore } from "@/stores";
import { NAV_WIDGET_CHILDREN } from "@/components/layout/SidebarNav";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import type { ToasterProps } from "sonner";
import { PluginSetup } from "./components/plugin-setup/plugin-setup";

function useFigmaTheme(): ToasterProps["theme"] {
  const [theme, setTheme] = useState<ToasterProps["theme"]>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function showErrorNotification(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Something went wrong.";
  usePluginStore.getState().setNotification({
    variant: "error",
    message,
  });
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: showErrorNotification,
  }),
  queryCache: new QueryCache({
    onError: showErrorNotification,
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function PlaceholderPage({ id }: { id: string | null }) {
  const label = id?.replace(/-/g, " ") ?? "Page";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <p className="text-lg font-medium capitalize">{label}</p>
      <p className="text-sm">Coming soon</p>
    </div>
  );
}

function PageRouter() {
  const activeId = useNavigationStore((s) => s.activeId);
  const releaseRequestId = useNavigationStore((s) => s.releaseRequestId);

  const widgetChild = NAV_WIDGET_CHILDREN.find((w) => w.id === activeId);
  if (widgetChild) {
    return <WidgetPage widgetId={widgetChild.id} widgetLabel={widgetChild.label} />;
  }

  switch (activeId) {
    case "dashboard":
      return <DashboardPage />;
    case "release":
      return <ReleaseRequestsPage />;
    case "getting-started":
      return <GettingStartedPage />;
    case "create-release":
      return <CreateReleaseRequestPage />;
    case "edit-release":
      return <CreateReleaseRequestPage requestId={releaseRequestId ?? undefined} />;
    case "responsive-suite":
      return <ResponsiveSuitePage />;
    case "text-grids":
      return <TextGridsPage />;
    case "text-variables":
      return <TextVariablesPage />;
    case "release-requests":
      return <ReleaseRequestsPage />;
    case "user-groups":
      return <UserGroupsPage />;
    case "global-search":
      return <GlobalSearchPage />;
    case "users":
      return <UsersPage />;
    case "role-requests":
      return <RoleRequestsPage />;
    default:
      return <PlaceholderPage id={activeId} />;
  }
}

function MinimizedView() {
  const setMinimized = usePluginStore((s) => s.setMinimized);
  const handleMaximize = () => {
    setMinimized(false);
    sendPluginResize("maximize");
  };
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <Button
        variant="secondary"
        size="icon"
        className="h-full w-full rounded-none"
        onClick={handleMaximize}
        title="Maximise"
      >
        <Maximize2 className="size-5" />
      </Button>
    </div>
  );
}

function App() {
  const isMinimized = usePluginStore((s) => s.isMinimized);
  const theme = useFigmaTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-center" theme={theme} />
      {isMinimized ? (
        <MinimizedView />
      ) : (
        <AuthGate>
          <PluginSetup>
          <AppLayout>
            <PageRouter />
          </AppLayout>
          </PluginSetup>
        </AuthGate>
      )}
    </QueryClientProvider>
  );
}

export default App;
