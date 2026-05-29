import boxen from "boxen";
import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "node:path";
import { writeProblemMetadata } from "../metadata/problemMetadata.js";
import { savePracticeRecord, setActivePracticeRecord } from "../registry/practice.js";
import { saveSandboxToRegistry } from "../registry/sandboxes.js";
import { type PracticeProblem, type ProblemDifficulty, type ProblemPlatform, type ProblemRecord } from "../types/problem.js";
import { type SandboxLanguage, type SandboxRecord } from "../types/sandbox.js";
import { getSandboxDirectory } from "../utils/paths.js";
import { problemBank } from "./problemBank.js";
import { writeProblemStarter } from "./starter.js";
import { fetchRandomLeetCodeProblem } from "./api/leetcode.js";
import ora from "ora";

const platforms = new Set(["leetcode", "hackerrank", "codeforces", "codechef"]);
const difficulties = new Set(["easy", "medium", "hard"]);

export async function assignRandomProblem(args: string[]) {
  const filters = parseFilters(args);
  
  const spinner = ora("Querying LeetCode global database...").start();
  let problem = await fetchRandomLeetCodeProblem(filters);
  
  if (problem) {
    spinner.succeed(`Found problem dynamically from LeetCode! (Acceptance Rate: ${problem.acceptanceRate?.toFixed(1) ?? "N/A"}%)`);
  } else {
    spinner.warn("Failed to fetch dynamically from LeetCode. Falling back to local offline bank.");
    const candidates = problemBank.filter((problem) => matches(problem, filters));

    if (candidates.length === 0) {
      console.log(chalk.yellow("No problems matched those filters in the local bank either."));
      return;
    }

    problem = candidates[Math.floor(Math.random() * candidates.length)];
  }
  const { language } = await inquirer.prompt<{ language: SandboxLanguage }>([
    {
      type: "select",
      name: "language",
      message: "Language:",
      choices: [
        { name: "C++", value: "cpp" },
        { name: "Java", value: "java" },
        { name: "Python", value: "python" },
        { name: "SQL", value: "sql" },
        { name: "JavaScript", value: "javascript" },
        { name: "C", value: "c" },
      ],
      default: "cpp",
    },
  ]);

  const record = await createProblemWorkspace(problem, language);
  await savePracticeRecord(record);
  await setActivePracticeRecord(record);
  await saveSandboxToRegistry(toSandboxRecord(record));

  console.log(
    boxen(
      [
        `${chalk.cyanBright(record.platform)} #${record.problemId}`,
        chalk.whiteBright(record.title),
        "",
        `${chalk.dim("difficulty")} ${difficultyColor(record.difficulty)(record.difficulty)}`,
        `${chalk.dim("topics")}     ${record.topics.map((topic) => chalk.hex("#A78BFA")(topic)).join(", ")}`,
        ...(record.companies && record.companies.length > 0 ? [`${chalk.dim("companies")}  ${record.companies.slice(0, 5).map((c: string) => chalk.hex("#F59E0B")(c)).join(", ")}`] : []),
        `${chalk.dim("workspace")}  ${chalk.cyan(record.path)}`,
        `${chalk.dim("next")}       ${chalk.white(`cd "${record.path}"`)}`,
        `${chalk.dim("track")}      ${chalk.white("dev -s done")} ${chalk.dim("or")} ${chalk.white("dev -s stuck")}`,
        `${chalk.dim("url")}        ${chalk.dim(record.url)}`,
      ].join("\n"),
      {
        title: " random problem ",
        borderColor: "#00E5FF",
        borderStyle: "double",
        padding: 1,
      }
    )
  );

  const { openProblem } = await inquirer.prompt<{ openProblem: boolean }>([
    {
      type: "confirm",
      name: "openProblem",
      message: "Open problem in browser?",
      default: false,
    },
  ]);

  if (openProblem) {
    await openUrl(record.url);
  }
}

async function createProblemWorkspace(problem: PracticeProblem, language: SandboxLanguage): Promise<ProblemRecord> {
  const topic = problem.topics[0] ?? "mixed";
  const root = path.join(getSandboxDirectory(), "competitive", problem.platform, topic, problem.slug);

  await fs.ensureDir(root);
  await writeProblemStarter(root, language);

  const now = new Date().toISOString();
  const record: ProblemRecord = {
    ...problem,
    language,
    status: "attempted",
    path: root,
    startedAt: now,
    endedAt: null,
    timeSpentMinutes: 0,
    attempts: 1,
    notes: [],
    history: [{ action: "assigned", at: now }],
  };

  await writeProblemMetadata(record);
  return record;
}

function toSandboxRecord(record: ProblemRecord): SandboxRecord {
  return {
    id: `problem:${record.platform}:${record.problemId}`,
    name: record.slug,
    type: "competitive",
    path: record.path,
    language: record.language,
    activity: "dsa-practice",
    createdAt: record.startedAt,
    platform: record.platform,
    difficulty: record.difficulty,
    topic: record.topics[0],
    tags: record.topics,
    history: record.history,
  };
}

function parseFilters(args: string[]) {
  let platform: ProblemPlatform | undefined;
  let difficulty: ProblemDifficulty | undefined;
  const topics: string[] = [];

  for (const arg of args.map((item) => item.toLowerCase())) {
    if (platforms.has(arg)) {
      platform = arg as ProblemPlatform;
    } else if (difficulties.has(arg)) {
      difficulty = arg as ProblemDifficulty;
    } else {
      topics.push(arg);
    }
  }

  return { platform, difficulty, topics };
}

function matches(problem: PracticeProblem, filters: ReturnType<typeof parseFilters>) {
  if (filters.platform && problem.platform !== filters.platform) {
    return false;
  }

  if (filters.difficulty && problem.difficulty !== filters.difficulty) {
    return false;
  }

  return filters.topics.every((topic) => problem.topics.includes(topic));
}

function difficultyColor(difficulty: ProblemDifficulty) {
  switch (difficulty) {
    case "easy":
      return chalk.green;
    case "medium":
      return chalk.yellow;
    case "hard":
      return chalk.red;
  }
}

async function openUrl(url: string) {
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const { execa } = await import("execa");
  const child = execa(command, args, { reject: false, detached: true, stdio: "ignore" });
  child.unref();
}
