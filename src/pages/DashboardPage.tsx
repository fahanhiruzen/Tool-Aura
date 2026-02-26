import { DashboardHeader } from "@/components/dashboard";
import { DashboardWidgetsGrid } from "@/components/dashboard";
import { UniqueIdsTable } from "@/components/dashboard";

export function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <DashboardWidgetsGrid />
      <UniqueIdsTable />
    </>
  );
}
