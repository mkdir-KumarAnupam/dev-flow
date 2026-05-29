import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "node:path";
import { execa } from "execa";
import { getProjectsFromRegistry, saveProjectToRegistry } from "../registry/projects.js";
import { type DeploymentStatus, type ProjectRecord } from "../types/project.js";
import { selectProject } from "../utils/projectSelect.js";

type ShipStep = "lint" | "test" | "commit" | "push" | "pr" | "deploy";

export async function shipCommand() {
  const projects = await getProjectsFromRegistry();
  const project = await selectProject(projects, "Ship project:");

  if (!project) {
    return;
  }

  const packageJson = await readPackageJson(project.path);
  const availableSteps = getAvailableSteps(packageJson);
  const { steps } = await inquirer.prompt<{ steps: ShipStep[] }>([
    {
      type: "checkbox",
      name: "steps",
      message: `Ship steps for ${project.name}:`,
      choices: availableSteps,
      default: availableSteps
        .filter((step) => ["lint", "test"].includes(step.value))
        .map((step) => step.value),
    },
  ]);

  for (const step of steps) {
    await runShipStep(project, step);
  }
}

async function runShipStep(project: ProjectRecord, step: ShipStep) {
  switch (step) {
    case "lint":
      await runPackageScript(project, "lint");
      return;
    case "test":
      await runPackageScript(project, "test");
      return;
    case "commit":
      await commitChanges(project);
      return;
    case "push":
      await runCommand(project.path, "git", ["push"]);
      return;
    case "pr":
      await createPr(project);
      return;
    case "deploy":
      await deploy(project);
      return;
  }
}

async function runPackageScript(project: ProjectRecord, script: string) {
  const packageManager = project.packageManager ?? "npm";
  const args = packageManager === "npm" ? ["run", script] : [script];
  await runCommand(project.path, packageManager, args);
}

async function commitChanges(project: ProjectRecord) {
  const status = await execa("git", ["status", "--short"], {
    cwd: project.path,
    reject: false,
  });

  if (!status.stdout.trim()) {
    console.log(chalk.dim("No Git changes to commit."));
    return;
  }

  const { message } = await inquirer.prompt<{ message: string }>([
    {
      type: "input",
      name: "message",
      message: "Commit message:",
      default: "Ship project updates",
    },
  ]);

  await runCommand(project.path, "git", ["add", "."]);
  await runCommand(project.path, "git", ["commit", "-m", message]);
}

async function createPr(project: ProjectRecord) {
  const gh = await execa("gh", ["--version"], {
    reject: false,
    stdio: "ignore",
  });

  if (gh.exitCode !== 0) {
    console.log(chalk.yellow("GitHub CLI not found. Skipping PR creation."));
    return;
  }

  await runCommand(project.path, "gh", ["pr", "create", "--fill"]);
}

async function deploy(project: ProjectRecord) {
  const packageJson = await readPackageJson(project.path);

  if (!packageJson.scripts?.deploy) {
    console.log(chalk.yellow("No deploy script found in package.json."));
    await updateDeployment(project, "not-configured");
    return;
  }

  await updateDeployment(project, "deploying");
  const result = await runPackageScript(project, "deploy").then(
    () => "deployed" as const,
    () => "failed" as const
  );
  await updateDeployment(project, result);
}

async function updateDeployment(project: ProjectRecord, status: DeploymentStatus) {
  await saveProjectToRegistry({
    ...project,
    deployment: {
      ...project.deployment,
      status,
      updatedAt: new Date().toISOString(),
    },
  });
}

async function runCommand(cwd: string, command: string, args: string[]) {
  console.log(chalk.cyan(`> ${command} ${args.join(" ")}`));
  const result = await execa(command, args, {
    cwd,
    stdio: "inherit",
    reject: false,
  });

  if (result.exitCode !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

async function readPackageJson(projectPath: string): Promise<{ scripts?: Record<string, string> }> {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (!(await fs.pathExists(packageJsonPath))) {
    return {};
  }

  return fs.readJson(packageJsonPath);
}

function getAvailableSteps(packageJson: { scripts?: Record<string, string> }) {
  const choices: Array<{ name: string; value: ShipStep; disabled?: string }> = [
    { name: "lint", value: "lint", disabled: packageJson.scripts?.lint ? undefined : "no lint script" },
    { name: "test", value: "test", disabled: packageJson.scripts?.test ? undefined : "no test script" },
    { name: "commit", value: "commit" },
    { name: "push", value: "push" },
    { name: "create PR", value: "pr" },
    { name: "deploy", value: "deploy", disabled: packageJson.scripts?.deploy ? undefined : "no deploy script" },
  ];

  return choices;
}

