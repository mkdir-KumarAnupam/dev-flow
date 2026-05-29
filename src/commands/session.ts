import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";
import { detectCurrentContext } from "../continuity/contextDetection.js";
import { readLocalSession, saveSessionToRegistry, writeLocalSession } from "../sessions/sessionRegistry.js";
import { getRecentSketchesForContext } from "../sketches/sketches.js";
import { type DevSessionRecord, type SessionStatus } from "../types/session.js";
import { getSessionsPath } from "../utils/paths.js";

const statuses: Array<{ name: string; value: SessionStatus }> = [
  { name: "Active", value: "active" },
  { name: "In Progress", value: "in-progress" },
  { name: "Paused", value: "paused" },
  { name: "Blocked", value: "blocked" },
  { name: "Debugging", value: "debugging" },
  { name: "Review Needed", value: "review-needed" },
  { name: "Completed", value: "completed" },
  { name: "Archived", value: "archived" },
  { name: "Abandoned", value: "abandoned" },
];

export async function sessionCommand() {
  const context = await detectCurrentContext();
  const existing = await readLocalSession(context.path);
  const now = new Date().toISOString();
  const recentSketches = await getRecentSketchesForContext(context.path, new Date(Date.now() - 14 * 86400000));

  const answers = await inquirer.prompt<{
    status: SessionStatus;
    summary: string;
    nextAction: string;
    notes: string;
    openFiles: string;
    runningServices: string;
    tags: string;
  }>([
    {
      type: "select",
      name: "status",
      message: "Session status:",
      choices: statuses,
      default: existing?.status ?? "paused",
    },
    {
      type: "input",
      name: "summary",
      message: "What were you working on?",
      default: existing?.summary,
      validate: (value: string) => value.trim().length > 0 || "Add a short engineering summary.",
    },
    {
      type: "input",
      name: "nextAction",
      message: "Next recommended step:",
      default: existing?.nextAction,
      validate: (value: string) => value.trim().length > 0 || "nextAction is required. This is the memory anchor.",
    },
    {
      type: "input",
      name: "notes",
      message: "Notes (optional):",
      default: existing?.notes ?? "",
    },
    {
      type: "input",
      name: "openFiles",
      message: "Open files (comma-separated, optional):",
      default: existing?.openFiles.join(", ") ?? "",
    },
    {
      type: "input",
      name: "runningServices",
      message: "Running services (comma-separated, optional):",
      default: existing?.runningServices.join(", ") ?? "",
    },
    {
      type: "input",
      name: "tags",
      message: "Tags (comma-separated, optional):",
      default: existing?.tags.join(", ") ?? "",
    },
  ]);

  const startedAt = existing?.startedAt ?? now;
  const session: DevSessionRecord = {
    id: existing?.id ?? `${context.path}:${now}`,
    project: context.project,
    contextKind: context.contextKind,
    path: context.path,
    branch: context.branch,
    status: answers.status,
    summary: answers.summary.trim(),
    nextAction: answers.nextAction.trim(),
    notes: answers.notes.trim() || undefined,
    openFiles: splitList(answers.openFiles),
    runningServices: splitList(answers.runningServices),
    sketches: recentSketches.map((sketch) => sketch.id),
    assets: existing?.assets ?? [],
    captures: existing?.captures ?? [],
    startedAt,
    endedAt: now,
    durationMinutes: durationMinutes(startedAt, now),
    tags: splitList(answers.tags),
    editor: context.editor,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await writeLocalSession(session);
  await saveSessionToRegistry(session);

  console.log(
    boxen(
      [
        `${chalk.dim("context")} ${chalk.cyan(session.project)} ${chalk.dim(session.contextKind)}`,
        `${chalk.dim("status ")} ${chalk.white(formatStatus(session.status))}`,
        `${chalk.dim("branch ")} ${chalk.white(session.branch ?? "none")}`,
        "",
        chalk.cyanBright("summary"),
        session.summary,
        "",
        chalk.magentaBright("next action"),
        session.nextAction,
        "",
        `${chalk.dim("visual")} ${chalk.white(`${session.sketches?.length ?? 0} sketches`)}`,
        "",
        `${chalk.dim("saved")} ${chalk.white(".session.json")} ${chalk.dim("and")} ${chalk.white(getSessionsPath())}`,
      ].join("\n"),
      {
        title: " momentum checkpoint ",
        borderColor: "#63E6BE",
        borderStyle: "double",
        padding: 1,
      }
    )
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function durationMinutes(startedAt: string, endedAt: string) {
  const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(0, Math.round(diff / 60000));
}

function formatStatus(status: SessionStatus) {
  return status
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
