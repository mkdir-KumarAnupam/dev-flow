const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/src/daemon/telemetry.ts', 'utf8');

// We'll replace from `const POLLING_INTERVAL = 2;` up to `// Timeline logic`

const regex = /const POLLING_INTERVAL = 2;[\s\S]*?\/\/ Timeline logic/;

const replacement = `const POLLING_INTERVAL = 2;
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
    const lines = raw.split("\\n").map((l: string) => l.trim()).filter(Boolean);
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

    // Timeline logic`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('C:/dev-cli/src/daemon/telemetry.ts', code);
  console.log('Updated telemetry.ts');
} else {
  console.log('Regex not found');
}
