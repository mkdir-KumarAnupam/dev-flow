import fs from "fs-extra";
import path from "node:path";
import { type ProjectAnswers, type ProjectRecord } from "../types/project.js";
import { type DevServerResult } from "../workspace/startDevServer.js";

interface DevMetaOptions {
  linear?: ProjectRecord["linear"];
  devServer?: DevServerResult;
}

export async function createDevMeta(
  answers: ProjectAnswers,
  projectPath: string,
  options: DevMetaOptions = {}
) {
  await fs.writeJson(
    path.join(projectPath, ".devmeta.json"),
    {
      name: answers.name,
      type: answers.type,
      editor: answers.editor,
      packageManager: answers.packageManager,
      createdAt: new Date().toISOString(),
      tags: answers.tags,
      features: {
        typescript: answers.typescript,
        tailwind: answers.tailwind,
        uiLibrary: answers.uiLibrary,
        docker: answers.docker,
        githubRepo: answers.githubRepo,
      },
      linear: {
        enabled: answers.linear.enabled,
        mode: answers.linear.mode,
        teamId: answers.linear.teamId ?? null,
        status: options.linear?.status ?? null,
        projectUrl: options.linear?.projectUrl ?? null,
        deadline: answers.linear.details?.deadline ?? null,
        priority: answers.linear.details?.priority ?? null,
      },
      workspace: {
        restoreCommand: null,
        devServer: options.devServer ?? null,
      },
      deployment: {
        status: "not-configured",
        target: null,
        url: null,
      },
    },
    { spaces: 2 }
  );
}
