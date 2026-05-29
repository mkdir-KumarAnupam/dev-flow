import chalk from "chalk";
import ora from "ora";
import path from "node:path";
import fs from "fs-extra";
import { generateProject } from "../generators/index.js";
import { initializeGit, type GitInitResult } from "../git/initializeGit.js";
import { syncProjectToLinear } from "../integrations/linear.js";
import { promptForLinearConnection, promptForProjectStart } from "../prompts/startPrompts.js";
import { saveProjectToRegistry } from "../registry/projects.js";
import { createDevMeta } from "../templates/devMeta.js";
import { createReadme } from "../templates/readme.js";
import { type ProjectRecord } from "../types/project.js";
import {
  playLaunchSequence,
  renderCompletion,
  renderCreationMap,
  renderStage,
} from "../ui/terminalArt.js";
import { isPromptCancelled } from "../utils/commandAction.js";
import { getProjectsDirectory } from "../utils/paths.js";
import { openEditor } from "../workspace/openEditor.js";
import { startDevServer, type DevServerResult } from "../workspace/startDevServer.js";

export async function startCommand() {
  await playLaunchSequence();

  const answers = await promptForProjectStart();
  const linearConnection = answers.linear.enabled ? await promptForLinearConnection() : {};
  answers.linear.apiKey = linearConnection.apiKey;
  answers.linear.teamId = linearConnection.teamId;
  const projectsDirectory = getProjectsDirectory();
  const projectPath = path.join(projectsDirectory, answers.name);
  const spinner = ora("Creating environment...").start();

  try {
    await fs.ensureDir(projectsDirectory);

    if (await fs.pathExists(projectPath)) {
      spinner.fail(`Project already exists: ${projectPath}`);
      return;
    }

    spinner.stop();
    renderCreationMap(answers.name);
    renderStage("Scaffolding", "Generating the runnable project workspace.");
    await generateProject(answers, projectPath);
    spinner.start("Writing dev metadata...");

    await createReadme(answers, projectPath);

    const linear = await syncProjectToLinear(answers, projectPath);
    const devServer = answers.startDevServer
      ? await startDevServer(projectPath, answers.type, answers.packageManager)
      : undefined;

    await createDevMeta(answers, projectPath, {
      linear: linear
        ? {
            projectId: linear.projectId,
            projectUrl: linear.projectUrl,
            pendingFile: linear.pendingFile,
            syncedAt: linear.projectId ? new Date().toISOString() : undefined,
            status: linear.status,
            deadline: answers.linear.details?.deadline,
            priority: answers.linear.details?.priority,
          }
        : undefined,
      devServer,
    });

    const git = answers.git ? await initializeGit(projectPath) : undefined;

    const record: ProjectRecord = {
      name: answers.name,
      type: answers.type,
      description: answers.description,
      path: projectPath,
      editor: answers.editor,
      packageManager: answers.packageManager,
      createdAt: new Date().toISOString(),
      tags: answers.tags,
      linear: linear
        ? {
            projectId: linear.projectId,
            projectUrl: linear.projectUrl,
            pendingFile: linear.pendingFile,
            syncedAt: linear.projectId ? new Date().toISOString() : undefined,
            status: linear.status,
            deadline: answers.linear.details?.deadline,
            priority: answers.linear.details?.priority,
          }
        : undefined,
      workspace: {
        restoreCommand: devServer?.command,
        devServer,
      },
    };

    await saveProjectToRegistry(record);

    spinner.succeed("Environment created");
    renderCompletion(projectPath, linear?.projectUrl);

    if (linear?.pendingFile) {
      console.log(chalk.yellow(`Linear handoff written: ${linear.pendingFile}`));
      console.log(chalk.dim(linear.message ?? "Linear sync is pending."));
    } else if (linear?.projectUrl) {
      console.log(chalk.hex("#5E6AD2")(`Linear project created: ${linear.projectUrl}`));
    }

    renderGitResult(git);
    renderDevServerResult(devServer);

    if (answers.openEditor) {
      await openEditor(answers.editor, projectPath);
    }
  } catch (error) {
    if (isPromptCancelled(error)) {
      spinner.stop();
      throw error;
    }

    spinner.fail("Failed to create environment");
    console.error(error);
  }
}

function renderDevServerResult(devServer?: DevServerResult) {
  if (!devServer) {
    return;
  }

  if (devServer.status === "running") {
    console.log(chalk.green(`Dev server started: ${devServer.command}`));
    console.log(chalk.dim(`pid ${devServer.pid}${devServer.logFile ? ` | log ${devServer.logFile}` : ""}`));
    return;
  }

  if (devServer.message) {
    console.log(chalk.yellow(`Dev server not started: ${devServer.message}`));
  }
}

function renderGitResult(git?: GitInitResult) {
  if (!git) {
    return;
  }

  if (!git.initialized) {
    console.log(chalk.red(`Git was not initialized: ${git.message}`));
    return;
  }

  console.log(chalk.green("Git initialized."));

  if (!git.committed && git.message) {
    console.log(chalk.yellow(`Initial commit skipped: ${git.message}`));
  }
}
