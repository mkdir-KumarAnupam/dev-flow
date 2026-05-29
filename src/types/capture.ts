export type CaptureType = "screenshot" | "recording" | "reference";

export interface CaptureRecord {
  id: string;
  fileName: string;
  originalPath: string;
  capturedTo: string;
  project: string;
  contextKind: "project" | "sandbox" | "workspace";
  contextPath: string;
  sessionId?: string;
  capturedAt: string;
  type: CaptureType;
  source: "watcher" | "clipboard";
  label?: string;
  sizeBytes?: number;
}
