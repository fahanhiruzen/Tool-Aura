import {
  ReleaseRequestsHeader,
  ToReviewSection,
  CreatedByMeSection,
} from "@/components/release-requests";
import { useNavigationStore } from "@/stores";

export function ReleaseRequestsPage() {
  const setActiveWithReleaseId = useNavigationStore((s) => s.setActiveWithReleaseId);

  return (
    <div className="flex flex-col">
      <ReleaseRequestsHeader />
      <hr className="mx-6 mt-4 border-border" />
      <div className="flex flex-col gap-4 px-6 py-4">
        <ToReviewSection onEdit={(id) => setActiveWithReleaseId("edit-release", id)} />
        <CreatedByMeSection onEdit={(id) => setActiveWithReleaseId("edit-release", id)} />
      </div>
    </div>
  );
}
