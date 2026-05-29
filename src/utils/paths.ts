import fs from "fs-extra";
import os from "node:os";
import path from "node:path";

const GLOBAL_DIR_NAME = ".dev-cli";

export function getGlobalRoot() {
  return path.resolve(os.homedir(), GLOBAL_DIR_NAME);
}

export async function ensureGlobalRoot() {
  const root = getGlobalRoot();
  await fs.ensureDir(root);
  return root;
}

export async function ensureGlobalDirectories() {
  const root = await ensureGlobalRoot();
  const subdirs = [
    "analytics",
    "achievements",
    "streaks",
    "sessions",
    "continuity",
    "dashboard",
    "workspace",
    "sandbox",
    "sketches",
    "history",
    "metadata",
    "assets",
    "captures",
    "cache",
    "logs",
    "layouts",
    "temp",
  ];

  await Promise.all(subdirs.map((dir) => fs.ensureDir(path.join(root, dir))));
}

export function getProfilePath() {
  return path.join(getGlobalRoot(), "profile.json");
}

export function getSettingsPath() {
  return path.join(getGlobalRoot(), "settings.json");
}

export function getProjectsPath() {
  return path.join(getGlobalRoot(), "projects.json");
}

export function getSessionsPath() {
  return path.join(getGlobalRoot(), "sessions.json");
}

export function getAssetsPath() {
  return path.join(getGlobalRoot(), "assets.json");
}

export function getCapturesPath() {
  return path.join(getGlobalRoot(), "captures.json");
}

export function getAnalyticsPath() {
  return path.join(getGlobalRoot(), "analytics");
}

export function getSandboxPath() {
  return path.join(getGlobalRoot(), "sandboxes.json");
}

export function getSketchesRegistryPath() {
  return path.join(getGlobalRoot(), "sketches.json");
}

export function getSketchesDirectory() {
  return path.join(getGlobalRoot(), "sketches");
}

export function getDashboardPath() {
  return path.join(getGlobalRoot(), "dashboard");
}

export function getWorkspacePath() {
  return path.join(getGlobalRoot(), "workspace");
}

export function getHistoryPath() {
  return path.join(getGlobalRoot(), "history");
}

export function getAchievementsPath() {
  return path.join(getGlobalRoot(), "achievements");
}

export function getTempPath() {
  return path.join(getGlobalRoot(), "temp");
}

export function getPracticePath() {
  return path.join(getGlobalRoot(), "practice.json");
}

export function getActivePracticePath() {
  return path.join(getGlobalRoot(), ".active-problem.json");
}

export function getProjectsDirectory() {
  const homeDirectory = process.env.HOME || process.env.USERPROFILE;

  if (!homeDirectory) {
    return path.resolve("projects");
  }

  return process.env.DEV_PROJECTS_DIR ?? path.join(homeDirectory, "projects");
}

export function getSandboxDirectory() {
  const homeDirectory = process.env.HOME || process.env.USERPROFILE;

  if (!homeDirectory) {
    return path.resolve("sandbox");
  }

  return process.env.DEV_SANDBOX_DIR ?? path.join(homeDirectory, "sandbox");
}
