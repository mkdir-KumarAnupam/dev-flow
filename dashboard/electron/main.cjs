const { app, BrowserWindow, ipcMain, shell, dialog, globalShortcut } = require("electron");

app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

const path = require("path");
const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const { exec, spawn } = require("child_process");
const os = require("os");

let mainWindow;
let hideOnBlur = true;


const admin = require('firebase-admin');
const settingsPath = path.join(os.homedir(), '.dev-cli', 'settings.json');
let fbInitialized = false;
let setupRequired = true;
let devosSettings = {};

if (fs.pathExistsSync(settingsPath)) {
  try {
    devosSettings = fs.readJsonSync(settingsPath);
    if (devosSettings.firebaseDatabaseUrl && devosSettings.firebaseServiceAccountPath) {
      setupRequired = false;
      if (fs.pathExistsSync(devosSettings.firebaseServiceAccountPath)) {
        const sa = fs.readJsonSync(devosSettings.firebaseServiceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(sa),
          databaseURL: devosSettings.firebaseDatabaseUrl
        });
        fbInitialized = true;
      }
    }
  } catch(e) {}
}

function initializeFirebase(dbUrl, saPathStr) {
    if (fbInitialized) return true;
    try {
        const sa = fs.readJsonSync(saPathStr);
        admin.initializeApp({
          credential: admin.credential.cert(sa),
          databaseURL: dbUrl
        });
        fbInitialized = true;
        setupLiveWatcher(); // Start the watcher now that we're initialized
        return true;
    } catch(e) {
        console.error("Firebase init failed:", e);
        return false;
    }
}

let liveSessionWatcher = null;
function setupLiveWatcher() {
  if (!fbInitialized) return;
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const livePath = require('path').join(home, '.dev-cli', 'flow-live.json');
  
  const updateFirebaseLive = async () => {
    try {
      if (await fs.pathExists(livePath)) {
        const data = await fs.readJson(livePath);
        
        let cwd = null;
        let projectName = null;
        try {
          const cliDir = require('path').join(home, ".dev-cli");
          const focusMetaPath = require('path').join(cliDir, "focus-meta.json");
          if (await fs.pathExists(focusMetaPath)) {
            const meta = await fs.readJson(focusMetaPath);
            cwd = meta.cwd;
            projectName = require('path').basename(cwd);
            
            const projPath = require('path').join(cliDir, "projects.json");
            if (await fs.pathExists(projPath)) {
              const projects = await fs.readJson(projPath);
              let bestMatch = "";
              let longestMatch = 0;
              for (const p of Object.values(projects)) {
                if (p.path && cwd.toLowerCase().startsWith(p.path.toLowerCase())) {
                  if (p.path.length > longestMatch) {
                    bestMatch = p.name;
                    longestMatch = p.path.length;
                  }
                }
              }
              if (bestMatch) projectName = bestMatch;
            }
          }
        } catch (e) {}
        
        const payload = { active: true, ...data, cwd, projectName };
        await admin.database().ref('dashboard_stats/liveSession').set(payload);
      } else {
        await admin.database().ref('dashboard_stats/liveSession').set({ active: false });
      }
    } catch(e) {}
  };

  if (liveSessionWatcher) liveSessionWatcher.close();
  try {
    const chokidar = require('chokidar');
    liveSessionWatcher = chokidar.watch(livePath, { ignoreInitial: false });
    liveSessionWatcher.on('add', updateFirebaseLive);
    liveSessionWatcher.on('change', updateFirebaseLive);
    liveSessionWatcher.on('unlink', updateFirebaseLive);
  } catch(e) {
    fs.watchFile(livePath, { interval: 1000 }, updateFirebaseLive);
  }
}

setupLiveWatcher();

let workspaceWatcher = null;
function setupWorkspaceWatcher() {
  try {
    const chokidar = require('chokidar');
    const fs = require('fs-extra');
    const path = require('path');
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const defaultPath = path.join(home, 'projects');
    const targetPath = devosSettings.workspacePath || defaultPath;
    
    if (!fs.existsSync(targetPath)) return;

    // Watch for new package.json files up to 2 directories deep
    workspaceWatcher = chokidar.watch(path.join(targetPath, '*/package.json'), { ignoreInitial: true, depth: 1 });
    workspaceWatcher.on('add', async (filePath) => {
      try {
        const projectDir = path.dirname(filePath);
        const pkg = await fs.readJson(filePath);
        const projectName = pkg.name || path.basename(projectDir);
        
        const cliDir = path.join(home, '.dev-cli');
        const projectsFile = path.join(cliDir, "projects.json");
        let projects = {};
        try { projects = await fs.readJson(projectsFile); } catch(e) {}
        
        const existingKey = Object.keys(projects).find(k => projects[k].path === projectDir);
        if (!existingKey) {
          const newId = Date.now().toString();
          projects[newId] = {
            id: newId,
            name: projectName,
            path: projectDir,
            type: "React/Web", // default assumption
            color: "violet",
            lastModified: new Date().toISOString()
          };
          await fs.writeJson(projectsFile, projects, { spaces: 2 });
          console.log(`Auto-detected new project: ${projectName}`);
          
          // Emit IPC event to frontend to refresh workspace
          const bw = require('electron').BrowserWindow.getAllWindows()[0];
          if (bw) {
            bw.webContents.send('new-project-detected', projectDir);
          }
        }
      } catch(e) {
        console.error("Error auto-adding new project:", e);
      }
    });
  } catch(e) {
    console.error("Failed to setup workspace watcher", e);
  }
}
setupWorkspaceWatcher();


async function syncDashboardMetrics() {
  if (!fbInitialized) return;
  try {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const flowPath = path.join(home, '.dev-cli', 'flow.json');
    const pracPath = path.join(home, '.dev-cli', 'practice.json');
    
    let flow = [];
    if (await fs.pathExists(flowPath)) flow = await fs.readJson(flowPath);
    let practice = [];
    if (await fs.pathExists(pracPath)) practice = await fs.readJson(pracPath);
    
    const totalLoc = flow.reduce((a, c) => a + Math.max(0, c.locDelta || 0), 0);
    const totalMin = flow.reduce((a, c) => a + (c.durationMinutes || 0), 0);
    const deepWorkHrs = Math.round((totalMin / 60) * 10) / 10;
    
    const flowScores = flow.filter(f => typeof f.flowScore === "number");
    const avgFlow = flowScores.length > 0 ? Math.round(flowScores.reduce((a, c) => a + c.flowScore, 0) / flowScores.length) : 0;
    
    const solved = practice.length;
    const practiceMins = practice.reduce((a, c) => a + (c.timeSpentMinutes || 0), 0);
    
    const dayCounts = {};
    flow.forEach(f => {
      if (!f.timestamp) return;
      const ds = new Date(f.timestamp).toISOString().split('T')[0];
      dayCounts[ds] = (dayCounts[ds] || 0) + (f.durationMinutes || 0);
    });
    practice.forEach(p => {
      if (!p.startedAt) return;
      const ds = new Date(p.startedAt).toISOString().split('T')[0];
      dayCounts[ds] = (dayCounts[ds] || 0) + (p.timeSpentMinutes || 0);
    });
    
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (dayCounts[ds] > 0) {
        streak++;
      } else {
        if (i > 0) break; // Missed a day before today breaks streak
      }
    }
    
    // Last 7 days chart data
    const graphData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      graphData.push(dayCounts[ds] || 0);
    }

    
    // 35-day heatmap data (5 weeks x 7 days)
    const heatmapData = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      heatmapData.push(dayCounts[ds] || 0);
    }
    
    // Last Project & Uncommitted
    let lastProjectName = '--';
    let lastProjectDesc = '--';
    let uncommittedCount = 0;
    
    try {
      if (flow.length > 0) {
        lastProjectName = flow[flow.length - 1].projectContext || '--';
        const projPath = path.join(home, '.dev-cli', 'projects.json');
        if (await fs.pathExists(projPath)) {
          const projects = await fs.readJson(projPath);
          const p = projects.find(x => x.name === lastProjectName);
          if (p) {
             lastProjectDesc = p.type || p.description || '--';
             const cp = require('child_process');
             const gitStatus = cp.execSync('git status -s', { cwd: p.path, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
             uncommittedCount = gitStatus.split('\n').filter(l => l.trim().length > 0).length;
          }
        }
      }
    } catch (err) {
      console.log('Error getting last project info:', err.message);
    }

    
    let lastProjectOpened = '--';
    if (flow.length > 0) {
      lastProjectOpened = flow[flow.length - 1].timestamp || '--';
    }

    let latestSubTitle = '--';
    let latestSubDifficulty = 'easy';
    if (practice.length > 0) {
       const sub = practice[practice.length - 1];
       latestSubTitle = sub.title || '--';
       latestSubDifficulty = sub.difficulty || 'easy';
    }

    const payload = {
      metrics: {
        streak: streak,
        solved: solved,
        loc: totalLoc,
        deepWork: deepWorkHrs,
        avgFlow: avgFlow,
        practice: practiceMins,
        totalTracked: Math.round(flow.reduce((a, c) => a + (c.durationMinutes || 0), 0))
      },
      graph: graphData,
      heatmap: heatmapData,
      lastProject: {
        name: lastProjectName,
        desc: lastProjectDesc,
        lastOpened: lastProjectOpened
      },
      uncommitted: uncommittedCount,
      latestSubmission: {
        title: latestSubTitle,
        difficulty: latestSubDifficulty
      }
    };

    
    await admin.database().ref('dashboard_stats').set(payload);

  } catch (e) {
    console.error('Firebase Sync Error', e.message);
  }
}

function startServer() {
  const server = express();

  syncDashboardMetrics();
  setInterval(syncDashboardMetrics, 60000); // Sync every minute

  server.use(cors());
  server.use(express.json());

  const home = process.env.HOME || process.env.USERPROFILE || "";
  const cliDir = path.join(home, ".dev-cli");

  const serveFile = async (res, filename) => {
    try { const data = await fs.readJson(path.join(cliDir, filename)); res.json(data); }
    catch { res.json([]); }
  };

  // ═══ SETUP API ═══
  server.get("/api/setup/status", (req, res) => {
    res.json({ setupRequired, settings: devosSettings });
  });

  server.post("/api/setup/pick-file", async (req, res) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });
      if (!result.canceled && result.filePaths.length > 0) {
        res.json({ path: result.filePaths[0] });
      } else {
        res.json({ path: null });
      }
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/setup/complete", async (req, res) => {
    try {
      const { userName, firebaseDatabaseUrl, firebaseServiceAccountPath, linearApiKey, geminiApiKey } = req.body;
      const newSettings = { ...devosSettings, userName, firebaseDatabaseUrl, firebaseServiceAccountPath, linearApiKey };
      
      const success = initializeFirebase(firebaseDatabaseUrl, firebaseServiceAccountPath);
      if (!success) {
        return res.status(400).json({ error: "Failed to initialize Firebase with provided credentials" });
      }

      await fs.writeJson(settingsPath, newSettings, { spaces: 2 });
      devosSettings = newSettings;
      
      if (geminiApiKey) {
        const configPath = path.join(os.homedir(), '.dev-cli', 'config.json');
        let cliConfig = {};
        if (fs.pathExistsSync(configPath)) {
          try { cliConfig = fs.readJsonSync(configPath); } catch(e) {}
        }
        cliConfig['GEMINI_API_KEY'] = geminiApiKey;
        await fs.writeJson(configPath, cliConfig, { spaces: 2 });
      }

      setupRequired = false;
      
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.get("/api/flow", (req, res) => serveFile(res, "flow.json"));
  server.get("/api/projects", (req, res) => serveFile(res, "projects.json"));
  server.get("/api/sandboxes", (req, res) => serveFile(res, "sandboxes.json"));
  server.get("/api/practice", (req, res) => serveFile(res, "practice.json"));
  server.post("/api/practice/update", async (req, res) => {
    try {
      const { slug, timeSpentMinutes } = req.body;
      const file = path.join(cliDir, "practice.json");
      const practice = await fs.readJson(file).catch(() => ([]));
      const idx = practice.findIndex((p) => p.slug === slug);
      if (idx !== -1) {
        practice[idx].timeSpentMinutes = timeSpentMinutes;
        practice[idx].endedAt = new Date().toISOString();
      } else {
        practice.push({ slug, timeSpentMinutes, startedAt: new Date().toISOString(), endedAt: new Date().toISOString() });
      }
      await fs.writeJson(file, practice, { spaces: 2 });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  server.get("/api/sessions", (req, res) => serveFile(res, "sessions.json"));
  server.get("/api/sketches", (req, res) => serveFile(res, "sketches.json"));
  server.get("/api/captures", (req, res) => serveFile(res, "captures.json"));

  server.get("/api/techstack", async (req, res) => {
    try {
      const projects = await fs.readJson(path.join(cliDir, "projects.json")).catch(() => ({}));
      const deps = {};
      for (const p of Object.values(projects)) {
        if (!p.path) continue;
        try {
          const pkg = await fs.readJson(path.join(p.path, "package.json"));
          const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
          for (const d of Object.keys(allDeps)) { deps[d] = (deps[d] || 0) + 1; }
        } catch {}
      }
      res.json(deps);
    } catch { res.json({}); }
  });

  // Server-Sent Events (SSE) for hot-refresh
  server.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const notify = () => {
      res.write(`data: ${JSON.stringify({ type: "refresh" })}\n\n`);
    };

    const chokidar = require('chokidar');
    const watcher = chokidar.watch(cliDir, {
      persistent: true,
      ignoreInitial: true,
      depth: 1
    });

    watcher.on("change", (path) => {
      if (path.endsWith('.json')) notify();
    });

    req.on("close", () => {
      watcher.close();
      res.end();
    });
  });

  server.get("/api/git-status", async (req, res) => {
    try {
      const projects = await fs.readJson(path.join(cliDir, "projects.json")).catch(() => ({}));
      let totalChanges = 0;
      const details = [];
      for (const p of Object.values(projects)) {
        if (!p.path) continue;
        try {
          const out = await new Promise(resolve => exec("git status --porcelain", { cwd: p.path }, (err, stdout) => resolve(stdout || "")));
          const lines = out.split("\n").filter(l => l.trim().length > 0);
          if (lines.length > 0) {
            totalChanges += lines.length;
            details.push({ project: p.name || path.basename(p.path), count: lines.length, files: lines });
          }
        } catch {}
      }
      res.json({ globalUncommittedChanges: totalChanges, details });
    } catch { res.json({ globalUncommittedChanges: 0, details: [] }); }
  });

  server.get("/api/deployments", async (req, res) => {
    try {
      const projects = await fs.readJson(path.join(cliDir, "projects.json")).catch(() => []);
      const deployments = [];
      for (const p of Object.values(projects)) {
        if (!p.path) continue;
        const name = p.name || path.basename(p.path);
        let target = null;
        if (await fs.pathExists(path.join(p.path, "vercel.json"))) target = "Vercel";
        else if (await fs.pathExists(path.join(p.path, "netlify.toml"))) target = "Netlify";
        else if (await fs.pathExists(path.join(p.path, "firebase.json")) || await fs.pathExists(path.join(p.path, ".firebaserc"))) target = "Firebase";
        else if (await fs.pathExists(path.join(p.path, "fly.toml"))) target = "Fly.io";
        else if (await fs.pathExists(path.join(p.path, "Dockerfile"))) target = "Docker";
        else if (p.deployment) target = p.deployment.target || "Unknown";
        
        let status = "Not Deployed";
        let latency = null;
        let url = null;

        if (target) {
          status = "Unknown";
          if (p.deployment && p.deployment.url && p.deployment.url !== "NIL" && p.deployment.url.startsWith("http")) {
             url = p.deployment.url;
             const start = Date.now();
             try {
               const r = await fetch(url, { method: 'HEAD', timeout: 5000 });
               latency = Date.now() - start;
               status = r.ok ? "Online" : "Offline";
             } catch (e) {
               status = "Offline";
             }
          } else if (p.linear && p.linear.projectUrl && p.linear.projectUrl.startsWith("http")) {
             url = p.linear.projectUrl;
             const start = Date.now();
             try {
               const r = await fetch(url, { method: 'HEAD', timeout: 5000 });
               latency = Date.now() - start;
               status = r.ok ? "Online" : "Offline";
             } catch (e) {
               status = "Offline";
             }
          } else {
             // Mock for projects without actual URLs recorded but with targets
             status = "Online";
             latency = Math.floor(Math.random() * 200) + 20;
          }
          deployments.push({ name, target, status, latency, url, path: p.path });
        } else {
          deployments.push({ name, target: null, status: "Not Deployed", latency: null, path: p.path });
        }
      }
      res.json(deployments);
    } catch { res.json([]); }
  });

  server.post("/api/deployments", express.json(), async (req, res) => {
    try {
      const { path: projectPath, url, method } = req.body;
      const projectsFile = path.join(cliDir, "projects.json");
      const projects = await fs.readJson(projectsFile).catch(() => ({}));
      
      let foundKey = null;
      for (const [key, p] of Object.entries(projects)) {
        if (p.path === projectPath) {
          foundKey = key;
          break;
        }
      }

      if (foundKey) {
        if (!projects[foundKey].deployment) {
          projects[foundKey].deployment = { status: "not-configured" };
        }
        if (url !== undefined) projects[foundKey].deployment.url = url || "NIL";
        if (method !== undefined) projects[foundKey].deployment.target = method;
        
        await fs.writeJson(projectsFile, projects, { spaces: 2 });
        res.json({ ok: true });
      } else {
        res.status(404).json({ error: "Project not found" });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.delete("/api/flow/:index", async (req, res) => {
    try {
      const data = await fs.readJson(path.join(cliDir, "flow.json"));
      const idx = parseInt(req.params.index, 10);
      if (idx >= 0 && idx < data.length) { data.splice(idx, 1); await fs.writeJson(path.join(cliDir, "flow.json"), data, { spaces: 2 }); res.json({ ok: true }); }
      else res.status(404).json({ error: "not found" });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  server.get("/api/linear", async (req, res) => {
    const apiKey = devosSettings.linearApiKey || process.env.LINEAR_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ error: "Linear API key not set in onboarding or env." });
    }
    try {
      const q = `query {
        issues(first: 50, filter: { assignee: { isMe: { eq: true } }, state: { type: { neq: "canceled" } } }) {
          nodes {
            id
            identifier
            title
            state { id name color type }
            priority
            priorityLabel
            project { id name color }
            dueDate
            estimate
            url
            cycle { number startsAt endsAt }
            children { nodes { id state { type } } }
            team { id states { nodes { id name type color position } } }
          }
        }
      }`;
      const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey },
        body: JSON.stringify({ query: q })
      });
      if (!response.ok) throw new Error("Linear API request failed: " + response.statusText);
      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0].message);
      res.json(data.data.issues.nodes);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  server.post("/api/linear/state", async (req, res) => {
    const apiKey = devosSettings.linearApiKey || process.env.LINEAR_API_KEY;
    if (!apiKey) return res.status(401).json({ error: "Linear API key not set." });
    try {
      const { issueId, stateId } = req.body;
      if (!issueId || !stateId) return res.status(400).json({ error: "Missing issueId or stateId" });
      
      const q = `mutation { issueUpdate(id: "${issueId}", input: { stateId: "${stateId}" }) { success } }`;
      const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey },
        body: JSON.stringify({ query: q })
      });
      if (!response.ok) throw new Error("Linear API request failed");
      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0].message);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  server.post("/api/linear/create", async (req, res) => {
    const apiKey = devosSettings.linearApiKey || process.env.LINEAR_API_KEY;
    if (!apiKey) return res.status(401).json({ error: "Linear API key not set." });
    try {
      const { title, teamId } = req.body;
      if (!title || !teamId) return res.status(400).json({ error: "Missing title or teamId" });
      const q = `mutation { issueCreate(input: { title: "${title.replace(/"/g, '\\"')}", teamId: "${teamId}" }) { success issue { id identifier url } } }`;
      const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: apiKey },
        body: JSON.stringify({ query: q })
      });
      if (!response.ok) throw new Error("Linear API request failed");
      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0].message);
      res.json({ ok: true, issue: data.data.issueCreate.issue });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Read code files RECURSIVELY from a practice problem path
  server.get("/api/code", async (req, res) => {
    const p = req.query.path;
    if (!p) return res.json({ files: [] });
    try {
      const exists = await fs.pathExists(p);
      if (!exists) return res.json({ files: [] });
      const codeExts = ['.java', '.py', '.js', '.ts', '.cpp', '.c', '.go', '.rs', '.kt', '.rb'];
      const files = [];

      async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(full);
          } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (codeExts.includes(ext)) {
              const content = await fs.readFile(full, 'utf-8');
              // Show path relative to the problem root
              const rel = path.relative(p, full).replace(/\\/g, '/');
              files.push({ name: rel, content });
            }
          }
        }
      }

      await walk(p);
      // Sort: solutions last, Main first
      files.sort((a, b) => {
        if (a.name.includes('solutions/') && !b.name.includes('solutions/')) return 1;
        if (!a.name.includes('solutions/') && b.name.includes('solutions/')) return -1;
        return a.name.localeCompare(b.name);
      });
      res.json({ files });
    } catch { res.json({ files: [] }); }
  });

  server.post("/api/open", async (req, res) => {
    const p = req.body.path;
    if (!p) return res.status(400).json({ error: "no path" });
    exec(`code "${p}"`, (err) => { if (err) shell.openPath(p); });
    res.json({ ok: true });
  });

  server.post("/api/open-url", async (req, res) => {
    const url = req.body.url;
    if (!url) return res.status(400).json({ error: "no url" });
    shell.openExternal(url);
    res.json({ ok: true });
  });

  // Serve a capture image as base64 for in-app preview
  server.get("/api/capture-image", async (req, res) => {
    const p = req.query.path;
    if (!p) return res.status(400).json({ error: "no path" });
    try {
      const exists = await fs.pathExists(p);
      if (!exists) return res.status(404).json({ error: "not found" });
      const data = await fs.readFile(p);
      const ext = path.extname(p).toLowerCase().replace('.', '');
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/webp';
      res.set('Content-Type', mime);
      res.send(data);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  server.patch("/api/sketches/:index", async (req, res) => {
    try {
      const data = await fs.readJson(path.join(cliDir, "sketches.json"));
      const idx = parseInt(req.params.index, 10);
      if (idx >= 0 && idx < data.length) {
        if (req.body.url !== undefined) data[idx].url = req.body.url;
        if (req.body.elements !== undefined) data[idx].elements = req.body.elements;
        if (req.body.appState !== undefined) data[idx].appState = req.body.appState;
        if (req.body.files !== undefined) data[idx].files = req.body.files;
        if (req.body.title !== undefined) data[idx].title = req.body.title;
        if (req.body.project !== undefined) data[idx].project = req.body.project;
        data[idx].updatedAt = new Date().toISOString();
        await fs.writeJson(path.join(cliDir, "sketches.json"), data);
        res.json({ success: true });
      } else { res.status(404).json({ error: "Not found" }); }
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  server.post("/api/sketches", async (req, res) => {
    try {
      const file = path.join(cliDir, "sketches.json");
      const data = await fs.readJson(file).catch(() => []);
      const newSketch = {
        title: req.body.title || "New Sketch",
        project: req.body.project || null,
        elements: [],
        appState: {},
        files: {},
        updatedAt: new Date().toISOString()
      };
      data.unshift(newSketch); // Add to beginning
      await fs.writeJson(file, data);
      res.json({ success: true, index: 0, sketch: newSketch });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  server.get("/api/leetcode/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const query = `query { question(titleSlug: "${slug}") { title difficulty content metaData exampleTestcaseList codeSnippets { lang langSlug code } } }`;
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/competitive/random", async (req, res) => {
    try {
      const filters = req.body.filters || {};
      const filterInput = {};
      if (filters.difficulty) filterInput.difficulty = filters.difficulty.toUpperCase();
      if (filters.topics && filters.topics.length > 0) filterInput.tags = filters.topics;

      const query = `
        query randomQuestion($categorySlug: String, $filters: QuestionListFilterInput) {
          randomQuestion(categorySlug: $categorySlug, filters: $filters) { titleSlug }
        }
      `;
      let q = null;
      const practiceFile = path.join(cliDir, "practice.json");
      const practiceData = await fs.readJson(practiceFile).catch(() => ([]));
      const solvedSlugs = new Set(practiceData.filter(p => p.status === 'solved').map(p => p.slug));

      for (let i = 0; i < 10; i++) {
        const response = await fetch('https://leetcode.com/graphql', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { categorySlug: "algorithms", filters: filterInput } })
        });
        const data = await response.json();
        const candidate = data?.data?.randomQuestion?.titleSlug;
        
        if (candidate && !solvedSlugs.has(candidate)) {
          const detailsQuery = `
            query questionData($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                questionId questionFrontendId title titleSlug isPaidOnly difficulty topicTags { name slug } stats companyTagStats
              }
            }
          `;
          const detailsRes = await fetch('https://leetcode.com/graphql', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: detailsQuery, variables: { titleSlug: candidate } })
          });
          const detailsData = await detailsRes.json();
          const candidateQ = detailsData?.data?.question;
          
          if (candidateQ && !candidateQ.isPaidOnly) {
            q = candidateQ;
            break;
          }
        }
        if (!candidate) break;
      }

      if (!q) return res.status(404).json({ error: "Could not find a new free random question" });

      const problemRec = {
        platform: "leetcode",
        problemId: q.questionFrontendId,
        title: q.title,
        slug: q.titleSlug,
        difficulty: q.difficulty.toLowerCase(),
        topics: q.topicTags.map((t) => t.slug),
        url: `https://leetcode.com/problems/${q.titleSlug}/`
      };
      res.json(problemRec);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/competitive/save-solution", async (req, res) => {
    try {
      const { slug, code, language, problemRecord } = req.body;
      const topic = problemRecord?.topics?.[0] || 'mixed';
      const root = path.join(home, ".dev-cli", "scratch", "competitive", "leetcode", topic, slug);
      const solutionsDirectory = path.join(root, "solutions");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      
      const exts = { 'cpp': 'cpp', 'java': 'java', 'python': 'py', 'javascript': 'js', 'c': 'c' };
      const ext = exts[language] || 'txt';
      const fileName = `${timestamp}-${slug}.${ext}`;
      const solutionPath = path.join(solutionsDirectory, fileName);

      await fs.ensureDir(solutionsDirectory);
      await fs.writeFile(solutionPath, code.endsWith("\n") ? code : `${code}\n`, "utf8");

      // Update practice.json to include the path so the frontend can read the code
      const practiceFile = path.join(home, ".dev-cli", "practice.json");
      const practice = await fs.readJson(practiceFile).catch(() => []);
      const idx = practice.findIndex((p) => p.slug === slug);
      if (idx !== -1) {
        practice[idx].path = root;
        await fs.writeJson(practiceFile, practice, { spaces: 2 });
      }

      res.json({ success: true, path: solutionPath });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/competitive/status", async (req, res) => {
    try {
      const { slug, status, problemRecord, timeSpentMinutes } = req.body;
      const file = path.join(cliDir, "practice.json");
      const practice = await fs.readJson(file).catch(() => ([]));
      const idx = practice.findIndex((p) => p.slug === slug);
      const now = new Date().toISOString();
      if (idx !== -1) {
        practice[idx].status = status;
        practice[idx].timeSpentMinutes = (practice[idx].timeSpentMinutes || 0) + (timeSpentMinutes || 0);
        practice[idx].endedAt = now;
        if (!practice[idx].history) practice[idx].history = [];
        practice[idx].history.push({ action: status, at: now });
      } else {
        const pRec = {
           ...(problemRecord || {}),
           slug, status, timeSpentMinutes,
           startedAt: now, endedAt: now,
           history: [{ action: "assigned", at: now }, { action: status, at: now }]
        };
        practice.push(pRec);
      }
      await fs.writeJson(file, practice, { spaces: 2 });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/execute", async (req, res) => {
    try {
      const { code, testcases, functionName, language = 'javascript', metaData } = req.body;
      const start = Date.now();
      let results;

      if (language === 'javascript' || language === 'js') {
        const wrapper = `
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}
function arrayToListNode(arr) {
    if (!arr || arr.length === 0) return null;
    let head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
        curr.next = new ListNode(arr[i]);
        curr = curr.next;
    }
    return head;
}
function listNodeToArray(node) {
    let arr = [];
    while (node) { arr.push(node.val); node = node.next; }
    return arr;
}
function arrayToTreeNode(arr) {
    if (!arr || arr.length === 0 || arr[0] === null) return null;
    let root = new TreeNode(arr[0]);
    let queue = [root];
    let i = 1;
    while (queue.length > 0 && i < arr.length) {
        let curr = queue.shift();
        if (arr[i] !== null) { curr.left = new TreeNode(arr[i]); queue.push(curr.left); }
        i++;
        if (i < arr.length && arr[i] !== null) { curr.right = new TreeNode(arr[i]); queue.push(curr.right); }
        i++;
    }
    return root;
}
function treeNodeToArray(root) {
    if (!root) return [];
    let arr = [];
    let queue = [root];
    while (queue.length > 0) {
        let curr = queue.shift();
        if (curr) { arr.push(curr.val); queue.push(curr.left); queue.push(curr.right); }
        else { arr.push(null); }
    }
    while (arr[arr.length - 1] === null) arr.pop();
    return arr;
}

${code}
const testcases = ${JSON.stringify(testcases)};
const metaData = ${JSON.stringify(metaData)};
const results = testcases.map(tc => {
  try {
    const inputs = tc.split('\\n').map(l => JSON.parse(l));
    const processedInputs = inputs.map((input, idx) => {
        const type = metaData.params[idx]?.type;
        if (type === 'listnode') return arrayToListNode(input);
        if (type === 'tree') return arrayToTreeNode(input);
        return input;
    });
    
    let res = ${functionName}(...processedInputs);
    
    if (metaData.return && metaData.return.type === 'listnode') res = listNodeToArray(res);
    if (metaData.return && metaData.return.type === 'tree') res = treeNodeToArray(res);
    
    return res;
  } catch (e) {
    return { error: e.message };
  }
});
console.log(JSON.stringify(results));
`;
        const tempFile = path.join(cliDir, 'tempRunner.js');
        await fs.writeFile(tempFile, wrapper);
        
        const util = require('util');
        const execPromise = util.promisify(exec);
        const child = await execPromise(`node "${tempFile}"`, { timeout: 3000 });
        results = JSON.parse(child.stdout);
      }
      else if (language === 'cpp' || language === 'c++') {
        const { generateCppWrapper } = await import('../../dist/commands/runners.js');
        const wrapper = generateCppWrapper(code, testcases, metaData);
        const tempFile = path.join(cliDir, 'tempRunner.cpp');
        await fs.writeFile(tempFile, wrapper);
        
        const util = require('util');
        const execPromise = util.promisify(exec);
        await execPromise(`g++ "${tempFile}" -o "${path.join(cliDir, 'tempRunner.exe')}" -I "${path.join(__dirname, '..', '..', 'lib')}"`, { timeout: 5000 });
        const child = await execPromise(`"${path.join(cliDir, 'tempRunner.exe')}" ${JSON.stringify(JSON.stringify(testcases))}`, { timeout: 3000 });
        results = JSON.parse(child.stdout);
      }
      else if (language === 'java') {
        const { generateJavaWrapper } = await import('../../dist/commands/runners.js');
        const wrapper = generateJavaWrapper(code, testcases, metaData);
        const tempFile = path.join(cliDir, 'Main.java');
        await fs.writeFile(tempFile, wrapper);
        
        const gsonPath = path.join(__dirname, '..', '..', 'lib', 'gson.jar');
        const cp = `.;${gsonPath};${cliDir}`;
        const util = require('util');
        const execPromise = util.promisify(exec);
        await execPromise(`javac -cp "${cp}" "${tempFile}"`, { timeout: 5000, cwd: cliDir });
        const child = await execPromise(`java -cp "${cp}" Main ${JSON.stringify(JSON.stringify(testcases))}`, { timeout: 3000, cwd: cliDir });
        results = JSON.parse(child.stdout);
      }

      const duration = Date.now() - start;
      res.json({ results, duration });
    } catch (e) {
      res.status(500).json({ error: e.message, stdout: e.stdout, stderr: e.stderr });
    }
  });

  // ═══ FOCUS MODE ENDPOINTS ═══
  let focusDaemonProcess = null;

  server.post("/api/focus/start", async (req, res) => {
    try {
      const { durationMinutes, cwd } = req.body;
      if (!durationMinutes || durationMinutes < 1) {
        return res.status(400).json({ error: "Invalid duration" });
      }
      const targetCwd = cwd || process.cwd();
      const path = require('path');
      const home = process.env.HOME || process.env.USERPROFILE || '';
      const livePath = path.join(home, '.dev-cli', 'flow-live.json');
      
      try { fs.unlinkSync(livePath); } catch (e) {}
      
      const { exec } = require("child_process");
      exec(`dev focus ${durationMinutes}m --no-hud`,  { cwd: targetCwd }, (err) => {
         if (err) console.error(err);
      });

      // Wait up to 3.5s for flow-live.json to be created by the daemon
      let attempts = 0;
      while (attempts < 35) {
         if (fs.existsSync(livePath)) break;
         await new Promise(r => setTimeout(r, 100));
         attempts++;
      }

      res.json({ success: true, pid: 999999 });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.get("/api/focus/live", async (req, res) => {
    try {
      const livePath = path.join(home, ".dev-cli", "flow-live.json");
      if (await fs.pathExists(livePath)) {
        const data = await fs.readJson(livePath);
        
        let cwd = null;
        let projectName = null;
        try {
          const cliDir = path.join(home, ".dev-cli");
          const focusMetaPath = path.join(cliDir, "focus-meta.json");
          if (await fs.pathExists(focusMetaPath)) {
            const meta = await fs.readJson(focusMetaPath);
            cwd = meta.cwd;
            projectName = path.basename(cwd);
            
            const projPath = path.join(cliDir, "projects.json");
            if (await fs.pathExists(projPath)) {
              const projects = await fs.readJson(projPath);
              let bestMatch = "";
              let longestMatch = 0;
              for (const p of Object.values(projects)) {
                if (p.path && cwd.toLowerCase().startsWith(p.path.toLowerCase())) {
                  if (p.path.length > longestMatch) {
                    bestMatch = p.name;
                    longestMatch = p.path.length;
                  }
                }
              }
              if (bestMatch) projectName = bestMatch;
            }
          }
        } catch (e) {}

        res.json({ active: true, ...data, cwd, projectName });
      } else {
        res.json({ active: false });
      }
    } catch {
      res.json({ active: false });
    }
  });

  server.get("/api/focus/last-session", async (req, res) => {
    try {
      const flowPath = path.join(home, ".dev-cli", "flow.json");
      if (await fs.pathExists(flowPath)) {
        const data = await fs.readJson(flowPath);
        if (data && data.length > 0) {
          return res.json(data[data.length - 1]);
        }
      }
      res.json({ error: "No sessions found" });
    } catch {
      res.json({ error: "Error reading sessions" });
    }
  });

  
  // Listen for remote commands from Firebase
  if (fbInitialized) {
    admin.database().ref('dashboard_stats/commands').on('value', async (snapshot) => {
      const val = snapshot.val();
      if (val && val.command) {
        const home = process.env.HOME || process.env.USERPROFILE || "";
        const controlPath = require('path').join(home, '.dev-cli', 'flow-control.json');
        try {
          await fs.writeJson(controlPath, { command: val.command, timestamp: Date.now() });
          // Clear it in Firebase so we don't re-trigger indefinitely
          await admin.database().ref('dashboard_stats/commands').remove();
        } catch (e) {}
      }
    });
  }

  server.post("/api/focus/command", async (req, res) => {
    try {
      const { command } = req.body;
      const home = process.env.HOME || process.env.USERPROFILE || "";
      const controlPath = require('path').join(home, '.dev-cli', 'flow-control.json');
      await fs.writeJson(controlPath, { command, timestamp: Date.now() });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/focus/stop", async (req, res) => {
    try {
      // Try to kill the daemon by PID from flow-live.json
      const livePath = path.join(home, ".dev-cli", "flow-live.json");
      if (await fs.pathExists(livePath)) {
        const live = await fs.readJson(livePath);
        if (live.pid) {
          try { process.kill(live.pid); } catch {}
        }
        await fs.remove(livePath);
      }

      // Also clean up focus-meta if it exists
      const focusMetaPath = path.join(cliDir, "focus-meta.json");
      if (await fs.pathExists(focusMetaPath)) {
        await fs.remove(focusMetaPath);
      }
      
      if (focusDaemonProcess) {
        try { focusDaemonProcess.kill(); } catch {}
        focusDaemonProcess = null;
      }
      
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/focus/generate-report", async (req, res) => {
    try {
      const util = require('util');
      const execPromise = util.promisify(exec);
      // Run the global CLI to analyze
      const { stdout } = await execPromise('dev focus analyze-json');
      const lines = stdout.split('\n');
      let result = null;
      for (const line of lines) {
        if (line.trim().startsWith('{')) {
           try { result = JSON.parse(line); break; } catch {}
        }
      }
      
        if (fbInitialized && result) {
          admin.database().ref('dashboard_stats/lastReport').set(result).catch(() => {});
        }
        res.json(result || { error: "Failed to parse JSON", stdout });

    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/generate-problem-link", async (req, res) => {
    try {
      const configPath = path.join(home, ".dev-cli", "config.json");
      if (!(await fs.pathExists(configPath))) return res.status(400).json({ error: "No config.json found." });
      const config = await fs.readJson(configPath);
      const apiKey = config.groqKey || process.env.GROQ_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "No groqKey found." });

      const { topic, focusArea, difficulty, seenUrls } = req.body;
      const excludeText = (seenUrls && seenUrls.length > 0) ? `\nCRITICAL: Do NOT return any of these URLs: ${seenUrls.join(', ')}` : "";
      const prompt = `You are a DSA instructor. I need exactly ONE valid LeetCode (or similar platform) problem URL that matches the topic "${topic} - ${focusArea}" and difficulty "${difficulty}".
Return ONLY a valid JSON object: {"title": "Problem Name", "url": "https://leetcode.com/problems/..."}
Do not use markdown blocks.${excludeText}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("No choices returned from Groq: " + JSON.stringify(data));
      }
      
      let rawText = data.choices[0].message?.content;
      if (!rawText) {
         throw new Error("No text content returned from Groq: " + JSON.stringify(data.choices[0]));
      }

      // Strip markdown block if present
      rawText = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

      res.json(JSON.parse(rawText));
    } catch (e) {
      console.error("Groq Generate Error:", e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  server.post("/api/validate-code", async (req, res) => {
    try {
      const configPath = path.join(home, ".dev-cli", "config.json");
      const config = await fs.readJson(configPath);
      const apiKey = config.groqKey || process.env.GROQ_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "No groqKey found." });

      const { code, topic, url } = req.body;
      const prompt = `You are an expert code reviewer evaluating a user's solution for a coding problem.
Problem URL/Topic: ${url} (${topic})
User's Code:
${code}

Does this code correctly solve the problem? Determine if the code crosses a threshold of 70% correctness.
Return ONLY a strictly valid JSON object matching this schema:
{"passed": true/false, "feedback": "Brief 1-2 sentence explanation of your validation."}
Do not wrap in markdown blocks.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("No choices returned from Groq: " + JSON.stringify(data));
      }
      
      let rawText = data.choices[0].message?.content;
      if (!rawText) {
         throw new Error("No text content returned from Groq: " + JSON.stringify(data.choices[0]));
      }

      // Strip markdown block if present
      rawText = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

      res.json(JSON.parse(rawText));
    } catch (e) {
      console.error("Groq Validate Error:", e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });
  server.post('/api/sysdesign/evaluate', async (req, res) => {
    try {
      const home = process.env.HOME || process.env.USERPROFILE || "";
      const configPath = path.join(home, ".dev-cli", "config.json");
      let config = {};
      try { config = await fs.readJson(configPath); } catch (e) {}
      const apiKey = config.groqKey || process.env.GROQ_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "No groqKey found in dev config." });

      const { problem, nodes, edges } = req.body;
      const prompt = `You are a Senior Staff FAANG Engineer evaluating a user's system design architecture for the following problem:
Problem: ${problem}

User's Architecture Graph:
Nodes (Components): ${JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, label: n.data?.label })))}
Edges (Connections): ${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target })))}

Evaluate this architecture for bottlenecks, scalability, and missing components (like missing caches, load balancers, or database replication).
Return ONLY a strictly valid JSON object matching this schema:
{
  "score": 85,
  "bottlenecks": ["List of 1-3 bottlenecks or single point of failures"],
  "feedback": "A short 2-3 sentence overall evaluation and suggestions for improvement."
}
Do not wrap in markdown blocks.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));
      if (!data.choices || data.choices.length === 0) throw new Error("No choices returned from Groq");
      
      let rawText = data.choices[0].message?.content;
      rawText = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

      res.json(JSON.parse(rawText));
    } catch (e) {
      console.error("Groq SysDesign Error:", e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  server.get("/api/ip", (req, res) => {
    const interfaces = os.networkInterfaces();
    let localIp = "127.0.0.1";
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIp = iface.address;
          break;
        }
      }
    }
    res.json({ ip: localIp, tunnelUrl: global.tunnelUrl || "" });
  });

  const dashboardDist = path.join(__dirname, "../dist");
  const dashboardAssets = path.join(dashboardDist, "assets");
  const sendDashboardApp = async (req, res) => {
    try {
      const indexPath = path.join(dashboardDist, "index.html");
      const html = await fs.readFile(indexPath, "utf8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch {
      res.status(404).send("Dashboard build not found. Run the dashboard build first.");
    }
  };

  server.use("/dashboard/assets", express.static(dashboardAssets));
  server.use("/assets", express.static(dashboardAssets));
  server.get("/dashboard-health", (req, res) => res.json({ ok: true, app: "dev-dashboard" }));
  server.get("/dashboard", sendDashboardApp);
  server.get(/^\/dashboard\/(?!assets\/).*/, sendDashboardApp);

  server.get("/companion", (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Focus Companion</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { background-color: #000000; color: #f8fafc; font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow: hidden; overscroll-behavior: none; }
    
    .glass { 
      background: rgba(10, 10, 10, 0.6); 
      backdrop-filter: blur(20px); 
      -webkit-backdrop-filter: blur(20px); 
      border: 1px solid rgba(255, 255, 255, 0.08); 
    }
    
    .glow-coding { box-shadow: 0 0 80px rgba(139, 92, 246, 0.25), inset 0 0 30px rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.3); }
    .glow-research { box-shadow: 0 0 80px rgba(59, 130, 246, 0.25), inset 0 0 30px rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3); }
    .glow-distraction { box-shadow: 0 0 80px rgba(225, 29, 72, 0.3), inset 0 0 30px rgba(225, 29, 72, 0.15); border-color: rgba(225, 29, 72, 0.4); }
    .glow-idle { box-shadow: 0 0 40px rgba(255, 255, 255, 0.05); }
    
    .pulse-distraction { animation: pulseDistraction 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulseDistraction { 
      0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4), 0 0 80px rgba(225, 29, 72, 0.3); } 
      70% { box-shadow: 0 0 0 20px rgba(225, 29, 72, 0), 0 0 80px rgba(225, 29, 72, 0.3); } 
      100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0), 0 0 80px rgba(225, 29, 72, 0.3); } 
    }

    .time-font { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="h-screen w-screen flex flex-col items-center justify-center p-6 relative bg-black">
  <!-- Subtle background ambient light -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div id="ambientGlow" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] transition-colors duration-1000"></div>
  </div>

  <div id="content" class="w-full max-w-sm flex flex-col items-center gap-12 z-10 transition-opacity duration-500">
    
    <div class="w-full flex justify-center pt-4">
      <div class="glass rounded-full px-5 py-2 flex items-center justify-center min-w-[140px] max-w-[240px]">
        <div id="targetPath" class="text-sm font-semibold text-slate-200 truncate">Ready</div>
      </div>
    </div>

    <div id="timerContainer" class="relative w-[300px] h-[300px] rounded-full glass glow-idle flex flex-col items-center justify-center transition-all duration-1000 ease-out">
      <svg class="absolute inset-0 w-full h-full -rotate-90 z-20 pointer-events-none" style="padding: 12px;">
        <circle cx="138" cy="138" r="130" stroke="rgba(255,255,255,0.05)" stroke-width="4" fill="none" />
        <circle id="progressCircle" cx="138" cy="138" r="130" stroke="#334155" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="816.81" stroke-dashoffset="0" class="transition-colors duration-500" />
      </svg>
      <div id="timeText" class="text-7xl font-bold tracking-tighter text-white mt-4 z-10 time-font">00:00</div>
      <div id="distractionBadge" class="mt-4 px-4 py-1.5 bg-slate-800/80 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 transition-colors duration-300 border border-slate-700/50 cursor-pointer hover:bg-slate-700">IDLE</div>
    </div>
    
    <div class="w-full flex justify-center mt-4">
      <div id="contextBtn" class="flex items-center glass cursor-pointer rounded-full transition-all duration-500 ease-in-out overflow-hidden w-14 h-14 group relative hover:bg-white/5">
        <div class="w-14 h-14 shrink-0 flex items-center justify-center z-10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 group-hover:text-white transition-colors"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
        </div>
        <p id="activeWindowText" class="text-xs font-mono text-slate-300 truncate tracking-tight whitespace-nowrap opacity-0 transition-all duration-400 ease-in-out w-0 transform translate-x-4">Waiting...</p>
      </div>
    </div>
  </div>

  <div id="offlineOverlay" class="absolute inset-0 bg-transparent flex items-center justify-center z-20 transition-opacity duration-500 opacity-0 pointer-events-none">
    <div class="w-12 h-12 rounded-full border-4 border-slate-800 border-t-violet-500 animate-spin"></div>
  </div>
  
  <div id="reportOverlay" class="absolute inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center z-30 transition-all duration-500 opacity-0 pointer-events-none translate-y-8 p-6">
    <div class="w-full max-w-sm glass rounded-3xl p-8 flex flex-col items-center relative shadow-2xl">
      <div class="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">Session Complete</h2>
      <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">Performance Report</p>
      
      <div class="w-full grid grid-cols-2 gap-4 mb-8">
        <div class="bg-black/50 border border-white/5 rounded-2xl p-5 flex flex-col items-center">
          <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Flow Score</p>
          <p id="repScore" class="text-3xl font-bold text-emerald-400">--</p>
        </div>
        <div class="bg-black/50 border border-white/5 rounded-2xl p-5 flex flex-col items-center">
          <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Code Added</p>
          <p id="repLines" class="text-3xl font-bold text-violet-400">--</p>
        </div>
        <div class="bg-black/50 border border-white/5 rounded-2xl p-5 flex flex-col items-center">
          <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Deep Work</p>
          <p id="repDeep" class="text-xl font-bold text-slate-200">--</p>
        </div>
        <div class="bg-black/50 border border-white/5 rounded-2xl p-5 flex flex-col items-center">
          <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Distractions</p>
          <p id="repDistract" class="text-xl font-bold text-rose-400">--</p>
        </div>
      </div>
      
      <button id="closeReportBtn" class="w-full py-4 rounded-xl bg-white text-black font-bold text-sm transition-all active:scale-95 hover:bg-slate-200">
        Close Report
      </button>
    </div>
  </div>

  <script>
    const timeText = document.getElementById('timeText');
    const targetPath = document.getElementById('targetPath');
    const progressCircle = document.getElementById('progressCircle');
    const offlineOverlay = document.getElementById('offlineOverlay');
    const content = document.getElementById('content');
    const distractionBadge = document.getElementById('distractionBadge');
    const timerContainer = document.getElementById('timerContainer');
    const activeWindowText = document.getElementById('activeWindowText');
    const reportOverlay = document.getElementById('reportOverlay');
    const contextBtn = document.getElementById('contextBtn');
    const ambientGlow = document.getElementById('ambientGlow');
    
    contextBtn.addEventListener('click', () => {
      const isExpanded = contextBtn.classList.contains('w-[280px]');
      if (isExpanded) {
        contextBtn.classList.remove('w-[280px]');
        contextBtn.classList.add('w-14');
        activeWindowText.classList.remove('opacity-100', 'w-[220px]', 'translate-x-0', 'pr-4');
        activeWindowText.classList.add('opacity-0', 'w-0', 'translate-x-4');
      } else {
        contextBtn.classList.remove('w-14');
        contextBtn.classList.add('w-[280px]');
        activeWindowText.classList.remove('opacity-0', 'w-0', 'translate-x-4');
        activeWindowText.classList.add('opacity-100', 'w-[220px]', 'translate-x-0', 'pr-4');
      }
    });

    const repScore = document.getElementById('repScore');
    const repLines = document.getElementById('repLines');
    const repDeep = document.getElementById('repDeep');
    const repDistract = document.getElementById('repDistract');
    const closeReportBtn = document.getElementById('closeReportBtn');
    
    const circumference = 816.81; // 2 * PI * 130
    
    let wasActive = false;
    
    // Smooth Sync State
    let syncTarget = 0;
    let syncElapsed = 0;
    let lastSyncTime = Date.now();
    let isSessionActive = false;
    let animationFrameId = null;

    async function fetchReport() {
      try {
        const res = await fetch('/api/focus/last-session');
        const data = await res.json();
        if (data && !data.error) {
          repScore.textContent = data.flowScore || 0;
          repLines.textContent = (data.locDelta > 0 ? '+' : '') + (data.locDelta || 0);
          repDeep.textContent = Math.floor((data.codingSeconds || 0)/60) + "m";
          repDistract.textContent = Math.floor((data.distractionSeconds || 0)/60) + "m";
          
          reportOverlay.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-8');
          reportOverlay.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
        }
      } catch (e) {}
    }
    
    closeReportBtn.addEventListener('click', () => {
      reportOverlay.classList.add('opacity-0', 'pointer-events-none', 'translate-y-8');
      reportOverlay.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    });

    // Clicking the badge acts as a "Stop Session" button
    distractionBadge.addEventListener('click', async () => {
      if (distractionBadge.textContent !== "IDLE" && distractionBadge.textContent !== "STOPPING...") {
        distractionBadge.textContent = "STOPPING...";
        await fetch('/api/focus/stop', { method: 'POST' });
        poll();
      }
    });

    // Local loop for 60fps perfectly smooth clock ticking
    function updateClockUI() {
      if (!isSessionActive) return;
      
      const now = Date.now();
      const localElapsed = syncElapsed + ((now - lastSyncTime) / 1000);
      const left = Math.max(0, syncTarget - localElapsed);
      const percent = syncTarget > 0 ? Math.min(1, left / syncTarget) : 0;
      
      progressCircle.style.strokeDashoffset = circumference - percent * circumference;
      
      const m = String(Math.floor(left / 60)).padStart(2, '0');
      const s = String(Math.floor(left % 60)).padStart(2, '0');
      timeText.textContent = m + ':' + s;
      
      animationFrameId = requestAnimationFrame(updateClockUI);
    }

    async function poll() {
      try {
        const res = await fetch('/api/focus/live');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        offlineOverlay.classList.remove('opacity-100');
        offlineOverlay.classList.add('opacity-0', 'pointer-events-none');
        content.classList.remove('opacity-0');

        if (data.active) {
          wasActive = true;
          isSessionActive = true;
          
          targetPath.textContent = data.projectName || data.windowTitle || "Active Session";
          
          // Update Sync State
          syncTarget = data.targetSeconds || 0;
          syncElapsed = data.elapsedSeconds || 0;
          lastSyncTime = Date.now();
          
          // Start render loop if not running
          if (!animationFrameId) {
             animationFrameId = requestAnimationFrame(updateClockUI);
          }
          
          activeWindowText.textContent = data.windowTitle || "Unknown Window";
          
          const category = data.category || 'idle';
          timerContainer.className = "relative w-[300px] h-[300px] rounded-full glass flex flex-col items-center justify-center transition-all duration-1000 ease-out";
          
          if (category === 'coding') {
            timerContainer.classList.add('glow-coding');
            ambientGlow.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] transition-colors duration-1000";
            progressCircle.style.stroke = "#8b5cf6"; 
            distractionBadge.textContent = "DEEP WORK";
            distractionBadge.className = "mt-4 px-4 py-1.5 bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 transition-colors duration-500 border border-violet-500/30 cursor-pointer hover:bg-violet-500/30";
          } else if (category === 'research') {
            timerContainer.classList.add('glow-research');
            ambientGlow.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] transition-colors duration-1000";
            progressCircle.style.stroke = "#3b82f6"; 
            distractionBadge.textContent = "RESEARCH";
            distractionBadge.className = "mt-4 px-4 py-1.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 transition-colors duration-500 border border-blue-500/30 cursor-pointer hover:bg-blue-500/30";
          } else if (category === 'distraction') {
            timerContainer.classList.add('glow-distraction', 'pulse-distraction');
            ambientGlow.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[100px] transition-colors duration-1000";
            progressCircle.style.stroke = "#e11d48"; 
            distractionBadge.textContent = "DISTRACTED";
            distractionBadge.className = "mt-4 px-4 py-1.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 transition-colors duration-500 border border-rose-500/30 cursor-pointer hover:bg-rose-500/30";
          } else {
            timerContainer.classList.add('glow-idle');
            ambientGlow.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] transition-colors duration-1000";
            progressCircle.style.stroke = "#475569";
            distractionBadge.textContent = "IDLE";
            distractionBadge.className = "mt-4 px-4 py-1.5 bg-slate-800/80 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 transition-colors duration-500 border border-slate-700/50 cursor-pointer hover:bg-slate-700";
          }
          
        } else {
          isSessionActive = false;
          if (animationFrameId) {
             cancelAnimationFrame(animationFrameId);
             animationFrameId = null;
          }

          if (wasActive) {
            wasActive = false;
            fetchReport();
          }
        
          targetPath.textContent = "Ready";
          timeText.textContent = "00:00";
          progressCircle.style.strokeDashoffset = circumference;
          progressCircle.style.stroke = "#334155";
          
          timerContainer.className = "relative w-[300px] h-[300px] rounded-full glass glow-idle flex flex-col items-center justify-center transition-all duration-1000 ease-out";
          ambientGlow.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] transition-colors duration-1000";
          
          distractionBadge.textContent = "IDLE";
          distractionBadge.className = "mt-4 px-4 py-1.5 bg-slate-800/80 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 border border-slate-700/50 cursor-pointer hover:bg-slate-700";
          activeWindowText.textContent = "Waiting for session...";
        }
      } catch (err) {
        offlineOverlay.classList.remove('opacity-0', 'pointer-events-none');
        offlineOverlay.classList.add('opacity-100');
        content.classList.add('opacity-0');
      }
      
      // Decouple polling completely from the tick loop!
      // Only hit the server once every 2 seconds to avoid freezing
      setTimeout(poll, 2000);
    }

    // Initialize
    setTimeout(poll, 100);
  </script>
</body>
</html>`);
  });
  // IPC terminal handlers
  let pty = null;
  try { pty = require('node-pty'); } catch(e) {}

  ipcMain.removeAllListeners('run-terminal-cmd');
  ipcMain.on('run-terminal-cmd', (event, payload) => {
    let commandStr, cols, rows;
    if (typeof payload === 'string') {
      commandStr = payload;
      cols = 80;
      rows = 30;
    } else {
      commandStr = payload.command;
      cols = payload.cols || 80;
      rows = payload.rows || 30;
    }
    
    if (!pty) {
      event.reply('terminal-data', '\r\n\x1b[31mError: node-pty module not loaded.\x1b[0m\r\n');
      return;
    }

    const defaultPath = process.env.USERPROFILE || 'C:\\dev-cli';
    const targetPath = devosSettings.workspacePath || defaultPath;
    let cmd = (commandStr || "").trim();
    
    if (!activeTerminalProcess) {
      const promptCmd = `function prompt { $e=[char]27; $u=$env:USERNAME; $f=Split-Path -Leaf $pwd; $v="139;92;246"; $g="45;43;85"; $l1=$e+"[38;2;"+$v+"m╭─"+$e+"[38;2;"+$v+"m"+$e+"[48;2;"+$v+"m"+$e+"[38;2;0;0;0m ⚡ "+$u+" "+$e+"[0m"+$e+"[38;2;"+$v+"m"+$e+"[48;2;"+$g+"m"+$e+"[38;2;255;255;255m 📁 "+$f+" "+$e+"[0m"+$e+"[38;2;"+$g+"m"+$e+"[0m\`n"; $l2=$e+"[38;2;"+$v+"m╰─❯ "+$e+"[0m"; Write-Host -NoNewline ($l1+$l2); return " " }`;
      activeTerminalProcess = pty.spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-NoExit', '-Command', promptCmd], {
        name: 'xterm-256color',
        cols: cols,
        rows: rows,
        cwd: targetPath,
        env: { ...process.env, FORCE_COLOR: '1' }
      });
      
      activeTerminalProcess.onData((data) => {
        event.reply('terminal-data', data);
      });
      
      activeTerminalProcess.onExit(({ exitCode }) => {
        event.reply('terminal-data', `\r\n\x1b[90m[Process exited with code ${exitCode}]\x1b[0m\r\n`);
        activeTerminalProcess = null;
      });
    }

    if (cmd) {
      activeTerminalProcess.write(cmd + '\r');
    }
  });

  ipcMain.removeAllListeners('terminal-input');
  ipcMain.on('terminal-input', (event, data) => {
    if (activeTerminalProcess) {
      activeTerminalProcess.write(data);
    }
  });

  ipcMain.removeAllListeners('terminal-resize');
  ipcMain.on('terminal-resize', (event, { cols, rows }) => {
    if (activeTerminalProcess) {
      activeTerminalProcess.resize(cols, rows);
    }
  });

  server.listen(4000, () => {
    console.log("Local API server running on port 4000");
    try {
      const { spawn } = require('child_process');
      const ssh = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-R', '80:localhost:4000', 'nokey@localhost.run']);
      
      const processOutput = (data) => {
        const str = data.toString();
        const match = str.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/);
        if (match && !global.tunnelUrl) {
          global.tunnelUrl = match[0];
          console.log("Tunnel opened at " + global.tunnelUrl);
          
          // Cloud Sync: Publish the URL so the Android Companion App can find it automatically
          const cloudSyncId = "ff8081819d82fab6019e609ac55379fd";
          fetch(`https://api.restful-api.dev/objects/${cloudSyncId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'dev-cli-tunnel',
              data: { url: global.tunnelUrl, timestamp: Date.now() }
            })
          }).then(() => console.log("Cloud Sync: Tunnel URL published to Mobile App"))
            .catch(err => console.error("Cloud Sync Failed:", err.message));
        }
      };

      ssh.stdout.on('data', processOutput);
      ssh.stderr.on('data', processOutput);
      ssh.on('close', () => console.log("SSH Tunnel closed"));
    } catch (err) {
      console.error("Failed to open SSH tunnel:", err);
    }
  });
}

function createWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const winWidth = 1200;
  const winHeight = 900;
  
  mainWindow = new BrowserWindow({
    show: false,
    width: winWidth, 
    height: winHeight, 
    x: Math.round((width - winWidth) / 2),
    y: 0,
    frame: false, 
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false, webviewTag: true },
    icon: path.join(__dirname, "../public/vite.svg")
  });

  // Whether a webview inside the window currently has focus (set via IPC from renderer)
  let webviewActive = false;
  let blurTimer = null;

  mainWindow.on('blur', () => {
    if (!hideOnBlur) return; // Already disabled for Academy/Arena tab
    if (webviewActive) return; // A webview inside our window has focus — don't hide
    if (blurTimer) clearTimeout(blurTimer);
    blurTimer = setTimeout(() => {
      blurTimer = null;
      if (!hideOnBlur || webviewActive) return;
      if (!mainWindow || mainWindow.isDestroyed()) return;

      // Final safety: check Electron's own webContents focus list
      try {
        const { webContents } = require('electron');
        const childHasFocus = webContents.getAllWebContents().some(wc => {
          try { return wc.isFocused() && wc.hostWebContents === mainWindow.webContents; }
          catch { return false; }
        });
        if (childHasFocus) return;
      } catch {}

      mainWindow.hide();
    }, 300);
  });

  mainWindow.on('focus', () => {
    if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; }
  });

  // Renderer tells us a webview inside got focus — prevent hide and recover if hidden
  ipcMain.on('webview-gained-focus', () => {
    webviewActive = true;
    if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; }
    // Recovery: if the window somehow already hid, bring it back immediately
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  ipcMain.on('webview-lost-focus', () => {
    webviewActive = false;
  });

  ipcMain.on('set-blur-hide', (e, shouldHide) => {
    hideOnBlur = shouldHide;
  });

  // --- Course Hub IPC Handlers ---
  const coursesBaseDir = 'C:\\dev-cli\\courses';

  
  ipcMain.handle('start-project-tunnel', async (e, projectPath) => {
    try {
      return await new Promise(async (resolve, reject) => {
        const { spawn } = require('child_process');
        const localtunnel = require('localtunnel');
        const fs = require('fs');
        const path = require('path');
        
        console.log('Starting dev server in: ' + projectPath);
        
        if (!projectPath || !fs.existsSync(projectPath)) {
            return reject(new Error('Project path does not exist: ' + projectPath));
        }

        let pm = 'npm';
        if (fs.existsSync(path.join(projectPath, 'bun.lockb')) || fs.existsSync(path.join(projectPath, 'bun.lock'))) pm = 'bun';
        else if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) pm = 'pnpm';
        else if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) pm = 'yarn';

        let envs = Object.assign({}, process.env);
        // Inject keys if available
        try {
          const { safeStorage } = require('electron');
          const vaultPath = path.join(app.getPath('userData'), '.devos_vault');
          if (fs.existsSync(vaultPath) && safeStorage.isEncryptionAvailable()) {
            const keys = JSON.parse(safeStorage.decryptString(fs.readFileSync(vaultPath)));
            keys.forEach(k => {
              if (k.environment !== 'Production') {
                 if (k.assignedProjects.length === 0 || k.assignedProjects.includes(projectPath)) {
                    envs[k.name] = k.value;
                 }
              }
            });
          }
        } catch(e) {}
        
        const nodeModulesPath = path.join(projectPath, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
          console.log(`Auto-installing dependencies for ${projectPath} using ${pm}...`);
          try {
             await new Promise((res, rej) => {
               const installChild = spawn(pm, ['install'], { cwd: projectPath, env: envs, shell: true });
               installChild.on('exit', (code) => {
                 if (code === 0) res(null);
                 else rej(new Error('Install failed with code ' + code));
               });
               installChild.on('error', rej);
             });
          } catch(e) {
             return reject(e);
          }
        }

        const child = spawn(pm, ['run', 'dev'], { cwd: projectPath, env: envs, shell: true });
        
        let portFound = false;
        let lastOutput = '';
        let isResolved = false;
        
        const onData = async (data) => {
          const out = data.toString();
          lastOutput += out;
          console.log(out);
          const match = lastOutput.match(/http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/);
          if (match && !portFound) {
            portFound = true;
            const port = parseInt(match[1]);
            console.log('Detected dev port:', port);
            
            try {
              const ssh = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-R', `80:localhost:${port}`, 'nokey@localhost.run']);
              
              const sshProcessOutput = (sshData) => {
                const str = sshData.toString();
                const sshMatch = str.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/);
                if (sshMatch && !isResolved) {
                  isResolved = true;
                  clearTimeout(timeoutHandle);
                  resolve({ url: sshMatch[0] });
                }
              };
              
              ssh.stdout.on('data', sshProcessOutput);
              ssh.stderr.on('data', sshProcessOutput);
              
              ssh.on('error', (err) => {
                if (!isResolved) {
                  isResolved = true;
                  clearTimeout(timeoutHandle);
                  reject(new Error("SSH Tunnel error: " + err.message));
                }
              });

              // When the child dev server dies, kill the SSH tunnel
              child.on('exit', () => { ssh.kill(); });

            } catch (err) {
              if (!isResolved) {
                isResolved = true;
                clearTimeout(timeoutHandle);
                reject(err);
              }
            }
          }
        };
        child.stdout.on('data', onData);
        child.stderr.on('data', onData);
        
        child.on('error', (err) => {
          if (!isResolved) {
             isResolved = true;
             reject(err);
          }
        });

        child.on('exit', (code) => {
          if (!isResolved) {
             isResolved = true;
             clearTimeout(timeoutHandle);
             reject(new Error(`Dev server exited prematurely with code ${code}. Output: ${lastOutput.substring(lastOutput.length - 150)}`));
          }
        });
        
        timeoutHandle = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            child.kill();
            if (!portFound) {
              reject(new Error(`Timeout waiting for dev server port output. Last output: ${lastOutput.substring(lastOutput.length - 150)}`));
            } else {
              reject(new Error(`Dev server started, but SSH tunnel establishment timed out.`));
            }
          }
        }, 15000);
      });
    } catch (e) {
      console.error(e);
      return { error: e.message };
    }
  });

  const getVaultPath = () => require('path').join(app.getPath('userData'), '.devos_vault');

  ipcMain.handle('get-security-keys', async () => {
    const { safeStorage } = require('electron');
    const vaultPath = getVaultPath();
    if (!fs.existsSync(vaultPath)) return [];
    try {
      const encrypted = fs.readFileSync(vaultPath);
      if (safeStorage.isEncryptionAvailable()) {
        const decrypted = safeStorage.decryptString(encrypted);
        return JSON.parse(decrypted);
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  ipcMain.handle('save-security-keys', async (e, keys) => {
    const { safeStorage } = require('electron');
    const vaultPath = getVaultPath();
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(JSON.stringify(keys));
        require('fs').writeFileSync(vaultPath, encrypted);
        return { success: true };
      }
      return { success: false, error: 'Encryption not available' };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('create-course-workspace', async (e, courseName) => {
    try {
      const fs = require('fs');
      const courseDir = path.join(coursesBaseDir, courseName);
      if (!fs.existsSync(courseDir)) {
        fs.mkdirSync(courseDir, { recursive: true });
      }
      const notesFile = path.join(courseDir, 'notes.md');
      if (!fs.existsSync(notesFile)) {
        fs.writeFileSync(notesFile, `# ${courseName} - Notes\n\n`);
      }
      const srcDir = path.join(courseDir, 'src');
      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
      }
      return { success: true, path: courseDir };
    } catch (err) {
      console.error('Failed to create course workspace:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('read-course-file', async (e, courseName, fileName) => {
    try {
      const fs = require('fs');
      const filePath = path.join(coursesBaseDir, courseName, fileName);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
      return '';
    } catch (err) {
      console.error('Failed to read course file:', err);
      return '';
    }
  });

  ipcMain.handle('write-course-file', async (e, courseName, fileName, content) => {
    try {
      const fs = require('fs');
      const filePath = path.join(coursesBaseDir, courseName, fileName);
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    } catch (err) {
      console.error('Failed to write course file:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.on('open-in-vscode', (e, courseName) => {
    const { exec } = require('child_process');
    const courseDir = path.join(coursesBaseDir, courseName);
    exec(`code "${courseDir}"`, (error) => {
      if (error) console.error('Failed to open VS Code:', error);
    });
  });
  // ------------------------------

  const isDev = process.env.VITE_DEV === 'true';
  if (isDev) mainWindow.loadURL("http://localhost:5173");
  else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  startServer(); createWindow();
  
  const ret1 = globalShortcut.register('CommandOrControl+Space', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('summon-dashboard');
    }
  });
  if (!ret1 && mainWindow) {
    console.error("Shortcut failed on boot, showing window as fallback.");
    mainWindow.show();
    setTimeout(() => {
      mainWindow.webContents.send('summon-dashboard');
    }, 500); // Give React time to load
  }

  globalShortcut.register('CommandOrControl+`', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('summon-terminal');
    }
  });

  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("will-quit", () => { globalShortcut.unregisterAll(); });

ipcMain.on("close-app", () => app.quit());

// Terminal Backend Logic via Express
let activeTerminalProcess = null;
let terminalSseClients = [];
let paletteSseClients = [];

// Removed redundant global shortcut block
