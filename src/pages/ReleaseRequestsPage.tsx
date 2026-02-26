import {
  ReleaseRequestsHeader,
  ToReviewSection,
  CreatedByMeSection,
} from "@/components/release-requests";
import { mockReleaseRequests } from "@/api/mocks";

export function ReleaseRequestsPage() {
  const { toReview, createdByMe } = mockReleaseRequests;

  return (
    <div className="flex flex-col">
      <ReleaseRequestsHeader />
      <hr className="mx-6 mt-4 border-border" />
      <div className="flex flex-col gap-4 px-6 py-4">
        <ToReviewSection items={toReview} />
        <CreatedByMeSection requests={createdByMe} />
      </div>
    </div>
  );
}
