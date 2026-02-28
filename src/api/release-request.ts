import { api, apiCustom } from "./client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RequestStatusType =
  | "NEW"
  | "IN_PROGRESS"
  | "VALIDATION"
  | "VALIDATION_FAILED"
  | "VALIDATION_SUCCEEDED"
  | "REVIEW"
  | "RELEASE"
  | "COMPLETED";

export type UserRole = "CREATOR" | "REVIEWER" | "ADMIN";
export type DateRangeFilter =
  | "LAST_WEEK"
  | "LAST_MONTH"
  | "LAST_3_MONTHS"
  | "LAST_6_MONTHS"
  | "CURRENT_YEAR";
export type ReleaseProcessType = "DesignOnly" | "SPECIFICATION";

export interface CreateReleaseRequestPayload {
  documentKey: string;
  releaseProcessId: string;
}

export interface ReleaseRequestItem {
  id: string;
  releaseProcessName: string;
  releaseProcessType: ReleaseProcessType;
  documentKey: string;
  documentLink: string | null;
  domainId: string;
  status: RequestStatusType;
  createdBy: string;
  createdAt: string;
  requestRole: UserRole;
  releaseTag: string | null;
  releasedAt: string | null;
  reviewers: Array<{
    userEmail: string;
    approved: boolean;
    reviewerNotes: string;
  }>;
  reviewerNotes?: string;
  releaseHistoryId?: string;
}

export interface ReleaseRequestStep {
  stepType: "VALIDATION" | "REVIEW" | "RELEASE";
  status: "NEW" | "PENDING" | "DONE" | "FAILED";
  ignoredIds?: string[];
  messages: Array<{
    message: string;
    createdAt: string;
    createdBy: string;
    status: string;
  }>;
}

export interface ValidationResult {
  invalidElements: Array<{
    uniqueId: string;
    elementIds: string[];
    messages: Array<{
      message: string;
      messageType: "ERROR" | "WARNING";
    }>;
    messageType: "ERROR" | "WARNING";
  }>;
  status?:string;
  documentErrors: unknown[];
  documentWarnings: unknown[];
  totalErrorElements: number;
  totalPassingElements: number;
  totalWarningElements: number;
  ignoredIds?: string[];
  hasErrors?: boolean;
}

export interface PaginatedReleaseRequests {
  content: ReleaseRequestItem[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

export interface CreateReleasePayload {
  figmaDocumentVersionLink: string;
  releaseTag: string;
  userStoryLink: string;
  requirementsLink: string;
  presets: number[];
  userIdsToNotify: string[];
}

export type ReleaseProcessStatus = "ACTIVE" | "PENDING";
export type ReleaseProcessReleaseType = "SPECIFICATION" | "DESIGN";

export interface ReleaseProcess {
  id: number;
  name: string;
  description: string;
  rules: string | null;
  status: ReleaseProcessStatus;
  releaseType: ReleaseProcessReleaseType;
  canEdit: boolean;
  canDelete: boolean;
}

export interface PaginatedReleaseProcesses {
  content: ReleaseProcess[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const releaseRequestApi = {
  create: (data: CreateReleaseRequestPayload) =>
    api<ReleaseRequestItem>("/v1/release-request", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getDetails: (requestId: string) =>
    api<ReleaseRequestItem>(`/v1/release-request/${requestId}`),

  getSteps: (requestId: string) =>
    api<ReleaseRequestStep[]>(`/v1/release-request/${requestId}/steps`),

  validate: (requestId: string, ignoredIds: string[]) =>
    apiCustom<ValidationResult>(`/v1/release-request/${requestId}/validate`, {
      method: "POST",
      body: JSON.stringify({ ignoredIds }),
    }),

  assignReviewers: (requestId: string, reviewerEmails: string[]) =>
    api<Array<{ username: string; approved: boolean; reviewerNotes: string }>>(
      `/v1/release-request/${requestId}/review/assign`,
      {
        method: "POST",
        body: JSON.stringify({ reviewerEmails }),
      }
    ),

  updateReview: (
    requestId: string,
    data: { approve: boolean; reviewNotes: string }
  ) =>
    api<void>(`/v1/release-request/${requestId}/review/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  list: (data: {
    pageNumber: number;
    pageSize: number;
    currentDocumentKey: string;
    filter: {
      documentKey: string;
      iam: UserRole[];
      dateRange?: DateRangeFilter;
      status?: string;
    };
  }) =>
    api<PaginatedReleaseRequests>("/v1/release-request/search", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createRelease: (requestId: string, data: CreateReleasePayload) =>
    api<void>(`/v1/release-request/${requestId}/release`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listReleaseProcesses: (pageNumber = 0, pageSize = 100) =>
    api<PaginatedReleaseProcesses>(
      `/v1/release-process/all?pageNumber=${pageNumber}&pageSize=${pageSize}&statuses=ACTIVE,PENDING`
    ),

  getValidationResults: (requestId: string) =>
    api<ValidationResult>(`/v1/release-request/${requestId}/validation-results`),
};
