import chalk from "chalk";
import chokidar from "chokidar";
import clipboardy from "clipboardy";
import fs from "fs-extra";
import inquirer from "inquirer";
import os from "node:os";
import path from "node:path";
import { detectCurrentContext } from "../continuity/contextDetection.js";
import { appendCapturesToRegistry } from "../registry/captures.js";
import { getProjectsFromRegistry } from "../registry/projects.js";
import { getSandboxesFromRegistry } from "../registry/sandboxes.js";
import { appendCapturesToSession, readLocalSession, SESSION_FILE } from "../sessions/sessionRegistry.js";
import { type CaptureRecord, type CaptureType } from "../types/capture.js";

const CAPTURE_TYPE_MAP: Record<string, CaptureType> = {
  ".png": "screenshot",
  ".jpg": "screenshot",
  ".jpeg": "screenshot",
  ".webp": "screenshot",
  ".gif": "screenshot",
  ".svg": "reference",
  ".mp4": "recording",
  ".mov": "recording",
  ".webm": "recording",
};

const CAPTURE_FOLDER_MAP: Record<CaptureType, string> = {
  screenshot: "screenshots",
  recording: "recordings",
  reference: "references",
};

const TEMP_EXTENSIONS = new Set([".crdownload", ".part", ".tmp", ".download"]);
const CAPTURE_EXTENSIONS = new Set(Object.keys(CAPTURE_TYPE_MAP));
const ENDED_STATUSES = new Set(["completed", "archived", "abandoned"]);

interface CaptureContext {
  project: string;
  contextKind: "project" | "sandbox" | "workspace";
  path: string;
  sessionId?: string;
  label?: string;
}

interface CaptureEntry {
  filePath: string;
  fileName: string;
  extension: string;
  type: CaptureType;
  source: "watcher" | "clipboard";
}

export async function captureCommand(labelArg?: string) {
  const context = await resolveCaptureContext(labelArg);
  if (!context) {
    return;
  }

  const captureContext = context;

  const captureModes = await promptCaptureModes();
  const allowedTypes = resolveAllowedTypes(captureModes);
  const duration = await promptForDuration(captureContext);

  const capturesRoot = path.join(captureContext.path, "captures");
  const captureBase = captureContext.label ? path.join(capturesRoot, slugify(captureContext.label)) : capturesRoot;

  await fs.ensureDir(capturesRoot);
  await fs.ensureDir(captureBase);

  const sources = await resolveCaptureSources(captureModes);
  if (!sources.length && !captureModes.clipboard) {
    console.log(chalk.yellow("No capture sources found. Choose a different capture mode or add a valid folder."));
    return;
  }

  console.log(chalk.cyan("\nCapture Tracking Mode"));
  console.log(chalk.dim(`Attach target: ${captureBase}`));
  if (sources.length) {
    console.log(chalk.dim(`Watching: ${sources.join(", ")}`));
  }
  if (captureModes.clipboard) {
    console.log(chalk.dim("Clipboard capture enabled"));
  }

  const pending = new Map<string, "watcher" | "clipboard">();
  const processed = new Set<string>();
  let debounceHandle: NodeJS.Timeout | undefined;
  let shuttingDown = false;
  let rememberedAction: "move" | "copy" | "skip" | undefined;
  let processing = false;
  let rerunRequested = false;
  let clipboardTimer: NodeJS.Timeout | undefined;
  let lastClipboard = "";

  const ignored = (candidatePath: string) => {
    if (candidatePath.startsWith(captureBase)) {
      return true;
    }

    const ext = path.extname(candidatePath).toLowerCase();
    if (TEMP_EXTENSIONS.has(ext)) {
      return true;
    }

    return ext ? !CAPTURE_EXTENSIONS.has(ext) : false;
  };

  const watcher = sources.length
    ? chokidar.watch(sources, {
        ignoreInitial: true,
        ignorePermissionErrors: true,
        ignored,
        depth: 0,
      })
    : undefined;

  const sessionWatcher = duration?.sessionBound ? await attachSessionWatcher(captureContext, stopTracking) : undefined;
  const durationTimer = duration?.timeoutMs ? setTimeout(stopTracking, duration.timeoutMs) : undefined;

  watcher?.on("add", (filePath) => {
    if (!isSupportedCapture(filePath, allowedTypes)) {
      return;
    }

    if (processed.has(filePath)) {
      return;
    }

    pending.set(filePath, "watcher");
    scheduleProcessPending();
  });

  watcher?.on("error", (error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.log(chalk.red(`Watcher error: ${message}`));
  });

  if (captureModes.clipboard) {
    clipboardTimer = setInterval(() => void pollClipboard(), 1500);
  }

  async function pollClipboard() {
    if (shuttingDown) {
      return;
    }

    let text = "";
    try {
      text = (await clipboardy.read()).trim();
    } catch {
      return;
    }

    if (!text || text === lastClipboard) {
      return;
    }

    lastClipboard = text;
    const paths = extractClipboardPaths(text);
    if (!paths.length) {
      return;
    }

    for (const item of paths) {
      if (!isSupportedCapture(item, allowedTypes)) {
        continue;
      }

      if (processed.has(item)) {
        continue;
      }

      pending.set(item, "clipboard");
    }

    if (pending.size) {
      scheduleProcessPending();
    }
  }

  function scheduleProcessPending() {
    if (debounceHandle) {
      clearTimeout(debounceHandle);
    }

    debounceHandle = setTimeout(() => void processPending(), 250);
  }

  async function processPending() {
    if (shuttingDown || pending.size === 0) {
      return;
    }

    if (processing) {
      rerunRequested = true;
      return;
    }

    processing = true;

    const items = [...pending.entries()];
    pending.clear();

    const entries = await Promise.all(items.map(([filePath, source]) => buildCaptureEntry(filePath, source)));
    const supported = entries.filter((entry): entry is CaptureEntry => entry !== null);

    if (!supported.length) {
      await finishProcessing();
      return;
    }

    console.log(chalk.cyan("\nNew Visual Captures:"));
    supported.forEach((entry) => console.log(chalk.green(`\u2713 ${entry.fileName}`)));

    let action = rememberedAction;
    if (!action) {
      const answers = await inquirer.prompt<{
        action: "move" | "copy" | "skip";
        remember: boolean;
      }>([
        {
          type: "select",
          name: "action",
          message: `Attach to ${captureContext.project}/captures?`,
          choices: [
            { name: "Copy into captures", value: "copy" },
            { name: "Move into captures", value: "move" },
            { name: "Skip", value: "skip" },
          ],
          default: "copy",
        },
        {
          type: "confirm",
          name: "remember",
          message: "Remember this choice for this capture session?",
          default: false,
        },
      ]);

      action = answers.action;
      if (answers.remember) {
        rememberedAction = answers.action;
      }
    }

    if (action === "skip") {
      await finishProcessing();
      return;
    }

    const imported = await importCaptures(supported, captureBase, action);
    if (!imported.length) {
      await finishProcessing();
      return;
    }

    const records = await createCaptureRecords(imported, captureContext);
    await appendCapturesToRegistry(records);

    if (captureContext.sessionId) {
      await appendCapturesToSession(captureContext.path, records.map((record) => record.id));
    }

    for (const entry of supported) {
      processed.add(entry.filePath);
    }

    console.log(chalk.green(`Captured ${records.length} item${records.length === 1 ? "" : "s"}.`));
    await finishProcessing();
  }

  async function finishProcessing() {
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

    if (clipboardTimer) {
      clearInterval(clipboardTimer);
    }

    if (durationTimer) {
      clearTimeout(durationTimer);
    }

    await watcher?.close();
    if (sessionWatcher) {
      await sessionWatcher.close();
    }

    console.log(chalk.dim("\nCapture tracking stopped."));
  }

  process.on("SIGINT", stopTracking);
}

async function resolveCaptureContext(labelArg?: string): Promise<CaptureContext | undefined> {
  const detected = await detectCurrentContext();
  const projects = await getProjectsFromRegistry();
  const sandboxes = await getSandboxesFromRegistry();
  const localSession = await readLocalSession(detected.path);
  const localSessionId = localSession?.id;

  const { contextChoice } = await inquirer.prompt<{
    contextChoice: "active" | "session" | "debugging" | "learning" | "custom";
  }>([
    {
      type: "select",
      name: "contextChoice",
      message: "Attach captures to which context?",
      choices: [
        { name: `Active Project (${detected.project})`, value: "active" },
        { name: "Current Session", value: "session" },
        { name: "Current Debugging Context", value: "debugging" },
        { name: "Current Learning Context", value: "learning" },
        { name: "Custom Context", value: "custom" },
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
        label: labelArg,
      };
    }

    console.log(chalk.yellow("No active session found. Falling back to active project."));
  }

  if (contextChoice === "debugging") {
    const label = labelArg ?? "debugging";
    if (localSession) {
      return {
        project: localSession.project,
        contextKind: localSession.contextKind,
        path: localSession.path,
        sessionId: localSession.id,
        label,
      };
    }

    return {
      project: detected.project,
      contextKind: detected.contextKind,
      path: detected.path,
      sessionId: localSessionId,
      label,
    };
  }

  if (contextChoice === "learning") {
    const label = labelArg ?? "learning";
    if (detected.contextKind === "sandbox") {
      return {
        project: detected.project,
        contextKind: detected.contextKind,
        path: detected.path,
        sessionId: localSessionId,
        label,
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
          sessionId: localSessionId,
          label,
        };
      }
    }

    console.log(chalk.yellow("No learning contexts found. Falling back to active project."));
  }

  if (contextChoice === "custom") {
    const { label } = await inquirer.prompt<{ label: string }>([
      {
        type: "input",
        name: "label",
        message: "Context label (e.g., auth-debugging):",
        default: labelArg ?? "visual-captures",
      },
    ]);

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
            sessionId: localSessionId,
            label: label.trim() || labelArg,
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
      sessionId: localSessionId,
      label: label.trim() || labelArg,
    };
  }

  return {
    project: detected.project,
    contextKind: detected.contextKind,
    path: detected.path,
    sessionId: localSessionId,
    label: labelArg,
  };
}

async function promptCaptureModes() {
  const { modes } = await inquirer.prompt<{ modes: Array<"screenshots" | "recordings" | "clipboard" | "all"> }>([
    {
      type: "checkbox",
      name: "modes",
      message: "What should be captured?",
      choices: [
        { name: "Screenshots", value: "screenshots" },
        { name: "Screen Recordings", value: "recordings" },
        { name: "Copied Images", value: "clipboard" },
        { name: "All", value: "all" },
      ],
      validate: (value: string[]) => value.length > 0 || "Select at least one capture mode.",
    },
  ]);

  const set = new Set(modes);
  if (set.has("all")) {
    return { screenshots: true, recordings: true, clipboard: true };
  }

  return {
    screenshots: set.has("screenshots"),
    recordings: set.has("recordings"),
    clipboard: set.has("clipboard"),
  };
}

async function resolveCaptureSources(modes: { screenshots: boolean; recordings: boolean; clipboard: boolean }) {
  const home = os.homedir();
  const candidates: string[] = [path.join(home, "Downloads"), path.join(home, "Desktop")];

  if (modes.screenshots) {
    if (process.platform === "win32") {
      candidates.push(path.join(home, "Pictures", "Screenshots"));
    } else if (process.platform === "darwin") {
      candidates.push(path.join(home, "Desktop"));
    } else {
      candidates.push(path.join(home, "Pictures"));
    }
  }

  if (modes.recordings) {
    if (process.platform === "win32") {
      candidates.push(path.join(home, "Videos", "Captures"));
    } else if (process.platform === "darwin") {
      candidates.push(path.join(home, "Movies"));
    } else {
      candidates.push(path.join(home, "Videos"));
    }
  }

  const unique = [...new Set(candidates.map((item) => path.resolve(item)))];
  const existing: string[] = [];

  for (const candidate of unique) {
    if (await fs.pathExists(candidate)) {
      existing.push(candidate);
    }
  }

  return existing;
}

async function promptForDuration(context: CaptureContext) {
  const { durationChoice } = await inquirer.prompt<{
    durationChoice: "until" | "session" | "30m" | "1h";
  }>([
    {
      type: "select",
      name: "durationChoice",
      message: "Capture duration?",
      choices: [
        { name: "Until stopped", value: "until" },
        { name: "Session-bound", value: "session" },
        { name: "30 mins", value: "30m" },
        { name: "1 hour", value: "1h" },
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
      console.log(chalk.yellow("No session detected. Capturing until stopped."));
      return undefined;
    }

    return { sessionBound: true };
  }

  return undefined;
}

async function attachSessionWatcher(context: CaptureContext, stop: () => Promise<void>) {
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

async function buildCaptureEntry(filePath: string, source: "watcher" | "clipboard"): Promise<CaptureEntry | null> {
  const extension = path.extname(filePath).toLowerCase();
  const type = CAPTURE_TYPE_MAP[extension];
  if (!type) {
    return null;
  }

  if (!(await fs.pathExists(filePath))) {
    return null;
  }

  return {
    filePath,
    fileName: path.basename(filePath),
    extension,
    type,
    source,
  };
}

async function importCaptures(entries: CaptureEntry[], captureBase: string, action: "move" | "copy") {
  const imported: Array<{ entry: CaptureEntry; targetPath: string }> = [];

  for (const entry of entries) {
    const targetDir = path.join(captureBase, CAPTURE_FOLDER_MAP[entry.type]);
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

async function createCaptureRecords(
  imported: Array<{ entry: CaptureEntry; targetPath: string }>,
  context: CaptureContext
): Promise<CaptureRecord[]> {
  const capturedAt = new Date().toISOString();

  return Promise.all(
    imported.map(async ({ entry, targetPath }) => {
      const stats = await fs.stat(targetPath);
      return {
        id: `${context.project}:${capturedAt}:${path.basename(targetPath)}`,
        fileName: entry.fileName,
        originalPath: entry.filePath,
        capturedTo: targetPath,
        project: context.project,
        contextKind: context.contextKind,
        contextPath: context.path,
        sessionId: context.sessionId,
        capturedAt,
        type: entry.type,
        source: entry.source,
        label: context.label,
        sizeBytes: stats.size,
      };
    })
  );
}

function isSupportedCapture(filePath: string, allowedTypes: Set<CaptureType>) {
  const ext = path.extname(filePath).toLowerCase();
  if (!CAPTURE_EXTENSIONS.has(ext) || TEMP_EXTENSIONS.has(ext)) {
    return false;
  }

  const type = CAPTURE_TYPE_MAP[ext];
  return type ? allowedTypes.has(type) : false;
}

function resolveAllowedTypes(modes: { screenshots: boolean; recordings: boolean; clipboard: boolean }) {
  const allowed = new Set<CaptureType>();
  if (modes.screenshots) {
    allowed.add("screenshot");
  }
  if (modes.recordings) {
    allowed.add("recording");
  }
  if (modes.clipboard) {
    allowed.add("screenshot");
    allowed.add("reference");
  }

  if (allowed.size === 0) {
    allowed.add("screenshot");
  }

  return allowed;
}

function extractClipboardPaths(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
    .filter((item) => path.isAbsolute(item));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
