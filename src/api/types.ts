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

export interface CddbFigmaDocument {
  documentKey: string;
  parentDocumentKey: string | null;
  status: string;
  mergedAt: string | null;
  mergedBy: string | null;
  domainId: string;
  documentNumber: string;
  figmaDocumentLink: string;
  branchName: string | null;
  branchStatus: string | null;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaFill {
  blendMode: string;
  type: string;
  color?: FigmaColor;
}

export interface FigmaBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaTextStyle {
  fontFamily: string;
  fontPostScriptName: string | null;
  fontStyle: string;
  fontWeight: number;
  fontSize: number;
  textAlignHorizontal: string;
  textAlignVertical: string;
  letterSpacing: number;
  lineHeightPx: number;
  lineHeightPercent: number;
  lineHeightUnit: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  scrollBehavior: string;
  blendMode?: string;
  fills?: FigmaFill[];
  strokes?: FigmaFill[];
  strokeWeight?: number;
  strokeAlign?: string;
  absoluteBoundingBox?: FigmaBoundingBox;
  absoluteRenderBounds?: FigmaBoundingBox;
  constraints?: { vertical: string; horizontal: string };
  effects?: unknown[];
  interactions?: unknown[];
  children?: FigmaNode[];
  // CANVAS
  backgroundColor?: FigmaColor;
  prototypeStartNodeID?: string | null;
  flowStartingPoints?: unknown[];
  // FRAME
  clipsContent?: boolean;
  background?: FigmaFill[];
  // TEXT
  characters?: string;
  style?: FigmaTextStyle;
  characterStyleOverrides?: number[];
  styleOverrideTable?: Record<string, unknown>;
  lineTypes?: string[];
  lineIndentations?: number[];
}

export interface FigmaDocumentNode extends FigmaNode {
  type: "DOCUMENT";
  children: FigmaNode[];
}

export interface FigmaFileData {
  document: FigmaDocumentNode;
  components: Record<string, unknown>;
  componentSets: Record<string, unknown>;
  schemaVersion: number;
  styles: Record<string, unknown>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
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

export interface Reviewer {
  userEmail: string;
  approved: boolean;
  reviewerNotes: string;
}

export interface ReleaseRequest {
  id: string;
  document: string;
  documentKey: string | null;
  domainName: string | null;
  createdAt: string;
  progress: ReleaseProgress;
  status: ReleaseRequestStatus;
  reviewers: Reviewer[];
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

export interface GridIdHistory {
  gridId: string;
  message: string;
}

export interface GridChange {
  updatedBy: string;
  updatedAt: string;
  uploadedFileName: string;
  gridIdHistories: GridIdHistory[];
}

export interface GridHistoryResponse {
  fileName: string;
  changes: GridChange[];
}

export interface TextVariable {
  id: number;
  type: string;
  groupName: string;
  description: string;
  name: string;
  relevantDocuments: string | null;
  technicalCompliance: boolean | null;
  comment: string | null;
  hilId: string | null;
  conceptTextDeutsch: string | null;
  conceptText: string | null;
  mk: string | null;
  minValue: string | null;
  maxValue: string | null;
  alwaysShow: boolean | null;
  leadingZero: boolean | null;
  defaultErrorValue: string | null;
  configuration: string | null;
  commentsOnTextsAndDash: string | null;
  gen20xIf1Star35: string | null;
  gen20xIf1Star3mopf: string | null;
}
