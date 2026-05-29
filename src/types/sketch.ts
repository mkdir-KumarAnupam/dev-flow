export type SketchContextKind = "project" | "sandbox" | "workspace";

export interface SketchProblemContext {
  title: string;
  slug: string;
  platform?: string;
  difficulty?: string;
  topics?: string[];
}

export interface SketchRecord {
  id: string;
  title: string;
  slug: string;
  filePath?: string;
  url: string;
  project: string;
  contextKind: SketchContextKind;
  contextPath: string;
  sessionId?: string;
  branch?: string;
  tags: string[];
  problem?: SketchProblemContext;
  createdAt: string;
  updatedAt: string;
}
