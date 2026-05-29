import path from "node:path";
import { execa } from "execa";
import { type PackageManager, type ProjectAnswers } from "../types/project.js";
import { createExpressTemplate } from "./templates/express.js";
import { createMernTemplate } from "./templates/mern.js";

export async function generateProject(answers: ProjectAnswers, projectPath: string) {
  switch (answers.type) {
    case "nextjs":
      await createNextApp(answers, projectPath);
      return;
    case "react-vite":
      await createViteReactApp(answers, projectPath);
      await installDependencies(answers.packageManager, projectPath);
      return;
    case "express-api":
      await createExpressTemplate(answers, projectPath);
      await installDependencies(answers.packageManager, projectPath);
      return;
    case "mern-stack":
      await createMernTemplate(answers, projectPath);
      await installDependencies(answers.packageManager, projectPath);
      return;
    case "cli-tool":
    case "ai-app":
      await createExpressTemplate(answers, projectPath);
      await installDependencies(answers.packageManager, projectPath);
      return;
  }
}

async function createNextApp(answers: ProjectAnswers, projectPath: string) {
  const parentDirectory = path.dirname(projectPath);
  const projectName = path.basename(projectPath);
  const command = getNextCreateCommand(answers.packageManager);

  await execa(command.binary, [
    ...command.args,
    projectName,
    answers.typescript ? "--ts" : "--js",
    answers.tailwind ? "--tailwind" : "--no-tailwind",
    "--eslint",
    "--app",
    "--src-dir",
    "--import-alias",
    "@/*",
    getNextPackageManagerFlag(answers.packageManager),
    "--yes",
  ], {
    cwd: parentDirectory,
    stdio: "inherit",
  });
}

async function createViteReactApp(answers: ProjectAnswers, projectPath: string) {
  const parentDirectory = path.dirname(projectPath);
  const projectName = path.basename(projectPath);
  const template = answers.typescript ? "react-ts" : "react";
  const command = getViteCreateCommand(answers.packageManager);

  await execa(command.binary, [
    ...command.args,
    projectName,
    ...getViteArgumentSeparator(answers.packageManager),
    "--template",
    template,
  ], {
    cwd: parentDirectory,
    stdio: "inherit",
  });
}

async function installDependencies(packageManager: PackageManager, projectPath: string) {
  await execa(packageManager, ["install"], {
    cwd: projectPath,
    stdio: "inherit",
  });
}

function getNextCreateCommand(packageManager: PackageManager) {
  switch (packageManager) {
    case "pnpm":
      return { binary: "pnpm", args: ["create", "next-app@latest"] };
    case "yarn":
      return { binary: "yarn", args: ["create", "next-app"] };
    case "bun":
      return { binary: "bunx", args: ["create-next-app@latest"] };
    case "npm":
      return { binary: "npx", args: ["create-next-app@latest"] };
  }
}

function getNextPackageManagerFlag(packageManager: PackageManager) {
  switch (packageManager) {
    case "pnpm":
      return "--use-pnpm";
    case "yarn":
      return "--use-yarn";
    case "bun":
      return "--use-bun";
    case "npm":
      return "--use-npm";
  }
}

function getViteCreateCommand(packageManager: PackageManager) {
  switch (packageManager) {
    case "pnpm":
      return { binary: "pnpm", args: ["create", "vite@latest"] };
    case "yarn":
      return { binary: "yarn", args: ["create", "vite"] };
    case "bun":
      return { binary: "bun", args: ["create", "vite@latest"] };
    case "npm":
      return { binary: "npm", args: ["create", "vite@latest"] };
  }
}

function getViteArgumentSeparator(packageManager: PackageManager) {
  switch (packageManager) {
    case "npm":
      return ["--"];
    case "pnpm":
    case "yarn":
    case "bun":
      return [];
  }
}
