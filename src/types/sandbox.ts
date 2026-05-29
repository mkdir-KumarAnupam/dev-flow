export type SandboxType =
  | "university"
  | "competitive"
  | "practice"
  | "interview"
  | "research";

export type SandboxLanguage = "cpp" | "java" | "python" | "sql" | "javascript" | "c";

export type SandboxActivity =
  | "assignment"
  | "lab"
  | "viva-practice"
  | "dsa-practice"
  | "mini-project"
  | "exam-revision"
  | "experiment";

export interface SandboxRecord {
  id: string;
  name: string;
  type: SandboxType;
  path: string;
  language: SandboxLanguage;
  activity: SandboxActivity;
  createdAt: string;
  lastOpenedAt?: string;
  semester?: number;
  course?: string;
  platform?: "leetcode" | "codeforces" | "codechef" | "hackerrank";
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
  tags?: string[];
  history?: Array<{
    action: string;
    at: string;
    detail?: string;
  }>;
}

