import chalk from "chalk";
import chokidar from "chokidar";
import fs from "fs-extra";
import inquirer from "inquirer";
import os from "node:os";
import path from "node:path";
import { detectCurrentContext } from "../continuity/contextDetection.js";
import { appendAssetsToRegistry } from "../registry/assets.js";
import { getProjectsFromRegistry } from "../registry/projects.js";
import { getSandboxesFromRegistry } from "../registry/sandboxes.js";
import { appendAssetsToSession, readLocalSession, SESSION_FILE } from "../sessions/sessionRegistry.js";
import { type AssetCategory, type AssetRecord } from "../types/asset.js";

const CATEGORY_MAP: Record<string, AssetCategory> = {
  ".png": "images",
  ".jpg": "images",
  ".jpeg": "images",
  ".webp": "images",
  ".gif": "images",
  ".svg": "vectors",
  ".ttf": "fonts",
  ".otf": "fonts",
  ".woff": "fonts",
  ".woff2": "fonts",
  ".mp4": "videos",
  ".mov": "videos",
  ".webm": "videos",
  ".zip": "archives",
  ".rar": "archives",
  ".mp3": "audio",
  ".wav": "audio",
  ".pdf": "documents",
  ".fig": "documents",
  ".sketch": "documents",
};

const ENDED_STATUSES = new Set(["completed", "archived", "abandoned"]);
const TEMP_EXTENSIONS = new Set([".crdownload", ".part", ".tmp", ".download"]);
const CATEGORY_EXTENSIONS = new Set(Object.keys(CATEGORY_MAP));

interface TrackContext {
  project: string;
  contextKind: "project" | "sandbox" | "workspace";
  path: string;
  sessionId?: string;
}

export async function trackAssetCommand(targetDir?: string) {
  const watchDir = await resolveWatchDirectory(targetDir);
  if (!watchDir) {
    return;
  }

  const context = await resolveTrackingContext();
  if (!context) {
    return;
  }

  const trackingContext = context;

  const { recursive } = await inquirer.prompt<{ recursive: boolean }>([
    {
      type: "confirm",
      name: "recursive",
      message: "Include subfolders?",
      default: false,
    },
  ]);

  const duration = await promptForDuration(trackingContext);
  const assetsRoot = path.join(trackingContext.path, "assets");

  await fs.ensureDir(assetsRoot);

  console.log(chalk.cyan(`\nAsset Tracking Mode: watching ${watchDir}`));
  console.log(chalk.dim(`Attach target: ${assetsRoot}`));

  const pending = new Set<string>();
  let debounceHandle: NodeJS.Timeout | undefined;
  let shuttingDown = false;
  let rememberedAction: "move" | "copy" | "skip" | undefined;
  let processing = false;
  let rerunRequested = false;

  const watcher = chokidar.watch(watchDir, {
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ignored: (candidatePath) => {
      const ext = path.extname(candidatePath).toLowerCase();
      if (TEMP_EXTENSIONS.has(ext)) {
        return true;
      }

      return ext ? !CATEGORY_EXTENSIONS.has(ext) : false;
    },
    depth: recursive ? undefined : 0,
  });

  const sessionWatcher = duration?.sessionBound ? await attachSessionWatcher(trackingContext, stopTracking) : undefined;
  const durationTimer = duration?.timeoutMs ? setTimeout(stopTracking, duration.timeoutMs) : undefined;

  watcher.on("add", (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!CATEGORY_MAP[ext]) {
      return;
    }

    if (TEMP_EXTENSIONS.has(ext)) {
      return;
    }

    pending.add(filePath);
    if (debounceHandle) {
      clearTimeout(debounceHandle);
    }

    debounceHandle = setTimeout(() => void processPending(), 200);
  });

  watcher.on("error", (error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.log(chalk.red(`Watcher error: ${message}`));
  });

  async function processPending() {
    if (shuttingDown || pending.size === 0) {
      return;
    }

    if (processing) {
      rerunRequested = true;
      return;
    }

    processing = true;

    const files = [...pending];
    pending.clear();

    const entries = await Promise.all(files.map(buildAssetEntry));
    const supported = entries.filter((entry): entry is AssetEntry => entry !== null);

    if (!supported.length) {
      processing = false;
      if (rerunRequested) {
        rerunRequested = false;
        await processPending();
      }
      return;
    }

    console.log(chalk.cyan("\nNew Assets Found:"));
    supported.forEach((entry) => {
      console.log(chalk.green(`\u2713 ${entry.fileName}`));
    });

    let action = rememberedAction;

    if (!action) {
      const answers = await inquirer.prompt<{
        action: "move" | "copy" | "skip";
        remember: boolean;
      }>([
        {
          type: "select",
          name: "action",
          message: `Import into ${trackingContext.project}/assets?`,
          choices: [
            { name: "Move into assets", value: "move" },
            { name: "Copy into assets", value: "copy" },
            { name: "Skip", value: "skip" },
          ],
          default: "move",
        },
        {
          type: "confirm",
          name: "remember",
          message: "Remember this choice for this tracking session?",
          default: false,
        },
      ]);

      action = answers.action;
      if (answers.remember) {
        rememberedAction = answers.action;
      }
    }

    if (action === "skip") {
      processing = false;
      if (rerunRequested) {
        rerunRequested = false;
        await processPending();
      }
      return;
    }

    const imported = await importAssets(supported, assetsRoot, action);
    if (!imported.length) {
      processing = false;
      if (rerunRequested) {
        rerunRequested = false;
        await processPending();
      }
      return;
    }

    const records = await createAssetRecords(imported, trackingContext);
    await appendAssetsToRegistry(records);

    if (trackingContext.sessionId) {
      await appendAssetsToSession(trackingContext.path, records.map((record) => record.id));
    }

    console.log(chalk.green(`Imported ${records.length} asset${records.length === 1 ? "" : "s"}.`));

    processing = false;
    if (rerunRequested) {
      rerunRequested = false;
      await processPending();
    }
  }

  async function stopTracking() {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    if (debounceHandle) {
      clearTimeout(debounceHandle);
    }

    if (durationTimer) {
      clearTimeout(durationTimer);
    }

    await watcher.close();
    if (sessionWatcher) {
      await sessionWatcher.close();
    }

    console.log(chalk.dim("\nAsset tracking stopped."));
  }

  process.on("SIGINT", stopTracking);
}

interface AssetEntry {
  filePath: string;
  fileName: string;
  extension: string;
  category: AssetCategory;
}

async function buildAssetEntry(filePath: string): Promise<AssetEntry | null> {
  const extension = path.extname(filePath).toLowerCase();
  const category = CATEGORY_MAP[extension];
  if (!category) {
    return null;
  }

  return {
    filePath,
    fileName: path.basename(filePath),
    extension,
    category,
  };
}

async function resolveWatchDirectory(targetDir?: string) {
  if (targetDir) {
    const resolved = path.resolve(targetDir);
    if (await fs.pathExists(resolved)) {
      const stat = await fs.stat(resolved);
      if (stat.isDirectory()) {
        return resolved;
      }

      console.log(chalk.red(`Path is not a directory: ${resolved}`));
      return undefined;
    }

    console.log(chalk.red(`Directory not found: ${resolved}`));
    return undefined;
  }

  const home = os.homedir();
  const downloads = path.join(home, "Downloads");
  const desktop = path.join(home, "Desktop");

  const { dirChoice } = await inquirer.prompt<{ dirChoice: "downloads" | "desktop" | "custom" }>([
    {
      type: "select",
      name: "dirChoice",
      message: "Track which directory?",
      choices: [
        { name: "Downloads", value: "downloads" },
        { name: "Desktop", value: "desktop" },
        { name: "Custom path", value: "custom" },
      ],
      default: "downloads",
    },
  ]);

  if (dirChoice === "downloads") {
    return downloads;
  }

  if (dirChoice === "desktop") {
    return desktop;
  }

  const { customPath } = await inquirer.prompt<{ customPath: string }>([
    {
      type: "input",
      name: "customPath",
      message: "Directory path:",
      validate: async (value: string) => {
        const resolved = path.resolve(value.trim());
        if (!(await fs.pathExists(resolved))) {
          return "Path not found.";
        }

        const stat = await fs.stat(resolved);
        return stat.isDirectory() || "Path must be a directory.";
      },
    },
  ]);

  return path.resolve(customPath.trim());
}

async function resolveTrackingContext(): Promise<TrackContext | undefined> {
  const detected = await detectCurrentContext();
  const projects = await getProjectsFromRegistry();
  const sandboxes = await getSandboxesFromRegistry();
  const localSession = await readLocalSession(detected.path);
  const sessionForPath = async (targetPath: string) => (await readLocalSession(targetPath))?.id;

  const { contextChoice } = await inquirer.prompt<{ contextChoice: "active" | "session" | "learning" | "custom" }>([
    {
      type: "select",
      name: "contextChoice",
      message: "Attach assets to which context?",
      choices: [
        { name: `Active Project (${detected.project})`, value: "active" },
        { name: "Current Session", value: "session" },
        { name: "Current Learning Context", value: "learning" },
        { name: "Custom Project", value: "custom" },
      ],
      default: "active",
    },
  ]);

  if (contextChoice === "session") {
    if (localSession) {
      return {
        project: localSession.project,
        contextKind: localSession.contextKind,
        path: localSession.path,
        sessionId: localSession.id,
      };
    }

    console.log(chalk.yellow("No active session found. Falling back to active project."));
  }

  if (contextChoice === "learning") {
    if (detected.contextKind === "sandbox") {
      return {
        project: detected.project,
        contextKind: detected.contextKind,
        path: detected.path,
        sessionId: await sessionForPath(detected.path),
      };
    }

    if (sandboxes.length) {
      const { sandboxChoice } = await inquirer.prompt<{ sandboxChoice: string }>([
        {
          type: "select",
          name: "sandboxChoice",
          message: "Choose learning context:",
          choices: sandboxes.map((sandbox) => ({ name: sandbox.name, value: sandbox.path })),
        },
      ]);

      const selected = sandboxes.find((sandbox) => sandbox.path === sandboxChoice);
      if (selected) {
        return {
          project: selected.name,
          contextKind: "sandbox",
          path: selected.path,
          sessionId: await sessionForPath(selected.path),
        };
      }
    }

    console.log(chalk.yellow("No learning contexts found. Falling back to active project."));
  }

  if (contextChoice === "custom") {
    if (projects.length) {
      const { projectChoice } = await inquirer.prompt<{ projectChoice: string }>([
        {
          type: "select",
          name: "projectChoice",
          message: "Attach to which project?",
          choices: [
            ...projects.map((project) => ({ name: project.name, value: project.path })),
            { name: "Custom path", value: "custom" },
          ],
        },
      ]);

      if (projectChoice !== "custom") {
        const selected = projects.find((project) => project.path === projectChoice);
        if (selected) {
          return {
            project: selected.name,
            contextKind: "project",
            path: selected.path,
            sessionId: await sessionForPath(selected.path),
          };
        }
      }
    }

    const { customPath } = await inquirer.prompt<{ customPath: string }>([
      {
        type: "input",
        name: "customPath",
        message: "Project path:",
        validate: async (value: string) => {
          const resolved = path.resolve(value.trim());
          if (!(await fs.pathExists(resolved))) {
            return "Path not found.";
          }

          const stat = await fs.stat(resolved);
          return stat.isDirectory() || "Path must be a directory.";
        },
      },
    ]);

    return {
      project: path.basename(customPath.trim()),
      contextKind: "project",
      path: path.resolve(customPath.trim()),
      sessionId: await sessionForPath(path.resolve(customPath.trim())),
    };
  }

  return {
    project: detected.project,
    contextKind: detected.contextKind,
    path: detected.path,
    sessionId: localSession?.id,
  };
}

async function promptForDuration(context: TrackContext) {
  const { durationChoice } = await inquirer.prompt<{
    durationChoice: "until" | "30m" | "1h" | "session";
  }>([
    {
      type: "select",
      name: "durationChoice",
      message: "Track duration?",
      choices: [
        { name: "Until stopped", value: "until" },
        { name: "30 mins", value: "30m" },
        { name: "1 hour", value: "1h" },
        { name: "Session-bound", value: "session" },
      ],
      default: "until",
    },
  ]);

  if (durationChoice === "30m") {
    return { timeoutMs: 30 * 60 * 1000 };
  }

  if (durationChoice === "1h") {
    return { timeoutMs: 60 * 60 * 1000 };
  }

  if (durationChoice === "session") {
    if (!context.sessionId) {
      console.log(chalk.yellow("No session detected. Tracking until stopped."));
      return undefined;
    }

    return { sessionBound: true };
  }

  return undefined;
}

async function attachSessionWatcher(context: TrackContext, stop: () => Promise<void>) {
  if (!context.sessionId) {
    return undefined;
  }

  const sessionPath = path.join(context.path, SESSION_FILE);
  if (!(await fs.pathExists(sessionPath))) {
    return undefined;
  }

  return chokidar.watch(sessionPath, { ignoreInitial: true }).on("change", async () => {
    const session = await readLocalSession(context.path);
    if (session && ENDED_STATUSES.has(session.status)) {
      await stop();
    }
  });
}

async function importAssets(entries: AssetEntry[], assetsRoot: string, action: "move" | "copy") {
  const imported: Array<{ entry: AssetEntry; targetPath: string }> = [];

  for (const entry of entries) {
    const stable = await waitForStableFile(entry.filePath);
    if (!stable) {
      console.log(chalk.dim(`Skipped (still downloading): ${entry.fileName}`));
      continue;
    }

    const targetDir = path.join(assetsRoot, entry.category);
    await fs.ensureDir(targetDir);

    const targetPath = await getUniqueDestination(targetDir, entry.fileName);
    if (path.resolve(targetPath) === path.resolve(entry.filePath)) {
      continue;
    }

    if (action === "move") {
      await fs.move(entry.filePath, targetPath, { overwrite: false });
    } else {
      await fs.copy(entry.filePath, targetPath, { overwrite: false, errorOnExist: false });
    }

    imported.push({ entry, targetPath });
  }

  return imported;
}

async function waitForStableFile(filePath: string, maxWaitMs = 1500, intervalMs = 150) {
  let lastSize = -1;
  let stableCount = 0;
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const stats = await fs.stat(filePath).catch(() => undefined);
    if (!stats) {
      return false;
    }

    if (stats.size === lastSize) {
      stableCount += 1;
      if (stableCount >= 2) {
        return true;
      }
    } else {
      stableCount = 0;
      lastSize = stats.size;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

async function getUniqueDestination(targetDir: string, fileName: string) {
  const base = path.parse(fileName);
  let candidate = path.join(targetDir, fileName);
  let counter = 1;

  while (await fs.pathExists(candidate)) {
    candidate = path.join(targetDir, `${base.name}-${counter}${base.ext}`);
    counter += 1;
  }

  return candidate;
}

async function createAssetRecords(
  imported: Array<{ entry: AssetEntry; targetPath: string }>,
  context: TrackContext
): Promise<AssetRecord[]> {
  const importedAt = new Date().toISOString();

  return Promise.all(
    imported.map(async ({ entry, targetPath }) => {
      const stats = await fs.stat(targetPath);
      return {
        id: `${context.project}:${importedAt}:${path.basename(targetPath)}`,
        fileName: entry.fileName,
        originalPath: entry.filePath,
        importedTo: targetPath,
        project: context.project,
        contextKind: context.contextKind,
        contextPath: context.path,
        sessionId: context.sessionId,
        importedAt,
        type: entry.category,
        sizeBytes: stats.size,
      };
    })
  );
}
