import boxen from "boxen";
import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import os from "node:os";
import path from "node:path";
import { execa } from "execa";
import { highlight } from "cli-highlight";
import { getPracticeAnalytics, topEntry } from "../analytics/practiceAnalytics.js";
import { assignRandomProblem } from "../competitive/assignProblem.js";
import { renderPracticeGraph } from "../graphs/renderGraphs.js";
import { getPracticeRecords } from "../registry/practice.js";
import { markCurrentProblem } from "../trackers/problemTracker.js";
import { type ProblemRecord } from "../types/problem.js";
import { openEditor } from "../workspace/openEditor.js";
import { findProblemRoot, readProblemMetadata } from "../metadata/problemMetadata.js";
import { getActivePracticePath } from "../registry/practice.js";

export async function competitiveSandboxCommand(action: string | undefined, args: string[]) {
  switch (action) {
    case "random":
    case "next":
    case "daily":
      await assignRandomProblem(args);
      return;
    case "done":
      await markCurrentProblem("solved");
      return;
    case "stuck":
      await markCurrentProblem("stuck");
      return;
    case "history":
      await renderHistory(args);
      return;
    case "stats":
      await renderStats();
      return;
    case "review":
    case "revisit":
      await renderReviewQueue();
      return;
    case "graph":
      await renderPracticeGraph(args[0] ?? "activity");
      return;
    case "race":
      await renderRaceHUD(args);
      return;
  }
}

async function renderHistory(args: string[]) {
  const filters = args.map((item) => item.toLowerCase());
  const records = (await getPracticeRecords()).filter((record) => {
    if (filters.length === 0) {
      return true;
    }

    const haystack = [
      record.platform,
      record.difficulty,
      record.status,
      record.language,
      ...record.topics,
      record.title,
    ]
      .join(" ")
      .toLowerCase();

    return filters.every((filter) => haystack.includes(filter));
  });

  console.log(
    boxen(
      records.length
        ? records
            .slice(0, 25)
            .map((record) => `${icon(record.status)} ${record.title} ${chalk.dim(record.platform)} ${chalk.cyan(record.difficulty)} ${chalk.magenta(record.topics.join(", "))}`)
            .join("\n")
        : chalk.dim("No practice history matched."),
      {
        title: " practice history ",
        borderColor: "#00E5FF",
        borderStyle: "round",
        padding: 1,
      }
    )
  );

  await maybeOpenSavedSolution(records);
}

async function renderStats() {
  const analytics = await getPracticeAnalytics();
  const weak = topEntry(analytics.topicStuck)?.[0] ?? "none";
  const favorite = topEntry(analytics.topicCounts)?.[0] ?? "none";

  console.log(
    boxen(
      [
        `${chalk.dim("solved")} ${chalk.green(String(analytics.solved))}`,
        `${chalk.dim("attempted")} ${chalk.cyan(String(analytics.attempted))}`,
        `${chalk.dim("stuck")} ${chalk.yellow(String(analytics.stuck))}`,
        `${chalk.dim("current streak")} ${chalk.green(`${analytics.currentStreak}d`)}`,
        `${chalk.dim("longest streak")} ${chalk.green(`${analytics.longestStreak}d`)}`,
        `${chalk.dim("favorite topic")} ${chalk.white(favorite)}`,
        `${chalk.dim("weak topic")} ${chalk.white(weak)}`,
      ].join("\n"),
      {
        title: " competitive stats ",
        borderColor: "#A78BFA",
        borderStyle: "double",
        padding: 1,
      }
    )
  );
}

async function renderReviewQueue() {
  const records = (await getPracticeRecords()).filter((record) => record.status === "stuck" || record.status === "attempted");

  console.log(
    boxen(
      records.length
        ? records
            .slice(0, 10)
            .map((record) => `${icon(record.status)} ${record.title} ${chalk.dim(record.path)}`)
            .join("\n")
        : chalk.green("Review queue is clear."),
      {
        title: " review queue ",
        borderColor: "#FF4FD8",
        borderStyle: "round",
        padding: 1,
      }
    )
  );
}

function icon(status: string) {
  switch (status) {
    case "solved":
      return chalk.green("\u2713");
    case "stuck":
      return chalk.yellow("!");
    default:
      return chalk.cyan("\u2022");
  }
}

async function maybeOpenSavedSolution(records: ProblemRecord[]) {
  if (records.length === 0 || !process.stdin.isTTY) {
    return;
  }

  const solutions = await getSavedSolutions(records);

  if (solutions.length === 0) {
    return;
  }

  const { openSolution } = await inquirer.prompt<{ openSolution: boolean }>([
    {
      type: "confirm",
      name: "openSolution",
      message: "Open a saved solution from these results?",
      default: false,
    },
  ]);

  if (!openSolution) {
    return;
  }

  const { solutionPath } = await inquirer.prompt<{ solutionPath: string }>([
    {
      type: "select",
      name: "solutionPath",
      message: "Saved solution:",
      pageSize: 12,
      choices: solutions.map((solution) => ({
        name: `${solution.record.title} ${chalk.dim(path.basename(solution.path))}`,
        value: solution.path,
      })),
      default: solutions[0]?.path,
    },
  ]);

  const resolvedSolutionPath = solutionPath || solutions[0]?.path;

  if (!resolvedSolutionPath || !(await fs.pathExists(resolvedSolutionPath))) {
    console.log(chalk.yellow("Could not resolve that saved solution path."));
    return;
  }

  const { action } = await inquirer.prompt<{ action: "open" | "print" }>([
    {
      type: "select",
      name: "action",
      message: "How should dev show it?",
      choices: [
        { name: "Open in VS Code", value: "open" },
        { name: "Print in terminal", value: "print" },
      ],
      default: "open",
    },
  ]);

  if (action === "open") {
    await openEditor("code", resolvedSolutionPath);
    return;
  }

  const code = await fs.readFile(resolvedSolutionPath, "utf8");
  const ext = path.extname(resolvedSolutionPath).slice(1);
  const highlightedCode = highlight(code, { language: ext || "javascript", ignoreIllegals: true });

  console.log(
    boxen(highlightedCode, {
      title: chalk.cyanBright(` ${path.basename(resolvedSolutionPath)} `),
      borderColor: "#63E6BE",
      borderStyle: "bold",
      padding: 1,
    })
  );
}

async function getSavedSolutions(records: ProblemRecord[]) {
  const solutions: Array<{ record: ProblemRecord; path: string }> = [];

  for (const record of records) {
    const solutionDirectory = path.join(record.path, "solutions");

    if (!(await fs.pathExists(solutionDirectory))) {
      continue;
    }

    const entries = await fs.readdir(solutionDirectory);
    const files = (
      await Promise.all(
        entries.map(async (entry) => {
          const solutionPath = path.join(solutionDirectory, entry);
          const stats = await fs.stat(solutionPath);
          return stats.isFile() ? solutionPath : undefined;
        })
      )
    )
      .filter((solutionPath): solutionPath is string => Boolean(solutionPath))
      .sort((first, second) => second.localeCompare(first));

    for (const file of files) {
      solutions.push({ record, path: file });
    }
  }

  return solutions;
}

async function launchFloatingHUD() {
  const execArgs = process.execArgv;
  const scriptPath = process.argv[1];

  console.log(chalk.cyan("Spawning floating HUD..."));
  
  await execa("cmd.exe", [
    "/c",
    "start",
    "Ghost Race HUD",
    process.execPath,
    ...execArgs,
    scriptPath,
    "-s",
    "race",
    "internal-hud"
  ], {
    detached: true,
    stdio: "ignore"
  });
  
  console.log(chalk.green("HUD spawned successfully!"));
  process.exit(0);
}

async function renderRaceHUD(args: string[] = []) {
  if (!args.includes("internal-hud")) {
    await launchFloatingHUD();
    return;
  }

  const root = (await findProblemRoot(process.cwd())) ?? (await getActivePracticePath());

  if (!root) {
    console.log(chalk.yellow("No active problem found to race against. Run `dev -s random` first."));
    // Pause before closing if running as internal hud
    if (args.includes("internal-hud")) setTimeout(() => process.exit(1), 3000);
    return;
  }

  const currentProblem = await readProblemMetadata(root);

  if (!currentProblem) {
    console.log(chalk.yellow("Could not read current problem metadata."));
    if (args.includes("internal-hud")) setTimeout(() => process.exit(1), 3000);
    return;
  }

  if (currentProblem.status === "solved") {
    console.log(chalk.green("You've already solved this problem! Start a new one to race."));
    if (args.includes("internal-hud")) setTimeout(() => process.exit(0), 3000);
    return;
  }

  const records = await getPracticeRecords();
  const solvedSameDifficulty = records.filter(r => r.difficulty === currentProblem.difficulty && r.status === "solved" && r.timeSpentMinutes);
  
  // Advanced matchmaking: prioritize problems that share at least one topic
  const solvedSameTopics = solvedSameDifficulty.filter(r => 
    r.topics && currentProblem.topics && 
    r.topics.some((topic: string) => currentProblem.topics.includes(topic))
  );

  let targetMinutes = 20;
  let multiplier = 1.0;

  if (solvedSameTopics.length > 0) {
    const total = solvedSameTopics.reduce((sum, r) => sum + (r.timeSpentMinutes ?? 0), 0);
    targetMinutes = Math.max(1, Math.round(total / solvedSameTopics.length));
    
    // Scale target based on exact acceptance rate differences
    const validAc = solvedSameTopics.filter(r => typeof r.acceptanceRate === 'number');
    if (validAc.length > 0 && currentProblem.acceptanceRate) {
      const avgAc = validAc.reduce((sum, r) => sum + r.acceptanceRate!, 0) / validAc.length;
      multiplier = Math.min(2.0, Math.max(0.5, avgAc / currentProblem.acceptanceRate));
    }
  } else if (solvedSameDifficulty.length > 0) {
    const total = solvedSameDifficulty.reduce((sum, r) => sum + (r.timeSpentMinutes ?? 0), 0);
    targetMinutes = Math.max(1, Math.round(total / solvedSameDifficulty.length));

    const validAc = solvedSameDifficulty.filter(r => typeof r.acceptanceRate === 'number');
    if (validAc.length > 0 && currentProblem.acceptanceRate) {
      const avgAc = validAc.reduce((sum, r) => sum + r.acceptanceRate!, 0) / validAc.length;
      multiplier = Math.min(2.0, Math.max(0.5, avgAc / currentProblem.acceptanceRate));
    }
  } else if (currentProblem.difficulty === "easy") {
    targetMinutes = 10;
  } else if (currentProblem.difficulty === "hard") {
    targetMinutes = 40;
  }

  // Apply the acceptance-rate based multiplier
  targetMinutes = Math.max(1, Math.round(targetMinutes * multiplier));

  const targetSecs = targetMinutes * 60;
  const startedAtMs = new Date(currentProblem.startedAt).getTime();

  // Setup the tiny floating window
  if (args.includes("internal-hud")) {
    process.stdout.write("\x1b[8;6;75t"); // Resize to 6 rows, 75 cols
    process.stdout.write("\x1b[?25l"); // Hide cursor
    console.clear();
  }

  const timer = setInterval(async () => {
    try {
      const liveProblem = await readProblemMetadata(root);
      if (liveProblem && (liveProblem.status === "solved" || liveProblem.status === "stuck")) {
        clearInterval(timer);
        console.clear();
        
        const finalMsg = boxen(`You marked the problem as ${chalk.cyan(liveProblem.status)}.`, {
          title: chalk.green(" 🏁 Race finished! "),
          padding: 1,
          borderColor: "green",
          borderStyle: "round"
        });
        console.log(finalMsg);
        
        if (args.includes("internal-hud")) {
          setTimeout(() => process.exit(0), 4000);
        } else {
          process.stdout.write("\x1b[?25h"); // Show cursor
          process.exit(0);
        }
        return;
      }
    } catch {
      // Ignore transient read errors
    }

    const elapsedSecs = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
    const barWidth = 25;
    
    const ghostRatio = Math.min(1, elapsedSecs / targetSecs);
    const ghostFilled = Math.floor(ghostRatio * barWidth);
    const ghostBar = chalk.dim("■").repeat(ghostFilled) + chalk.dim("·").repeat(barWidth - ghostFilled);
    
    const userRatio = Math.min(1, elapsedSecs / targetSecs);
    const userFilled = Math.floor(userRatio * barWidth);
    const userBarChar = elapsedSecs > targetSecs ? chalk.red("■") : chalk.greenBright("■");
    const userBar = userBarChar.repeat(userFilled) + chalk.dim("·").repeat(barWidth - userFilled);

    const minutes = Math.floor(elapsedSecs / 60);
    const seconds = elapsedSecs % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    const targetString = `${targetMinutes.toString().padStart(2, "0")}:00`;
    
    let paceString = "";
    let color = chalk.greenBright;
    let paceIcon = "🟢";
    let borderColor = "#00E5FF";
    
    if (elapsedSecs <= targetSecs) {
      const diff = targetSecs - elapsedSecs;
      paceString = `-${Math.floor(diff/60)}m ${diff%60}s`;
    } else {
      const diff = elapsedSecs - targetSecs;
      paceString = `+${Math.floor(diff/60)}m ${diff%60}s`;
      color = chalk.redBright;
      paceIcon = "🔴";
      borderColor = "#FF0055";
    }

    const hudText = 
      `Ghost : [${ghostBar}] ${targetString}\n` +
      `You   : [${userBar}] ${color(timeString)}  | Pace: ${color(paceString)} ${paceIcon}`;
      
    const output = boxen(hudText, {
      title: chalk.cyanBright(` ${currentProblem.title} `),
      padding: { left: 2, right: 2, top: 0, bottom: 0 },
      margin: 0,
      borderStyle: "round",
      borderColor
    });

    // Flicker-free overwrite
    process.stdout.write("\x1b[0;0H" + output);
  }, 1000);
}
