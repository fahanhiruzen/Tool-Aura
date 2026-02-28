import type {
  DocumentSummary,
  HealthCheck,
  ReleaseStatus,
  UniqueIdsResponse,
  ReleaseRequestsData,
} from "./types";

export const mockDocumentSummary: DocumentSummary = {
  id: "doc-213",
  name: "Doc213",
};

export const mockHealthCheck: HealthCheck = {
  status: "good",
  message: "Good",
  allIdsLinked: true,
};

export const mockReleaseStatus: ReleaseStatus = {
  segments: [
    { label: "Done", value: 20, color: "green" },
    { label: "Drafts", value: 60, color: "gray" },
    { label: "Deleted", value: 20, color: "red" },
  ],
  donePercent: 20,
};

export const mockSubdomainChart: ReleaseStatus = {
  segments: [
    { label: "Keyboard", value: 20, color: "green" },
    { label: "Control Element", value: 60, color: "gray" },
    { label: "Text Field", value: 20, color: "red" },
  ],
  donePercent: 20,
};

export const mockUniqueIds: UniqueIdsResponse = {
  total: 1,
  items: [
    {
      id: "20239394",
      parentName: "Unique ID 20239394",
      type: "Screen",
      screenId: "20239394",
      status: "linked",
    },
  ],
};

export const mockReleaseRequests: ReleaseRequestsData = {
  toReview: [
    {
      id: "tr-1",
      title: "HMI Release v2.4.1",
      assignedAt: "12/20/25 12:20 pm",
    },
  ],
  createdByMe: [

  ],
};
