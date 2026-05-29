import { type Editor } from "./project.js";

export type SessionStatus =
  | "active"
  | "in-progress"
  | "paused"
  | "blocked"
  | "debugging"
  | "review-needed"
  | "completed"
  | "archived"
  | "abandoned";

export interface DevSessionRecord {
  id: string;
  project: string;
  contextKind: "project" | "sandbox" | "workspace";
  path: string;
  branch?: string;
  status: SessionStatus;
  summary: string;
  nextAction: string;
  notes?: string;
  openFiles: string[];
  runningServices: string[];
  sketches?: string[];
  assets?: string[];
  captures?: string[];
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  tags: string[];
  editor: Editor;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeFriction {
  level: "LOW" | "MEDIUM" | "HIGH";
  checks: Array<{
    label: string;
    status: "ok" | "warn" | "bad";
    detail: string;
  }>;
}
