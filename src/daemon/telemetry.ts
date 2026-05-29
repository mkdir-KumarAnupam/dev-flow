import fs from "fs-extra";
import path from "node:path";
import { execa } from "execa";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const serviceAccountPath = path.join(process.env.USERPROFILE || "", ".dev-cli", "firebase-service-account.json");
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = fs.readJsonSync(serviceAccountPath);
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
  } catch (e) {}
}

async function main() {
  const durationMinutes = parseInt(process.argv[2], 10);
  const targetCwd = process.argv[3];
  const startLoc = parseInt(process.argv[4], 10);

  let trackerScript = path.join(__dirname, "tracker.ps1");
  if (!fs.existsSync(trackerScript)) {
    trackerScript = path.join(__dirname, "../../src/daemon/tracker.ps1");
  }

  const child = execa("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", trackerScript]);
  child.catch(() => {});

  let codingSeconds = 0;
  let researchSeconds = 0;
  let distractionSeconds = 0;
  let idleSeconds = 0;
  let elapsedSeconds = 0;
  
  let currentStreak = 0;
  let lastCategory = "idle";
  let contextSwitches = 0;
  let deepWorkSeconds = 0;

  const POLLING_INTERVAL = 2;
  const targetSeconds = durationMinutes * 60;
  
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const livePath = path.join(home, ".dev-cli", "flow-live.json");
  const controlPath = path.join(home, ".dev-cli", "flow-control.json");
  
  const timeline: any[] = [];
  let currentEvent: any = null;

  let isBreak = false;
  let nextBreakTarget = 30 * 60; // Auto-break every 30 minutes
  let breakSeconds = 0;

  process.on("SIGTERM", () => { try { child.kill(); fs.unlinkSync(livePath); } catch(e){} process.exit(0); });
  child.stdout?.on("data", (chunk) => {
    
    // Handle Remote Commands
    if (fs.existsSync(controlPath)) {
      try {
        const cmdData = fs.readJsonSync(controlPath);
        if (cmdData.command === "end_session") {
          fs.unlinkSync(controlPath);
          if (currentEvent) timeline.push(currentEvent);
          finalize(child, targetCwd, startLoc, durationMinutes, codingSeconds, researchSeconds, distractionSeconds, idleSeconds, contextSwitches, deepWorkSeconds, 0, timeline, livePath);
          return;
        } else if (cmdData.command === "start_break") {
          isBreak = true;
          fs.unlinkSync(controlPath);
        } else if (cmdData.command === "resume_focus") {
          isBreak = false;
          nextBreakTarget = elapsedSeconds + (30 * 60); // Reset for next 30m
          fs.unlinkSync(controlPath);
        }
      } catch(e) {}
    }

    if (!isBreak && elapsedSeconds >= nextBreakTarget && elapsedSeconds > 0) {
      isBreak = true;
    }

    const raw = chunk.toString().trim().toLowerCase();
    const lines = raw.split("\n").map((l: string) => l.trim()).filter(Boolean);
    const lastLine = lines[lines.length - 1] || "idle|idle";
    const parts = lastLine.split("|");
    const processName = parts[0] || "";
    const windowTitle = parts[1] || "";

    let category = "idle";

    if (isBreak) {
      category = "break";
      breakSeconds += POLLING_INTERVAL;
      currentStreak = 0;
    } else {
      if (processName.includes("code") || processName.includes("terminal") || processName.includes("powershell")) {
        category = "coding";
      } else if (["chrome", "msedge", "firefox", "brave", "safari", "zen", "opera", "vivaldi", "arc", "librewolf", "waterfox", "chromium", "thorium"].includes(processName)) {
        if (windowTitle.includes("stack overflow") || windowTitle.includes("github") || windowTitle.includes("docs") || windowTitle.includes("chatgpt") || windowTitle.includes("claude") || windowTitle.includes("gemini") || windowTitle.includes("mdn") || windowTitle.includes("leetcode")) {
          category = "research";
        } else if (windowTitle.includes("youtube") || windowTitle.includes("twitter") || windowTitle.includes("reddit") || windowTitle.includes("discord") || windowTitle.includes("netflix") || windowTitle.includes("instagram") || windowTitle.includes("twitch")) {
          category = "distraction";
        } else {
          category = "research"; 
        }
      } else if (["discord", "spotify", "slack", "telegram", "whatsapp"].includes(processName)) {
        category = "distraction";
      }

      if (category === "coding") codingSeconds += POLLING_INTERVAL;
      else if (category === "research") researchSeconds += POLLING_INTERVAL;
      else if (category === "distraction") distractionSeconds += POLLING_INTERVAL;
      else idleSeconds += POLLING_INTERVAL;

      if (category === "coding") {
        currentStreak += POLLING_INTERVAL;
        if (currentStreak >= 300) {
          deepWorkSeconds += POLLING_INTERVAL;
        }
      } else {
        if (lastCategory === "coding" && category !== "coding" && currentStreak < 300) {
          contextSwitches++;
        }
        currentStreak = 0;
      }
      
      elapsedSeconds += POLLING_INTERVAL;
    }

    lastCategory = category;

    // Timeline logic
    const now = new Date().toISOString();
    if (!currentEvent) {
      currentEvent = { start: now, end: now, category, process: processName, title: windowTitle, durationSecs: POLLING_INTERVAL };
    } else if (currentEvent.category !== category) {
      currentEvent.end = now;
      timeline.push(currentEvent);
      currentEvent = { start: now, end: now, category, process: processName, title: windowTitle, durationSecs: POLLING_INTERVAL };
    } else {
      currentEvent.durationSecs += POLLING_INTERVAL;
      currentEvent.end = now;
    }

    // Dynamic Flow Score for live broadcasting
    const totalSecs = elapsedSeconds || 1;
    const productivePct = ((codingSeconds + researchSeconds) / totalSecs) * 100;
    const deepWorkBonus = (deepWorkSeconds / totalSecs) * 20; 
    const contextSwitchPenalty = contextSwitches * 5; 
    const distractionPct = (distractionSeconds / totalSecs) * 100;
    const liveScore = Math.max(0, Math.min(100, Math.round(productivePct + deepWorkBonus - contextSwitchPenalty - (distractionPct * 0.5))));

    
    if (fs.existsSync(serviceAccountPath)) {
      admin.database().ref("sessions/live").set({
        flowScore: liveScore,
        elapsedSeconds,
        targetSeconds,
        category,
        processName,
        windowTitle,
        codingSeconds,
        researchSeconds,
        distractionSeconds,
        idleSeconds,
        currentStreak,
        pid: process.pid
      }).catch(() => {});
    }

    fs.writeJson(livePath, {
      flowScore: liveScore,
      elapsedSeconds,
      targetSeconds,
      category,
      processName,
      windowTitle,
      codingSeconds,
      researchSeconds,
      distractionSeconds,
      idleSeconds,
      currentStreak,
      pid: process.pid
    }).catch(() => {});

    if (elapsedSeconds >= targetSeconds) {
      if (currentEvent) timeline.push(currentEvent);
      finalize(child, targetCwd, startLoc, durationMinutes, codingSeconds, researchSeconds, distractionSeconds, idleSeconds, contextSwitches, deepWorkSeconds, liveScore, timeline, livePath);
    }
  });

  setTimeout(() => {
    if (currentEvent) timeline.push(currentEvent);
    finalize(child, targetCwd, startLoc, durationMinutes, codingSeconds, researchSeconds, distractionSeconds, idleSeconds, contextSwitches, deepWorkSeconds, 0, timeline, livePath);
  }, targetSeconds * 1000 + 5000);
}

async function finalize(
  child: any, 
  targetCwd: string, 
  startLoc: number, 
  durationMinutes: number, 
  codingSeconds: number, 
  researchSeconds: number, 
  distractionSeconds: number,
  idleSeconds: number,
  contextSwitches: number,
  deepWorkSeconds: number,
  flowScore: number,
  timeline: any[],
  livePath: string
) {
  child.kill();
  
  try { await fs.remove(livePath); } catch {}

  if (fs.existsSync(serviceAccountPath)) {
    try { await admin.database().ref("sessions/live").remove(); } catch {}
  }


  const totalSeconds = (durationMinutes * 60) || (codingSeconds + researchSeconds + distractionSeconds + idleSeconds) || 1;
  const productivePct = ((codingSeconds + researchSeconds) / totalSeconds) * 100;
  const deepWorkBonus = (deepWorkSeconds / totalSeconds) * 20; 
  const contextSwitchPenalty = contextSwitches * 5; 
  const distractionPct = (distractionSeconds / totalSeconds) * 100;
  
  let rawScore = productivePct + deepWorkBonus - contextSwitchPenalty - (distractionPct * 0.5);
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const endLoc = await countLoc(targetCwd);
  const locDelta = endLoc - startLoc;

  const home = process.env.HOME || process.env.USERPROFILE || "";
  const flowPath = path.join(home, ".dev-cli", "flow.json");

  await fs.ensureFile(flowPath);
  let data = [];
  try {
    data = await fs.readJson(flowPath);
  } catch {}

  let resolvedProject = path.basename(targetCwd);
  try {
    const projPath = path.join(home, ".dev-cli", "projects.json");
    if (await fs.pathExists(projPath)) {
      const projects = await fs.readJson(projPath);
      let bestMatch = "";
      let longestMatch = 0;
      for (const p of Object.values(projects) as any[]) {
        if (p.path && targetCwd.toLowerCase().startsWith(p.path.toLowerCase())) {
          if (p.path.length > longestMatch) {
            bestMatch = p.name;
            longestMatch = p.path.length;
          }
        }
      }
      if (bestMatch) resolvedProject = bestMatch;
    }
  } catch {}

  data.push({
    timestamp: new Date().toISOString(),
    durationMinutes,
    codingSeconds,
    researchSeconds,
    distractionSeconds,
    idleSeconds,
    locDelta,
    flowScore: finalScore,
    projectContext: resolvedProject,
    timeline
  });

  await fs.writeJson(flowPath, data, { spaces: 2 });

  try {
    let motivational = "Solid effort.";
    if (finalScore >= 90) motivational = "Unstoppable! True monk mode.";
    else if (finalScore >= 70) motivational = "Great focus session.";
    else motivational = "A bit distracted, but good try.";

    const toastScript = `
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null;
    [Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null;
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null;

    $APP_ID = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe';
    $template = '<toast><visual><binding template="ToastText02"><text id="1">dev focus complete! Score: ${finalScore}/100</text><text id="2">${motivational} You wrote ${locDelta} LOC.</text></binding></visual></toast>';

    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument;
    $xml.LoadXml($template);
    $toast = New-Object Windows.UI.Notifications.ToastNotification $xml;
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($APP_ID).Show($toast);
    `;
    await execa("powershell", ["-Command", toastScript]);
  } catch (err) {
    console.error(err);
  }

  process.exit(0);
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

main().catch((err) => {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  fs.writeFileSync(path.join(home, ".dev-cli", "flow-error.log"), String(err?.stack || err));
  process.exit(1);
});
