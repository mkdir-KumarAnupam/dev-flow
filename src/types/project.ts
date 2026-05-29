export type ProjectType = "nextjs" | "react-vite" | "express-api" | "mern-stack" | "cli-tool" | "ai-app";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type Editor = "code" | "hx" | "nvim" | "webstorm";

export type UiLibrary = "none" | "shadcn" | "daisyui";

export type LinearPriority = "none" | "urgent" | "high" | "medium" | "low";

export type DeploymentStatus = "not-configured" | "ready" | "deploying" | "deployed" | "failed";

export interface ProjectAnswers {
  type: ProjectType;
  name: string;
  description: string;
  typescript: boolean;
  tailwind: boolean;
  packageManager: PackageManager;
  uiLibrary: UiLibrary;
  git: boolean;
  editor: Editor;
  openEditor: boolean;
  startDevServer: boolean;
  docker: boolean;
  githubRepo: boolean;
  linear: {
    enabled: boolean;
    mode: "project" | "project-with-issues";
    apiKey?: string;
    teamId?: string;
    details?: {
      deadline?: string;
      priority?: LinearPriority;
      lead?: string;
      notes?: string;
    };
  };
  tags: string[];
}

export interface ProjectRecord {
  name: string;
  type: ProjectType | string;
  description?: string;
  path: string;
  editor: Editor;
  packageManager?: PackageManager;
  createdAt: string;
  tags?: string[];
  deployment?: {
    status: DeploymentStatus;
    target?: string;
    url?: string;
    updatedAt?: string;
  };
  linear?: {
    projectId?: string;
    projectUrl?: string;
    syncedAt?: string;
    pendingFile?: string;
    status?: "synced" | "pending";
    deadline?: string;
    priority?: LinearPriority;
  };
  workspace?: {
    restoreCommand?: string;
    devServer?: {
      command: string;
      pid?: number;
      startedAt?: string;
      status: "running" | "not-started" | "failed";
      logFile?: string;
      message?: string;
    };
  };
}
