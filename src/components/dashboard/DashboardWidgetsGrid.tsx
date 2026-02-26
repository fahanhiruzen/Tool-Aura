import { DocumentSummaryCard } from "./DocumentSummaryCard";
import { HealthCheckCard } from "./HealthCheckCard";
import { ChartCard } from "./ChartCard";
import { useReleaseStatus } from "@/hooks/use-dashboard";
import { useSubdomainChart } from "@/hooks/use-dashboard";

export function DashboardWidgetsGrid() {
  const release = useReleaseStatus();
  const subdomain = useSubdomainChart();

  return (
    <div className="grid gap-4 p-6 md:grid-cols-2">
      <DocumentSummaryCard />
      <HealthCheckCard />
      <ChartCard
        title="Release Status"
        data={release.data}
        isPending={release.isPending}
        error={release.error}
      />
      <ChartCard
        title="Subdomain"
        data={subdomain.data}
        isPending={subdomain.isPending}
        error={subdomain.error}
      />
    </div>
  );
}
