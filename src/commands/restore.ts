import chalk from "chalk";
import { getProjectsFromRegistry, saveProjectToRegistry } from "../registry/projects.js";
import { type PackageManager, type ProjectRecord, type ProjectType } from "../types/project.js";
import { selectProject } from "../utils/projectSelect.js";
import { openEditor } from "../workspace/openEditor.js";
import { startDevServer } from "../workspace/startDevServer.js";

const projectTypes = new Set(["nextjs", "react-vite", "express-api", "mern-stack", "cli-tool", "ai-app"]);
const packageManagers = new Set(["npm", "pnpm", "yarn", "bun"]);

export async function restoreCommand() {
  const projects = await getProjectsFromRegistry();
  const project = await selectProject(projects, "Restore project:");

  if (!project) {
    return;
  }

  console.log(chalk.cyan(`Restoring ${project.name}...`));
  await openEditor(project.editor, project.path);

  if (isProjectType(project.type) && isPackageManager(project.packageManager)) {
    const devServer = await startDevServer(project.path, project.type, project.packageManager);
    const updated: ProjectRecord = {
      ...project,
      workspace: {
        ...project.workspace,
        restoreCommand: devServer.command || project.workspace?.restoreCommand,
        devServer,
      },
    };

    await saveProjectToRegistry(updated);

    if (devServer.status === "running") {
      console.log(chalk.green(`Dev server restored in a separate window: ${devServer.command}`));
      return;
    }

    console.log(chalk.yellow(`Dev server not restored: ${devServer.message ?? "unknown reason"}`));
    return;
  }

  console.log(chalk.yellow("No supported dev-server contract for this project yet."));
}

function isProjectType(value: string): value is ProjectType {
  return projectTypes.has(value);
}

function isPackageManager(value?: string): value is PackageManager {
  return typeof value === "string" && packageManagers.has(value);
}
