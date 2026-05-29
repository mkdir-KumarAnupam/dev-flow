const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const stopStart = code.indexOf('server.post("/api/focus/stop"');
const stopEnd = code.indexOf('server.post("/api/focus/generate-report"');

const newStopCode = `server.post("/api/focus/stop", async (req, res) => {
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

  `;

code = code.substring(0, stopStart) + newStopCode + code.substring(stopEnd);
fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
console.log('Patched focus stop in main.cjs');
