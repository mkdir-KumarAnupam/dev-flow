import boxen from "boxen";
import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "node:path";
import { getProjectLabel, getProjectsFromRegistry, removeProjectFromRegistry, saveProjectToRegistry } from "../registry/projects.js";
import { type DeploymentStatus, type ProjectRecord } from "../types/project.js";
import { getProjectHealth, type ProjectHealth } from "../utils/projectHealth.js";
import { openEditor } from "../workspace/openEditor.js";
import { stopDevServer } from "../workspace/startDevServer.js";

interface ProjectView extends ProjectRecord {
  exists: boolean;
  age: string;
  health: ProjectHealth;
}

interface ProjectsCommandOptions {
  noAction?: boolean;
  action?: boolean;
}

export async function projectsCommand(options: ProjectsCommandOptions = {}) {
  const projects = await getProjectsFromRegistry();

  if (projects.length === 0) {
    console.log(chalk.yellow("No projects registered yet. Run `dev start` first."));
    return;
  }

  const views = await Promise.all(projects.map(toProjectView));
  const linked = views.filter((project) => project.linear?.status === "synced").length;
  const missing = views.filter((project) => !project.exists).length;
  const servers = views.filter((project) => project.health.serverAlive).length;

  console.log(
    boxen(
      [
        `${chalk.cyanBright("dev projects")}`,
        "",
        metric("total", projects.length),
        metric("linear", linked),
        metric("servers", servers),
        metric("missing", missing),
      ].join("  "),
      {
        title: " projects ",
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        borderColor: "#A78BFA",
        borderStyle: "double",
      }
    )
  );

  for (const project of views) {
    renderProjectRow(project);
  }

  if (!options.noAction && options.action !== false) {
    await promptForProjectAction(views);
  }
}

async function toProjectView(project: ProjectRecord): Promise<ProjectView> {
  const health = await getProjectHealth(project);

  return {
    ...project,
    exists: health.exists,
    age: formatAge(project.createdAt),
    health,
  };
}

function renderProjectRow(project: ProjectView) {
  const status = project.exists ? chalk.green("available") : chalk.red("missing");
  const tags = project.tags?.length ? project.tags.map((tag) => chalk.hex("#8A90B8")(`#${tag}`)).join(" ") : chalk.dim("no tags");
  const linear = project.linear?.status === "synced"
    ? chalk.hex("#5E6AD2")("Linear synced")
    : project.linear?.status === "pending"
      ? chalk.yellow("Linear pending")
      : chalk.dim("Linear not linked");
  const server = project.health.serverAlive
    ? chalk.green(`server pid ${project.workspace?.devServer?.pid}`)
    : chalk.dim("server idle");
  const plan = [project.linear?.priority, project.linear?.deadline ? `due ${project.linear.deadline}` : undefined]
    .filter(Boolean)
    .join(" / ");
  const badges = renderBadges(project);
  const deployment = project.deployment?.status ?? "not-configured";

  const body = [
    `${chalk.bold(project.name)} ${chalk.dim(project.type)} ${status}`,
    `${chalk.dim("health")}  ${badges.slice(0, 3).join(" ")}`,
    `${chalk.dim("ops")}     ${badges.slice(3).join(" ")}`,
    `${chalk.dim("path")}     ${project.exists ? chalk.cyan(project.path) : chalk.red(project.path || "unknown")}`,
    `${chalk.dim("stack")}    ${project.packageManager ?? "unknown"} / ${project.editor}`,
    `${chalk.dim("state")}    ${linear}   ${server}`,
    `${chalk.dim("deploy")}   ${deployment}${project.deployment?.url ? ` / ${project.deployment.url}` : ""}`,
    `${chalk.dim("created")}  ${project.age}   ${tags}`,
  ];

  if (project.description) {
    body.splice(1, 0, `${chalk.dim("about")}    ${project.description}`);
  }

  if (plan) {
    body.push(`${chalk.dim("plan")}     ${chalk.white(plan)}`);
  }

  console.log(
    boxen(body.join("\n"), {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: project.exists ? "#00E5FF" : "red",
      borderStyle: "round",
    })
  );
}

function renderBadges(project: ProjectView) {
  return [
    project.health.serverAlive ? badge("[RUN] running", "green") : badge("[IDLE] stopped", "gray"),
    project.health.gitDirty ? badge("[GIT] dirty", "yellow") : project.health.gitReady ? badge("[GIT] clean", "green") : badge("[GIT] none", "gray"),
    project.health.linearLinked ? badge("[LIN] synced", "violet") : badge("[LIN] none", "gray"),
    project.health.envMissing ? badge("[ENV] missing", "yellow") : badge("[ENV] ok", "green"),
    project.health.brokenInstall ? badge("[PKG] broken", "red") : badge("[PKG] ok", "green"),
    badge(`[DEP] ${project.deployment?.status ?? "not-configured"}`, getDeploymentTone(project.deployment?.status)),
  ];
}

function badge(label: string, tone: "green" | "yellow" | "red" | "violet" | "gray") {
  const value = ` ${label} `;

  switch (tone) {
    case "green":
      return chalk.black.bgGreen(value);
    case "yellow":
      return chalk.black.bgYellow(value);
    case "red":
      return chalk.white.bgRed(value);
    case "violet":
      return chalk.white.bgHex("#5E6AD2")(value);
    case "gray":
      return chalk.white.bgHex("#4B5177")(value);
  }
}

function getDeploymentTone(status?: DeploymentStatus): "green" | "yellow" | "red" | "gray" {
  switch (status) {
    case "deployed":
      return "green";
    case "deploying":
    case "ready":
      return "yellow";
    case "failed":
      return "red";
    default:
      return "gray";
  }
}

async function promptForProjectAction(projects: ProjectView[]) {
  const { selectedProject } = await inquirer.prompt<{ selectedProject: ProjectView | "none" }>([
    {
      type: "select",
      name: "selectedProject",
      message: "Manage project:",
      choices: [
        { name: "No action", value: "none" },
        ...projects.map((project) => ({
          name: getProjectLabel(project),
          value: project,
        })),
      ],
      default: "none",
    },
  ]);

  if (selectedProject === "none") {
    return;
  }

  const { action } = await inquirer.prompt<{ action: "open" | "deploy-status" | "delete" | "back" }>([
    {
      type: "select",
      name: "action",
      message: `Action for ${selectedProject.name}:`,
      choices: [
        { name: "Open in editor", value: "open" },
        { name: "Change deployment status", value: "deploy-status" },
        { name: "Delete from dev registry", value: "delete" },
        { name: "Back / no action", value: "back" },
      ],
      default: "open",
    },
  ]);

  if (action === "open") {
    await openEditor(selectedProject.editor, selectedProject.path);
    return;
  }

  if (action === "delete") {
    await confirmAndDeleteProject(selectedProject);
  }

  if (action === "deploy-status") {
    await changeDeploymentStatus(selectedProject);
  }
}

async function changeDeploymentStatus(project: ProjectView) {
  const { status } = await inquirer.prompt<{ status: DeploymentStatus }>([
    {
      type: "select",
      name: "status",
      message: `Deployment status for ${project.name}:`,
      choices: [
        { name: "Not configured", value: "not-configured" },
        { name: "Ready", value: "ready" },
        { name: "Deploying", value: "deploying" },
        { name: "Deployed", value: "deployed" },
        { name: "Failed", value: "failed" },
      ],
      default: project.deployment?.status ?? "not-configured",
    },
  ]);

  const { target } = await inquirer.prompt<{ target: string }>([
    {
      type: "input",
      name: "target",
      message: "Deployment target (optional):",
      default: project.deployment?.target ?? "",
    },
  ]);

  const { url } = await inquirer.prompt<{ url: string }>([
    {
      type: "input",
      name: "url",
      message: "Deployment URL (optional):",
      default: project.deployment?.url ?? "",
    },
  ]);

  await saveProjectToRegistry({
    ...project,
    deployment: {
      status,
      target: target.trim() || undefined,
      url: url.trim() || undefined,
      updatedAt: new Date().toISOString(),
    },
  });

  console.log(chalk.green(`Deployment status updated: ${status}`));
}

async function confirmAndDeleteProject(project: ProjectView) {
  const { confirmRegistryDelete } = await inquirer.prompt<{ confirmRegistryDelete: boolean }>([
    {
      type: "confirm",
      name: "confirmRegistryDelete",
      message: `Remove ${project.name} from the dev registry?`,
      default: false,
    },
  ]);

  if (!confirmRegistryDelete) {
    console.log(chalk.dim("Delete cancelled."));
    return;
  }

  await removeProjectFromRegistry(project);
  console.log(chalk.yellow(`${project.name} removed from dev registry.`));

  if (!project.exists) {
    return;
  }

  const { deleteFolder } = await inquirer.prompt<{ deleteFolder: boolean }>([
    {
      type: "confirm",
      name: "deleteFolder",
      message: `Also delete project folder at ${project.path}?`,
      default: false,
    },
  ]);

  if (!deleteFolder) {
    console.log(chalk.dim("Project folder left untouched."));
    return;
  }

  const { typedName } = await inquirer.prompt<{ typedName: string }>([
    {
      type: "input",
      name: "typedName",
      message: `Type "${project.name}" to permanently delete the folder:`,
    },
  ]);

  if (typedName !== project.name) {
    console.log(chalk.dim("Folder delete cancelled."));
    return;
  }

  const stopped = await stopProjectProcesses(project);
  const deleted = await removeProjectFolder(project.path);

  if (deleted) {
    console.log(chalk.red(`Deleted folder: ${project.path}`));
    return;
  }

  console.log(chalk.yellow(`Could not delete folder because Windows says it is busy or locked.`));
  console.log(chalk.dim(`Stopped recorded dev server: ${stopped ? "yes" : "no or not running"}`));
  console.log(chalk.dim("Close VS Code, terminals, file explorers, and any running dev server using this folder, then try again."));
}

async function stopProjectProcesses(project: ProjectView) {
  const pid = project.workspace?.devServer?.pid;

  if (!pid) {
    return false;
  }

  const stopped = await stopDevServer(pid);

  if (stopped) {
    await delay(600);
  }

  return stopped;
}

async function removeProjectFolder(projectPath: string) {
  try {
    await fs.remove(projectPath);
    return true;
  } catch (error) {
    if (isBusyError(error)) {
      await delay(900);

      try {
        await fs.remove(projectPath);
        return true;
      } catch {
        return false;
      }
    }

    throw error;
  }
}

function isBusyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ["EBUSY", "EPERM", "ENOTEMPTY"].includes(String(error.code))
  );
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function metric(label: string, value: number) {
  return `${chalk.dim(label)} ${chalk.whiteBright(String(value))}`;
}

function formatAge(createdAt: string) {
  const created = new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return "unknown";
  }

  const diff = Date.now() - created;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
