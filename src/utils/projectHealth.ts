import fs from "fs-extra";
import path from "node:path";
import { execa } from "execa";
import { type ProjectRecord } from "../types/project.js";

export interface ProjectHealth {
  exists: boolean;
  gitBranch?: string;
  gitDirty: boolean;
  gitReady: boolean;
  linearLinked: boolean;
  envMissing: boolean;
  brokenInstall: boolean;
  serverAlive: boolean;
}

export async function getProjectHealth(project: ProjectRecord): Promise<ProjectHealth> {
  const exists = Boolean(project.path) && (await fs.pathExists(project.path));

  if (!exists) {
    return {
      exists,
      gitDirty: false,
      gitReady: false,
      linearLinked: project.linear?.status === "synced",
      envMissing: false,
      brokenInstall: true,
      serverAlive: false,
    };
  }

  const packageJsonPath = path.join(project.path, "package.json");
  const nodeModulesPath = path.join(project.path, "node_modules");
  const hasPackageJson = await fs.pathExists(packageJsonPath);
  const needsInstall = hasPackageJson && !(await fs.pathExists(nodeModulesPath));
  const hasEnv = (await fs.pathExists(path.join(project.path, ".env"))) ||
    (await fs.pathExists(path.join(project.path, ".env.local")));

  const gitDirectory = path.join(project.path, ".git");
  const gitReady = await fs.pathExists(gitDirectory);
  let gitBranch: string | undefined;
  let gitDirty = false;

  if (gitReady) {
    const branch = await execa("git", ["branch", "--show-current"], {
      cwd: project.path,
      reject: false,
    });
    const status = await execa("git", ["status", "--short"], {
      cwd: project.path,
      reject: false,
    });

    gitBranch = branch.stdout || "detached";
    gitDirty = Boolean(status.stdout.trim());
  }

  return {
    exists,
    gitBranch,
    gitDirty,
    gitReady,
    linearLinked: project.linear?.status === "synced",
    envMissing: hasPackageJson && !hasEnv,
    brokenInstall: needsInstall,
    serverAlive: await isProcessAlive(project.workspace?.devServer?.pid),
  };
}

export async function isProcessAlive(pid?: number) {
  if (!pid) {
    return false;
  }

  if (process.platform === "win32") {
    const result = await execa("tasklist", ["/FI", `PID eq ${pid}`], {
      reject: false,
      windowsHide: true,
    });

    return result.stdout.includes(String(pid));
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

