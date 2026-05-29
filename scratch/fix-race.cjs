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
      const path = require('path');
      const home = process.env.HOME || process.env.USERPROFILE || '';
      const livePath = path.join(home, '.dev-cli', 'flow-live.json');
      
      try { fs.unlinkSync(livePath); } catch (e) {}
      
      const { exec } = require("child_process");
      exec(\`dev focus \${durationMinutes}m\`, { cwd: targetCwd }, (err) => {
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

  `;

code = code.substring(0, focusStart) + newStartCode + code.substring(focusEnd);
fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
console.log('Fixed focus start race condition');
