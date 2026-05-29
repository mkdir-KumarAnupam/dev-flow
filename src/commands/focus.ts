import chalk from "chalk";
import boxen from "boxen";
import fs from "fs-extra";
import path from "node:path";
import { execa } from "execa";
import { fileURLToPath } from "node:url";
import ora from "ora";
import { analyzeSession } from "../integrations/groq.js";
import express from "express";
import cors from "cors";
import open from "open";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function focusCommand(arg?: string) {
  if (arg === "analyze-json") {
    await analyzeJson();
    return;
  }

  if (arg === "report") {
    await renderReport();
    return;
  }
  
  if (arg === "stats") {
    await renderStats();
    return;
  }

  if (arg === "internal-hud") {
    await runFocusHUD();
    return;
  }

  if (!arg) {
    console.log(chalk.red("Error: Please specify a duration (e.g., 'dev focus 90m'), or use 'report', 'stats'."));
    return;
  }

  const minutesMatch = arg.match(/^(\d+)m$/);
  if (!minutesMatch) {
    console.log(chalk.red("Error: Invalid duration format. Use '90m' for 90 minutes."));
    return;
  }

  const durationMinutes = parseInt(minutesMatch[1], 10);
  const cwd = process.cwd();
  
  console.log(chalk.cyan(`Analyzing workspace snapshot for LOC tracking...`));
  const loc = await countLoc(cwd);

  const daemonPath = path.join(__dirname, "..", "daemon", "telemetry.js");
  
  const child = execa("node", [daemonPath, durationMinutes.toString(), cwd, loc.toString()], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();

  if (!process.argv.includes("--no-hud")) {
  // Spawn the Floating HUD
  await execa("cmd.exe", [
    "/c",
    "start",
    "Flow State HUD",
    process.execPath,
    ...process.execArgv,
    process.argv[1],
    "focus",
    "internal-hud"
  ], {
    detached: true,
    stdio: "ignore"
  });
  }

  console.log(
    boxen(
      [
        chalk.whiteBright(" ✦ Flow State Telemetry Daemon Activated"),
        "",
        `${chalk.dim("Duration:")}    ${chalk.cyan(durationMinutes + " minutes")}`,
        `${chalk.dim("Tracking:")}    ${chalk.cyan("Active Window Title, LOC Delta, Context-Switching Velocity")}`,
        `${chalk.dim("Start LOC:")}   ${chalk.green(loc.toLocaleString())}`,
        "",
        chalk.dim("Your terminal is now completely freed up."),
        chalk.dim("A live biofeedback HUD has been spawned on your screen."),
        chalk.dim("The daemon runs silently in the background and will"),
        chalk.dim("notify you and generate a report when time is up.")
      ].join("\n"),
      { borderColor: "gray", padding: 1, borderStyle: "round" }
    )
  );
}

async function runFocusHUD() {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const livePath = path.join(home, ".dev-cli", "flow-live.json");

  process.stdout.write("\x1b[8;8;65t"); // Resize to 8 rows, 65 cols
  process.stdout.write("\x1b[?25l"); // Hide cursor
  console.clear();

  const timer = setInterval(async () => {
    try {
      if (!fs.existsSync(livePath)) {
        console.clear();
        console.log(boxen(chalk.green(" 🏁 Focus session finished! "), { padding: 1, borderColor: "green" }));
        clearInterval(timer);
        setTimeout(() => process.exit(0), 3000);
        return;
      }

      const data = await fs.readJson(livePath);
      const remaining = Math.max(0, data.targetSeconds - data.elapsedSeconds);
      
      const m = Math.floor(remaining / 60).toString().padStart(2, "0");
      const s = (remaining % 60).toString().padStart(2, "0");
      
      const scoreColor = data.flowScore >= 90 ? chalk.greenBright : data.flowScore >= 70 ? chalk.yellowBright : chalk.redBright;
      const streakMins = Math.floor(data.currentStreak / 60);
      
      let activityBadge = chalk.dim("IDLE");
      if (data.category === "coding") activityBadge = chalk.bgGreen.black(" CODING ");
      else if (data.category === "research") activityBadge = chalk.bgCyan.black(" RESEARCH ");
      else if (data.category === "distraction") activityBadge = chalk.bgRed.black(" DISTRACTED ");

      const hudText = 
        `${chalk.whiteBright.bold("Flow Score:")} ${scoreColor(data.flowScore + " / 100")}\n` +
        `${chalk.dim("Remaining:")}  ${m}:${s}  ${chalk.dim("│")}  ${chalk.dim("Streak:")} ${chalk.green(streakMins + "m")}\n\n` +
        `${chalk.dim("Active Window:")}\n` +
        `${activityBadge} ${chalk.white(data.processName)} ${chalk.dim(data.windowTitle.substring(0, 30))}`;

      const output = boxen(hudText, {
        title: chalk.cyanBright(` ✦ FLOW `),
        padding: { left: 2, right: 2, top: 0, bottom: 0 },
        margin: 0,
        borderStyle: "round",
        borderColor: data.flowScore >= 90 ? "green" : data.flowScore >= 70 ? "cyan" : "red"
      });

      process.stdout.write("\x1b[0;0H" + output);
    } catch {}
  }, 1000);
}

async function countLoc(dir: string): Promise<number> {
  let files: string[] = [];
  try {
    const { stdout } = await execa("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: dir });
    files = stdout.split("\n").filter((f: string) => f.trim().length > 0).map((f: string) => path.join(dir, f));
  } catch {
    files = await walkDir(dir);
  }

  let total = 0;
  for (const fullPath of files) {
    try {
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory() || stat.size > 1000000) continue;
      const content = await fs.readFile(fullPath, "utf-8");
      total += content.split("\n").length;
    } catch {}
  }
  return total;
}

async function walkDir(dir: string, fileList: string[] = []): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file === "node_modules" || file === ".git" || file === "dist" || file === "build") continue;
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await walkDir(fullPath, fileList);
      } else {
        fileList.push(fullPath);
      }
    }
  } catch {}
  return fileList;
}

function drawBar(pct: number, colorFn: (s: string) => string): string {
  const width = 30;
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return colorFn("█".repeat(filled)) + chalk.dim("░".repeat(empty));
}

async function renderReport() {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const flowPath = path.join(home, ".dev-cli", "flow.json");
  if (!fs.existsSync(flowPath)) {
    console.log(chalk.yellow("No flow reports found. Run 'dev focus 90m' to generate one."));
    return;
  }

  const data = await fs.readJson(flowPath);
  const recent = data[data.length - 1];
  if (!recent) return;

  const spinner = ora("🤖 Groq is analyzing and recalibrating your timeline...").start();
  const analysis = await analyzeSession(recent);
  spinner.stop();

  let wasRecalibrated = false;
  if (analysis && !analysis.error && analysis.recalibratedEvents && analysis.recalibratedEvents.length > 0) {
    for (const correction of analysis.recalibratedEvents) {
      if (recent.timeline[correction.index]) {
        recent.timeline[correction.index].category = correction.newCategory;
        wasRecalibrated = true;
      }
    }

    if (wasRecalibrated) {
      recent.codingSeconds = 0;
      recent.researchSeconds = 0;
      recent.distractionSeconds = 0;
      recent.idleSeconds = 0;

      let currentStreak = 0;
      let deepWorkSeconds = 0;
      let contextSwitches = 0;
      let lastCat = "idle";

      for (const ev of recent.timeline) {
        const intervals = Math.max(1, Math.floor(ev.durationSecs / 5));
        for (let i = 0; i < intervals; i++) {
          const cat = ev.category;
          if (cat === "coding") recent.codingSeconds += 5;
          else if (cat === "research") recent.researchSeconds += 5;
          else if (cat === "distraction") recent.distractionSeconds += 5;
          else recent.idleSeconds += 5;

          if (cat === "coding") {
            currentStreak += 5;
            if (currentStreak >= 300) deepWorkSeconds += 5;
          } else {
            if (lastCat === "coding" && cat !== "coding" && currentStreak < 300) {
              contextSwitches++;
            }
            currentStreak = 0;
          }
          lastCat = cat;
        }
      }

      const totalSeconds = (recent.durationMinutes * 60) || 1;
      const productivePct = ((recent.codingSeconds + recent.researchSeconds) / totalSeconds) * 100;
      const deepWorkBonus = (deepWorkSeconds / totalSeconds) * 20; 
      const contextSwitchPenalty = contextSwitches * 5; 
      // Harsher penalty for recalibrated distractions
      const distractionPct = (recent.distractionSeconds / totalSeconds) * 100;
      const rawScore = productivePct + deepWorkBonus - contextSwitchPenalty - (distractionPct * 1.5);
      
      recent.flowScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    }
  }

  if (analysis && !analysis.error) {
    recent.aiAnalysis = analysis;
    if (analysis.wastedTimeAnalysis) recent.aiSummary = analysis.wastedTimeAnalysis;
  }
  data[data.length - 1] = recent;
  await fs.writeJson(flowPath, data, { spaces: 2 });

  const totalSecs = recent.durationMinutes * 60 || 1;
  const codingPct = Math.min(100, Math.round((recent.codingSeconds / totalSecs) * 100)) || 0;
  const researchPct = Math.min(100, Math.round((recent.researchSeconds / totalSecs) * 100)) || 0;
  const distractionPct = Math.min(100, Math.round(((recent.distractionSeconds || 0) / totalSecs) * 100)) || 0;
  const idlePct = Math.min(100, Math.round((recent.idleSeconds / totalSecs) * 100)) || 0;

  const scoreColor = recent.flowScore >= 90 ? chalk.greenBright : recent.flowScore >= 70 ? chalk.yellowBright : chalk.redBright;

  let timelineGraph = "";
  if (recent.timeline && recent.timeline.length > 0) {
    const blocks = 40;
    const secsPerBlock = totalSecs / blocks;
    
    let currentBlockStr = "";
    for (let i = 0; i < blocks; i++) {
      const blockTimeSecs = i * secsPerBlock;
      let activeEvent = null;
      let elapsedEventSecs = 0;
      for (const ev of recent.timeline) {
        elapsedEventSecs += ev.durationSecs;
        if (elapsedEventSecs > blockTimeSecs) {
          activeEvent = ev;
          break;
        }
      }
      if (!activeEvent) activeEvent = recent.timeline[recent.timeline.length - 1];

      if (activeEvent.category === "coding") currentBlockStr += chalk.greenBright("█");
      else if (activeEvent.category === "research") currentBlockStr += chalk.cyanBright("█");
      else if (activeEvent.category === "distraction") currentBlockStr += chalk.redBright("█");
      else currentBlockStr += chalk.gray("█");
    }
    
    timelineGraph = 
      `\n${chalk.cyan("◇")} ${chalk.whiteBright.bold("Chronological Timeline")}\n` +
      `${currentBlockStr}\n` +
      `${chalk.dim("0m" + " ".repeat(36) + recent.durationMinutes + "m")}`;
  }

  const uiPanels = [
    chalk.magenta.bold("✦ Flow State Session Report"),
    chalk.dim(new Date(recent.timestamp).toLocaleString() + ` │ ${recent.projectContext || "Workspace"}`),
    ""
  ];

  if (analysis && !analysis.error) {
    if (wasRecalibrated) {
      uiPanels.push(chalk.greenBright(`  ${chalk.dim("│")} Timeline automatically recalibrated by AI context filter.`));
      uiPanels.push("");
    }

    uiPanels.push(`${chalk.cyan("◇")} ${chalk.whiteBright.bold("Time Drain Analysis")}`);
    uiPanels.push(`  ${chalk.dim("│")} ${chalk.dim(analysis.wastedTimeAnalysis)}`);
    uiPanels.push("");

    uiPanels.push(`${chalk.cyan("◇")} ${chalk.whiteBright.bold("AI Core Observations")}`);
    for (const obs of analysis.coreObservations || []) {
      uiPanels.push(`  ${chalk.dim("│")} ${chalk.cyan("▸")} ${chalk.white(obs)}`);
    }
    uiPanels.push("");

    if (analysis.derivedMetrics && analysis.derivedMetrics.length > 0) {
      uiPanels.push(`${chalk.cyan("◇")} ${chalk.whiteBright.bold("AI Derived Metrics")}`);
      for (const metric of analysis.derivedMetrics) {
        let statusColor = chalk.white;
        if (metric.status === "good") statusColor = chalk.greenBright;
        else if (metric.status === "bad") statusColor = chalk.redBright;
        else if (metric.status === "neutral") statusColor = chalk.yellowBright;
        
        uiPanels.push(`  ${chalk.dim("│")} ${chalk.dim(metric.label.padEnd(25))} ${statusColor(metric.value)}`);
      }
      uiPanels.push("");
    }
  } else if (analysis?.error) {
    uiPanels.push(chalk.dim(`  ${chalk.dim("│")} ${analysis.error}`), "");
  }

  uiPanels.push(
    `${chalk.cyan("◇")} ${chalk.whiteBright.bold("Performance")}`,
    `  ${chalk.dim("│")} ${chalk.dim("Flow Score".padEnd(25))} ${scoreColor(recent.flowScore + " / 100")}`,
    `  ${chalk.dim("│")} ${chalk.dim("Lines Written".padEnd(25))} ${recent.locDelta > 0 ? chalk.greenBright("+" + recent.locDelta) : chalk.dim(recent.locDelta)} lines`,
    "",
    `${chalk.cyan("◇")} ${chalk.whiteBright.bold("Time Allocation")} ${chalk.dim(`(${recent.durationMinutes}m total)`)}`,
    `  ${chalk.dim("│")} ${chalk.dim("Coding".padEnd(15))} ${drawBar(codingPct, chalk.greenBright)} ${codingPct}%`,
    `  ${chalk.dim("│")} ${chalk.dim("Research".padEnd(15))} ${drawBar(researchPct, chalk.cyanBright)} ${researchPct}%`,
    `  ${chalk.dim("│")} ${chalk.dim("Distraction".padEnd(15))} ${drawBar(distractionPct, chalk.redBright)} ${distractionPct}%`,
    `  ${chalk.dim("│")} ${chalk.dim("Idle / Other".padEnd(15))} ${drawBar(idlePct, chalk.dim)} ${idlePct}%`,
    timelineGraph
  );

  console.log(
    boxen(uiPanels.join("\n"), { borderColor: "gray", padding: 1, borderStyle: "round" })
  );
}

async function renderStats() {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const flowPath = path.join(home, ".dev-cli", "flow.json");
  if (!fs.existsSync(flowPath)) {
    console.log(chalk.yellow("No flow reports found. Run 'dev focus 90m' to generate one."));
    return;
  }

  const data = await fs.readJson(flowPath);
  
  const dailyLoc: Record<string, number> = {};
  const dailyScore: Record<string, number[]> = {};
  
  for (const d of data) {
    const day = new Date(d.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    dailyLoc[day] = (dailyLoc[day] || 0) + (d.locDelta > 0 ? d.locDelta : 0);
    if (!dailyScore[day]) dailyScore[day] = [];
    dailyScore[day].push(d.flowScore || 0);
  }

  const days = Object.keys(dailyLoc).slice(-7); 
  if (days.length === 0) return;

  const maxLoc = Math.max(...Object.values(dailyLoc));

  console.log(chalk.magenta.bold("\n ✦ Productivity Trends (Last 7 Days)"));
  console.log(chalk.dim("─".repeat(50)));

  for (const day of days) {
    const loc = dailyLoc[day];
    const avgScore = Math.round(dailyScore[day].reduce((a, b) => a + b, 0) / dailyScore[day].length);
    
    const pct = maxLoc > 0 ? Math.round((loc / maxLoc) * 100) : 0;
    const bar = "█".repeat(Math.max(1, Math.round(pct / 5))); 
    const scoreColor = avgScore >= 90 ? chalk.greenBright : avgScore >= 70 ? chalk.yellowBright : chalk.redBright;

    console.log(`${chalk.cyan(day.padEnd(15))} | ${chalk.greenBright(bar.padEnd(20))} ${loc} LOC`);
    console.log("");
  }
}

async function analyzeJson() {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const flowPath = path.join(home, ".dev-cli", "flow.json");
  if (!fs.existsSync(flowPath)) {
    console.log(JSON.stringify({ error: "No flow reports found" }));
    return;
  }

  const data = await fs.readJson(flowPath);
  const recent = data[data.length - 1];
  if (!recent) return;

  if (recent.aiAnalysis) {
    console.log(JSON.stringify(recent));
    return;
  }

  const analysis = await analyzeSession(recent);

  let wasRecalibrated = false;
  if (analysis && !analysis.error && analysis.recalibratedEvents && analysis.recalibratedEvents.length > 0) {
    for (const correction of analysis.recalibratedEvents) {
      if (recent.timeline[correction.index]) {
        recent.timeline[correction.index].category = correction.newCategory;
        wasRecalibrated = true;
      }
    }

    if (wasRecalibrated) {
      recent.codingSeconds = 0;
      recent.researchSeconds = 0;
      recent.distractionSeconds = 0;
      recent.idleSeconds = 0;

      let currentStreak = 0;
      let deepWorkSeconds = 0;
      let contextSwitches = 0;
      let lastCat = "idle";

      for (const ev of recent.timeline) {
        const intervals = Math.max(1, Math.floor(ev.durationSecs / 5));
        for (let i = 0; i < intervals; i++) {
          const cat = ev.category;
          if (cat === "coding") recent.codingSeconds += 5;
          else if (cat === "research") recent.researchSeconds += 5;
          else if (cat === "distraction") recent.distractionSeconds += 5;
          else recent.idleSeconds += 5;

          if (cat === "coding") {
            currentStreak += 5;
            if (currentStreak >= 300) deepWorkSeconds += 5;
          } else {
            if (lastCat === "coding" && cat !== "coding" && currentStreak < 300) {
              contextSwitches++;
            }
            currentStreak = 0;
          }
          lastCat = cat;
        }
      }

      const totalSeconds = (recent.durationMinutes * 60) || 1;
      const productivePct = ((recent.codingSeconds + recent.researchSeconds) / totalSeconds) * 100;
      const deepWorkBonus = (deepWorkSeconds / totalSeconds) * 20; 
      const contextSwitchPenalty = contextSwitches * 5; 
      const distractionPct = (recent.distractionSeconds / totalSeconds) * 100;
      const rawScore = productivePct + deepWorkBonus - contextSwitchPenalty - (distractionPct * 1.5);
      
      recent.flowScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    }
  }

  if (analysis && !analysis.error) {
    recent.aiAnalysis = analysis;
    if (analysis.wastedTimeAnalysis) recent.aiSummary = analysis.wastedTimeAnalysis;
  }
  data[data.length - 1] = recent;
  await fs.writeJson(flowPath, data, { spaces: 2 });

  console.log(JSON.stringify(recent));
}
