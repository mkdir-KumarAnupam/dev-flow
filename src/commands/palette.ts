import search from "@inquirer/search";
import inquirer from "inquirer";
import chalk from "chalk";
import { openCommand } from "./open.js";
import { projectsCommand } from "./projects.js";
import { restoreCommand } from "./restore.js";
import { runCommand } from "./run.js";
import { sandboxCommand } from "./sandbox.js";
import { sketchCommand } from "./sketch.js";
import { shipCommand } from "./ship.js";
import { startCommand } from "./start.js";
import { watchCommand } from "./watch.js";
import { workspaceCommand } from "./workspace.js";
import { focusCommand } from "./focus.js";
import { dashboardCommand } from "./dashboard.js";
import { captureCommand } from "./capture.js";
import { getProjectsFromRegistry, getProjectLabel } from "../registry/projects.js";
import { getSandboxesFromRegistry, getSandboxLabel } from "../registry/sandboxes.js";
import { openEditor } from "../workspace/openEditor.js";

type PaletteAction =
  | { type: "command"; id: string }
  | { type: "project"; path: string; editor: string; restoreCommand?: string }
  | { type: "sandbox"; path: string; editor: string; restoreCommand?: string };

interface PaletteChoice {
  name: string;
  value: PaletteAction;
  description?: string;
  search: string;
}

export async function paletteCommand() {
  const projects = await getProjectsFromRegistry();
  const sandboxes = await getSandboxesFromRegistry();

  const commands: PaletteChoice[] = [
    { name: "✨ Start new project",           value: { type: "command", id: "start" },      search: "start new project" },
    { name: "📦 Create sandbox",              value: { type: "command", id: "sandbox" },    search: "create sandbox" },
    { name: "📂 Open context",                value: { type: "command", id: "open" },       search: "open context" },
    { name: "⏪ Restore project",             value: { type: "command", id: "restore" },   search: "restore project" },
    { name: "▶️  Run current sandbox",         value: { type: "command", id: "run" },        search: "run current sandbox" },
    { name: "👀 Watch current sandbox",        value: { type: "command", id: "watch" },      search: "watch current sandbox" },
    { name: "🎨 Sketch current context",       value: { type: "command", id: "sketch" },    search: "sketch current context" },
    { name: "📊 Projects dashboard",           value: { type: "command", id: "projects" },  search: "projects dashboard" },
    { name: "💻 Workspace dashboard",          value: { type: "command", id: "workspace" }, search: "workspace dashboard" },
    { name: "🚀 Ship project",                 value: { type: "command", id: "ship" },      search: "ship project" },
    { name: "🎯 Start focus session (90m)",    value: { type: "command", id: "focus" },     search: "focus flow state session timer" },
    { name: "📈 Focus report",                 value: { type: "command", id: "focus-report" }, search: "focus report ai analysis" },
    { name: "📉 Focus stats",                  value: { type: "command", id: "focus-stats" },  search: "focus stats productivity trends" },
    { name: "📸 Capture screenshot",           value: { type: "command", id: "capture" },   search: "capture screenshot workflow" },
    { name: "🖥️  Engineering dashboard",        value: { type: "command", id: "dashboard" }, search: "dashboard graphical engineering" },
  ];

  const projectChoices: PaletteChoice[] = projects.map(p => ({
    name: `📂 ${getProjectLabel(p)}`,
    value: { type: "project", path: p.path, editor: p.editor, restoreCommand: p.workspace?.restoreCommand },
    description: p.path,
    search: `project ${p.name} ${p.type} ${p.description}`,
  }));

  const sandboxChoices: PaletteChoice[] = sandboxes.map(s => ({
    name: `📦 ${getSandboxLabel(s)}`,
    value: { type: "sandbox", path: s.path, editor: "code" },
    description: s.path,
    search: `sandbox ${s.name} ${s.type} ${s.platform} ${s.course} ${s.language}`,
  }));

  const allChoices = [...commands, ...projectChoices, ...sandboxChoices];

  const action = await search({
    message: "Command palette:",
    source: async (input) => {
      const query = (input || "").toLowerCase().trim();
      if (!query) {
        return allChoices.slice(0, 15); // Show a subset when there's no query to avoid massive list
      }
      return allChoices.filter(c => fuzzyIncludes(c.search.toLowerCase(), query));
    }
  });

  if (action.type === "command") {
    switch (action.id) {
      case "start":        await startCommand(); return;
      case "sandbox":      await sandboxCommand(); return;
      case "open":         await openCommand(); return;
      case "restore":      await restoreCommand(); return;
      case "run":          await runCommand(); return;
      case "watch":        await watchCommand(); return;
      case "sketch":       await sketchCommand(); return;
      case "projects":     await projectsCommand(); return;
      case "workspace":    await workspaceCommand(); return;
      case "ship":         await shipCommand(); return;
      case "focus":        await focusCommand("90m"); return;
      case "focus-report": await focusCommand("report"); return;
      case "focus-stats":  await focusCommand("stats"); return;
      case "capture":      await captureCommand(); return;
      case "dashboard":    await dashboardCommand(); return;
    }
  } else if (action.type === "project" || action.type === "sandbox") {
    console.log(chalk.cyan(`Opening context...`));
    await openEditor(action.editor as "code", action.path);
    
    if (action.restoreCommand) {
      const { restore } = await inquirer.prompt<{ restore: boolean }>([
        {
          type: "confirm",
          name: "restore",
          message: "Restore saved workspace command?",
          default: false,
        },
      ]);
      if (restore) {
        console.log(chalk.yellow("Workspace restore is registered but not automated yet."));
        console.log(chalk.dim(action.restoreCommand));
      }
    }
  }
}

function fuzzyIncludes(value: string, query: string): boolean {
  let cursor = 0;
  for (const character of query) {
    cursor = value.indexOf(character, cursor);
    if (cursor === -1) {
      return false;
    }
    cursor += 1;
  }
  return true;
}
