import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout";
import { AuthGate } from "@/components/AuthGate";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReleaseRequestsPage } from "@/pages/ReleaseRequestsPage";
import { GettingStartedPage } from "@/pages/GettingStartedPage";
import { CreateReleaseRequestPage } from "@/pages/CreateReleaseRequestPage";
import { ResponsiveSuitePage } from "@/pages/ResponsiveSuitePage";
import { TextGridsPage } from "@/pages/TextGridsPage";
import { UserGroupsPage } from "@/pages/UserGroupsPage";
import { GlobalSearchPage } from "@/pages/GlobalSearchPage";
import { useNavigationStore } from "@/stores";

const queryClient = new QueryClient({
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

  switch (activeId) {
    case "dashboard":
      return <DashboardPage />;
    case "release":
      return <ReleaseRequestsPage />;
    case "getting-started":
      return <GettingStartedPage />;
    case "create-release":
      return <CreateReleaseRequestPage />;
    case "responsive-suite":
      return <ResponsiveSuitePage />;
    case "text-grids":
      return <TextGridsPage />;
    case "release-requests":
      return <ReleaseRequestsPage />;
    case "user-groups":
      return <UserGroupsPage />;
    case "global-search":
      return <GlobalSearchPage />;
    default:
      return <PlaceholderPage id={activeId} />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <AppLayout>
          <PageRouter />
        </AppLayout>
      </AuthGate>
    </QueryClientProvider>
  );
}

export default App;
