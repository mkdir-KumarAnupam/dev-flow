const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

// I will find where firebase is initialized or where syncDashboardMetrics is, and add a watcher.
const watcherLogic = `
let liveSessionWatcher = null;
function setupLiveWatcher() {
  if (!fbInitialized) return;
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const livePath = path.join(home, '.dev-cli', 'flow-live.json');
  
  const updateFirebaseLive = async () => {
    try {
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
    // fallback
    fs.watchFile(livePath, { interval: 1000 }, updateFirebaseLive);
  }
}

`;

// inject watcherLogic after fbInitialized
code = code.replace(/if \(!fbInitialized\)\s*\{\s*fbInitialized = true;\s*\}/, "if (!fbInitialized) { fbInitialized = true; }\nsetupLiveWatcher();\n");
code = code.replace(/const chokidar = require\('chokidar'\);/, watcherLogic + "\nconst chokidar = require('chokidar');");

fs.writeFileSync('C:/dev-cli/scratch/patch_main_live.cjs', code);
console.log('patched');
