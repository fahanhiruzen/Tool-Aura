import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReleaseRequestsPage } from "@/pages/ReleaseRequestsPage";
import { useNavigationStore } from "@/stores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function PageRouter() {
  const activeId = useNavigationStore((s) => s.activeId);

  if (activeId === "release-requests") {
    return <ReleaseRequestsPage />;
  }

  return <DashboardPage />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <PageRouter />
      </AppLayout>
    </QueryClientProvider>
  );
}

export default App;
