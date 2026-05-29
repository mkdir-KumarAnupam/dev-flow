import boxen from "boxen";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import { execa } from "execa";
import { getProjectsFromRegistry } from "../registry/projects.js";
import { type ProjectRecord } from "../types/project.js";

export async function workspaceCommand() {
  const projects = await getProjectsFromRegistry();

  if (projects.length === 0) {
    console.log(chalk.yellow("No projects registered yet. Run `dev start` first."));
    return;
  }

  const enriched = await Promise.all(projects.map(enrichProject));
  const active = enriched.filter((project) => project.exists);
  const linearSynced = enriched.filter((project) => project.linear?.status === "synced");
  const runningServers = enriched.filter((project) => project.workspace?.devServer?.status === "running");

  console.log(
    boxen(
      [
        `${chalk.cyanBright("dev workspace")} ${chalk.dim("terminal control plane")}`,
        "",
        statLine("projects", String(projects.length), "available", String(active.length)),
        statLine("dev servers", String(runningServers.length), "linear", String(linearSynced.length)),
      ].join("\n"),
      {
        title: " dashboard ",
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        borderColor: "#00E5FF",
        borderStyle: "double",
      }
    )
  );

  for (const project of enriched.slice(0, 8)) {
    renderProjectCard(project);
  }
}

interface EnrichedProject extends ProjectRecord {
  exists: boolean;
  gitBranch?: string;
  gitDirty?: boolean;
}

async function enrichProject(project: ProjectRecord): Promise<EnrichedProject> {
  const exists = Boolean(project.path) && (await fs.pathExists(project.path));

  if (!exists) {
    return { ...project, exists };
  }

  const gitDirectory = path.join(project.path, ".git");
  const hasGit = await fs.pathExists(gitDirectory);

  if (!hasGit) {
    return { ...project, exists };
  }

  const branch = await execa("git", ["branch", "--show-current"], {
    cwd: project.path,
    reject: false,
  });
  const status = await execa("git", ["status", "--short"], {
    cwd: project.path,
    reject: false,
  });

  return {
    ...project,
    exists,
    gitBranch: branch.stdout || "detached",
    gitDirty: Boolean(status.stdout.trim()),
  };
}

function renderProjectCard(project: EnrichedProject) {
  const server = project.workspace?.devServer;
  const linear = project.linear;
  const gitState = project.gitBranch
    ? `${project.gitBranch}${project.gitDirty ? " dirty" : " clean"}`
    : "not initialized";

  const lines = [
    `${chalk.bold(project.name)} ${chalk.dim(project.type)}`,
    `${chalk.dim("path")}    ${project.exists ? chalk.cyan(project.path) : chalk.red("missing")}`,
    `${chalk.dim("git")}     ${project.gitDirty ? chalk.yellow(gitState) : chalk.green(gitState)}`,
    `${chalk.dim("server")}  ${server?.status === "running" ? chalk.green(`${server.command} pid ${server.pid}`) : chalk.dim("not running")}`,
    `${chalk.dim("linear")}  ${linear?.status === "synced" ? chalk.hex("#5E6AD2")(linear.projectUrl ?? "synced") : chalk.dim(linear?.status ?? "not linked")}`,
  ];

  if (linear?.deadline || linear?.priority) {
    lines.push(
      `${chalk.dim("plan")}    ${chalk.white(linear.priority ?? "none")} priority${linear.deadline ? ` | due ${linear.deadline}` : ""}`
    );
  }

  console.log(
    boxen(lines.join("\n"), {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: project.exists ? "#63E6BE" : "red",
      borderStyle: "round",
    })
  );
}

function statLine(leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) {
  return `${chalk.dim(leftLabel)} ${chalk.whiteBright(leftValue)}   ${chalk.dim(rightLabel)} ${chalk.whiteBright(rightValue)}`;
}
