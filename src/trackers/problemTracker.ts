import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "node:path";
import readline from "node:readline/promises";
import { findProblemRoot, readProblemMetadata, writeProblemMetadata } from "../metadata/problemMetadata.js";
import { getActivePracticePath, savePracticeRecord } from "../registry/practice.js";
import { type ProblemRecord, type ProblemStatus } from "../types/problem.js";
import { type SandboxLanguage } from "../types/sandbox.js";

export async function markCurrentProblem(status: Extract<ProblemStatus, "solved" | "stuck">) {
  const root = (await findProblemRoot(process.cwd())) ?? (await getActivePracticePath());

  if (!root) {
    console.log(chalk.yellow("No active problem found. Run `dev -s random` or run this inside a competitive sandbox."));
    return;
  }

  const record = await readProblemMetadata(root);

  if (!record) {
    console.log(chalk.yellow("Could not read problem metadata."));
    return;
  }

  const now = new Date().toISOString();
  const solutionPath = status === "solved" ? await maybeSaveSolvedCode(record) : undefined;
  const updated: ProblemRecord = {
    ...record,
    status,
    endedAt: status === "solved" ? now : record.endedAt,
    timeSpentMinutes: calculateMinutes(record.startedAt, now),
    attempts: record.attempts + (status === "stuck" ? 1 : 0),
    history: [
      ...record.history,
      {
        action: status,
        at: now,
        detail: solutionPath ? `Saved reference solution: ${path.relative(record.path, solutionPath)}` : undefined,
      },
    ],
  };

  try {
    await writeProblemMetadata(updated);
  } catch (error) {
    console.log(chalk.yellow("Could not update .problem.json, but practice history will still be updated."));
    if (error instanceof Error) {
      console.log(chalk.dim(error.message));
    }
  }

  await savePracticeRecord(updated);

  console.log(status === "solved" ? chalk.green(`Solved: ${record.title}`) : chalk.yellow(`Marked stuck: ${record.title}`));

  if (solutionPath) {
    console.log(chalk.cyan(`Reference solution saved to ${solutionPath}`));
  }
}

function calculateMinutes(startedAt: string, endedAt: string) {
  const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(1, Math.round(diff / 60000));
}

async function maybeSaveSolvedCode(record: ProblemRecord) {
  if (!process.stdin.isTTY) {
    return undefined;
  }

  const { saveSolution } = await inquirer.prompt<{ saveSolution: boolean }>([
    {
      type: "confirm",
      name: "saveSolution",
      message: "Save your final solved code for future reference?",
      default: true,
    },
  ]);

  if (!saveSolution) {
    return undefined;
  }

  console.log(chalk.dim("Paste your final code below. Type :save on a new line when you are done."));
  const code = await readPastedCode();

  if (!code.trim()) {
    console.log(chalk.yellow("No code pasted, skipping reference solution save."));
    return undefined;
  }

  const solutionsDirectory = path.join(record.path, "solutions");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${timestamp}-${record.slug}.${extensionForLanguage(record.language)}`;
  const solutionPath = path.join(solutionsDirectory, fileName);

  await fs.ensureDir(solutionsDirectory);
  await fs.writeFile(solutionPath, code.endsWith("\n") ? code : `${code}\n`, "utf8");

  return solutionPath;
}

async function readPastedCode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  const lines: string[] = [];

  try {
    for await (const line of rl) {
      if (line.trim() === ":save") {
        break;
      }

      lines.push(line);
    }
  } finally {
    rl.close();
  }

  return lines.join("\n");
}

function extensionForLanguage(language: SandboxLanguage) {
  switch (language) {
    case "cpp":
      return "cpp";
    case "java":
      return "java";
    case "python":
      return "py";
    case "sql":
      return "sql";
    case "javascript":
      return "js";
    case "c":
      return "c";
  }
}
