import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import { execa } from "execa";
import { type Editor } from "../types/project.js";

const guiEditors = new Set<Editor>(["code", "webstorm"]);

export async function openEditor(editor: Editor, projectPath: string) {
  const command = await resolveEditorCommand(editor);

  if (!command) {
    console.log(chalk.yellow(`Could not find editor executable for: ${editor}`));
    console.log(chalk.dim(getEditorInstallHint(editor)));
    return;
  }

  try {
    const subprocess = execa(command, getEditorArgs(editor, projectPath), {
      detached: guiEditors.has(editor),
      stdio: guiEditors.has(editor) ? "ignore" : "inherit",
      windowsHide: false,
    });

    if (guiEditors.has(editor)) {
      subprocess.unref();
      return;
    }

    await subprocess;
  } catch (error) {
    console.log(chalk.yellow(`Could not open editor: ${editor}`));

    if (error instanceof Error) {
      console.log(chalk.dim(error.message));
    }
  }
}

async function resolveEditorCommand(editor: Editor) {
  const candidates = getEditorCandidates(editor);

  for (const candidate of candidates) {
    if (path.isAbsolute(candidate) && !(await fs.pathExists(candidate))) {
      continue;
    }

    const result = await execa(candidate, ["--version"], {
      reject: false,
      stdio: "ignore",
      windowsHide: true,
    });

    if (result.exitCode === 0) {
      return candidate;
    }
  }

  return undefined;
}

function getEditorCandidates(editor: Editor) {
  switch (editor) {
    case "code":
      return [
        process.env.DEV_CODE_CMD,
        "code",
        "code.cmd",
        path.join(process.env.LOCALAPPDATA ?? "", "Programs", "Microsoft VS Code", "bin", "code.cmd"),
        path.join(process.env.ProgramFiles ?? "", "Microsoft VS Code", "bin", "code.cmd"),
      ].filter(isString);
    case "webstorm":
      return [process.env.DEV_WEBSTORM_CMD, "webstorm", "webstorm.cmd"].filter(isString);
    case "hx":
      return ["hx"];
    case "nvim":
      return ["nvim"];
  }
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}

function getEditorArgs(editor: Editor, projectPath: string) {
  if (editor === "code") {
    return ["--new-window", projectPath];
  }

  return [projectPath];
}

function getEditorInstallHint(editor: Editor) {
  if (editor === "code") {
    return "Install the VS Code shell command, or make sure `code.cmd` is on PATH.";
  }

  return `Make sure \`${editor}\` is installed and available on PATH.`;
}
