import chalk from "chalk";
import inquirer from "inquirer";
import { getProjectLabel, getProjectsFromRegistry } from "../registry/projects.js";
import { getSandboxLabel, getSandboxesFromRegistry } from "../registry/sandboxes.js";
import { isPromptCancelled } from "../utils/commandAction.js";
import { openEditor } from "../workspace/openEditor.js";

export async function openCommand() {
  const projects = await getProjectsFromRegistry();
  const sandboxes = await getSandboxesFromRegistry();
  const contexts = [
    ...projects.map((project) => ({
      kind: "project" as const,
      label: `project  ${getProjectLabel(project)}`,
      search: [project.name, project.type, project.description, project.path, ...(project.tags ?? [])].join(" "),
      path: project.path,
      editor: project.editor,
      restoreCommand: project.workspace?.restoreCommand,
    })),
    ...sandboxes.map((sandbox) => ({
      kind: "sandbox" as const,
      label: `sandbox  ${getSandboxLabel(sandbox)}`,
      search: [
        sandbox.name,
        sandbox.type,
        sandbox.course,
        sandbox.platform,
        sandbox.topic,
        sandbox.language,
        sandbox.path,
      ].join(" "),
      path: sandbox.path,
      editor: "code" as const,
      restoreCommand: undefined,
    })),
  ];

  if (contexts.length === 0) {
    console.log(chalk.yellow("No contexts registered yet. Run `dev start` or `dev sandbox` first."));
    return;
  }

  const context = await promptForContextOpen(contexts).catch((error: unknown) => {
    if (isPromptCancelled(error)) {
      throw error;
    }

    console.log(chalk.yellow(error instanceof Error ? error.message : "No matching context found."));
    return null;
  });

  if (!context) {
    return;
  }

  console.log(chalk.cyan(`Opening ${context.label}`));
  await openEditor(context.editor, context.path);

  if (context.restoreCommand) {
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
      console.log(chalk.dim(context.restoreCommand));
    }
  }
}

interface OpenContext {
  kind: "project" | "sandbox";
  label: string;
  search: string;
  path: string;
  editor: "code" | "hx" | "nvim" | "webstorm";
  restoreCommand?: string;
}

async function promptForContextOpen(contexts: OpenContext[]) {
  const { search } = await inquirer.prompt<{ search: string }>([
    {
      type: "input",
      name: "search",
      message: "Search contexts:",
      default: "",
    },
  ]);

  const matches = filterContexts(contexts, search);

  if (matches.length === 0) {
    throw new Error(`No contexts matched "${search}".`);
  }

  const { context } = await inquirer.prompt<{ context: OpenContext }>([
    {
      type: "select",
      name: "context",
      message: "Open context:",
      pageSize: 12,
      choices: matches.map((item) => ({
        name: item.label,
        value: item,
      })),
    },
  ]);

  return context;
}

function filterContexts(contexts: OpenContext[], search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return contexts;
  }

  return contexts.filter((context) => fuzzyIncludes(context.search.toLowerCase(), query));
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
