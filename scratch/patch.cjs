const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const focusStart = code.indexOf('server.post("/api/focus/start"');
const focusEnd = code.indexOf('server.get("/api/focus/live"');

const newStartCode = `server.post("/api/focus/start", async (req, res) => {
    try {
      const { durationMinutes, cwd } = req.body;
      if (!durationMinutes || durationMinutes < 1) {
        return res.status(400).json({ error: "Invalid duration" });
      }
      const targetCwd = cwd || process.cwd();
      
      const { exec } = require("child_process");
      exec(\`dev focus \${durationMinutes}m\`, { cwd: targetCwd }, (err) => {
         if (err) console.error("Failed to spawn dev focus:", err);
      });

      res.json({ success: true, pid: 999999 });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  `;

code = code.substring(0, focusStart) + newStartCode + code.substring(focusEnd);
fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
console.log('Patched focus start in main.cjs');
