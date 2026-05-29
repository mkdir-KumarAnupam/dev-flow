export type AssetCategory =
  | "images"
  | "fonts"
  | "videos"
  | "vectors"
  | "audio"
  | "archives"
  | "documents"
  | "other";

export interface AssetRecord {
  id: string;
  fileName: string;
  originalPath: string;
  importedTo: string;
  project: string;
  contextKind: "project" | "sandbox" | "workspace";
  contextPath: string;
  sessionId?: string;
  importedAt: string;
  type: AssetCategory;
  sizeBytes?: number;
}
