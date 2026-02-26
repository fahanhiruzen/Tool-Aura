export interface DocumentSummary {
  id: string;
  name: string;
}

export interface HealthCheck {
  status: "good" | "warning" | "error";
  message: string;
  allIdsLinked: boolean;
}

export interface ChartSegment {
  label: string;
  value: number;
  color: "green" | "gray" | "red";
}

export interface ReleaseStatus {
  segments: ChartSegment[];
  donePercent: number;
}

export interface UniqueIdRow {
  id: string;
  parentName: string;
  type: string;
  screenId: string;
  status: "linked" | "unlinked" | "draft";
}

export interface UniqueIdsResponse {
  items: UniqueIdRow[];
  total: number;
}

export type ReleaseProgress =
  | "Release Created"
  | "Ready"
  | "Waiting for Review";

export type ReleaseRequestStatus = "completed" | "in_progress";

export interface ReleaseRequest {
  id: string;
  document: string;
  domainName: string | null;
  createdAt: string;
  progress: ReleaseProgress;
  status: ReleaseRequestStatus;
}

export interface ToReviewRequest {
  id: string;
  title: string;
  assignedAt: string;
}

export interface ReleaseRequestsData {
  toReview: ToReviewRequest[];
  createdByMe: ReleaseRequest[];
}
