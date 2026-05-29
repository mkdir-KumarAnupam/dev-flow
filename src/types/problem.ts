import { type SandboxLanguage } from "./sandbox.js";

export type ProblemPlatform = "leetcode" | "hackerrank" | "codeforces" | "codechef";
export type ProblemDifficulty = "easy" | "medium" | "hard";
export type ProblemStatus = "assigned" | "attempted" | "solved" | "stuck" | "abandoned";

export interface PracticeProblem {
  platform: ProblemPlatform;
  problemId: string | number;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  topics: string[];
  url: string;
  acceptanceRate?: number;
  companies?: string[];
}

export interface ProblemRecord extends PracticeProblem {
  language: SandboxLanguage;
  status: ProblemStatus;
  path: string;
  startedAt: string;
  endedAt: string | null;
  timeSpentMinutes: number;
  attempts: number;
  notes: string[];
  history: Array<{
    action: string;
    at: string;
    detail?: string;
  }>;
}

