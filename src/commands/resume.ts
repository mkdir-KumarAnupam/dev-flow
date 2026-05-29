import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";
import path from "node:path";
import { estimateResumeFriction } from "../resume/friction.js";
import { getCapturesForSessionOrContext } from "../registry/captures.js";
import { getSessionsFromRegistry } from "../sessions/sessionRegistry.js";
import { getSketchesForSessionOrContext } from "../sketches/sketches.js";
import { type DevSessionRecord, type ResumeFriction, type SessionStatus } from "../types/session.js";
import { openExternal } from "../utils/openExternal.js";
import { openEditor } from "../workspace/openEditor.js";

const unfinished = new Set<SessionStatus>(["active", "in-progress", "paused", "blocked", "debugging", "review-needed"]);

export async function resumeCommand() {
  const sessions = prioritizeSessions(await getSessionsFromRegistry());

  if (sessions.length === 0) {
    console.log(chalk.yellow("No saved sessions yet. Run `dev session` inside a workspace first."));
    return;
  }

  const { session } = await inquirer.prompt<{ session: DevSessionRecord }>([
    {
      type: "select",
      name: "session",
      message: "Resume session:",
      pageSize: 10,
      choices: sessions.slice(0, 25).map((item) => ({
        name: sessionChoiceLabel(item),
        value: item,
      })),
    },
  ]);

  const sketches = await getSketchesForSessionOrContext(session.id, session.path);
  const sketchLines = sketches.map((sketch) => `${sketch.title} ${chalk.dim(sketch.url)}`);
  const captures = await getCapturesForSessionOrContext(session.id, session.path);
  const captureLines = captures.slice(0, 6).map((capture) => capture.fileName);
  const friction = await estimateResumeFriction(session);
  renderResumeBrief(session, friction, sketchLines, captureLines);

  const { openWorkspace } = await inquirer.prompt<{ openWorkspace: boolean }>([
    {
      type: "confirm",
      name: "openWorkspace",
      message: "Open workspace in editor?",
      default: true,
    },
  ]);

  if (openWorkspace) {
    await openEditor(session.editor, session.path);
  }

  if (sketches.length) {
    const { openSketches } = await inquirer.prompt<{ openSketches: boolean }>([
      {
        type: "confirm",
        name: "openSketches",
        message: "Open visual sketches in Excalidraw?",
        default: true,
      },
    ]);

    if (openSketches) {
      await openExternal("https://excalidraw.com");
      console.log(chalk.dim("Import the .excalidraw files listed above to resume visual context."));
    }
  }

  if (captures.length) {
    const { openCaptures } = await inquirer.prompt<{ openCaptures: boolean }>([
      {
        type: "confirm",
        name: "openCaptures",
        message: "Open capture folder?",
        default: false,
      },
    ]);

    if (openCaptures) {
      await openExternal(path.join(session.path, "captures"));
    }
  }
}

function renderResumeBrief(session: DevSessionRecord, friction: ResumeFriction, sketches: string[], captures: string[]) {
  console.log(
    boxen(
      [
        `${chalk.dim("project")} ${chalk.cyan(session.project)}   ${chalk.dim("status")} ${statusColor(session.status)(formatStatus(session.status))}`,
        `${chalk.dim("path   ")} ${chalk.white(session.path)}`,
        `${chalk.dim("branch ")} ${chalk.white(session.branch ?? "none")}   ${chalk.dim("last active")} ${chalk.white(relativeTime(session.updatedAt))}`,
        "",
        chalk.cyanBright("where your thinking stopped"),
        session.summary,
        "",
        chalk.magentaBright("next action"),
        session.nextAction,
        sketches.length ? `\n${chalk.cyanBright("visual context available")}` : "",
        ...sketches.map((sketch) => `  ${sketch}`),
        captures.length ? `\n${chalk.cyanBright("visual captures available")}` : "",
        ...captures.map((capture) => `  ${capture}`),
        "",
        chalk.cyanBright("resume complexity"),
        complexityColor(friction.level)(friction.level),
        ...friction.checks.map((check) => `  ${checkIcon(check.status)} ${chalk.dim(check.label.padEnd(12))} ${check.detail}`),
        session.openFiles.length ? `\n${chalk.cyanBright("open files")}\n${session.openFiles.map((file) => `  ${file}`).join("\n")}` : "",
        session.runningServices.length ? `\n${chalk.cyanBright("running services")}\n${session.runningServices.map((service) => `  ${service}`).join("\n")}` : "",
        session.notes ? `\n${chalk.cyanBright("notes")}\n${session.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      {
        title: " resume continuity ",
        borderColor: friction.level === "LOW" ? "#63E6BE" : friction.level === "MEDIUM" ? "#FBBF24" : "#F87171",
        borderStyle: "double",
        padding: 1,
      }
    )
  );
}

function prioritizeSessions(sessions: DevSessionRecord[]) {
  return [...sessions].sort((first, second) => {
    const unfinishedScore = Number(unfinished.has(second.status)) - Number(unfinished.has(first.status));

    if (unfinishedScore !== 0) {
      return unfinishedScore;
    }

    return second.updatedAt.localeCompare(first.updatedAt);
  });
}

function sessionChoiceLabel(session: DevSessionRecord) {
  return `${session.project} ${chalk.dim(formatStatus(session.status))} ${chalk.cyan(session.branch ?? "no-branch")} ${chalk.magenta(relativeTime(session.updatedAt))} ${chalk.white("->")} ${session.nextAction}`;
}

function formatStatus(status: SessionStatus) {
  return status
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function statusColor(status: SessionStatus) {
  if (status === "blocked" || status === "debugging") return chalk.yellow;
  if (status === "completed") return chalk.green;
  if (status === "abandoned" || status === "archived") return chalk.dim;
  return chalk.cyan;
}

function complexityColor(level: ResumeFriction["level"]) {
  if (level === "LOW") return chalk.green;
  if (level === "MEDIUM") return chalk.yellow;
  return chalk.red;
}

function checkIcon(status: ResumeFriction["checks"][number]["status"]) {
  if (status === "ok") return chalk.green("\u2713");
  if (status === "warn") return chalk.yellow("!");
  return chalk.red("x");
}
