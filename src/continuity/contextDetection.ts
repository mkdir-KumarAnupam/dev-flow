import path from "node:path";
import { execa } from "execa";
import { getProjectsFromRegistry } from "../registry/projects.js";
import { getSandboxesFromRegistry } from "../registry/sandboxes.js";
import { type Editor } from "../types/project.js";

export interface DetectedContext {
  project: string;
  contextKind: "project" | "sandbox" | "workspace";
  path: string;
  editor: Editor;
  branch?: string;
}

export async function detectCurrentContext(): Promise<DetectedContext> {
  const cwd = process.cwd();
  const projects = await getProjectsFromRegistry();
  const sandboxes = await getSandboxesFromRegistry();
  const project = projects.find((item) => isInside(cwd, item.path));

  if (project) {
    return {
      project: project.name,
      contextKind: "project",
      path: project.path,
      editor: project.editor,
      branch: await getGitBranch(project.path),
    };
  }

  const sandbox = sandboxes.find((item) => isInside(cwd, item.path));

  if (sandbox) {
    return {
      project: sandbox.name,
      contextKind: "sandbox",
      path: sandbox.path,
      editor: "code",
      branch: await getGitBranch(sandbox.path),
    };
  }

  return {
    project: path.basename(cwd),
    contextKind: "workspace",
    path: cwd,
    editor: "code",
    branch: await getGitBranch(cwd),
  };
}

async function getGitBranch(workspacePath: string) {
  const result = await execa("git", ["branch", "--show-current"], {
    cwd: workspacePath,
    reject: false,
    windowsHide: true,
  });

  return result.exitCode === 0 && result.stdout.trim() ? result.stdout.trim() : undefined;
}

function isInside(candidate: string, parent: string) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
